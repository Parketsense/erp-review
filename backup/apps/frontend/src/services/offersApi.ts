import { OfferType, OfferStatus } from '../types/offers';

export interface OfferItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  unit?: string;
}

export interface Offer {
  id: string;
  offerNumber: string;
  type: OfferType;
  status: OfferStatus;
  projectId: string;
  variantId: string;
  roomId: string;
  clientId: string;
  totalAmount: number;
  currency: string;
  validUntil?: string;
  notes?: string;
  terms?: string;
  conditions?: string;
  issuedBy?: string;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
  items: OfferItem[];
  project?: {
    id: string;
    name: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  room?: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateOfferData {
  offerNumber: string;
  type: OfferType;
  projectId: string;
  variantId: string;
  roomId: string;
  clientId: string;
  totalAmount: number;
  currency?: string;
  validUntil?: string;
  notes?: string;
  terms?: string;
  conditions?: string;
  items: Omit<OfferItem, 'id'>[];
}

export interface UpdateOfferData extends Partial<CreateOfferData> {
  status?: OfferStatus;
}

export interface OfferStats {
  totalOffers: number;
  draftOffers: number;
  sentOffers: number;
  acceptedOffers: number;
  totalAmount: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const offersApi = {
  // Get all offers with optional filters
  async getOffers(params?: {
    type?: OfferType;
    projectId?: string;
    variantId?: string;
    status?: OfferStatus;
  }): Promise<Offer[]> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.projectId) searchParams.append('projectId', params.projectId);
    if (params?.variantId) searchParams.append('variantId', params.variantId);
    if (params?.status) searchParams.append('status', params.status);

    const response = await fetch(`${API_BASE_URL}/offers?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch offers');
    }
    return response.json();
  },

  // Get offer by ID
  async getOffer(id: string): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch offer');
    }
    return response.json();
  },

  // Create new offer
  async createOffer(data: CreateOfferData): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create offer');
    }
    return response.json();
  },

  // Update offer
  async updateOffer(id: string, data: UpdateOfferData): Promise<Offer> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update offer');
    }
    return response.json();
  },

  // Delete offer
  async deleteOffer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete offer');
    }
  },

  // Get offer statistics
  async getOfferStats(): Promise<OfferStats> {
    const response = await fetch(`${API_BASE_URL}/offers/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch offer stats');
    }
    return response.json();
  },

  // Generate offer number
  async generateOfferNumber(type: OfferType): Promise<{ offerNumber: string }> {
    const response = await fetch(`${API_BASE_URL}/offers/generate-number`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate offer number');
    }
    return response.json();
  },

  // Get offers by project
  async getOffersByProject(projectId: string): Promise<Offer[]> {
    const response = await fetch(`${API_BASE_URL}/offers?projectId=${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project offers');
    }
    return response.json();
  },

  // Get offers by variant
  async getOffersByVariant(variantId: string): Promise<Offer[]> {
    const response = await fetch(`${API_BASE_URL}/offers?variantId=${variantId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch variant offers');
    }
    return response.json();
  },
}; 