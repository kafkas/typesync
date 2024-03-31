import { Text } from 'ink';
import React from 'react';

type Props = {
  message: string;
};

export function CheckFailed({ message }: Props) {
  return <Text color="red">{message}</Text>;
}
