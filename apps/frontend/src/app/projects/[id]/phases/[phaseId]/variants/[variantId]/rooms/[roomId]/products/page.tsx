'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { roomsApi } from '@/services/roomsApi';
import { type VariantRoom } from '@/types/room';
import RoomProductsList from '@/components/rooms/RoomProductsList';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function RoomProductsPage() {
  const params = useParams();
  const { id: projectId, phaseId, variantId, roomId } = params;
  
  const [room, setRoom] = useState<VariantRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId) {
      loadRoom();
    }
  }, [roomId]);

  const loadRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsApi.getRoomById(roomId as string);
      setRoom(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load room');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-red-800 mb-2">
              Грешка при зареждане
            </h2>
            <p className="text-red-700">
              {error || 'Room not found'}
            </p>
            <Link
              href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}/rooms`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад към стаите
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with breadcrumb */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link
                href="/projects"
                className="flex items-center hover:text-gray-700 transition-colors"
              >
                <Home className="w-4 h-4" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/projects/${projectId}`}
                className="hover:text-gray-700 transition-colors"
              >
                {room.variant?.phase?.project?.name || 'Проект'}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/projects/${projectId}/phases/${phaseId}/variants`}
                className="hover:text-gray-700 transition-colors"
              >
                {room.variant?.phase?.name || 'Фаза'}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}/rooms`}
                className="hover:text-gray-700 transition-colors"
              >
                {room.variant?.name || 'Вариант'}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}/rooms`}
                className="hover:text-gray-700 transition-colors"
              >
                Стаи
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">
                {room.name} - Продукти
              </span>
            </nav>

            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Продукти в стая: {room.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  Управление на продуктите в стаята
                  {room.area && (
                    <span className="ml-2">• Площ: {room.area} м²</span>
                  )}
                </p>
              </div>
              <Link
                href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}/rooms`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад към стаите
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RoomProductsList 
          roomId={roomId as string} 
          roomName={room.name}
        />
      </div>
    </div>
  );
} 