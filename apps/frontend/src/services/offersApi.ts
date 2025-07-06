import { Offer, OffersResponse, OfferStats, CreateOfferDto, UpdateOfferDto } from '../types/offer';
import { API_BASE_URL } from '../lib/api';

class OffersApiService {
  async getOffers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    projectId?: string;
    clientId?: string;
  }): Promise<OffersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.projectId) searchParams.append('projectId', params.projectId);
    if (params?.clientId) searchParams.append('clientId', params.clientId);

    const url = `${API_BASE_URL}/offers${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch offers');
    }
    
    return response.json();
  }

  async getOfferStats(): Promise<OfferStats> {
    const response = await fetch(`${API_BASE_URL}/offers/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch offer stats');
    }
    
    return response.json();
  }

  async getOfferById(id: string): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch offer');
    }
    
    const result = await response.json();
    return result.data;
  }

  async createOffer(offer: CreateOfferDto): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offer),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create offer');
    }
    
    return response.json();
  }

  async updateOffer(id: string, offer: UpdateOfferDto): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offer),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update offer');
    }
    
    return response.json();
  }

  async deleteOffer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete offer');
    }
  }

  async toggleOfferActive(id: string): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}/toggle-active`, {
      method: 'PATCH',
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle offer active status');
    }
    
    return response.json();
  }

  async checkOfferNumber(offerNumber: string): Promise<{ exists: boolean }> {
    const response = await fetch(`${API_BASE_URL}/offers/check-offer-number/${offerNumber}`);
    if (!response.ok) {
      throw new Error('Failed to check offer number');
    }
    
    return response.json();
  }
}

export const offersApi = new OffersApiService(); 