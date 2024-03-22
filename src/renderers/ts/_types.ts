import type { TSGenerationPlatform } from '../../api';
import type { TSGeneration } from '../../generators/ts';
import type { RenderedFile } from '../_types';

export interface TSRendererConfig {
  rootFileName: string;
  platform: TSGenerationPlatform;
  indentation: number;
}

export interface TSRenderer {
  render(g: TSGeneration): Promise<RenderedFile[]>;
}
