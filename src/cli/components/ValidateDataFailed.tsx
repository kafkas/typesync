import { Text } from 'ink';
import React from 'react';

type Props = {
  message: string;
};

export function ValidateDataFailed({ message }: Props) {
  return <Text color="red">Data validation failed: {message}</Text>;
}
