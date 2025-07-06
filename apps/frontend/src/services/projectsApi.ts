import { apiClient } from '../lib/api';

export interface ProjectContact {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  receivesOffers: boolean;
  receivesInvoices: boolean;
  receivesUpdates: boolean;
  isPrimary: boolean;
}

export interface CreateProjectDto {
  clientId: string;
  name: string;
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';
  address?: string;
  description?: string;
  city?: string;
  architectType: 'none' | 'client' | 'external';
  architectId?: string;
  architectName?: string;
  architectCommission?: number;
  architectPhone?: string;
  architectEmail?: string;
  contacts?: ProjectContact[]; // Optional for now
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';
  address?: string;
  description?: string;
  city?: string;
  totalArea?: number;
  roomsCount?: number;
  floorsCount?: number;
  estimatedBudget?: number;
  architectType: 'none' | 'client' | 'external';
  architectId?: string;
  architectName?: string;
  architectCommission?: number;
  architectPhone?: string;
  architectEmail?: string;
  contacts: ProjectContact[];
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ProjectsApiService {
  async getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
  }): Promise<ProjectsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);
      if (params?.clientId) searchParams.append('clientId', params.clientId);

      const url = `/projects${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      console.log('🔍 Fetching projects from:', url);
      
      const result = await apiClient.get<ApiResponse<Project[]>>(url);
      console.log('✅ API Response:', result);
      
      // Backend returns { success, data, pagination }
      return {
        data: result.data || [],
        meta: {
          total: result.pagination?.total || 0,
          page: result.pagination?.page || 1,
          limit: result.pagination?.limit || 50,
          totalPages: result.pagination?.totalPages || 1,
        },
      };
    } catch (error) {
      console.error('💥 getProjects error:', error);
      throw error;
    }
  }

  async createProject(project: CreateProjectDto): Promise<Project> {
    const result = await apiClient.post<ApiResponse<Project>>('/projects', project);
    return result.data; // Backend returns { success, data, message }
  }

  async getProjectById(id: string): Promise<Project> {
    const result = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return result.data; // Backend returns { success, data }
  }

  // Alias for getProjectById to maintain compatibility
  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data || response;
  }

  async updateProject(id: string, project: Partial<CreateProjectDto>): Promise<Project> {
    const result = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, project);
    return result.data; // Backend returns { success, data, message }
  }

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  }

  async getProjectStats() {
    return apiClient.get('/projects/stats');
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    const result = await apiClient.get<ApiResponse<Project[]>>(`/projects?clientId=${clientId}`);
    return result.data;
  }
}

export const projectsApi = new ProjectsApiService(); 