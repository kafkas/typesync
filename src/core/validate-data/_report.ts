import type { core } from 'zod';

import type { ValidateDataFailure, ValidateDataModelReport } from '../../api/validate-data.js';

/**
 * Per-model accumulator used during a traversal. Keeps counts and a bounded list
 * of failures.
 */
export class ModelReportAccumulator {
  private docsScanned = 0;
  private validCount = 0;
  private invalidCount = 0;
  private readonly failures: ValidateDataFailure[] = [];

  public constructor(
    public readonly name: string,
    public readonly collectionPath: string
  ) {}

  public recordValid(): void {
    this.docsScanned += 1;
    this.validCount += 1;
  }

  public recordInvalid(docId: string, docPath: string, issues: readonly core.$ZodIssue[]): void {
    this.docsScanned += 1;
    this.invalidCount += 1;
    this.failures.push({
      docId,
      docPath,
      issues: [...issues],
    });
  }

  public snapshot(): {
    model: string;
    docsScanned: number;
    valid: number;
    invalid: number;
  } {
    return {
      model: this.name,
      docsScanned: this.docsScanned,
      valid: this.validCount,
      invalid: this.invalidCount,
    };
  }

  public finalize(): ValidateDataModelReport {
    return {
      name: this.name,
      collectionPath: this.collectionPath,
      docsScanned: this.docsScanned,
      valid: this.validCount,
      invalid: this.invalidCount,
      failures: this.failures,
    };
  }
}
