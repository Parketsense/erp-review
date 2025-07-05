'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  RefreshCw,
  Settings,
  MoreHorizontal,
  Download,
  Upload,
  Eye,
  EyeOff,
  Package
} from 'lucide-react';
import VariantStatsGrid from '@/components/variants/VariantStatsGrid';
import VariantCard from '@/components/variants/VariantCard';
import CreateVariantModal from '@/components/variants/CreateVariantModal';
import EditVariantModal from '@/components/variants/EditVariantModal';
import RoomCreateModal from '@/components/rooms/RoomCreateModal';
import { PhaseVariant } from '@/types/variant';
import { variantsApi } from '@/services/variantsApi';
import { phasesApi } from '@/services/phasesApi';
import { projectsApi } from '@/services/projectsApi';

export default function VariantsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const phaseId = params.phaseId as string;

  // State
  const [variants, setVariants] = useState<PhaseVariant[]>([]);
  const [phase, setPhase] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'total'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PhaseVariant | null>(null);
  // Room modal state
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [selectedVariantForRoom, setSelectedVariantForRoom] = useState<PhaseVariant | null>(null);

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [variantsData, phaseData, projectData] = await Promise.all([
        variantsApi.getVariantsByPhase(phaseId),
        phasesApi.getPhaseById(phaseId),
        projectsApi.getProject(projectId)
      ]);
      
      setVariants(variantsData);
      setPhase(phaseData);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading variants data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, phaseId]);

  // Handlers
  const handleCreateVariant = () => {
    setShowCreateModal(true);
  };

  const handleEditVariant = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setShowEditModal(true);
    }
  };

  const handleDuplicateVariant = async (variantId: string) => {
    try {
      await variantsApi.duplicateVariant(variantId);
      await loadData();
    } catch (error) {
      console.error('Error duplicating variant:', error);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този вариант?')) {
      try {
        await variantsApi.deleteVariant(variantId);
        await loadData();
      } catch (error) {
        console.error('Error deleting variant:', error);
      }
    }
  };

  const handleToggleSelection = async (variantId: string) => {
    try {
      await variantsApi.selectVariant(variantId);
      await loadData();
    } catch (error) {
      console.error('Error toggling variant selection:', error);
    }
  };

  const handleRoomEdit = (roomId: string) => {
    router.push(`/projects/${projectId}/phases/${phaseId}/rooms/${roomId}/edit`);
  };

  const handleRoomDuplicate = async (roomId: string) => {
    try {
      // Implement room duplication
      console.log('Duplicate room:', roomId);
    } catch (error) {
      console.error('Error duplicating room:', error);
    }
  };

  const handleRoomDelete = async (roomId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете тази стая?')) {
      try {
        // Implement room deletion
        console.log('Delete room:', roomId);
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  // Modal handlers
  const handleCreateModalClose = () => {
    setShowCreateModal(false);
  };

  const handleCreateModalSuccess = async () => {
    setShowCreateModal(false);
    await loadData();
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedVariant(null);
  };

  const handleEditModalSuccess = async () => {
    setShowEditModal(false);
    setSelectedVariant(null);
    await loadData();
  };

  const calculateVariantTotal = (variantId: string): number => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return 0;
    
    return variant.rooms?.reduce((sum, room) => {
      return sum + (room.products?.reduce((productSum, product) => {
        return productSum + (product.quantity * product.unitPrice * (1 - (product.discount || 0) / 100));
      }, 0) || 0);
    }, 0) || 0;
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('bg-BG')} лв.`;
  };

  // Filter and sort variants
  const filteredVariants = variants
    .filter(variant => {
      const matchesSearch = variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           variant.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSelection = !showSelectedOnly || variant.isSelected;
      return matchesSearch && matchesSelection;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'total':
          aValue = calculateVariantTotal(a.id);
          bValue = calculateVariantTotal(b.id);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Room modal handlers
  const handleOpenCreateRoomModal = (variant: PhaseVariant) => {
    setSelectedVariantForRoom(variant);
    setShowCreateRoomModal(true);
  };
  const handleCloseCreateRoomModal = () => {
    setShowCreateRoomModal(false);
    setSelectedVariantForRoom(null);
  };
  const handleRoomCreated = async () => {
    setShowCreateRoomModal(false);
    setSelectedVariantForRoom(null);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Варианти - {phase?.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Проект: {project?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsRefreshing(true)}
                onTransitionEnd={() => setIsRefreshing(false)}
                className={`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                title="Обнови"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleCreateVariant}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Създай вариант
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <VariantStatsGrid variants={variants} isLoading={isLoading} />
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Търси варианти..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    showSelectedOnly
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {showSelectedOnly ? (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Избрани
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Всички
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="name">По име</option>
                  <option value="createdAt">По дата</option>
                  <option value="total">По стойност</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Variants List */}
        <div className="space-y-6">
          {filteredVariants.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || showSelectedOnly ? 'Няма намерени варианти' : 'Няма варианти'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || showSelectedOnly 
                  ? 'Променете критериите за търсене или филтриране'
                  : 'Създайте първия вариант за тази фаза'
                }
              </p>
              {!searchTerm && !showSelectedOnly && (
                <button
                  onClick={handleCreateVariant}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Създай първи вариант
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
              {filteredVariants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  onEdit={handleEditVariant}
                  onDuplicate={handleDuplicateVariant}
                  onDelete={handleDeleteVariant}
                  onToggleSelection={handleToggleSelection}
                  onRoomEdit={handleRoomEdit}
                  onRoomDuplicate={handleRoomDuplicate}
                  onRoomDelete={handleRoomDelete}
                  calculateVariantTotal={calculateVariantTotal}
                  formatCurrency={formatCurrency}
                  onCreateRoom={() => handleOpenCreateRoomModal(variant)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateVariantModal
          isOpen={showCreateModal}
          onClose={handleCreateModalClose}
          onSuccess={handleCreateModalSuccess}
          phaseId={phaseId}
        />
      )}

      {showEditModal && selectedVariant && (
        <EditVariantModal
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          onSuccess={handleEditModalSuccess}
          variant={selectedVariant}
          phaseId={phaseId}
        />
      )}

      {/* RoomCreateModal на глобално ниво */}
      {showCreateRoomModal && selectedVariantForRoom && (
        <RoomCreateModal
          isOpen={showCreateRoomModal}
          onClose={handleCloseCreateRoomModal}
          onRoomCreated={handleRoomCreated}
          variantId={selectedVariantForRoom.id}
        />
      )}
    </div>
  );
} 