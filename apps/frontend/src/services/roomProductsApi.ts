import { API_BASE_URL } from '@/lib/api';

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
  room?: {
    id: string;
    name: string;
    variantId: string;
  };
}

export interface CreateRoomProductDto {
  roomId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountEnabled?: boolean;
  wastePercent?: number;
}

export interface UpdateRoomProductDto {
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  discountEnabled?: boolean;
  wastePercent?: number;
}

export interface RoomProductsStats {
  totalProducts: number;
  totalRooms: number;
  totalQuantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const roomProductsApi = {
  // Add product to room
  async addProductToRoom(data: CreateRoomProductDto): Promise<ApiResponse<RoomProduct>> {
    const response = await fetch(`${API_BASE_URL}/room-products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add product to room' }));
      throw new Error(error.message || 'Failed to add product to room');
    }

    return response.json();
  },

  // Get all products in a room
  async getRoomProducts(roomId: string): Promise<ApiResponse<RoomProduct[]>> {
    const response = await fetch(`${API_BASE_URL}/room-products/room/${roomId}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch room products' }));
      throw new Error(error.message || 'Failed to fetch room products');
    }

    return response.json();
  },

  // Get single room product
  async getRoomProduct(id: string): Promise<ApiResponse<RoomProduct>> {
    const response = await fetch(`${API_BASE_URL}/room-products/${id}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch room product' }));
      throw new Error(error.message || 'Failed to fetch room product');
    }

    return response.json();
  },

  // Update room product
  async updateRoomProduct(id: string, data: UpdateRoomProductDto): Promise<ApiResponse<RoomProduct>> {
    const response = await fetch(`${API_BASE_URL}/room-products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update room product' }));
      throw new Error(error.message || 'Failed to update room product');
    }

    return response.json();
  },

  // Delete room product
  async deleteRoomProduct(id: string): Promise<ApiResponse<null>> {
    const response = await fetch(`${API_BASE_URL}/room-products/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete room product' }));
      throw new Error(error.message || 'Failed to delete room product');
    }

    return response.json();
  },

  // Get room products statistics
  async getRoomProductsStats(): Promise<ApiResponse<RoomProductsStats>> {
    const response = await fetch(`${API_BASE_URL}/room-products/stats`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch room products stats' }));
      throw new Error(error.message || 'Failed to fetch room products stats');
    }

    return response.json();
  },
}; 