import { Text } from 'ink';
import React from 'react';

type Props = {
  message: string;
};

export function ValidationFailed({ message }: Props) {
  return <Text color="red">{message}</Text>;
}
