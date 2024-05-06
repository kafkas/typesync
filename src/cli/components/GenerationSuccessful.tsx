import { Box, Text } from 'ink';
import pluralize from 'pluralize';
import React from 'react';

import type { GenerationResult } from '../../api/index.js';
import { assertNever } from '../../util/assert.js';

type Props = {
  result: GenerationResult;
  pathToOutputFile: string;
};

function getMessageForResult(result: GenerationResult) {
  switch (result.type) {
    case 'ts':
      return 'Successfully generated TypeScript type definitions for the specified schema.';
    case 'swift':
      return 'Successfully generated Swift type definitions for the specified schema.';
    case 'python':
      return 'Successfully generated Python/Pydantic type definitions for the specified schema.';
    case 'rules':
      return 'Successfully generated validator functions for Firestore Security Rules.';
    default:
      assertNever(result);
  }
}

export function GenerationSuccessful({ result, pathToOutputFile }: Props) {
  const message = getMessageForResult(result);
  const aliasModelCount = result.schema.aliasModels.length;
  const documentModelCount = result.schema.documentModels.length;
  return (
    <Box flexDirection="column">
      <Text color="green">✔ {message}</Text>
      <Text> - {pluralize('alias model', aliasModelCount, true)}</Text>
      <Text> - {pluralize('document model', documentModelCount, true)}</Text>
      <Box>
        <Text>✔ Wrote output to: </Text>
        <Text color="yellowBright">{pathToOutputFile}</Text>
      </Box>
    </Box>
  );
}
