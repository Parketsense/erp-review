'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Image as ImageIcon,
  Package,
  ArrowLeft,
  Home,
  Ruler,
  Percent,
  DollarSign
} from 'lucide-react';
import { VariantRoom } from '@/types/room';
import { roomsApi } from '@/services/roomsApi';
import { variantsApi } from '@/services/variantsApi';
import { phasesApi } from '@/services/phasesApi';
import { projectsApi } from '@/services/projectsApi';
import RoomCreateModal from '@/components/rooms/RoomCreateModal';
import RoomEditModal from '@/components/rooms/RoomEditModal';

export default function RoomsPage() {
  const { id: projectId, phaseId, variantId } = useParams() as { 
    id: string; 
    phaseId: string; 
    variantId: string; 
  };
  
  const [rooms, setRooms] = useState<VariantRoom[]>([]);
  const [variant, setVariant] = useState<any>(null);
  const [phase, setPhase] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<VariantRoom | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [roomsResponse, variantResponse, phaseResponse, projectResponse] = await Promise.all([
        roomsApi.getRoomsByVariant(variantId),
        variantsApi.getVariantById(variantId),
        phasesApi.getPhaseById(phaseId),
        projectsApi.getProjectById(projectId)
      ]);
      
      setRooms(roomsResponse);
      setVariant(variantResponse);
      setPhase(phaseResponse);
      setProject(projectResponse);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [variantId, phaseId, projectId]);

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете тази стая?')) {
      try {
        await roomsApi.deleteRoom(roomId);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Грешка при изтриване');
      }
    }
  };

  const handleDuplicateRoom = async (roomId: string) => {
    try {
      await roomsApi.duplicateRoom(roomId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при дублиране');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Зареждане на стаи...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Грешка: {error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  const totalRooms = rooms.length;
  const roomsWithProducts = rooms.filter(r => (r._count?.products || 0) > 0).length;
  const roomsWithImages = rooms.filter(r => (r._count?.images || 0) > 0).length;
  const totalProducts = rooms.reduce((sum, r) => sum + (r._count?.products || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Link href="/projects" className="hover:text-gray-700">
                    Проекти
                  </Link>
                  <span>/</span>
                  <Link href={`/projects/${projectId}`} className="hover:text-gray-700">
                    {project?.name || 'Зареждане...'}
                  </Link>
                  <span>/</span>
                  <Link href={`/projects/${projectId}/phases/${phaseId}/variants`} className="hover:text-gray-700">
                    {phase?.name || 'Зареждане...'}
                  </Link>
                  <span>/</span>
                  <span>{variant?.name || 'Зареждане...'}</span>
                </nav>
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/projects/${projectId}/phases/${phaseId}/variants`}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Стаи - {variant?.name || 'Зареждане...'}
                  </h1>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Управление на стаи в този вариант
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Нова стая
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Общо стаи
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalRooms}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      С продукти
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {roomsWithProducts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      С изображения
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {roomsWithImages}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Общо продукти
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalProducts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Стаи ({totalRooms})
            </h3>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени стаи</h3>
              <p className="mt-1 text-sm text-gray-500">
                Започнете с създаване на първата стая за този вариант
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Нова стая
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rooms.map((room) => (
                <div key={room.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {room.name}
                          </h4>
                          <p className="mt-1 text-sm text-gray-500">
                            Създадена: {formatDate(room.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        {room.area && (
                          <div className="flex items-center">
                            <Ruler className="w-4 h-4 mr-1" />
                            <span>{room.area} м²</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          <span>{room._count?.products || 0} продукта</span>
                        </div>
                        
                        <div className="flex items-center">
                          <ImageIcon className="w-4 h-4 mr-1" />
                          <span>{room._count?.images || 0} изображения</span>
                        </div>

                        {room.discount && room.discount > 0 && (
                          <div className="flex items-center">
                            <Percent className="w-4 h-4 mr-1" />
                            <span>{room.discount}% отстъпка</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}/rooms/${room.id}/products`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Продукти ({room._count?.products || 0})
                      </Link>
                      <button
                        onClick={() => handleDuplicateRoom(room.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Копирай
                      </button>
                      <button
                        onClick={() => {
                          setEditingRoom(room);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Редактирай
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Изтрий
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <RoomCreateModal
          variantId={variantId}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={loadData}
        />
      )}

      {/* Edit Modal */}
      {editingRoom && (
        <RoomEditModal
          room={editingRoom}
          isOpen={!!editingRoom}
          onClose={() => setEditingRoom(null)}
          onRoomUpdated={loadData}
        />
      )}
    </div>
  );
} 