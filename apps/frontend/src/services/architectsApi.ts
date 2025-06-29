import { clientsApi } from './clientsApi';
import { Client, ClientsResponse } from '@/types/client';

export interface ArchitectSearchOptions {
  search?: string;
  limit?: number;
  page?: number;
}

export class ArchitectsApiService {
  // Get all architects (clients with isArchitect = true)
  async getArchitects(options: ArchitectSearchOptions = {}): Promise<ClientsResponse> {
    return clientsApi.getClients({
      ...options,
      isArchitect: true
    });
  }

  // Search architects by name or company
  async searchArchitects(searchTerm: string, limit: number = 50): Promise<Client[]> {
    try {
      const response = await this.getArchitects({ 
        search: searchTerm, 
        limit 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching architects:', error);
      return [];
    }
  }

  // Get architect by id
  async getArchitect(id: string): Promise<Client | null> {
    try {
      return await clientsApi.getClientById(id);
    } catch (error) {
      console.error('Error getting architect:', error);
      return null;
    }
  }

  // Get architect stats
  async getArchitectStats() {
    try {
      const response = await this.getArchitects({ limit: 1000 });
      const architects = response.data;
      
      return {
        total: architects.length,
        withCompany: architects.filter(a => a.hasCompany).length,
        individuals: architects.filter(a => !a.hasCompany).length,
        averageCommission: architects.length > 0 
          ? Math.round(architects.reduce((sum, a) => sum + (a.commissionPercent || 0), 0) / architects.length)
          : 0
      };
    } catch (error) {
      console.error('Error getting architect stats:', error);
      return {
        total: 0,
        withCompany: 0,
        individuals: 0,
        averageCommission: 0
      };
    }
  }
}

export const architectsApi = new ArchitectsApiService(); 