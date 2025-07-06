import { apiClient } from '@/lib/api';

export interface Variant {
  id: string;
  name: string;
  description?: string;
  phaseId: string;
  isActive: boolean;
  order: number;
  discountPercent: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantDto {
  name: string;
  description?: string;
  phaseId: string;
  discountPercent?: number;
}

export interface UpdateVariantDto {
  name?: string;
  description?: string;
  discountPercent?: number;
  isActive?: boolean;
}

export interface VariantStats {
  total: number;
  active: number;
  inactive: number;
  averagePrice: number;
  totalValue: number;
}

export interface VariantWithRooms extends Variant {
  rooms: Array<{
    id: string;
    name: string;
    area: number;
    wasteFactorPercent: number;
    discountPercent: number;
    totalPrice: number;
    products: Array<{
      id: string;
      productId: string;
      productName: string;
      productCode: string;
      manufacturer: string;
      productType: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      discountPercent: number;
      totalPrice: number;
    }>;
  }>;
}

export const variantsApi = {
  // Get all variants with pagination and filters
  async getAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    phaseId?: string;
    includeInactive?: boolean;
  } = {}): Promise<{ data: Variant[]; total: number; page: number; limit: number }> {
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
  async getByProject(projectId: string): Promise<Variant[]> {
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
  async getByPhase(phaseId: string): Promise<Variant[]> {
    const response = await apiClient.get(`/variants/phase/${phaseId}`) as any;
    return response.data;
  },

  // Get a single variant by ID
  async getById(id: string): Promise<Variant> {
    const response = await apiClient.get(`/variants/${id}`) as any;
    return response.data;
  },

  // Create a new variant
  async create(data: CreateVariantDto): Promise<Variant> {
    const response = await apiClient.post('/variants', data) as any;
    return response.data;
  },

  // Update a variant
  async update(id: string, data: UpdateVariantDto): Promise<Variant> {
    const response = await apiClient.patch(`/variants/${id}`, data) as any;
    return response.data;
  },

  // Delete a variant
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/variants/${id}`);
  },

  // Duplicate a variant
  async duplicate(id: string): Promise<Variant> {
    const response = await apiClient.post(`/variants/${id}/duplicate`) as any;
    return response.data;
  },

  // Update discounts for a variant
  async updateDiscounts(id: string, discountPercent: number): Promise<Variant> {
    const response = await apiClient.post(`/variants/${id}/update-discounts`, {
      discountPercent
    }) as any;
    return response.data;
  },

  // Select a variant (mark as selected)
  async select(id: string): Promise<Variant> {
    const response = await apiClient.post(`/variants/${id}/select`) as any;
    return response.data;
  },

  // Reorder variants in a phase
  async reorder(phaseId: string, variantIds: string[]): Promise<Variant[]> {
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
  async toggleActive(id: string): Promise<Variant> {
    const response = await apiClient.patch(`/variants/${id}/toggle-active`) as any;
    return response.data;
  },

  // Get variants for offer generation
  async getForOffer(phaseId: string): Promise<VariantWithRooms[]> {
    const response = await apiClient.get(`/phases/${phaseId}/variants/offer`) as any;
    return response.data;
  }
};

export default variantsApi;