 import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor to handle unauthorized responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

// Generic API request function with TypeScript support
export async function apiRequest<T = unknown>(
  url: string,
  options?: {
    method?: string;
    data?: unknown;
    token?: string;
  }
): Promise<{ data: T }> {
  const config: AxiosRequestConfig = {
    method: options?.method || 'GET',
    url,
  };

  if (options?.data) {
    config.data = options.data;
  }

  if (options?.token) {
    config.headers = {
      Authorization: `Bearer ${options.token}`,
    };
  }

  return apiClient(config);
}

// Auth API with login and signup methods
export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post('/auth/login', { email, password });
  },
  signup: async (fullName: string, email: string, password: string) => {
    return apiClient.post('/auth/register', { email, password, fullName });
  },
};

export default apiClient;