import type { RulesGeneration } from '../../generators/rules/index.js';
import type { RenderedFile } from '../_types.js';

export interface RulesRendererConfig {
  pathToOutputFile: string;
  startMarker: string;
  endMarker: string;
  indentation: number;
}

export interface RulesRenderer {
  render(g: RulesGeneration): Promise<RenderedFile>;
}
