import { loadSchemaForTestDefinition } from '../../../test/util/load-schema';
import { deepFreeze } from '../deep-freeze';
import { processSchema } from '../process-schema';

describe('process-schema', () => {
  it('does not mutate input schema', () => {
    const inputSchema = loadSchemaForTestDefinition('flat');

    deepFreeze(inputSchema);

    expect(() => {
      processSchema(inputSchema);
    }).not.toThrow();
  });

  it('returns a new schema', () => {
    const inputSchema = loadSchemaForTestDefinition('flat');
    const processedSchema = processSchema(inputSchema);

    expect(processedSchema).not.toBe(inputSchema);
  });
});
