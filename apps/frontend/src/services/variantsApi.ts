import { PhaseVariant, CreateVariantDto, UpdateVariantDto, CloneVariantDto, VariantStats } from '../types/variant';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const variantsApi = {
  // Get all variants for a phase
  getByPhase: async (phaseId: string): Promise<PhaseVariant[]> => {
    const response = await fetch(`${API_BASE_URL}/variants/phase/${phaseId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch variants');
    }
    return response.json();
  },

  // Get single variant
  getById: async (id: string): Promise<PhaseVariant> => {
    const response = await fetch(`${API_BASE_URL}/variants/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch variant');
    }
    return response.json();
  },

  // Create new variant
  create: async (phaseId: string, data: CreateVariantDto): Promise<PhaseVariant> => {
    const response = await fetch(`${API_BASE_URL}/variants/phase/${phaseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create variant');
    }
    return response.json();
  },

  // Update variant
  update: async (id: string, data: UpdateVariantDto): Promise<PhaseVariant> => {
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
    return response.json();
  },

  // Clone variant
  clone: async (id: string, data: CloneVariantDto): Promise<PhaseVariant> => {
    const response = await fetch(`${API_BASE_URL}/variants/${id}/clone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to clone variant');
    }
    return response.json();
  },

  // Delete variant
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/variants/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete variant');
    }
  },

  // Get variant statistics
  getStats: async (phaseId: string): Promise<VariantStats> => {
    const response = await fetch(`${API_BASE_URL}/variants/phase/${phaseId}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch variant stats');
    }
    return response.json();
  },
}; 