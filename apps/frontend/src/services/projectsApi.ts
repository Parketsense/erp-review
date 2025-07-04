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

      const url = `${API_BASE_URL}/projects${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      
      console.log('🔍 Fetching projects from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`Failed to fetch projects: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
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
    
    const result = await response.json();
    return result.data; // Backend returns { success, data }
  }

  // Alias for getProjectById to maintain compatibility
  async getProject(id: string): Promise<Project> {
    return this.getProjectById(id);
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
    
    const result = await response.json();
    return result.data; // Backend returns { success, data, message }
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