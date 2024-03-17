import { PythonGeneration } from '../generation/_types';
import { PythonRenderer, PythonRendererConfig, RenderedFile } from './_types';

class PythonRendererImpl implements PythonRenderer {
  public readonly type = 'python';

  public constructor(private readonly config: PythonRendererConfig) {}

  public render(g: PythonGeneration): RenderedFile[] {
    //
    return [];
  }
}

export function create(config: PythonRendererConfig): PythonRenderer {
  return new PythonRendererImpl(config);
}
