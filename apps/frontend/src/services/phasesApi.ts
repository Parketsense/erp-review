import { apiClient } from '../lib/api';

export interface CreatePhaseDto {
  name: string;
  description?: string;
  includeArchitectCommission?: boolean;
  discountEnabled?: boolean;
  phaseDiscount?: number;
  status?: 'created' | 'quoted' | 'won' | 'lost';
}

export interface UpdatePhaseDto {
  name?: string;
  description?: string;
  includeArchitectCommission?: boolean;
  discountEnabled?: boolean;
  phaseDiscount?: number;
  status?: 'created' | 'quoted' | 'won' | 'lost';
  phaseOrder?: number;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  includeArchitectCommission: boolean;
  discountEnabled?: boolean;
  phaseDiscount?: number;
  status: 'created' | 'quoted' | 'won' | 'lost';
  phaseOrder: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  project?: {
    id: string;
    name: string;
    architectName?: string;
    architectCommission?: number;
    client?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  
  // Calculated fields (will be added later)
  variantsCount?: number;
  totalValue?: number;
  commissionDue?: number;
  commissionPaid?: number;
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'overpaid';
}

export interface PhasesResponse {
  data: ProjectPhase[];
  meta?: {
    total: number;
    projectId: string;
  };
}

export interface PhaseStats {
  totalPhases: number;
  byStatus: {
    created: number;
    quoted: number;
    won: number;
    lost: number;
  };
  totalValue: number;
  totalCommission: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class PhasesApiService {
  async getPhasesByProject(projectId: string): Promise<PhasesResponse> {
    const response = await apiClient.get<ApiResponse<ProjectPhase[]>>(`/phases/project/${projectId}`);
    return response.data ? { data: response.data } : response;
  }

  async createPhase(projectId: string, phase: CreatePhaseDto): Promise<ProjectPhase> {
    const response = await apiClient.post<ApiResponse<ProjectPhase>>(`/phases/project/${projectId}`, phase);
    return response.data;
  }

  async getPhaseById(id: string): Promise<ProjectPhase> {
    const response = await apiClient.get<ApiResponse<ProjectPhase>>(`/phases/${id}`);
    return response.data || response;
  }

  async updatePhase(id: string, phase: UpdatePhaseDto): Promise<ProjectPhase> {
    const response = await apiClient.patch<ApiResponse<ProjectPhase>>(`/phases/${id}`, phase);
    return response.data || response;
  }

  async deletePhase(id: string): Promise<void> {
    await apiClient.delete(`/phases/${id}`);
  }

  async reorderPhases(projectId: string, phases: { phaseId: string; newOrder: number }[]): Promise<void> {
    await apiClient.put(`/phases/project/${projectId}/reorder`, { phases });
  }

  async getPhaseStats(): Promise<PhaseStats> {
    return apiClient.get<PhaseStats>('/phases/stats');
  }
}

export const phasesApi = new PhasesApiService(); 