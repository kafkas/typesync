import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import React, { useEffect, useState } from 'react';

import type { ValidateDataProgressEvent } from '../../api/index.js';

type ModelState = {
  name: string;
  collectionPath: string;
  status: 'scanning' | 'done' | 'failed';
  docsScanned: number;
  valid: number;
  invalid: number;
  error?: string;
};

type Props = {
  register: (emitter: (event: ValidateDataProgressEvent) => void) => void;
};

/**
 * Live progress panel. The orchestration core emits progress events; this component
 * subscribes once on mount and renders the latest snapshot per model.
 */
export function ValidateDataInProgress({ register }: Props) {
  const [models, setModels] = useState<Record<string, ModelState>>({});

  useEffect(() => {
    register(event => {
      setModels(prev => {
        switch (event.type) {
          case 'model-started':
            return {
              ...prev,
              [event.model]: {
                name: event.model,
                collectionPath: event.collectionPath,
                status: 'scanning',
                docsScanned: 0,
                valid: 0,
                invalid: 0,
              },
            };
          case 'batch-processed': {
            const current = prev[event.model];
            if (!current) return prev;
            return {
              ...prev,
              [event.model]: {
                ...current,
                docsScanned: event.docsScanned,
                valid: event.valid,
                invalid: event.invalid,
              },
            };
          }
          case 'model-completed': {
            const current = prev[event.model];
            if (!current) return prev;
            return {
              ...prev,
              [event.model]: {
                ...current,
                status: 'done',
                docsScanned: event.docsScanned,
                valid: event.valid,
                invalid: event.invalid,
              },
            };
          }
          case 'model-failed': {
            const current = prev[event.model];
            if (!current) return prev;
            return {
              ...prev,
              [event.model]: {
                ...current,
                status: 'failed',
                error: event.error,
              },
            };
          }
          default:
            return prev;
        }
      });
    });
  }, [register]);

  const entries = Object.values(models);

  return (
    <Box flexDirection="column">
      <Text color="cyan">Typesync validate-data</Text>
      <Box flexDirection="column" marginTop={1}>
        {entries.length === 0 ? (
          <Box>
            <Text color="cyan">
              <Spinner type="dots" />
            </Text>
            <Text> preparing...</Text>
          </Box>
        ) : (
          entries.map(m => <ModelRow key={m.name} state={m} />)
        )}
      </Box>
    </Box>
  );
}

function ModelRow({ state }: { state: ModelState }) {
  const leftWidth = 20;
  const name = state.name.padEnd(leftWidth).slice(0, leftWidth);
  return (
    <Box>
      <Box width={3}>{renderStatusIcon(state.status)}</Box>
      <Box width={leftWidth + 1}>
        <Text>{name}</Text>
      </Box>
      <Box>
        <Text dimColor>
          {state.docsScanned.toLocaleString()} scanned · {state.valid.toLocaleString()} valid ·{' '}
        </Text>
        <Text color={state.invalid > 0 ? 'red' : undefined}>{state.invalid.toLocaleString()} invalid</Text>
        {state.error ? <Text color="red"> · {state.error}</Text> : null}
      </Box>
    </Box>
  );
}

function renderStatusIcon(status: ModelState['status']) {
  switch (status) {
    case 'scanning':
      return (
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
      );
    case 'done':
      return <Text color="green">✔</Text>;
    case 'failed':
      return <Text color="red">✖</Text>;
  }
}
