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
  Building,
  Target,
  CheckCircle,
  Edit,
  Mail,
  Share2,
  ChevronLeft,
  Send,
  Calendar,
  User,
  Home,
  Euro,
  Camera,
  Layers,
  BarChart3,
  Activity,
  Clock,
  Zap,
  Star,
  TrendingUp,
  ArrowRight,
  X,
  ChevronRight,
  Archive,
  Copy,
  Trash2
} from 'lucide-react';

// ✅ KEEPING ORIGINAL COMPONENTS (critical for functionality)
import VariantStatsGrid from '@/components/variants/VariantStatsGrid';
import VariantCard from '@/components/variants/VariantCard';
import CreateVariantModal from '@/components/variants/CreateVariantModal';
import EditVariantModal from '@/components/variants/EditVariantModal';
import VariantCloneModal from '@/components/variants/VariantCloneModal';
import RoomCreateModal from '@/components/rooms/RoomCreateModal';
import RoomEditModal from '@/components/rooms/RoomEditModal';
import RoomCloneModal from '@/components/rooms/RoomCloneModal';
import PhaseOffersManager from '@/components/offers/phase/PhaseOffersManager';
import EnhancedOfferModal from '@/components/offers/EnhancedOfferModal';
import OfferPreviewModal from '@/components/offers/phase/OfferPreviewModal';
import { PhaseVariant } from '@/types/variant';
import { VariantRoom } from '@/types/room';
import { variantsApi } from '@/services/variantsApi';
import { phasesApi } from '@/services/phasesApi';
import { projectsApi } from '@/services/projectsApi';
import { roomsApi } from '@/services/roomsApi';

export default function VariantsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  const phaseId = params?.phaseId as string;

  // ✅ KEEPING ALL ORIGINAL STATE
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
  
  // ✅ KEEPING ALL ORIGINAL MODAL STATES
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PhaseVariant | null>(null);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [selectedVariantForRoom, setSelectedVariantForRoom] = useState<string | null>(null);
  const [showOfferWizard, setShowOfferWizard] = useState(false);
  const [showOfferPreview, setShowOfferPreview] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // ✅ NEW: Modal states for room management
  const [showRoomEditModal, setShowRoomEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<VariantRoom | null>(null);
  const [showRoomCloneModal, setShowRoomCloneModal] = useState(false);
  const [selectedRoomForClone, setSelectedRoomForClone] = useState<VariantRoom | null>(null);
  const [selectedVariantForRoomClone, setSelectedVariantForRoomClone] = useState<PhaseVariant | null>(null);

  // ✅ NEW: Modal states for variant cloning
  const [showVariantCloneModal, setShowVariantCloneModal] = useState(false);
  const [selectedVariantForClone, setSelectedVariantForClone] = useState<PhaseVariant | null>(null);

  // ✅ SAFE LOADING WITH FALLBACKS
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Safe API calls with multiple fallback attempts
      let variantsData: PhaseVariant[] = [];
      let phaseData = null;
      let projectData = null;
      let clientData = null;

      // Load variants with fallbacks
      try {
        variantsData = await variantsApi.getByPhase(phaseId);
      } catch (error) {
        console.error('Error loading variants:', error);
        variantsData = [];
      }

      // Load phase with correct API method
      try {
        phaseData = await phasesApi.getPhaseById(phaseId);
      } catch (error) {
        console.error('Error loading phase:', error);
        phaseData = null;
      }

      // Load project with correct API method
      try {
        projectData = await projectsApi.getProjectById(projectId);
      } catch (error) {
        console.error('Error loading project:', error);
        projectData = null;
      }

      // Extract client from project data or try separate API call
      try {
        if (projectData?.client) {
          clientData = projectData.client;
        }
      } catch (error) {
        console.error('Error loading client:', error);
        clientData = null;
      }

      setVariants(Array.isArray(variantsData) ? variantsData : []);
      setPhase(phaseData);
      setProject(projectData);
      setClient(clientData);
      
    } catch (error) {
      console.error('Error in loadData:', error);
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
    loadData();
  }, [projectId, phaseId]);

  // ✅ CORRECTED HANDLERS WITH PROPER ERROR HANDLING
  const handleCreateVariant = () => {
    setShowCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
  };

  const handleCreateModalSuccess = () => {
    setShowCreateModal(false);
    loadData();
  };

  const handleEditVariant = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariant(variant);
      setShowEditModal(true);
    }
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedVariant(null);
  };

  const handleEditModalSuccess = () => {
    setShowEditModal(false);
    setSelectedVariant(null);
    loadData();
  };

  const handleDuplicateVariant = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId);
    if (variant) {
      setSelectedVariantForClone(variant);
      setShowVariantCloneModal(true);
    } else {
      console.error('Variant not found:', variantId);
      alert('Вариантът не е намерен!');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този вариант?')) {
      try {
        await variantsApi.delete(variantId);
        loadData();
      } catch (error) {
        console.error('Error deleting variant:', error);
        alert('Грешка при изтриване на варианта!');
      }
    }
  };

  const handleToggleSelection = async (variantId: string) => {
    try {
      await variantsApi.select(variantId);
      loadData();
    } catch (error) {
      console.error('Error toggling variant selection:', error);
      alert('Грешка при избор на варианта!');
    }
  };

  const handleCreateRoom = (variantId: string) => {
    setSelectedVariantForRoom(variantId);
    setShowCreateRoomModal(true);
  };

  const handleCreateRoomModalClose = () => {
    setShowCreateRoomModal(false);
    setSelectedVariantForRoom(null);
  };

  const handleCreateRoomModalSuccess = () => {
    setShowCreateRoomModal(false);
    setSelectedVariantForRoom(null);
    loadData();
  };

  const handleRoomEdit = (roomId: string) => {
    console.log('[DEBUG] handleRoomEdit called with roomId:', roomId);
    const room = variants
      .flatMap(v => v.rooms || [])
      .find(r => r.id === roomId);
    if (room) {
      setSelectedRoom(room);
      setShowRoomEditModal(true);
      alert('[DEBUG] Room edit modal should open for: ' + room.name);
    } else {
      console.error('Room not found:', roomId);
      alert('[ERROR] Стаята не е намерена! roomId=' + roomId);
    }
  };

  const handleRoomDuplicate = (roomId: string) => {
    console.log('[DEBUG] handleRoomDuplicate called with roomId:', roomId);
    const room = variants
      .flatMap(v => v.rooms || [])
      .find(r => r.id === roomId);
    const variant = variants.find(v => 
      v.rooms?.some(r => r.id === roomId)
    );
    if (room && variant) {
      setSelectedRoomForClone(room);
      setSelectedVariantForRoomClone(variant);
      setShowRoomCloneModal(true);
      alert('[DEBUG] Room clone modal should open for: ' + room.name);
    } else {
      console.error('Room or variant not found:', roomId);
      alert('[ERROR] Стаята или варианта не са намерени! roomId=' + roomId);
    }
  };

  const handleRoomDelete = async (roomId: string) => {
    console.log('[DEBUG] handleRoomDelete called with roomId:', roomId);
    if (confirm('Сигурни ли сте, че искате да изтриете тази стая?')) {
      try {
        await roomsApi.deleteRoom(roomId);
        loadData();
        alert('Стаята е изтрита успешно!');
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('[ERROR] Грешка при изтриване на стаята!');
      }
    }
  };

  // ✅ CORRECTED: Handle discount updates
  const handleUpdateDiscounts = async (variantId: string) => {
    try {
      await variantsApi.updateDiscounts(variantId, 0); // 0 means use variant's current discount
      loadData();
      alert('Отстъпките са ъпдейтнати успешно!');
    } catch (error) {
      console.error('Error updating discounts:', error);
      alert('Грешка при ъпдейтване на отстъпките!');
    }
  };

  // ✅ KEEPING ALL ORIGINAL UTILITY FUNCTIONS
  const calculateVariantTotal = (variantId: string): number => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant || !variant.rooms) return 0;
    
    return variant.rooms.reduce((total, room) => {
      const roomTotal = room.products?.reduce((sum, product) => {
        // Calculate total price for each product
        const quantity = product.quantity || 0;
        const unitPrice = product.unitPrice || 0;
        const discount = product.discount || 0;
        const totalPrice = quantity * unitPrice * (1 - discount / 100);
        return sum + totalPrice;
      }, 0) || 0;
      return total + roomTotal;
    }, 0);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ✅ KEEPING ALL ORIGINAL FILTERING AND SORTING
  const filteredVariants = variants.filter((variant) => {
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // ✅ NEW: Handle offer wizard
  const handleOfferWizardClose = () => {
    setShowOfferWizard(false);
  };

  const handleOfferWizardSuccess = () => {
    setShowOfferWizard(false);
    loadData();
  };

  // Transform PhaseVariant to EnhancedOfferModal format
  const transformVariantsForOffer = (variants: PhaseVariant[]) => {
    return variants.map(variant => {
      // Calculate variant total
      const variantTotal = variant.rooms?.reduce((variantSum, room) => {
        const roomTotal = room.products?.reduce((roomSum, product) => {
          const basePrice = product.quantity * product.unitPrice;
          const discountedPrice = basePrice * (1 - (product.discount || 0) / 100);
          return roomSum + discountedPrice;
        }, 0) || 0;
        return variantSum + roomTotal;
      }, 0) || 0;

      return {
        id: variant.id,
        name: variant.name,
        status: variant.includeInOffer ? 'ready' : 'draft',
        includeInOffer: variant.includeInOffer,
        totalPrice: variantTotal,
        rooms: variant.rooms?.map(room => {
          // Calculate room total
          const roomTotal = room.products?.reduce((sum, product) => {
            const basePrice = product.quantity * product.unitPrice;
            const discountedPrice = basePrice * (1 - (product.discount || 0) / 100);
            return sum + discountedPrice;
          }, 0) || 0;

          return {
            id: room.id,
            name: room.name,
            totalPrice: roomTotal,
            products: room.products?.map(product => {
              const basePrice = product.quantity * product.unitPrice;
              const totalPrice = basePrice * (1 - (product.discount || 0) / 100);
              
              return {
                id: product.id,
                name: product.product?.nameBg || product.product?.nameEn || 'Неизвестен продукт',
                quantity: product.quantity,
                unitPrice: product.unitPrice,
                discount: product.discount || 0,
                totalPrice: totalPrice
              };
            }) || []
          };
        }) || []
      };
    });
  };

  // Transform project data for EnhancedOfferModal
  const transformProjectForOffer = (project: any) => {
    if (!project) return undefined;
    return {
      id: project.id,
      name: project.name,
      address: project.address || '',
      client: {
        id: project.client?.id || '',
        name: project.client?.firstName && project.client?.lastName 
          ? `${project.client.firstName} ${project.client.lastName}`
          : project.client?.companyName || 'Неизвестен клиент',
        email: project.client?.email || '',
        phone: project.client?.phone || '',
        contact: project.client?.firstName && project.client?.lastName 
          ? `${project.client.firstName} ${project.client.lastName}`
          : project.client?.companyName || 'Неизвестен клиент'
      }
    };
  };

  // Transform phase data for EnhancedOfferModal
  const transformPhaseForOffer = (phase: any) => {
    if (!phase) return undefined;
    return {
      id: phase.id,
      name: phase.name,
      description: phase.description || ''
    };
  };

  // ✅ NEW: Handle offer preview
  const handleOfferPreviewClose = () => {
    setShowOfferPreview(false);
    setSelectedOfferId(null);
  };

  // ✅ NEW: Handle room edit modal
  const handleRoomEditModalClose = () => {
    setShowRoomEditModal(false);
    setSelectedRoom(null);
  };

  const handleRoomEditModalSuccess = () => {
    setShowRoomEditModal(false);
    setSelectedRoom(null);
    loadData();
  };

  // ✅ NEW: Handle room clone modal
  const handleRoomCloneModalClose = () => {
    setShowRoomCloneModal(false);
    setSelectedRoomForClone(null);
    setSelectedVariantForRoomClone(null);
  };

  const handleRoomCloneModalSuccess = () => {
    setShowRoomCloneModal(false);
    setSelectedRoomForClone(null);
    setSelectedVariantForRoomClone(null);
    loadData();
  };

  // ✅ NEW: Handle variant clone modal
  const handleVariantCloneModalClose = () => {
    setShowVariantCloneModal(false);
    setSelectedVariantForClone(null);
  };

  const handleVariantCloneModalSuccess = () => {
    setShowVariantCloneModal(false);
    setSelectedVariantForClone(null);
    loadData();
  };

  // 🎨 ENHANCED UI WITH LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Зареждане на варианти...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 🎨 ENHANCED HEADER */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          {/* Navigation */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Назад</span>
            </button>
            <div className="text-gray-400">/</div>
            <span className="text-white font-semibold">Варианти</span>
          </div>

          {/* Project Info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Package className="h-8 w-8 mr-3 text-blue-400" />
                {phase?.name || 'Варианти'}
              </h1>
              <div className="flex items-center space-x-6 text-gray-300">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{project?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{client?.name || 'Неизвестен клиент'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>{variants.length} варианта</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center space-x-2 backdrop-blur-sm"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleCreateVariant}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 font-semibold flex items-center space-x-2 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                <span>Създай вариант</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🎨 ENHANCED STATS SECTION */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <VariantStatsGrid 
            variants={variants}
            isLoading={isLoading}
          />
        </div>

        {/* 🎨 ENHANCED CONTROLS */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Търси варианти..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
                />
              </div>
              
              <button
                onClick={() => setShowSelectedOnly(!showSelectedOnly)}
                className={`px-4 py-3 rounded-xl border transition-all flex items-center space-x-2 ${
                  showSelectedOnly 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {showSelectedOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>Само избрани</span>
              </button>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'total')}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Име</option>
                <option value="createdAt">Дата</option>
                <option value="total">Стойност</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
              
              <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${
                    viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 🎨 ENHANCED LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Enhanced but using VariantCard */}
          <div className="lg:col-span-3">
            {sortedVariants.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Няма варианти</h3>
                <p className="text-gray-600 mb-6">Започнете чрез създаване на първия си вариант</p>
                <button
                  onClick={handleCreateVariant}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold"
                >
                  Създай вариант
                </button>
              </div>
            ) : (
              /* 🔥 CRITICAL: Using VariantCard with enhanced wrapper - ONE PER ROW */
              <div className="space-y-6">
                {sortedVariants.map((variant) => (
                  <div 
                    key={variant.id} 
                    className="transform transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* ✅ USING ORIGINAL VariantCard WITH ALL ROOMS FUNCTIONALITY */}
                    <VariantCard
                      variant={variant}
                      onEdit={handleEditVariant}
                      onDuplicate={handleDuplicateVariant}
                      onDelete={handleDeleteVariant}
                      onToggleSelection={handleToggleSelection}
                      onRoomEdit={handleRoomEdit}               // 🔥 CRITICAL: Rooms handlers!
                      onRoomDuplicate={handleRoomDuplicate}     // 🔥 CRITICAL: Rooms handlers!
                      onRoomDelete={handleRoomDelete}           // 🔥 CRITICAL: Rooms handlers!
                      calculateVariantTotal={calculateVariantTotal}
                      formatCurrency={formatCurrency}
                      onCreateRoom={() => handleCreateRoom(variant.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🎨 ENHANCED SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Enhanced Offers Manager */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Управление на оферти
                  </h3>
                </div>
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

              {/* Enhanced Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Бързи действия
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <button
                    onClick={() => setShowOfferWizard(true)}
                    className="w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all text-blue-700 font-medium flex items-center justify-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Генерирай оферта</span>
                  </button>
                  <button
                    onClick={handleCreateVariant}
                    className="w-full p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all text-green-700 font-medium flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Нов вариант</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ CORRECTED MODALS WITH PROPER PROPS */}
      {showCreateModal && (
        <CreateVariantModal
          isOpen={showCreateModal}
          phaseId={phaseId}
          onClose={handleCreateModalClose}
          onSuccess={handleCreateModalSuccess}
        />
      )}

      {showEditModal && selectedVariant && (
        <EditVariantModal
          isOpen={showEditModal}
          variant={selectedVariant}
          phaseId={phaseId}
          onClose={handleEditModalClose}
          onSuccess={handleEditModalSuccess}
        />
      )}

      {showCreateRoomModal && selectedVariantForRoom && (
        <RoomCreateModal
          variantId={selectedVariantForRoom}
          isOpen={showCreateRoomModal}
          onClose={handleCreateRoomModalClose}
          onRoomCreated={handleCreateRoomModalSuccess}
        />
      )}

      {showOfferWizard && (
        <EnhancedOfferModal
          isOpen={showOfferWizard}
          onClose={handleOfferWizardClose}
          variants={transformVariantsForOffer(variants)}
          project={transformProjectForOffer(project)}
          phase={transformPhaseForOffer(phase)}
        />
      )}

      {showOfferPreview && selectedOfferId && (
        <OfferPreviewModal
          isOpen={showOfferPreview}
          offerId={selectedOfferId}
          onClose={handleOfferPreviewClose}
        />
      )}

      {/* ✅ NEW: Room Edit Modal */}
      {showRoomEditModal && selectedRoom && (
        <RoomEditModal
          isOpen={showRoomEditModal}
          room={selectedRoom}
          onClose={handleRoomEditModalClose}
          onRoomUpdated={handleRoomEditModalSuccess}
        />
      )}

      {/* ✅ NEW: Room Clone Modal */}
      {showRoomCloneModal && selectedRoomForClone && selectedVariantForRoomClone && (
        <RoomCloneModal
          isOpen={showRoomCloneModal}
          room={selectedRoomForClone}
          currentVariantId={selectedVariantForRoomClone.id}
          currentPhaseId={phaseId}
          projectId={projectId}
          onClose={handleRoomCloneModalClose}
          onCloned={handleRoomCloneModalSuccess}
        />
      )}

      {/* ✅ NEW: Variant Clone Modal */}
      {showVariantCloneModal && selectedVariantForClone && (
        <VariantCloneModal
          isOpen={showVariantCloneModal}
          variant={selectedVariantForClone}
          currentPhaseId={phaseId}
          projectId={projectId}
          onClose={handleVariantCloneModalClose}
          onCloned={handleVariantCloneModalSuccess}
        />
      )}
    </div>
  );
}