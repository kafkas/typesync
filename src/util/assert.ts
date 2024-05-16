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

export function assertNeverNoThrow(_val: never): void {}

export function assertEmpty<T extends true | false>(_t: T) {}
