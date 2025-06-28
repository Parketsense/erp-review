export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  hasCompany: boolean;
  companyName?: string;
  eikBulstat?: string;
  vatNumber?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyMol?: string; // МОЛ (Материално отговорно лице)
  isArchitect: boolean;
  commissionPercent?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser: {
    id: string;
    name: string;
  };
}

export interface ClientsResponse {
  data: Client[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ClientStats {
  total: number;
  individuals: number;
  companies: number;
  architects: number;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  hasCompany?: boolean;
  companyName?: string;
  eikBulstat?: string;
  vatNumber?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyMol?: string; // МОЛ (Материално отговорно лице)
  isArchitect?: boolean;
  commissionPercent?: number;
} 