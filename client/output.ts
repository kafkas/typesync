/**
 * Represents a project within a workspace.
 */
export interface Project {
  /**
   * The ID of the project.
   */
  id: string;
  name: string;
  /**
   * Whether the project has been completed.
   */
  completed: boolean;
  order: number;
  /**
   * The ID of the user that created the project.
   */
  createdBy?: string;
}
