import { Box, Text } from 'ink';
import React from 'react';

type Props = {};

export function ValidationSuccessful(_: Props) {
  return (
    <Box flexDirection="column">
      <Text color="green">✔ The specified Typesync definition is valid.</Text>
    </Box>
  );
}
