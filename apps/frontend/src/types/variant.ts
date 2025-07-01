export interface PhaseVariant {
  id: string;
  phaseId: string;
  name: string;
  description?: string;
  isTemplate: boolean;
  isActive: boolean;
  architect?: string;
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
  phase?: {
    id: string;
    name: string;
  };
  rooms?: Room[];
  _count?: {
    rooms: number;
  };
}

export interface Room {
  id: string;
  variantId: string;
  name: string;
  area?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVariantDto {
  name: string;
  description?: string;
  architect?: string;
  isTemplate?: boolean;
}

export interface UpdateVariantDto {
  name?: string;
  description?: string;
  architect?: string;
  isTemplate?: boolean;
  isActive?: boolean;
  totalCost?: number;
}

export interface CloneVariantDto {
  name: string;
  description?: string;
  targetPhaseId: string;
  includeRooms: boolean;
  includeProducts: boolean;
}

export interface VariantStats {
  totalVariants: number;
  activeVariants: number;
  templateVariants: number;
  totalCost: number;
} 