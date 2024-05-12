export type MermaidGraphOrientation = 'TB' | 'LR';

export type MermaidGraphLink = [nodeId: string, nodeId: string];

export interface MermaidGraph {
  orientation: MermaidGraphOrientation;
  links: MermaidGraphLink[];
}
