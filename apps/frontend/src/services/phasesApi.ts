import { API_BASE_URL } from '../lib/api';

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

class PhasesApiService {
  async getPhasesByProject(projectId: string): Promise<PhasesResponse> {
    const response = await fetch(`${API_BASE_URL}/phases/project/${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project phases');
    }
    
    const result = await response.json();
    return result.data ? { data: result.data } : result;
  }

  async createPhase(projectId: string, phase: CreatePhaseDto): Promise<ProjectPhase> {
    const response = await fetch(`${API_BASE_URL}/phases/project/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phase),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to create phase');
    }
    
    const result = await response.json();
    return result.data; // Backend returns { success, data, message }
  }

  async getPhaseById(id: string): Promise<ProjectPhase> {
    const response = await fetch(`${API_BASE_URL}/phases/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch phase');
    }
    
    const result = await response.json();
    return result.data || result;
  }

  async updatePhase(id: string, phase: UpdatePhaseDto): Promise<ProjectPhase> {
    const response = await fetch(`${API_BASE_URL}/phases/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phase),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to update phase');
    }
    
    const result = await response.json();
    return result.data || result;
  }

  async deletePhase(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/phases/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete phase');
    }
  }

  async reorderPhases(projectId: string, phases: { phaseId: string; newOrder: number }[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/phases/project/${projectId}/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phases }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to reorder phases');
    }
  }

  async getPhaseStats(): Promise<PhaseStats> {
    const response = await fetch(`${API_BASE_URL}/phases/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch phase stats');
    }
    
    return response.json();
  }
}

export const phasesApi = new PhasesApiService(); 