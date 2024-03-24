import { Text } from 'ink';
import React from 'react';

type Props = {
  message: string;
};

export function GenerationFailed({ message }: Props) {
  return <Text color="red">Generation failed: {message}</Text>;
}
