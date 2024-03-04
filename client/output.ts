import { firestore } from 'firebase-admin';

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
  /**
   * The topic of the project
   */
  topic: null;
  /**
   * The current owner of the project
   */
  owner: {
    /**
     * The ID of the current owner.
     */
    id: string;
    /**
     * When the ownership expires
     */
    expiresAt: firestore.Timestamp;
    /**
     * Owner credentials
     */
    credentials: {
      /**
       * The email of the user
       */
      email: string;
      passwordHash: string;
    };
  };
}
