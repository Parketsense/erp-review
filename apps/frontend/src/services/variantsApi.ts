import { apiClient } from '@/lib/api';
import { PhaseVariant, VariantRoom } from '@/types/variant';

export interface CreateVariantDto {
  name: string;
  description?: string;
  phaseId: string;
  discountPercent?: number;
  designer?: string;
  architect?: string;
  architectCommission?: number;
  isSelected?: boolean;
  includeInOffer?: boolean;
  discountEnabled?: boolean;
  variantDiscount?: number;
}

export interface UpdateVariantDto {
  name?: string;
  description?: string;
  discountPercent?: number;
  isActive?: boolean;
  designer?: string;
  architect?: string;
  architectCommission?: number;
  isSelected?: boolean;
  includeInOffer?: boolean;
  discountEnabled?: boolean;
  variantDiscount?: number;
}

export interface VariantStats {
  total: number;
  active: number;
  inactive: number;
  averagePrice: number;
  totalValue: number;
}

export interface VariantWithRooms extends PhaseVariant {
  rooms: VariantRoom[];
}

export const variantsApi = {
  // Get all variants with pagination and filters
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    phaseId?: string;
    includeInactive?: boolean;
  } = {}): Promise<{ data: PhaseVariant[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.search) params.append('search', options.search);
    if (options.phaseId) params.append('phaseId', options.phaseId);
    if (options.includeInactive) params.append('includeInactive', 'true');
    
    const response = await apiClient.get(`/variants?${params.toString()}`) as any;
    return response.data;
  },

  // Get variants for a specific project (ADDED - THIS WAS MISSING!)
  async getByProject(projectId: string): Promise<PhaseVariant[]> {
    try {
      const response = await apiClient.get(`/variants/project/${projectId}`) as any;
      return response.data;
    } catch (error) {
      console.error(`Error fetching variants for project ${projectId}:`, error);
      // Fallback to getAll if project-specific endpoint doesn't exist
      const allVariants = await this.getAll();
      return allVariants.data;
    }
  },

  // Get variants for a specific phase
  async getByPhase(phaseId: string): Promise<PhaseVariant[]> {
    try {
      const response = await apiClient.get(`/variants/phase/${phaseId}`) as any;
      console.log('🔍 Raw API response:', response);
      
      // Backend returns { success: true, data: [...], message: "..." }
      if (response && typeof response === 'object' && 'data' in response) {
        console.log('✅ Extracted data:', response.data);
        return response.data;
      }
      
      // Fallback if response structure is different
      console.log('⚠️ Using response as data:', response);
      return response;
    } catch (error) {
      console.error('❌ API Error in getByPhase:', error);
      throw error;
    }
  },

  // Get a single variant by ID
  async getById(id: string): Promise<PhaseVariant> {
    const response = await apiClient.get(`/variants/${id}`) as any;
    return response.data;
  },

  // Create a new variant
  async create(data: CreateVariantDto): Promise<PhaseVariant> {
    const response = await apiClient.post('/variants', data) as any;
    return response.data;
  },

  // Update a variant
  async update(id: string, data: UpdateVariantDto): Promise<PhaseVariant> {
    const response = await apiClient.patch(`/variants/${id}`, data) as any;
    return response.data;
  },

  // Delete a variant
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/variants/${id}`);
  },

  // Duplicate a variant
  async duplicate(id: string): Promise<PhaseVariant> {
    const response = await apiClient.post(`/variants/${id}/duplicate`) as any;
    return response.data;
  },

  // ✅ NEW: Duplicate variant with advanced options
  async duplicateVariant(id: string, options: {
    name: string;
    targetPhaseId: string;
    cloneType: 'all' | 'selected';
    selectedRoomIds?: string[];
    includeProducts: boolean;
  }): Promise<PhaseVariant> {
    const response = await apiClient.post(`/variants/${id}/duplicate`, options) as any;
    return response.data;
  },

  // Update discounts for a variant
  async updateDiscounts(id: string, discountPercent: number): Promise<PhaseVariant> {
    const response = await apiClient.post(`/variants/${id}/update-discounts`, {
      discountPercent
    }) as any;
    return response.data;
  },

  // Select a variant (mark as selected)
  async select(id: string): Promise<PhaseVariant> {
    const response = await apiClient.post(`/variants/${id}/select`) as any;
    return response.data;
  },

  // Reorder variants in a phase
  async reorder(phaseId: string, variantIds: string[]): Promise<PhaseVariant[]> {
    const response = await apiClient.put(`/variants/phase/${phaseId}/reorder`, {
      variantIds
    }) as any;
    return response.data;
  },

  // Get variant statistics
  async getStats(): Promise<VariantStats> {
    const response = await apiClient.get('/variants/stats') as any;
    return response.data;
  },

  // Get variant with rooms and products (detailed view)
  async getWithRooms(id: string): Promise<VariantWithRooms> {
    const response = await apiClient.get(`/variants/${id}?include=rooms,products`) as any;
    return response.data;
  },

  // Toggle variant active status
  async toggleActive(id: string): Promise<PhaseVariant> {
    const response = await apiClient.patch(`/variants/${id}/toggle-active`) as any;
    return response.data;
  },

  // Get variants for offer generation
  async getForOffer(phaseId: string): Promise<VariantWithRooms[]> {
    const response = await apiClient.get(`/phases/${phaseId}/variants/offer`) as any;
    return response.data;
  },

  // ✅ NEW: Get variant statistics for a specific phase
  async getPhaseStats(phaseId: string): Promise<VariantStats> {
    const response = await apiClient.get(`/variants/phase/${phaseId}/stats`) as any;
    return response.data;
  },

  // ✅ NEW: Bulk update variants
  async bulkUpdate(variantIds: string[], data: Partial<UpdateVariantDto>): Promise<PhaseVariant[]> {
    const response = await apiClient.patch('/variants/bulk-update', {
      variantIds,
      data
    }) as any;
    return response.data;
  },

  // ✅ NEW: Bulk delete variants
  async bulkDelete(variantIds: string[]): Promise<void> {
    await apiClient.delete('/variants/bulk-delete');
  },

  // ✅ NEW: Export variants to CSV/Excel
  async exportVariants(phaseId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await apiClient.get(`/variants/phase/${phaseId}/export?format=${format}`) as any;
    return response.data;
  },

  // ✅ NEW: Import variants from CSV/Excel
  async importVariants(phaseId: string, file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/variants/phase/${phaseId}/import`, formData) as any;
    return response.data;
  }
};

export default variantsApi;