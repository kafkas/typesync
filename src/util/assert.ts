export function assertNever(val: never): never {
  throw new Error(`Invalid value: ${JSON.stringify(val)}`);
}

export function assertNeverNoThrow(_val: never): void {}
