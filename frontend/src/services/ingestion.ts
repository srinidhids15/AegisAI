import apiClient from './apiClient';

export interface IngestResponse {
  project_id: string;
  status: string;
  message: string;
}

export const ingestionService = {
  async ingestGit(repoUrl: string, projectName: string): Promise<IngestResponse> {
    const response = await apiClient.post<IngestResponse>('/ingestion/git', {
      repo_url: repoUrl,
      project_name: projectName
    });
    return response.data;
  },

  async ingestZip(file: File, projectName: string): Promise<IngestResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_name', projectName);
    
    const response = await apiClient.post<IngestResponse>('/ingestion/zip', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};
