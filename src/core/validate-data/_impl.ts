import { createTraverser } from 'firewalk';
import { writeFile } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';
import type { z } from 'zod';

import type {
  ValidateDataModelReport,
  ValidateDataOptions,
  ValidateDataProgressEvent,
  ValidateDataResult,
} from '../../api/validate-data.js';
import {
  DEFAULT_VALIDATE_DATA_BATCH_SIZE,
  DEFAULT_VALIDATE_DATA_DEBUG,
  DEFAULT_VALIDATE_DATA_MAX_RETRIES,
  VALIDATE_DATA_PROGRESS_THROTTLE_MS,
} from '../../constants.js';
import {
  ConflictingValidateDataModelSelectorError,
  InvalidValidateDataBatchSizeOptionError,
  InvalidValidateDataLimitOptionError,
  InvalidValidateDataMaxRetriesOptionError,
  InvalidValidateDataModelsOptionError,
  MissingValidateDataModelSelectorError,
} from '../../errors/invalid-opts.js';
import { FirestoreTraversalError } from '../../errors/validate-data.js';
import { schema } from '../../schema/index.js';
import { assert } from '../../util/assert.js';
import { extractErrorMessage } from '../../util/extract-error-message.js';
import { buildZodSchemaMap } from '../zod/index.js';
import { initFirebaseAdminApp } from './_firebase-admin.js';
import { ModelReportAccumulator } from './_report.js';
import { resolveCollectionRef } from './_resolve-collection-ref.js';

/**
 * After normalization, the model selector is collapsed to one of two shapes:
 * either an explicit non-empty list of model names, or the `all` sentinel meaning
 * "every document model in the schema". This keeps downstream code from having to
 * juggle a `models | allModels` pair.
 */
export type ModelSelector = { kind: 'names'; names: string[] } | { kind: 'all' };

export interface NormalizedValidateDataOptions {
  definitionGlobPattern: string;
  modelSelector: ModelSelector;
  serviceAccount: string | undefined;
  projectId: string | undefined;
  emulatorHost: string | undefined;
  maxRetries: number;
  batchSize: number;
  limit: number;
  pathToOutFile: string | undefined;
  onProgress: ((event: ValidateDataProgressEvent) => void) | undefined;
  debug: boolean;
}

export function normalizeValidateDataOpts(opts: ValidateDataOptions): NormalizedValidateDataOptions {
  const {
    definition,
    models,
    allModels = false,
    serviceAccount,
    projectId,
    emulatorHost,
    maxRetries = DEFAULT_VALIDATE_DATA_MAX_RETRIES,
    batchSize = DEFAULT_VALIDATE_DATA_BATCH_SIZE,
    limit = Infinity,
    outFile,
    onProgress,
    debug = DEFAULT_VALIDATE_DATA_DEBUG,
  } = opts;

  const modelSelector = resolveModelSelector(models, allModels);

  if (!Number.isSafeInteger(maxRetries) || maxRetries < 0) {
    throw new InvalidValidateDataMaxRetriesOptionError(maxRetries);
  }
  if (!Number.isSafeInteger(batchSize) || batchSize < 1) {
    throw new InvalidValidateDataBatchSizeOptionError(batchSize);
  }
  if (limit !== Infinity && (!Number.isSafeInteger(limit) || limit < 1)) {
    throw new InvalidValidateDataLimitOptionError(limit);
  }

  return {
    definitionGlobPattern: definition,
    modelSelector,
    serviceAccount,
    projectId,
    emulatorHost,
    maxRetries,
    batchSize,
    limit,
    pathToOutFile: outFile ? resolvePath(process.cwd(), outFile) : undefined,
    onProgress,
    debug,
  };
}

function resolveModelSelector(models: string[] | undefined, allModels: boolean): ModelSelector {
  const names = (models ?? []).map(n => n.trim()).filter(n => n.length > 0);
  const hasNames = names.length > 0;

  if (hasNames && allModels) {
    throw new ConflictingValidateDataModelSelectorError();
  }
  if (!hasNames && !allModels) {
    throw new MissingValidateDataModelSelectorError();
  }
  if (allModels) {
    return { kind: 'all' };
  }
  return { kind: 'names', names: dedupe(names) };
}

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export interface RunValidateDataDeps {
  buildSchema: (
    globPattern: string,
    debug: boolean
  ) => {
    schema: schema.Schema;
  };
}

/**
 * Orchestrates a `validate-data` run. Deliberately takes its schema-building
 * dependency as a parameter so this module doesn't import the Typesync class
 * directly and remains testable in isolation.
 */
export async function runValidateData(
  opts: NormalizedValidateDataOptions,
  deps: RunValidateDataDeps
): Promise<ValidateDataResult> {
  const { schema: parsedSchema } = deps.buildSchema(opts.definitionGlobPattern, opts.debug);
  const zodMap = buildZodSchemaMap(parsedSchema);
  const modelsToValidate = selectModelsToValidate(parsedSchema, opts.modelSelector);

  const app = initFirebaseAdminApp({
    serviceAccountPath: opts.serviceAccount,
    projectId: opts.projectId,
    emulatorHost: opts.emulatorHost,
  });

  try {
    const db = app.firestore();
    const startedAt = Date.now();
    const reports: ValidateDataModelReport[] = [];

    for (const model of modelsToValidate) {
      const report = await traverseAndValidateModel({
        model,
        zodSchema: getZodSchemaForModel(zodMap, model.name),
        db,
        opts,
      });
      reports.push(report);
    }

    const durationMs = Date.now() - startedAt;
    const result: ValidateDataResult = {
      type: 'validate-data',
      schema: parsedSchema,
      summary: summarize(reports, durationMs),
      models: reports,
    };

    if (opts.pathToOutFile) {
      await writeFile(opts.pathToOutFile, JSON.stringify(serializeResultForFile(result), null, 2), 'utf-8');
    }

    return result;
  } finally {
    await app.delete().catch(() => {
      /* best-effort cleanup */
    });
  }
}

function selectModelsToValidate(s: schema.Schema, selector: ModelSelector): readonly schema.DocumentModel[] {
  if (selector.kind === 'all') {
    return s.documentModels;
  }
  const byName = new Map(s.documentModels.map(m => [m.name, m] as const));
  const missing: string[] = [];
  const matched: schema.DocumentModel[] = [];
  for (const name of selector.names) {
    const found = byName.get(name);
    if (found) {
      matched.push(found);
    } else {
      missing.push(name);
    }
  }
  if (missing.length > 0) {
    throw new InvalidValidateDataModelsOptionError(missing);
  }
  return matched;
}

function getZodSchemaForModel(zodMap: ReturnType<typeof buildZodSchemaMap>, modelName: string): z.ZodTypeAny {
  const zodSchema = zodMap.get(modelName);
  assert(zodSchema, `Internal error: no Zod schema was built for document model '${modelName}'.`);
  return zodSchema;
}

async function traverseAndValidateModel(args: {
  model: schema.DocumentModel;
  zodSchema: z.ZodTypeAny;
  db: FirebaseFirestore.Firestore;
  opts: NormalizedValidateDataOptions;
}): Promise<ValidateDataModelReport> {
  const { model, zodSchema, db, opts } = args;
  const { label, ref, isCollectionGroup, matchesPath } = resolveCollectionRef(db, model.path);
  const accumulator = new ModelReportAccumulator(model.name, label, isCollectionGroup);

  opts.onProgress?.({
    type: 'model-started',
    model: model.name,
    collectionPath: label,
    isCollectionGroup,
  });

  const traverser = createTraverser(ref, {
    batchSize: opts.batchSize,
    maxDocCount: opts.limit,
    maxBatchRetryCount: opts.maxRetries,
    sleepTimeBetweenTrials: lastTrialIndex =>
      Math.min(30_000, 500 * 2 ** lastTrialIndex) + Math.floor(Math.random() * 250),
  });

  const emitThrottledProgress = createThrottledProgressEmitter(opts.onProgress, accumulator);

  try {
    await traverser.traverse(async batchDocs => {
      for (const doc of batchDocs) {
        // Collection-group queries return every collection with the same leaf name
        // across the database, so we filter out documents whose path doesn't match the
        // model's path template before validating. For non-group refs this is a no-op.
        if (isCollectionGroup && !matchesPath(doc.ref.path)) {
          accumulator.recordSkipped();
          continue;
        }
        const parseRes = zodSchema.safeParse(doc.data());
        if (parseRes.success) {
          accumulator.recordValid();
        } else {
          accumulator.recordInvalid(doc.id, doc.ref.path, parseRes.error.issues);
        }
      }
      emitThrottledProgress();
    });
  } catch (err) {
    const message = extractErrorMessage(err);
    opts.onProgress?.({
      type: 'model-failed',
      model: model.name,
      error: message,
    });
    throw new FirestoreTraversalError(label, message);
  }

  emitThrottledProgress.flush();

  const finalized = accumulator.finalize();
  opts.onProgress?.({
    type: 'model-completed',
    model: finalized.name,
    docsScanned: finalized.docsScanned,
    valid: finalized.valid,
    invalid: finalized.invalid,
    skipped: finalized.skipped,
  });
  return finalized;
}

interface ThrottledProgressEmitter {
  (): void;
  flush(): void;
}

function createThrottledProgressEmitter(
  onProgress: ((event: ValidateDataProgressEvent) => void) | undefined,
  accumulator: ModelReportAccumulator
): ThrottledProgressEmitter {
  let lastEmittedAt = 0;

  const emit = () => {
    if (!onProgress) return;
    const snapshot = accumulator.snapshot();
    onProgress({
      type: 'batch-processed',
      model: snapshot.model,
      docsScanned: snapshot.docsScanned,
      valid: snapshot.valid,
      invalid: snapshot.invalid,
      skipped: snapshot.skipped,
    });
  };

  const throttled = (() => {
    const now = Date.now();
    if (now - lastEmittedAt < VALIDATE_DATA_PROGRESS_THROTTLE_MS) return;
    lastEmittedAt = now;
    emit();
  }) as ThrottledProgressEmitter;

  throttled.flush = () => {
    lastEmittedAt = Date.now();
    emit();
  };

  return throttled;
}

function summarize(reports: ValidateDataModelReport[], durationMs: number) {
  const totalDocsScanned = reports.reduce((acc, r) => acc + r.docsScanned, 0);
  const totalValid = reports.reduce((acc, r) => acc + r.valid, 0);
  const totalInvalid = reports.reduce((acc, r) => acc + r.invalid, 0);
  const totalSkipped = reports.reduce((acc, r) => acc + r.skipped, 0);
  return {
    totalModels: reports.length,
    totalDocsScanned,
    totalValid,
    totalInvalid,
    totalSkipped,
    durationMs,
  };
}

function serializeResultForFile(result: ValidateDataResult) {
  // The schema object contains class instances and non-serializable bits; we strip it
  // from the persisted report to keep the JSON file portable and focused on findings.
  const { schema: _schema, ...rest } = result;
  return rest;
}
