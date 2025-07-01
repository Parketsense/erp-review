import { Phase, PhasesResponse, PhaseStats, CreatePhaseDto, UpdatePhaseDto, PhaseVariant, CreatePhaseVariantDto, UpdatePhaseVariantDto } from '../types/phase';
import { API_BASE_URL } from '../lib/api';

class PhasesApiService {
  // Phase operations
  async getPhases(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    projectId?: string;
    architectCommission?: boolean;
  }): Promise<PhasesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.projectId) searchParams.append('projectId', params.projectId);
    if (params?.architectCommission !== undefined) searchParams.append('architectCommission', params.architectCommission.toString());

    const url = `${API_BASE_URL}/phases${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch phases');
    }
    
    return response.json();
  }

  async getPhasesByProject(projectId: string): Promise<Phase[]> {
    const response = await fetch(`${API_BASE_URL}/phases/project/${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project phases');
    }
    
    return response.json();
  }

  async getPhaseStats(): Promise<PhaseStats> {
    const response = await fetch(`${API_BASE_URL}/phases/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch phase stats');
    }
    
    return response.json();
  }

  async getPhaseById(id: string): Promise<Phase> {
    const response = await fetch(`${API_BASE_URL}/phases/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch phase');
    }
    
    return response.json();
  }

  async createPhase(projectId: string, phase: CreatePhaseDto): Promise<Phase> {
    const response = await fetch(`${API_BASE_URL}/phases/project/${projectId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phase),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create phase';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Could not parse error response
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  async updatePhase(id: string, phase: UpdatePhaseDto): Promise<Phase> {
    const response = await fetch(`${API_BASE_URL}/phases/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phase),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update phase');
    }
    
    return response.json();
  }

  async deletePhase(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/phases/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete phase');
    }
  }

  async reorderPhases(projectId: string, phaseOrders: { id: string; phaseOrder: number }[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/phases/project/${projectId}/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phases: phaseOrders }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reorder phases');
    }
  }

  // Phase variant operations
  async getPhaseVariants(phaseId: string): Promise<PhaseVariant[]> {
    const response = await fetch(`${API_BASE_URL}/phases/${phaseId}/variants`);
    if (!response.ok) {
      throw new Error('Failed to fetch phase variants');
    }
    
    return response.json();
  }

  async createPhaseVariant(variant: CreatePhaseVariantDto): Promise<PhaseVariant> {
    const response = await fetch(`${API_BASE_URL}/phases/${variant.phaseId}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variant),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create phase variant');
    }
    
    return response.json();
  }

  async updatePhaseVariant(phaseId: string, variantId: string, variant: UpdatePhaseVariantDto): Promise<PhaseVariant> {
    const response = await fetch(`${API_BASE_URL}/phases/${phaseId}/variants/${variantId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(variant),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update phase variant');
    }
    
    return response.json();
  }

  async deletePhaseVariant(phaseId: string, variantId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/phases/${phaseId}/variants/${variantId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete phase variant');
    }
  }
}

export const phasesApi = new PhasesApiService(); 