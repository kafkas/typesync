export function deepFreeze<T>(input: T) {
  if (Array.isArray(input)) {
    for (const elem of input) {
      const unknownElem = elem as unknown;
      deepFreeze(unknownElem);
    }
  } else if (typeof input === 'object' && input !== null) {
    const propNames = Object.getOwnPropertyNames(input);

    for (const name of propNames) {
      if (name in input) {
        const value = (input as { [K: string]: unknown })[name];
        deepFreeze(value);
      }
    }
  }

  return Object.freeze(input);
}
