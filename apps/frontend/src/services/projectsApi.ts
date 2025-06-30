import { API_BASE_URL } from '../lib/api';
import type { 
  Project, 
  ProjectsResponse, 
  CreateProjectDto, 
  ApiResponse, 
  ProjectStats 
} from '../types/project';

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

class ProjectsApiService {
  async getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    projectType?: string;
    status?: string;
  }): Promise<ProjectsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.clientId) searchParams.append('clientId', params.clientId);
    if (params?.projectType) searchParams.append('projectType', params.projectType);
    if (params?.status) searchParams.append('status', params.status);

    const url = `${API_BASE_URL}/projects${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result; // Backend returns { success, data, pagination }
  }

  async createProject(project: CreateProjectDto): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to create project: ${response.statusText}`);
    }
    
    const result: ApiResponse<Project> = await response.json();
    return result.data;
  }

  async getProjectById(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }
    
    const result: ApiResponse<Project> = await response.json();
    return result.data;
  }

  async updateProject(id: string, project: Partial<CreateProjectDto>): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update project: ${response.statusText}`);
    }
    
    const result: ApiResponse<Project> = await response.json();
    return result.data;
  }

  async updateProjectStatus(id: string, status: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update project status: ${response.statusText}`);
    }
    
    const result: ApiResponse<Project> = await response.json();
    return result.data;
  }

  async toggleProjectActive(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/toggle-active`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to toggle project status: ${response.statusText}`);
    }
    
    const result: ApiResponse<Project> = await response.json();
    return result.data;
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to delete project: ${response.statusText}`);
    }
  }

  async getProjectStats(): Promise<ProjectStats> {
    const response = await fetch(`${API_BASE_URL}/projects/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch project stats: ${response.statusText}`);
    }
    
    const result: ApiResponse<ProjectStats> = await response.json();
    return result.data;
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects/client/${clientId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch client projects: ${response.statusText}`);
    }
    
    const result: ApiResponse<Project[]> = await response.json();
    return result.data;
  }
}

export const projectsApi = new ProjectsApiService();

// Re-export types for convenience
export type { Project, CreateProjectDto, ProjectsResponse, ProjectStats } from '../types/project'; 