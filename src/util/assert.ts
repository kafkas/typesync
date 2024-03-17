class AssertionError extends Error {
  public constructor(message: string) {
    super(message);
  }
}

export function assert(condition: unknown, msg?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(msg || 'Assertion failed');
  }
}

export function assertNever(val: never): never {
  throw new Error(`Invalid value: ${JSON.stringify(val)}`);
}

export function assertNeverNoThrow(_val: never): void {}
