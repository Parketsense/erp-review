export interface PhaseVariant {
  id: string;
  phaseId: string;
  name: string;
  description?: string;
  variantOrder: number;
  designer?: string;
  architect?: string;
  architectCommission?: number;
  isSelected: boolean;
  includeInOffer: boolean;
  discountEnabled: boolean;
  variantDiscount?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  phase?: {
    id: string;
    name: string;
    discountEnabled: boolean;
    phaseDiscount?: number;
    project?: {
      id: string;
      name: string;
    };
  };
  
  rooms?: VariantRoom[];
  _count?: {
    rooms: number;
  };
}

export interface VariantRoom {
  id: string;
  variantId: string;
  name: string;
  area?: number;
  discount?: number;
  discountEnabled: boolean;
  wastePercent?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  products?: RoomProduct[];
  images?: RoomImage[];
  _count?: {
    products: number;
    images: number;
  };
}

export interface RoomProduct {
  id: string;
  roomId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountEnabled: boolean;
  wastePercent?: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  product?: {
    id: string;
    code: string;
    nameBg: string;
    nameEn?: string;
    unit: string;
    costBgn?: number;
    saleBgn?: number;
    manufacturer?: {
      id: string;
      name: string;
      displayName: string;
    };
    productType?: {
      id: string;
      name: string;
      nameBg: string;
    };
  };
}

export interface RoomImage {
  id: string;
  roomId: string;
  filename: string;
  originalName?: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  caption?: string;
  uploadedAt: string;
}

export interface CreateVariantDto {
  phaseId: string;
  name: string;
  description?: string;
  variantOrder?: number;
  designer?: string;
  architect?: string;
  architectCommission?: number;
  isSelected?: boolean;
  includeInOffer?: boolean;
  discountEnabled?: boolean;
  variantDiscount?: number;
}

export interface UpdateVariantDto {
  name?: string;
  description?: string;
  variantOrder?: number;
  designer?: string;
  architect?: string;
  architectCommission?: number;
  isSelected?: boolean;
  includeInOffer?: boolean;
  discountEnabled?: boolean;
  variantDiscount?: number;
}

export interface VariantStats {
  total: number;
  includedInOffer: number;
  excludedFromOffer: number;
  phaseCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
} 