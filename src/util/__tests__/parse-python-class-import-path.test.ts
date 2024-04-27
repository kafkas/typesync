import { type CustomPythonClass, parsePythonClassImportPath } from '../parse-python-class-import-path.js';

describe('parse-python-class-import-path', () => {
  it('throws for incorrectly formatted input', () => {
    const invalidInputs = [
      '',
      'x',
      '.x',
      'x.',
      '..x',
      'x..',
      '.x.',
      '.x.y.',
      'x.y.',
      '.x.y.',
      '.x.y.CustomModel.',
      '/',
      '/x',
      '/x/CustomModel',
      '/x/y/CustomModel',
      'x/y/CustomModel',
    ];
    invalidInputs.forEach(input => {
      const parse = () => parsePythonClassImportPath(input);
      expect(parse).toThrow();
    });
  });

  it('correctly parses properly formatted input', () => {
    const inputs = [
      'x.CustomModel1',
      'x.y.CustomModel2',
      'x.y.z.CustomModel3',
      '.x.CustomModel',
      '..x.CustomModel',
      '...x.CustomModel',
      '.x.y.CustomModel',
      '..x.y.CustomModel',
      '...x.y.CustomModel',
    ];

    const results = inputs.map(parsePythonClassImportPath);

    const expectedResults: CustomPythonClass[] = [
      { importPath: 'x', className: 'CustomModel1' },
      { importPath: 'x.y', className: 'CustomModel2' },
      { importPath: 'x.y.z', className: 'CustomModel3' },
      { importPath: '.x', className: 'CustomModel' },
      { importPath: '..x', className: 'CustomModel' },
      { importPath: '...x', className: 'CustomModel' },
      { importPath: '.x.y', className: 'CustomModel' },
      { importPath: '..x.y', className: 'CustomModel' },
      { importPath: '...x.y', className: 'CustomModel' },
    ];

    expect(results).toEqual(expectedResults);
  });
});
