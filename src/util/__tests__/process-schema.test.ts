import { getSchemaForTestDefinition } from '../../../test/util/get-schema-for-test-definition';
import { deepFreeze } from '../deep-freeze';
import { processSchema } from '../process-schema';

describe('process-schema', () => {
  it('does not mutate input schema', () => {
    const inputSchema = getSchemaForTestDefinition('flat');

    deepFreeze(inputSchema);

    expect(() => {
      processSchema(inputSchema);
    }).not.toThrow();
  });

  it('returns a new schema', () => {
    const inputSchema = getSchemaForTestDefinition('flat');
    const processedSchema = processSchema(inputSchema);

    expect(processedSchema).not.toBe(inputSchema);
  });
});
