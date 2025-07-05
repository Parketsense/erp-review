'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Package, 
  Image as ImageIcon, 
  Plus,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Edit2,
  Trash2,
  Copy
} from 'lucide-react';
import Link from 'next/link';
import { VariantRoom } from '@/types/room';
import { roomsApi } from '@/services/roomsApi';
import { variantsApi } from '@/services/variantsApi';
import { phasesApi } from '@/services/phasesApi';
import { projectsApi } from '@/services/projectsApi';

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
  const [searchTerm, setSearchTerm] = useState('');

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

  // Calculate stats
  const stats = {
    total: rooms.length,
    withProducts: rooms.filter(r => (r._count?.products || 0) > 0).length,
    withImages: rooms.filter(r => (r._count?.images || 0) > 0).length,
    emptyRooms: rooms.filter(r => (r._count?.products || 0) === 0).length,
    averageArea: rooms.length > 0 
      ? rooms.reduce((sum, r) => sum + (r.area || 0), 0) / rooms.length 
      : 0,
    totalProducts: rooms.reduce((sum, r) => sum + (r._count?.products || 0), 0)
  };

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Възникна грешка</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link 
                href="/projects" 
                className="hover:text-gray-700 transition-colors flex items-center"
              >
                <Home className="w-4 h-4 mr-1" />
                Проекти
              </Link>
              <span>/</span>
              <Link 
                href={`/projects/${projectId}`} 
                className="hover:text-gray-700 transition-colors"
              >
                {project?.name || 'Зареждане...'}
              </Link>
              <span>/</span>
              <Link 
                href={`/projects/${projectId}/phases/${phaseId}/variants`} 
                className="hover:text-gray-700 transition-colors"
              >
                {phase?.name || 'Зареждане...'}
              </Link>
              <span>/</span>
              <Link 
                href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}`} 
                className="hover:text-gray-700 transition-colors"
              >
                {variant?.name || 'Зареждане...'}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Стаи</span>
            </nav>

            {/* Main Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}`}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Назад към варианта"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Управление на стаи
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Вариант: {variant?.name || 'Зареждане...'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Търси стаи..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {/* Refresh */}
                <button 
                  onClick={loadData}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Обнови"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                {/* Create Room */}
                <button
                  onClick={() => alert('Функционалност за създаване на стая ще бъде добавена скоро')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Нова стая
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общо стаи</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">С продукти</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">С изображения</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withImages}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общо продукти</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Стаи ({filteredRooms.length})
              </h3>
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Няма намерени стаи' : 'Няма създадени стаи'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Променете критериите за търсене' 
                  : 'Започнете с създаване на първата стая за този вариант'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRooms.map((room) => (
                <div key={room.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">{room.name}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {room._count?.products || 0} продукти
                        </span>
                        {(room._count?.images || 0) > 0 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {room._count?.images || 0} изображения
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        {room.area && (
                          <span>Площ: {room.area} м²</span>
                        )}
                        {room.discountEnabled && room.discount && (
                          <span>Отстъпка: {room.discount}%</span>
                        )}
                        {room.wastePercent && (
                          <span>Отпадък: {room.wastePercent}%</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => alert('Функционалност за редактиране ще бъде добавена скоро')}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Редактирай"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicateRoom(room.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Дублирай"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Изтрий"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 