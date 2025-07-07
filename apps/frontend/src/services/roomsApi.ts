import { 
  VariantRoom, 
  CreateRoomDto, 
  UpdateRoomDto, 
  RoomStats,
  ApiResponse 
} from '@/types/room';
import { API_CONFIG } from '@/lib/env';

const API_BASE_URL = API_CONFIG.baseUrl;

export const roomsApi = {
  // Create new room
  async createRoom(variantId: string, data: CreateRoomDto): Promise<VariantRoom> {
    const response = await fetch(`${API_BASE_URL}/rooms/variant/${variantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    const result: ApiResponse<VariantRoom> = await response.json();
    return result.data;
  },

  // Get all rooms
  async getAllRooms(): Promise<VariantRoom[]> {
    const response = await fetch(`${API_BASE_URL}/rooms`);

    if (!response.ok) {
      throw new Error('Failed to fetch rooms');
    }

    const result: ApiResponse<VariantRoom[]> = await response.json();
    return result.data;
  },

  // Get rooms by variant
  async getRoomsByVariant(variantId: string): Promise<VariantRoom[]> {
    const response = await fetch(`${API_BASE_URL}/rooms/variant/${variantId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch variant rooms');
    }

    const result: ApiResponse<VariantRoom[]> = await response.json();
    return result.data;
  },

  // Get single room
  async getRoomById(id: string): Promise<VariantRoom> {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`);

    if (!response.ok) {
      throw new Error('Failed to fetch room');
    }

    const result: ApiResponse<VariantRoom> = await response.json();
    return result.data;
  },

  // Update room
  async updateRoom(id: string, data: UpdateRoomDto): Promise<VariantRoom> {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update room');
    }

    const result: ApiResponse<VariantRoom> = await response.json();
    return result.data;
  },

  // Delete room
  async deleteRoom(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete room');
    }
  },

  // Duplicate room
  async duplicateRoom(id: string, options?: {
    name?: string;
    targetVariantId?: string;
    productCloneType?: 'all' | 'selected' | 'none';
    selectedProductIds?: string[];
  }): Promise<VariantRoom> {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      throw new Error('Failed to duplicate room');
    }

    const result: ApiResponse<VariantRoom> = await response.json();
    return result.data;
  },

  // Get room stats
  async getRoomStats(): Promise<RoomStats> {
    const response = await fetch(`${API_BASE_URL}/rooms/stats`);

    if (!response.ok) {
      throw new Error('Failed to fetch room stats');
    }

    const result: ApiResponse<RoomStats> = await response.json();
    return result.data;
  },

  // ✅ NEW: Get rooms for a specific variant with products
  async getRoomsWithProducts(variantId: string): Promise<VariantRoom[]> {
    const response = await fetch(`${API_BASE_URL}/rooms/variant/${variantId}?include=products`);

    if (!response.ok) {
      throw new Error('Failed to fetch rooms with products');
    }

    const result: ApiResponse<VariantRoom[]> = await response.json();
    return result.data;
  },

  // ✅ NEW: Bulk update rooms
  async bulkUpdateRooms(roomIds: string[], data: Partial<UpdateRoomDto>): Promise<VariantRoom[]> {
    const response = await fetch(`${API_BASE_URL}/rooms/bulk-update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomIds, data }),
    });

    if (!response.ok) {
      throw new Error('Failed to bulk update rooms');
    }

    const result: ApiResponse<VariantRoom[]> = await response.json();
    return result.data;
  },

  // ✅ NEW: Bulk delete rooms
  async bulkDeleteRooms(roomIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/rooms/bulk-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to bulk delete rooms');
    }
  },

  // ✅ NEW: Export rooms to CSV/Excel
  async exportRooms(variantId: string, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/rooms/variant/${variantId}/export?format=${format}`);

    if (!response.ok) {
      throw new Error('Failed to export rooms');
    }

    return response.blob();
  },

  // ✅ NEW: Import rooms from CSV/Excel
  async importRooms(variantId: string, file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/rooms/variant/${variantId}/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to import rooms');
    }

    const result: ApiResponse<{ success: number; errors: string[] }> = await response.json();
    return result.data;
  },

  // ✅ NEW: Get room analytics
  async getRoomAnalytics(variantId: string): Promise<{
    totalRooms: number;
    totalProducts: number;
    totalValue: number;
    averageRoomValue: number;
    mostExpensiveRoom: VariantRoom | null;
    leastExpensiveRoom: VariantRoom | null;
  }> {
    const response = await fetch(`${API_BASE_URL}/rooms/variant/${variantId}/analytics`);

    if (!response.ok) {
      throw new Error('Failed to fetch room analytics');
    }

    const result: ApiResponse<any> = await response.json();
    return result.data;
  }
}; 