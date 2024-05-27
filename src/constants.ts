import type { SchemaGraphOrientation } from './api/graph.js';
import type { TSObjectTypeFormat } from './api/ts.js';

export const PYTHON_UNDEFINED_SENTINEL_CLASS = 'TypesyncUndefined';
export const RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM = '{modelName}';

/*
 * Default values
 */
export const DEFAULT_TS_OBJECT_TYPE_FORMAT: TSObjectTypeFormat = 'interface';
export const DEFAULT_TS_INDENTATION = 2;
export const DEFAULT_TS_DEBUG = false;

export const DEFAULT_SWIFT_INDENTATION = 2;
export const DEFAULT_SWIFT_DEBUG = false;

export const DEFAULT_PY_CUSTOM_PYDANTIC_BASE = undefined;
export const DEFAULT_PY_UNDEFINED_SENTINEL_NAME = 'UNDEFINED';
export const DEFAULT_PY_INDENTATION = 2;
export const DEFAULT_PY_DEBUG = false;

export const DEFAULT_RULES_START_MARKER = 'typesync-start';
export const DEFAULT_RULES_END_MARKER = 'typesync-end';
export const DEFAULT_RULES_TYPE_VALIDATOR_NAME_PATTERN = `isValid${RULES_TYPE_VALIDATOR_NAME_PATTERN_PARAM}`;
export const DEFAULT_RULES_TYPE_VALIDATOR_PARAM_NAME = 'data';
export const DEFAULT_RULES_INDENTATION = 2;
export const DEFAULT_RULES_DEBUG = false;

export const DEFAULT_GRAPH_START_MARKER = 'typesync-start';
export const DEFAULT_GRAPH_END_MARKER = 'typesync-end';
export const DEFAULT_GRAPH_ORIENTATION: SchemaGraphOrientation = 'horizontal';
export const DEFAULT_GRAPH_DEBUG = false;

export const DEFAULT_VALIDATE_DEBUG = false;
