import { Contact } from '../components/contacts/ContactModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface CreateContactRequest {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
  manufacturerId?: string;
  supplierId?: string;
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
  isActive?: boolean;
}

class ContactsApi {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      headers: defaultHeaders,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Създай нов контакт
  async createContact(data: CreateContactRequest): Promise<Contact> {
    return this.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Вземи всички контакти (с филтри)
  async getContacts(filters?: { manufacturerId?: string; supplierId?: string }): Promise<Contact[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.manufacturerId) {
      queryParams.append('manufacturerId', filters.manufacturerId);
    }
    
    if (filters?.supplierId) {
      queryParams.append('supplierId', filters.supplierId);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/contacts?${queryString}` : '/contacts';
    
    return this.request<Contact[]>(endpoint);
  }

  // Вземи един контакт по ID
  async getContact(id: string): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`);
  }

  // Обнови контакт
  async updateContact(id: string, data: UpdateContactRequest): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Изтрий контакт
  async deleteContact(id: string): Promise<void> {
    return this.request<void>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Направи контакт основен
  async setPrimaryContact(id: string): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}/set-primary`, {
      method: 'PATCH',
    });
  }

  // Вземи контактите за производител
  async getManufacturerContacts(manufacturerId: string): Promise<Contact[]> {
    return this.getContacts({ manufacturerId });
  }

  // Вземи контактите за доставчик
  async getSupplierContacts(supplierId: string): Promise<Contact[]> {
    return this.getContacts({ supplierId });
  }
}

export const contactsApi = new ContactsApi(); 