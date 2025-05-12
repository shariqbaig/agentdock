// frontend/src/services/api.ts
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Define types for API responses
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface Agent {
  name: string;
  description: string;
  config?: Record<string, any>;
  tools?: string[];
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tool {
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export interface ToolCategory {
  name: string;
  description: string;
  enabled: boolean;
}

export interface Log {
  id: string;
  timestamp: string;
  query: string;
  response: string;
  agent?: string;
  context?: Record<string, any>;
  responseTime: number;
}

export interface PaginatedLogs {
  logs: Log[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}

export interface QueryRequest {
  query: string;
  agent?: string;
  context?: Record<string, any>;
}

export interface QueryResponse {
  id: string;
  response: string;
  responseTime: number;
}

class ApiService {
  private readonly api: AxiosInstance;
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:3001/api';

    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Agents API
  async getAgents(): Promise<Agent[]> {
    const response: AxiosResponse<Agent[]> = await this.api.get('/agents');
    return response.data;
  }

  async getAgent(name: string): Promise<Agent> {
    const response: AxiosResponse<Agent> = await this.api.get(`/agents/${name}`);
    return response.data;
  }

  async createAgent(agent: Agent): Promise<Agent> {
    const response: AxiosResponse<Agent> = await this.api.post('/agents', agent);
    return response.data;
  }

  async updateAgent(name: string, agent: Partial<Agent>): Promise<Agent> {
    const response: AxiosResponse<Agent> = await this.api.put(`/agents/${name}`, agent);
    return response.data;
  }

  async deleteAgent(name: string): Promise<void> {
    await this.api.delete(`/agents/${name}`);
  }

  // Tools API
  async getToolCategories(): Promise<Record<string, ToolCategory>> {
    const response: AxiosResponse<Record<string, ToolCategory>> = await this.api.get('/tools/categories');
    return response.data;
  }

  async getTools(): Promise<Tool[]> {
    const response: AxiosResponse<Tool[]> = await this.api.get('/tools');
    return response.data;
  }

  async getToolsByCategory(category: string): Promise<Tool[]> {
    const response: AxiosResponse<Tool[]> = await this.api.get(`/tools/category/${category}`);
    return response.data;
  }

  async getTool(name: string): Promise<Tool> {
    const response: AxiosResponse<Tool> = await this.api.get(`/tools/${name}`);
    return response.data;
  }

  // Logs API
  async getLogs(page: number = 1, limit: number = 20, sort: 'asc' | 'desc' = 'desc'): Promise<PaginatedLogs> {
    const response: AxiosResponse<PaginatedLogs> = await this.api.get('/logs/queries', {
      params: { page, limit, sort }
    });
    return response.data;
  }

  async getLog(id: string): Promise<Log> {
    const response: AxiosResponse<Log> = await this.api.get(`/logs/queries/${id}`);
    return response.data;
  }

  async getSystemLogs(lines: number = 100): Promise<{ logs: string[] }> {
    const response: AxiosResponse<{ logs: string[] }> = await this.api.get('/logs/system', {
      params: { lines }
    });
    return response.data;
  }

  async getErrorLogs(lines: number = 100): Promise<{ logs: string[] }> {
    const response: AxiosResponse<{ logs: string[] }> = await this.api.get('/logs/errors', {
      params: { lines }
    });
    return response.data;
  }

  // Query API
  async processQuery(request: QueryRequest): Promise<QueryResponse> {
    const response: AxiosResponse<QueryResponse> = await this.api.post('/query', request);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response: AxiosResponse<{ status: string }> = await this.api.get('/health');
    return response.data;
  }
}

// Export a singleton instance
export const apiService = new ApiService();
export default apiService;