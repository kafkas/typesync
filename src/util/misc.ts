export function noop() {}

export function extractGenericId(id: string) {
  if (!id.startsWith('{') || !id.endsWith('}')) {
    throw new Error(`extractGenericId() expects an argument that starts with '{' and ends with '}'.`);
  }
  return id.slice(1, id.length - 1);
}
