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
  async duplicateRoom(id: string, newName?: string): Promise<VariantRoom> {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
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
}; 