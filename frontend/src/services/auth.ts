import apiClient from './apiClient';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export const authService = {
  async login(data: any): Promise<Token> {
    const response = await apiClient.post<Token>('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  async register(data: any): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
};
