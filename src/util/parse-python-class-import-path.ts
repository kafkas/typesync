export interface CustomPythonClass {
  importPath: string;
  className: string;
}

export function parsePythonClassImportPath(str: string): CustomPythonClass {
  const regex = /^(\.*)(?:\w+\.)+\w+$/;
  if (!regex.test(str)) {
    throw new Error('Input string is not in the correct format.');
  }
  const parts = str.split('.');
  const className = parts.pop() as string;
  const importPath = parts.join('.');
  return { importPath, className };
}
