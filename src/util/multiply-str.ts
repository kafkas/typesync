export function multiply(str: string, count: number) {
  return new Array<string>(count).fill(str).join('');
}
