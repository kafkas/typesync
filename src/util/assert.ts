class AssertionError extends Error {
  public constructor(message: string) {
    super(message);
  }
}

export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new AssertionError(message ?? 'Assertion failed');
  }
}

export function assertNever(val: never): never {
  throw new AssertionError(`Invalid value: ${JSON.stringify(val)}`);
}

export function assertDefined<T>(val: T | undefined, message?: string): asserts val is T {
  assert(val !== undefined, message);
}

export function assertNeverNoThrow(_val: never): void {}

export function assertEmpty<T extends true | false>(_t: T) {}
