import { Box, Text } from 'ink';
import pluralize from 'pluralize';
import React from 'react';

type Props = {
  aliasModelCount: number;
  documentModelCount: number;
  pathToRootFile: string;
};

export function GenerationSuccessful({ aliasModelCount, documentModelCount, pathToRootFile }: Props) {
  return (
    <Box flexDirection="column">
      <Text color="green">✔ Successfully generated type definitions for models.</Text>
      <Text>✔ {pluralize('alias model', aliasModelCount, true)}</Text>
      <Text>✔ {pluralize('document model', documentModelCount, true)}</Text>
      <Box>
        <Text>✔ Wrote output to: </Text>
        <Text color="green">{pathToRootFile}</Text>
      </Box>
    </Box>
  );
}
