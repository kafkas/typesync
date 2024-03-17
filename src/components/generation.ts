import type { Generation } from '../interfaces';

class GenerationImpl implements Generation {
  public constructor(private readonly content: string) {}

  public toString() {
    return this.content;
  }
}

export function createGeneration(content: string): GenerationImpl {
  return new GenerationImpl(content);
}
