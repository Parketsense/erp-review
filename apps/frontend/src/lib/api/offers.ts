import { apiClient } from '../api';

export interface ClientOfferData {
  id: string;
  offerNumber: string;
  subject: string;
  projectName: string;
  clientName: string;
  validUntil: string;
  variants: Array<{
    id: string;
    name: string;
    description?: string;
    rooms: Array<{
      id: string;
      name: string;
      products: Array<{
        id: string;
        name: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        totalPrice: number;
      }>;
      totalPrice: number;
    }>;
    totalPrice: number;
  }>;
  installationPhase?: {
    id: string;
    name: string;
    description?: string;
  };
  terms: string[];
}

export interface OfferSelection {
  selectedVariants: string[];
  selectedRooms: Record<string, string[]>;
  selectedProducts: Record<string, string[]>;
  selectedOptions: string[];
  customizations: Record<string, any>;
}

export interface PricingData {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  breakdown: {
    variants: Record<string, number>;
    rooms: Record<string, number>;
    products: Record<string, number>;
    installations: Record<string, number>;
  };
}

export interface OfferUpdate {
  type: 'variant' | 'room' | 'product' | 'option';
  action: 'select' | 'deselect' | 'update';
  id: string;
  data?: any;
}

export const interactiveOffersApi = {
  /**
   * Get offer data for client view
   */
  async getOfferData(token: string, offerId: string): Promise<ClientOfferData> {
    const response = await apiClient.get<ClientOfferData>(`/offers/client/${offerId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  },

  /**
   * Update offer selection
   */
  async updateSelection(token: string, offerId: string, selection: OfferSelection): Promise<void> {
    await apiClient.put(`/offers/client/${offerId}/selection`, selection, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  /**
   * Calculate pricing based on selection
   */
  async calculatePricing(token: string, offerId: string, selection: OfferSelection): Promise<PricingData> {
    const response = await apiClient.post<PricingData>(`/offers/client/${offerId}/pricing`, selection, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  },

  /**
   * Get product galleries
   */
  async getGalleries(token: string, offerId: string): Promise<Array<{
    id: string;
    name: string;
    images: Array<{
      id: string;
      url: string;
      alt: string;
      thumbnail: string;
    }>;
  }>> {
    const response = await apiClient.get<Array<{
      id: string;
      name: string;
      images: Array<{
        id: string;
        url: string;
        alt: string;
        thumbnail: string;
      }>;
    }>>(`/offers/client/${offerId}/galleries`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  },

  /**
   * Submit feedback
   */
  async submitFeedback(token: string, offerId: string, feedback: {
    rating: number;
    comments: string;
    contactPreference: 'email' | 'phone' | 'meeting';
  }): Promise<void> {
    await apiClient.post(`/offers/client/${offerId}/feedback`, feedback, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  /**
   * Accept offer
   */
  async acceptOffer(token: string, offerId: string, acceptanceData: {
    acceptedAt: string;
    notes?: string;
    contactInfo: {
      name: string;
      email: string;
      phone?: string;
    };
  }): Promise<void> {
    await apiClient.post(`/offers/client/${offerId}/accept`, acceptanceData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  /**
   * Reject offer
   */
  async rejectOffer(token: string, offerId: string, rejectionData: {
    rejectedAt: string;
    reason: string;
    comments?: string;
    contactInfo: {
      name: string;
      email: string;
      phone?: string;
    };
  }): Promise<void> {
    await apiClient.post(`/offers/client/${offerId}/reject`, rejectionData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  /**
   * Request modification
   */
  async requestModification(token: string, offerId: string, modificationData: {
    requestedAt: string;
    changes: string[];
    priority: 'low' | 'medium' | 'high';
    contactInfo: {
      name: string;
      email: string;
      phone?: string;
    };
  }): Promise<void> {
    await apiClient.post(`/offers/client/${offerId}/modify`, modificationData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}; 