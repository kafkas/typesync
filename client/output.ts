export interface Project {
  id: string;
  name: string;
  completed: boolean;
  order: number;
  createdBy?: string;
}
