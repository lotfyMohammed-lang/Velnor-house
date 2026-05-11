export interface Project {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
}
