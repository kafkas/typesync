import { Box, Text } from 'ink';
import pluralize from 'pluralize';
import React from 'react';

type Props = {
  aliasModelCount: number;
  documentModelCount: number;
};

export function GenerationSuccessful({ aliasModelCount, documentModelCount }: Props) {
  return (
    <Box flexDirection="column">
      <Text color="green">Successfully generated type definitions for models.</Text>
      <Text color="green">✔ {pluralize('alias model', aliasModelCount, true)}</Text>
      <Text color="green">✔ {pluralize('document model', documentModelCount, true)}</Text>
    </Box>
  );
}
