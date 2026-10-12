import apiClient from './apiClient';

export interface Vulnerability {
  id: string;
  type: string;
  asset: string;
  severity: string;
  lines: string;
  description?: string;
}

export interface AnalysisResults {
  project_id: string;
  vulnerabilities: Vulnerability[];
}

export const analysisService = {
  async runAnalysis(projectId: string): Promise<{ project_id: string, status: string }> {
    const response = await apiClient.post<{ project_id: string, status: string }>(`/analysis/run/${projectId}`);
    return response.data;
  },

  async getResults(projectId: string): Promise<AnalysisResults> {
    const response = await apiClient.get<AnalysisResults>(`/analysis/results/${projectId}`);
    return response.data;
  }
};
