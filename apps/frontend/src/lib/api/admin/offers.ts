import { apiClient } from '../../api';
import { CreateOfferDto, UpdateOfferDto, OfferStats, SendOfferDto, Offer } from '@/types/offer';
import { Project } from '@/types/project';
import { Client } from '@/types/client';
import type { 
  OfferSummary, 
  VariantForOffer, 
  PhaseOfferData
} from '@/types/offers';

export interface AdminOfferFilters {
  search?: string;
  status?: string;
  clientId?: string;
  dateRange?: 'today' | 'week' | 'month';
  page?: number;
  limit?: number;
}

export interface AdminOffersResponse {
  data: Offer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateOfferFromProjectData {
  projectId: string;
  phaseId?: string;
  variantId?: string;
  clientId: string;
  offerNumber: string;
  subject: string;
  validUntil: string;
  conditions?: string;
  emailSubject?: string;
  emailBody?: string;
}

export interface RoomSummary {
  id: string;
  name: string;
  productCount: number;
  totalPrice: number;
}

export const adminOffersApi = {
  /**
   * Get all offers with pagination and filters
   */
  async getAllOffers(filters: AdminOfferFilters = {}): Promise<AdminOffersResponse> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.dateRange) params.append('dateRange', filters.dateRange);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<AdminOffersResponse>(`/offers/admin?${params.toString()}`);
    return response;
  },

  /**
   * Get offer statistics
   */
  async getOffersStats(): Promise<OfferStats> {
    const response = await apiClient.get<OfferStats>('/offers/admin/stats');
    return response;
  },

  /**
   * Get single offer by ID
   */
  async getOfferById(id: string): Promise<Offer> {
    const response = await apiClient.get<Offer>(`/offers/admin/${id}`);
    return response;
  },

  /**
   * Create new offer
   */
  async createOffer(data: CreateOfferDto): Promise<Offer> {
    const response = await apiClient.post<Offer>('/offers', data);
    return response;
  },

  /**
   * Create offer from existing project
   */
  async createOfferFromProject(data: CreateOfferFromProjectData): Promise<Offer> {
    const response = await apiClient.post<Offer>('/offers/from-project', data);
    return response;
  },

  /**
   * Create offer from phase with selected variants
   */
  async createOfferFromPhase(phaseId: string, data: PhaseOfferData): Promise<Offer> {
    const response = await apiClient.post<Offer>(`/offers/phase/${phaseId}`, data);
    return response;
  },

  /**
   * Get all offers for a specific phase
   */
  async getPhaseOffers(phaseId: string): Promise<OfferSummary[]> {
    try {
      const response = await apiClient.get<OfferSummary[]>(`/phases/${phaseId}/offers`);
      
      // Винаги върни масив, дори ако response е null/undefined
      if (Array.isArray(response)) {
        return response;
      } else {
        console.warn('API response is not an array, returning empty array');
        return [];
      }
    } catch (error) {
      console.error('Error fetching phase offers:', error);
      // При грешка върни празен масив вместо да хвърляш error
      return [];
    }
  },

  /**
   * Get variants ready for offer creation from a phase
   */
  async getPhaseVariantsForOffer(phaseId: string): Promise<VariantForOffer[]> {
    const response = await apiClient.get<VariantForOffer[]>(`/phases/${phaseId}/variants/offer`);
    return response;
  },

  /**
   * Link installation phase to offer
   */
  async linkInstallationPhase(offerId: string, installPhaseId: string): Promise<void> {
    await apiClient.put(`/offers/${offerId}/installation-phase`, { installPhaseId });
  },

  /**
   * Create new version of existing offer
   */
  async createOfferVersion(originalOfferId: string, changes: Partial<PhaseOfferData>): Promise<Offer> {
    const response = await apiClient.post<Offer>(`/offers/${originalOfferId}/versions`, changes);
    return response;
  },

  /**
   * Get offer versions history
   */
  async getOfferVersions(offerId: string): Promise<OfferSummary[]> {
    const response = await apiClient.get<OfferSummary[]>(`/offers/${offerId}/versions`);
    return response;
  },

  /**
   * Update offer
   */
  async updateOffer(id: string, data: UpdateOfferDto): Promise<Offer> {
    const response = await apiClient.patch<Offer>(`/offers/${id}`, data);
    return response;
  },

  /**
   * Delete offer
   */
  async deleteOffer(id: string): Promise<void> {
    await apiClient.delete(`/offers/${id}`);
  },

  /**
   * Send offer to client
   */
  async sendOffer(id: string, emailData?: SendOfferDto): Promise<Offer> {
    const response = await apiClient.post<Offer>(`/offers/${id}/send`, emailData || {});
    return response;
  },

  /**
   * Generate JWT token for client access
   */
  async generateOfferToken(offerId: string): Promise<{ token: string; expiresAt: string }> {
    const response = await apiClient.post<{ token: string; expiresAt: string }>(`/offers/${offerId}/generate-token`);
    return response;
  },

  /**
   * Get offer analytics
   */
  async getOfferAnalytics(id: string): Promise<{
    views: number;
    uniqueViews: number;
    timeSpent: number;
    lastViewed: string | null;
    interactions: Array<{
      type: string;
      timestamp: string;
      data: any;
    }>;
  }> {
    const response = await apiClient.get<{
      views: number;
      uniqueViews: number;
      timeSpent: number;
      lastViewed: string | null;
      interactions: Array<{
        type: string;
        timestamp: string;
        data: any;
      }>;
    }>(`/offers/${id}/analytics`);
    return response;
  },

  /**
   * Get offer preview data (same as client sees)
   */
  async getOfferPreview(id: string): Promise<Offer> {
    const response = await apiClient.get<Offer>(`/offers/${id}/preview`);
    return response;
  },

  /**
   * Bulk operations
   */
  async bulkDeleteOffers(ids: string[]): Promise<void> {
    await apiClient.post('/offers/bulk-delete', { ids });
  },

  async bulkSendOffers(ids: string[], emailData: SendOfferDto): Promise<void> {
    await apiClient.post('/offers/bulk-send', { ids, emailData });
  },

  async bulkUpdateStatus(ids: string[], status: string): Promise<void> {
    await apiClient.post('/offers/bulk-update-status', { ids, status });
  },

  /**
   * Get available projects for offer creation
   */
  async getAvailableProjects(): Promise<Project[]> {
    const response = await apiClient.get<{ data: Project[] }>('/projects');
    return response.data || [];
  },

  /**
   * Get available clients for offer creation
   */
  async getAvailableClients(): Promise<Client[]> {
    const response = await apiClient.get<{ data: Client[] }>('/clients');
    return response.data || [];
  },

  /**
   * Duplicate existing offer
   */
  async duplicateOffer(id: string, newData?: Partial<CreateOfferDto>): Promise<Offer> {
    const response = await apiClient.post<Offer>(`/offers/${id}/duplicate`, newData || {});
    return response;
  },

  /**
   * Export offers to PDF/Excel
   */
  async exportOffers(filters: AdminOfferFilters, format: 'pdf' | 'excel'): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.dateRange) params.append('dateRange', filters.dateRange);
    params.append('format', format);

    const response = await apiClient.get<Blob>(`/offers/admin/export?${params.toString()}`);
    return response;
  },

  /**
   * Get offer templates
   */
  async getOfferTemplates(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    subject: string;
    body: string;
    conditions: string;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      name: string;
      description: string;
      subject: string;
      body: string;
      conditions: string;
    }>>('/offers/templates');
    return response;
  },

  /**
   * Save offer as template
   */
  async saveAsTemplate(id: string, templateData: {
    name: string;
    description: string;
  }): Promise<void> {
    await apiClient.post(`/offers/${id}/save-as-template`, templateData);
  },

  /**
   * Get offer activity log
   */
  async getOfferActivityLog(id: string): Promise<Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
    userId: string;
    userEmail: string;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      action: string;
      description: string;
      timestamp: string;
      userId: string;
      userEmail: string;
    }>>(`/offers/${id}/activity-log`);
    return response;
  },

  /**
   * Update offer status
   */
  async updateOfferStatus(id: string, status: string, notes?: string): Promise<Offer> {
    const response = await apiClient.patch<Offer>(`/offers/${id}/status`, { status, notes });
    return response;
  },

  /**
   * Get offer comparison
   */
  async getOfferComparison(ids: string[]): Promise<{
    offers: Offer[];
    comparison: {
      totalValues: number[];
      averageValues: number[];
      statusDistribution: Record<string, number>;
    };
  }> {
    const response = await apiClient.post<{
      offers: Offer[];
      comparison: {
        totalValues: number[];
        averageValues: number[];
        statusDistribution: Record<string, number>;
      };
    }>('/offers/compare', { ids });
    return response;
  },

  /**
   * Get offer performance metrics
   */
  async getOfferPerformanceMetrics(timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    totalOffers: number;
    totalValue: number;
    averageValue: number;
    acceptanceRate: number;
    viewRate: number;
    averageTimeToView: number;
    topPerformingOffers: Offer[];
    statusBreakdown: Record<string, number>;
    trendData: Array<{
      date: string;
      offers: number;
      value: number;
    }>;
  }> {
    const response = await apiClient.get<{
      totalOffers: number;
      totalValue: number;
      averageValue: number;
      acceptanceRate: number;
      viewRate: number;
      averageTimeToView: number;
      topPerformingOffers: Offer[];
      statusBreakdown: Record<string, number>;
      trendData: Array<{
        date: string;
        offers: number;
        value: number;
      }>;
    }>(`/offers/performance-metrics?timeRange=${timeRange}`);
    return response;
  },


};

// Export for backward compatibility
export const offersApi = adminOffersApi; 