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
  // Status and metadata
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  contacts: Contact[];
  // Relations (as returned by backend with includes)
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    hasCompany: boolean;
    isArchitect: boolean;
  };
  architect?: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
  };
  // Counts from backend
  _count?: {
    phases: number;
    offers: number;
  };
}

// Backend API response format
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectsResponse extends PaginatedResponse<Project> {}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  withArchitect: number;
  thisMonth: number;
  thisYear: number;
  byType: {
    apartment: number;
    house: number;
    office: number;
    commercial: number;
    other: number;
  };
  byStatus: {
    active: number;
    completed: number;
    draft: number;
    archived: number;
  };
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
  // Project status
  status?: 'draft' | 'active' | 'completed' | 'archived';
  // Contacts
  contacts?: Contact[];
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

export const PROJECT_STATUSES = [
  { value: 'draft', label: 'Чернова', color: 'yellow' },
  { value: 'active', label: 'Активен', color: 'green' },
  { value: 'completed', label: 'Завършен', color: 'blue' },
  { value: 'archived', label: 'Архивиран', color: 'gray' }
]; 