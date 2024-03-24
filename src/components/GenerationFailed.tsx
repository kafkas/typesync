import { Text } from 'ink';
import React from 'react';

type Props = {};

export function GenerationFailed(_: Props) {
  return <Text color="red">Generation failed.</Text>;
}
