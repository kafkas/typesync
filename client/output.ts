/**
 * Represents a project within a workspace.
 */
export interface Project {
  id: string;
  name: string;
  completed: boolean;
  order: number;
  createdBy?: string;
}
