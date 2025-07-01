export interface Phase {
  id: string;
  name: string;
  description?: string;
  status: 'created' | 'quoted' | 'won' | 'lost' | 'archived';
  projectId: string;
  phaseOrder: number;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    name: string;
    client?: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  variants?: PhaseVariant[];
}

export interface PhaseVariant {
  id: string;
  name: string;
  description?: string;
  phaseId: string;
  cost?: number;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhasesResponse {
  data: Phase[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PhaseStats {
  total: number;
  byStatus: {
    created?: number;
    quoted?: number;
    won?: number;
    lost?: number;
    archived?: number;
  };
}

export interface CreatePhaseDto {
  name: string;
  description?: string;
  status?: 'created' | 'quoted' | 'won' | 'lost' | 'archived';
  phaseOrder?: number;
  architectId?: string;
}

export interface CreatePhaseVariantDto {
  name: string;
  description?: string;
  phaseId: string;
  cost?: number;
  isSelected?: boolean;
}

export interface UpdatePhaseDto extends Partial<CreatePhaseDto> {}

export interface UpdatePhaseVariantDto extends Partial<CreatePhaseVariantDto> {} 