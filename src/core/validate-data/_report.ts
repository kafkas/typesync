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
  private skippedCount = 0;
  private readonly failures: ValidateDataFailure[] = [];

  public constructor(
    public readonly name: string,
    public readonly collectionPath: string,
    public readonly isCollectionGroup: boolean
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

  /**
   * Records a document returned by the underlying traverser that was filtered out
   * because its path didn't match the model's path template (i.e. it belongs to a
   * different model that happens to share the same leaf collection name).
   */
  public recordSkipped(): void {
    this.skippedCount += 1;
  }

  public snapshot(): {
    model: string;
    docsScanned: number;
    valid: number;
    invalid: number;
    skipped: number;
  } {
    return {
      model: this.name,
      docsScanned: this.docsScanned,
      valid: this.validCount,
      invalid: this.invalidCount,
      skipped: this.skippedCount,
    };
  }

  public finalize(): ValidateDataModelReport {
    return {
      name: this.name,
      collectionPath: this.collectionPath,
      isCollectionGroup: this.isCollectionGroup,
      docsScanned: this.docsScanned,
      valid: this.validCount,
      invalid: this.invalidCount,
      skipped: this.skippedCount,
      failures: this.failures,
    };
  }
}
