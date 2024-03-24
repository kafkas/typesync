import { Text } from 'ink';
import React from 'react';

type Props = {};

export function GenerationInProgress(_: Props) {
  return <Text color="green">Generation in progress...</Text>;
}
