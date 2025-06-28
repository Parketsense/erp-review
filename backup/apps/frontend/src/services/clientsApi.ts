import axios from 'axios';
import { Client } from '@parketsense/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface ClientsListResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getClients = async (params?: { page?: number; limit?: number; search?: string; type?: string }) => {
  const res = await axios.get<ClientsListResponse>(`${API_URL}/clients`, { params });
  return res.data;
};

export const getClient = async (id: string) => {
  const res = await axios.get<{ data: Client }>(`${API_URL}/clients/${id}`);
  return res.data.data;
};

export const createClient = async (client: Partial<Client>) => {
  const res = await axios.post<{ data: Client }>(`${API_URL}/clients`, client);
  return res.data.data;
};

export const updateClient = async (id: string, client: Partial<Client>) => {
  const res = await axios.patch<{ data: Client }>(`${API_URL}/clients/${id}`, client);
  return res.data.data;
};

export const deleteClient = async (id: string) => {
  await axios.delete(`${API_URL}/clients/${id}`);
}; 