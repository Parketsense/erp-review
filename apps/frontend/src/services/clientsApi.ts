import { Client, ClientsResponse, ClientStats, CreateClientDto } from '../types/client';
import { API_BASE_URL } from '../lib/api';

class ClientsApiService {
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    hasCompany?: boolean;
    isArchitect?: boolean;
  }): Promise<ClientsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.hasCompany !== undefined) searchParams.append('hasCompany', params.hasCompany.toString());
    if (params?.isArchitect !== undefined) searchParams.append('isArchitect', params.isArchitect.toString());

    const url = `${API_BASE_URL}/clients${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch clients');
    }
    
    return response.json();
  }

  async getClientStats(): Promise<ClientStats> {
    const response = await fetch(`${API_BASE_URL}/clients/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch client stats');
    }
    
    return response.json();
  }

  async getClientById(id: string): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch client');
    }
    
    const result = await response.json();
    return result.data;
  }

  async createClient(client: CreateClientDto): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create client');
    }
    
    const result = await response.json();
    return result.data; // Backend returns { success: true, data: Client }
  }

  async updateClient(id: string, client: Partial<CreateClientDto>): Promise<Client> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(client),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update client');
    }
    
    const result = await response.json();
    return result.data; // Backend returns { success: true, data: Client }
  }

  async deleteClient(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete client');
    }
  }

  async checkEik(eik: string): Promise<{ exists: boolean }> {
    const response = await fetch(`${API_BASE_URL}/clients/check-eik/${eik}`);
    if (!response.ok) {
      throw new Error('Failed to check EIK');
    }
    
    return response.json();
  }
}

export const clientsApi = new ClientsApiService(); 