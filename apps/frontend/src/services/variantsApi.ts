import { 
  PhaseVariant, 
  CreateVariantDto, 
  UpdateVariantDto, 
  VariantStats,
  ApiResponse 
} from '@/types/variant';
import { API_CONFIG } from '@/lib/env';

const API_BASE_URL = API_CONFIG.baseUrl;

export const variantsApi = {
  // Create new variant
  async createVariant(data: CreateVariantDto): Promise<PhaseVariant> {
    const response = await fetch(`${API_BASE_URL}/variants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create variant');
    }

    const result: ApiResponse<PhaseVariant> = await response.json();
    return result.data;
  },

  // Get all variants
  async getAllVariants(): Promise<PhaseVariant[]> {
    const response = await fetch(`${API_BASE_URL}/variants`);

    if (!response.ok) {
      throw new Error('Failed to fetch variants');
    }

    const result: ApiResponse<PhaseVariant[]> = await response.json();
    return result.data;
  },

  // Get variants by phase
  async getVariantsByPhase(phaseId: string): Promise<PhaseVariant[]> {
    const response = await fetch(`${API_BASE_URL}/variants/phase/${phaseId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch phase variants');
    }

    const result: ApiResponse<PhaseVariant[]> = await response.json();
    return result.data;
  },

  // Get single variant
  async getVariantById(id: string): Promise<PhaseVariant> {
    const response = await fetch(`${API_BASE_URL}/variants/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch variant');
    }

    const result: ApiResponse<PhaseVariant> = await response.json();
    return result.data;
  },

  // Update variant
  async updateVariant(id: string, data: UpdateVariantDto): Promise<PhaseVariant> {
    const response = await fetch(`${API_BASE_URL}/variants/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update variant');
    }

    const result: ApiResponse<PhaseVariant> = await response.json();
    return result.data;
  },

  // Delete variant
  async deleteVariant(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/variants/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete variant');
    }
  },

  // Reorder variants
  async reorderVariants(phaseId: string, variantIds: string[]): Promise<PhaseVariant[]> {
    const response = await fetch(`${API_BASE_URL}/variants/phase/${phaseId}/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ variantIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to reorder variants');
    }

    const result: ApiResponse<PhaseVariant[]> = await response.json();
    return result.data;
  },

  // Duplicate variant
  async duplicateVariant(id: string, options?: {
    name?: string;
    targetPhaseId?: string;
    cloneType?: 'all' | 'selected';
    selectedRoomIds?: string[];
    includeProducts?: boolean;
  }): Promise<PhaseVariant> {
    const response = await fetch(`${API_BASE_URL}/variants/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      throw new Error('Failed to duplicate variant');
    }

    const result: ApiResponse<PhaseVariant> = await response.json();
    return result.data;
  },

  // Get variant stats
  async getVariantStats(): Promise<VariantStats> {
    const response = await fetch(`${API_BASE_URL}/variants/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch variant stats');
    }

    const result: ApiResponse<VariantStats> = await response.json();
    return result.data;
  },
}; 