export function assertNever(x: never): never {
  throw new Error(`Invalid value: ${JSON.stringify(x)}`);
}
