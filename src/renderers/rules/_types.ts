import type { RulesGeneration } from '../../generators/rules/index.js';
import type { RenderedFile } from '../_types.js';

export interface RulesRendererConfig {
  indentation: number;
  pathToOutputFile: string;
  startMarker: string;
  endMarker: string;
  validatorNamePattern: string;
  validatorParamName: string;
}

export interface RulesRenderer {
  render(g: RulesGeneration): Promise<RenderedFile>;
}
