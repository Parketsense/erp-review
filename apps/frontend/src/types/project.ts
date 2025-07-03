export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  receivesOffers: boolean;
  receivesInvoices: boolean;
  receivesUpdates: boolean;
  isPrimary: boolean;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';
  address?: string;
  description?: string;
  city: string;
  totalArea?: number;
  roomsCount?: number;
  floorsCount?: number;
  estimatedBudget?: number;
  startDate?: string;
  expectedCompletionDate?: string;
  // Architect fields
  architectType: 'none' | 'client' | 'external';
  architectId?: string;
  architectName?: string;
  architectCommission?: number;
  architectPhone?: string;
  architectEmail?: string;
  // Status and metadata
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  contacts: Contact[];
  // Relations
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    hasCompany: boolean;
    companyName?: string;
    isArchitect: boolean;
    commissionPercent?: number;
  };
}

export interface ProjectsResponse {
  data: Project[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  drafts: number;
  thisMonth: number;
  withArchitect: number;
}

export interface ProjectFilters {
  search: string;
  status: 'all' | 'active' | 'completed' | 'with-architect';
  dateRange?: [Date, Date];
}

export interface ProjectTableRow {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  type: string;
  architect?: {
    id: string;
    name: string;
  };
  status: 'active' | 'completed' | 'with-architect';
  createdAt: string;
}

export interface CreateProjectDto {
  clientId: string;
  name: string;
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';
  address?: string;
  description?: string;
  city?: string;
  totalArea?: number;
  roomsCount?: number;
  floorsCount?: number;
  estimatedBudget?: number;
  startDate?: string;
  expectedCompletionDate?: string;
  // Architect fields
  architectType: 'none' | 'client' | 'external';
  architectId?: string;
  architectName?: string;
  architectCommission?: number;
  architectPhone?: string;
  architectEmail?: string;
  // Contacts
  contacts: Contact[];
}

export interface ProjectType {
  value: string;
  label: string;
  icon: string;
}

export const PROJECT_TYPES: ProjectType[] = [
  { value: 'apartment', label: 'Апартамент', icon: '🏠' },
  { value: 'house', label: 'Къща', icon: '🏡' },
  { value: 'office', label: 'Офис', icon: '🏢' },
  { value: 'commercial', label: 'Търговски обект', icon: '🏪' },
  { value: 'other', label: 'Друго', icon: '📋' }
];

export const CONTACT_ROLES = [
  'Собственик',
  'Съпруг/Съпруга', 
  'Архитект',
  'Счетоводител',
  'Строител',
  'Дизайнер',
  'Друго'
]; 