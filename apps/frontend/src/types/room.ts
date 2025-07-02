// Base interfaces
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
  variant?: {
    id: string;
    name: string;
    phaseId: string;
    phase?: {
      id: string;
      name: string;
      projectId: string;
      project?: {
        id: string;
        name: string;
      };
    };
  };
  
  products?: RoomProduct[];
  images?: RoomImage[];
  
  // Counts
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
    saleBgn?: number;
    unit: string;
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

// DTOs
export interface CreateRoomDto {
  name: string;
  area?: number;
  discount?: number;
  discountEnabled?: boolean;
  wastePercent?: number;
}

export interface UpdateRoomDto {
  name?: string;
  area?: number;
  discount?: number;
  discountEnabled?: boolean;
  wastePercent?: number;
}

// Stats
export interface RoomStats {
  total: number;
  withProducts: number;
  withImages: number;
  emptyRooms: number;
  averageArea: number;
  totalProducts: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
} 