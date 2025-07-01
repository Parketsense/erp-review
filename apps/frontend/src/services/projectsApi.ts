import { API_BASE_URL } from '../lib/api';

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
  architectType: 'none' | 'client' | 'external';
  architectId?: string;
  architectName?: string;
  architectCommission?: number;
  architectPhone?: string;
  architectEmail?: string;
  contacts: ProjectContact[];
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

class ProjectsApiService {
  async getProjects(params?: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
  }): Promise<ProjectsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.clientId) searchParams.append('clientId', params.clientId);

    const url = `${API_BASE_URL}/projects${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    
    return response.json();
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
      throw new Error(errorData?.message || 'Failed to create project');
    }
    
    const result = await response.json();
    return result.data; // Backend returns { success, data, message }
  }

  async getProjectById(id: string): Promise<Project> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project');
    }
    
    return response.json();
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
      throw new Error('Failed to update project');
    }
    
    return response.json();
  }

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  }

  async getProjectStats() {
    const response = await fetch(`${API_BASE_URL}/projects/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch project stats');
    }
    
    return response.json();
  }

  async getProjectsByClient(clientId: string): Promise<Project[]> {
    const response = await fetch(`${API_BASE_URL}/projects?clientId=${clientId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch client projects');
    }
    
    const data = await response.json();
    return data.data || [];
  }
}

export const projectsApi = new ProjectsApiService(); 