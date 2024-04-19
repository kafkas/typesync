import { StringBuilder } from '@proficient/ds';

import type { SwiftGeneration } from '../../generators/swift/index.js';
import type { RenderedFile } from '../_types.js';
import type { SwiftRenderer, SwiftRendererConfig } from './_types.js';

class SwiftRendererImpl implements SwiftRenderer {
  public readonly type = 'swift';

  public constructor(private readonly config: SwiftRendererConfig) {}

  public async render(g: SwiftGeneration): Promise<RenderedFile> {
    const b = new StringBuilder();

    const rootFile: RenderedFile = {
      content: b.toString(),
    };

    return rootFile;
  }
}

export function createSwiftRenderer(config: SwiftRendererConfig): SwiftRenderer {
  return new SwiftRendererImpl(config);
}
