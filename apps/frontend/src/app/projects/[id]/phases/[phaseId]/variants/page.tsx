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
  Package,
  FileText,
  Users,
  Building
} from 'lucide-react';
import VariantStatsGrid from '@/components/variants/VariantStatsGrid';
import VariantCard from '@/components/variants/VariantCard';
import CreateVariantModal from '@/components/variants/CreateVariantModal';
import EditVariantModal from '@/components/variants/EditVariantModal';
import RoomCreateModal from '@/components/rooms/RoomCreateModal';
import PhaseOffersManager from '@/components/offers/phase/PhaseOffersManager';
import OfferWizardFromPhase from '@/components/offers/wizard/OfferWizardFromPhase';
import OfferPreviewModal from '@/components/offers/phase/OfferPreviewModal';
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
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [selectedVariantForRoom, setSelectedVariantForRoom] = useState<PhaseVariant | null>(null);
  
  // Offer workflow states
  const [showOfferWizard, setShowOfferWizard] = useState(false);
  const [showOfferPreview, setShowOfferPreview] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Load data
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Safe loading с error handling
      const [variantsData, phaseData, projectData] = await Promise.allSettled([
        variantsApi.getByPhase(phaseId),
        phasesApi.getPhaseById(phaseId),
        projectsApi.getProject(projectId)
      ]);

      if (variantsData.status === 'fulfilled') {
        setVariants(Array.isArray(variantsData.value) ? variantsData.value : []);
      } else {
        console.error('Error loading variants:', variantsData.reason);
        setVariants([]);
      }

      if (phaseData.status === 'fulfilled') {
        setPhase(phaseData.value);
      } else {
        console.error('Error loading phase:', phaseData.reason);
        setPhase(null);
      }

      if (projectData.status === 'fulfilled') {
        setProject(projectData.value);
        setClient(projectData.value?.client || null);
      } else {
        console.error('Error loading project:', projectData.reason);
        setProject(null);
        setClient(null);
      }

    } catch (err) {
      console.error('Error in loadData:', err);
      setError('Възникна грешка при зареждането');
      setVariants([]);
      setPhase(null);
      setProject(null);
      setClient(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && phaseId) {
      loadData();
    }
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
      console.log('Duplicate room:', roomId);
    } catch (error) {
      console.error('Error duplicating room:', error);
    }
  };

  const handleRoomDelete = async (roomId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете тази стая?')) {
      try {
        console.log('Delete room:', roomId);
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const handleCreateRoom = (variant: PhaseVariant) => {
    setSelectedVariantForRoom(variant);
    setShowCreateRoomModal(true);
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

  const handleCreateRoomModalClose = () => {
    setShowCreateRoomModal(false);
    setSelectedVariantForRoom(null);
  };

  const handleCreateRoomModalSuccess = async () => {
    setShowCreateRoomModal(false);
    setSelectedVariantForRoom(null);
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
  const filteredVariants = variants.filter(variant => {
    if (searchTerm && !variant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (showSelectedOnly && !variant.isSelected) {
      return false;
    }
    return true;
  });

  const sortedVariants = [...filteredVariants].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt || 0);
        bValue = new Date(b.createdAt || 0);
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
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Error handling за page level
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Опитай отново
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6">Зареждане...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {phase?.name || 'Варианти'}
              </h1>
              <p className="text-gray-600">
                Проект: {project?.name || 'Неизвестен проект'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateVariant}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Създай вариант</span>
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Търси варианти..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">По име</option>
                <option value="createdAt">По дата</option>
                <option value="total">По обща стойност</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSelectedOnly}
                onChange={(e) => setShowSelectedOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Само избрани</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={loadData}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {variants.length > 0 && (
        <VariantStatsGrid 
          variants={variants}
        />
      )}

      {/* Variants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {sortedVariants.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || showSelectedOnly ? 'Няма намерени варианти' : 'Няма създадени варианти'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || showSelectedOnly 
                  ? 'Променете филтрите или създайте нов вариант'
                  : 'Започнете като създадете първия вариант за тази фаза'
                }
              </p>
              {!searchTerm && !showSelectedOnly && (
                <button
                  onClick={handleCreateVariant}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Създай първия вариант</span>
                </button>
              )}
            </div>
          ) : (
            <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
              {sortedVariants.map((variant) => (
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
                  onCreateRoom={() => handleCreateRoom(variant)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Offers sidebar */}
        <div className="lg:col-span-1">
          <PhaseOffersManager 
            phaseId={phaseId}
            projectId={projectId}
            clientId={client?.id || ''}
            onOfferCreated={() => setShowOfferWizard(true)}
            onOfferSelected={(offerId) => {
              setSelectedOfferId(offerId);
              setShowOfferPreview(true);
            }}
          />
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateVariantModal
          phaseId={phaseId}
          isOpen={showCreateModal}
          onClose={handleCreateModalClose}
          onSuccess={handleCreateModalSuccess}
        />
      )}

      {showEditModal && selectedVariant && (
        <EditVariantModal
          variant={selectedVariant}
          phaseId={phaseId}
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          onSuccess={handleEditModalSuccess}
        />
      )}

      {showCreateRoomModal && selectedVariantForRoom && (
        <RoomCreateModal
          variantId={selectedVariantForRoom.id}
          isOpen={showCreateRoomModal}
          onClose={handleCreateRoomModalClose}
          onRoomCreated={handleCreateRoomModalSuccess}
        />
      )}

      {showOfferWizard && (
        <OfferWizardFromPhase
          isOpen={showOfferWizard}
          onClose={() => setShowOfferWizard(false)}
          onSuccess={() => {
            setShowOfferWizard(false);
            // Refresh data after offer creation
            loadData();
          }}
          phaseId={phaseId}
          projectId={projectId}
          clientId={client?.id || ''}
        />
      )}

      {showOfferPreview && selectedOfferId && (
        <OfferPreviewModal
          offerId={selectedOfferId}
          isOpen={showOfferPreview}
          onClose={() => {
            setShowOfferPreview(false);
            setSelectedOfferId(null);
          }}
        />
      )}
    </div>
  );
} 