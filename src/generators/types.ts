import { PythonGeneration } from './python/index.js';
import { RulesGeneration } from './rules/index.js';
import { SwiftGeneration } from './swift/index.js';
import { TSGeneration } from './ts/index.js';

export type Generation = PythonGeneration | RulesGeneration | SwiftGeneration | TSGeneration;
