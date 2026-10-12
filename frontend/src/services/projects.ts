import apiClient from './apiClient';

export interface ProjectResponse {
  id: string;
  name: string;
  source_type: 'git' | 'zip';
  repo_url: string | null;
  storage_path: string;
  detected_languages: string[];
  detected_frameworks: string[];
  created_at: string;
}

export const projectsService = {
  getUserProjects: async (): Promise<ProjectResponse[]> => {
    const response = await apiClient.get('/projects/');
    return response.data;
  }
};
