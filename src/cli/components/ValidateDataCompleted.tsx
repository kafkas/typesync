import { Box, Text } from 'ink';
import React from 'react';

import type { ValidateDataResult } from '../../api/index.js';
import { VALIDATE_DATA_MAX_FAILURES_PER_MODEL_IN_TERMINAL } from '../../constants.js';

type Props = {
  result: ValidateDataResult;
  pathToOutFile?: string;
};

export function ValidateDataCompleted({ result, pathToOutFile }: Props) {
  const { summary, models } = result;
  const anyInvalid = summary.totalInvalid > 0;
  const anySkipped = summary.totalSkipped > 0;

  return (
    <Box flexDirection="column">
      <Text color={anyInvalid ? 'yellow' : 'green'}>
        {anyInvalid ? '⚠' : '✔'} Validation complete in {formatDuration(summary.durationMs)}.
      </Text>
      <Box marginTop={1} flexDirection="column">
        {models.map(m => (
          <Box key={m.name}>
            <Box width={24}>
              <Text>{m.name}</Text>
            </Box>
            <Text dimColor>{m.docsScanned.toLocaleString()} scanned · </Text>
            {m.invalid === 0 ? (
              <Text color="green">clean</Text>
            ) : (
              <Text color="red">{m.invalid.toLocaleString()} invalid</Text>
            )}
            {m.skipped > 0 ? <Text color="yellow"> · {m.skipped.toLocaleString()} skipped (other models)</Text> : null}
          </Box>
        ))}
      </Box>

      {anySkipped ? <SkippedNotice result={result} /> : null}

      {anyInvalid ? <FailureDetails result={result} /> : null}

      {pathToOutFile ? (
        <Box marginTop={1}>
          <Text>Wrote full report to: </Text>
          <Text color="yellowBright">{pathToOutFile}</Text>
        </Box>
      ) : null}
    </Box>
  );
}

function SkippedNotice({ result }: { result: ValidateDataResult }) {
  const offenders = result.models.filter(m => m.skipped > 0);
  if (offenders.length === 0) return null;

  return (
    <Box marginTop={1} flexDirection="column">
      <Text color="yellow">
        ⓘ {result.summary.totalSkipped.toLocaleString()} document(s) were returned by a collection-group query but
        belong to a different model:
      </Text>
      {offenders.map(m => (
        <Text key={m.name} dimColor>
          {'  '}• {m.name} ({m.collectionPath}): {m.skipped.toLocaleString()} skipped
        </Text>
      ))}
      <Text dimColor>
        {'  '}This happens when two document models share the same leaf collection name. Skipped documents are validated
        when their own model is scanned. If --limit was set, the actual fetch count was higher.
      </Text>
    </Box>
  );
}

function FailureDetails({ result }: { result: ValidateDataResult }) {
  const modelsWithFailures = result.models.filter(m => m.failures.length > 0);
  if (modelsWithFailures.length === 0) return null;

  return (
    <Box marginTop={1} flexDirection="column">
      <Text bold>First issues (showing up to {VALIDATE_DATA_MAX_FAILURES_PER_MODEL_IN_TERMINAL} per model):</Text>
      {modelsWithFailures.map(m => (
        <Box key={m.name} marginTop={1} flexDirection="column">
          <Text color="yellow">
            {m.name} ({m.invalid.toLocaleString()} invalid)
          </Text>
          {m.failures.slice(0, VALIDATE_DATA_MAX_FAILURES_PER_MODEL_IN_TERMINAL).map((f, i) => (
            <Box key={`${f.docPath}-${i}`} flexDirection="column" marginLeft={2}>
              <Text color="redBright">{f.docPath}</Text>
              {f.issues.slice(0, 5).map((issue, j) => (
                <Text key={j}>
                  {'  - '}
                  {issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''}
                  {issue.message}
                </Text>
              ))}
              {f.issues.length > 5 ? (
                <Text dimColor>
                  {'  '}...and {f.issues.length - 5} more issue(s)
                </Text>
              ) : null}
            </Box>
          ))}
          {m.failures.length > VALIDATE_DATA_MAX_FAILURES_PER_MODEL_IN_TERMINAL ? (
            <Text dimColor>
              {'  '}...and {m.failures.length - VALIDATE_DATA_MAX_FAILURES_PER_MODEL_IN_TERMINAL} more failing
              document(s)
            </Text>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remSeconds = Math.floor(seconds - minutes * 60);
  return `${minutes}m${remSeconds.toString().padStart(2, '0')}s`;
}
