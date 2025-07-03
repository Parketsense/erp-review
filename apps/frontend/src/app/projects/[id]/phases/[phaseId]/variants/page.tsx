'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  GripVertical,
  CheckSquare,
  Square,
  Home,
  DollarSign,
  Calendar,
  User,
  UserCheck,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Package,
  Ruler,
  Percent,
  Settings
} from 'lucide-react';
import { PhaseVariant } from '@/types/variant';
import { VariantRoom } from '@/types/room';
import { variantsApi } from '@/services/variantsApi';
import { roomsApi } from '@/services/roomsApi';
import { roomProductsApi, RoomProduct } from '@/services/roomProductsApi';
import { phasesApi, ProjectPhase } from '@/services/phasesApi';
import { projectsApi, Project } from '@/services/projectsApi';
import VariantCreateModal from '@/components/variants/VariantCreateModal';
import VariantEditModal from '@/components/variants/VariantEditModal';
import RoomCreateModal from '@/components/rooms/RoomCreateModal';
import RoomEditModal from '@/components/rooms/RoomEditModal';
import AddProductModal from '@/components/rooms/AddProductModal';

export default function VariantsPage() {
  const { id: projectId, phaseId } = useParams() as { id: string; phaseId: string };
  const [variants, setVariants] = useState<PhaseVariant[]>([]);
  const [phase, setPhase] = useState<ProjectPhase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PhaseVariant | null>(null);
  const [showRoomCreateModal, setShowRoomCreateModal] = useState(false);
  const [showRoomEditModal, setShowRoomEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<VariantRoom | null>(null);
  const [selectedVariantForRoom, setSelectedVariantForRoom] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedRoomForProducts, setSelectedRoomForProducts] = useState<VariantRoom | null>(null);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<VariantRoom | null>(null);
  
  // Expand/collapse states
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [variantRooms, setVariantRooms] = useState<Record<string, VariantRoom[]>>({});
  const [loadingRooms, setLoadingRooms] = useState<Record<string, boolean>>({});
  const [roomProducts, setRoomProducts] = useState<Record<string, RoomProduct[]>>({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [variantsResponse, phaseResponse, projectResponse] = await Promise.all([
        variantsApi.getVariantsByPhase(phaseId),
        phasesApi.getPhaseById(phaseId),
        projectsApi.getProjectById(projectId)
      ]);
      
      setVariants(variantsResponse);
      setPhase(phaseResponse);
      setProject(projectResponse);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setLoading(false);
    }
  };

  const loadRoomsForVariant = async (variantId: string) => {
    if (variantRooms[variantId]) return; // Already loaded
    
    try {
      setLoadingRooms(prev => ({ ...prev, [variantId]: true }));
      const rooms = await roomsApi.getRoomsByVariant(variantId);
      setVariantRooms(prev => ({ ...prev, [variantId]: rooms }));
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoadingRooms(prev => ({ ...prev, [variantId]: false }));
    }
  };

  const toggleVariantExpansion = async (variantId: string) => {
    const newExpanded = new Set(expandedVariants);
    
    if (expandedVariants.has(variantId)) {
      newExpanded.delete(variantId);
    } else {
      newExpanded.add(variantId);
      await loadRoomsForVariant(variantId);
    }
    
    setExpandedVariants(newExpanded);
  };

  const handleCreateRoom = (variantId: string) => {
    setSelectedVariantForRoom(variantId);
    setShowRoomCreateModal(true);
  };

  const handleRoomCreated = async () => {
    if (selectedVariantForRoom) {
      // Reload rooms for this variant
      setVariantRooms(prev => {
        const newRooms = { ...prev };
        delete newRooms[selectedVariantForRoom];
        return newRooms;
      });
      await loadRoomsForVariant(selectedVariantForRoom);
    }
    setShowRoomCreateModal(false);
    setSelectedVariantForRoom(null);
  };

  const handleRoomClick = (room: VariantRoom) => {
    setSelectedRoom(room);
    setShowProductModal(true);
  };

  const handleEditRoom = (room: VariantRoom) => {
    setSelectedRoomForEdit(room);
    setShowRoomEditModal(true);
  };

  const handleProductsManage = (room: VariantRoom) => {
    setSelectedRoomForProducts(room);
    setShowProductModal(true);
  };

  const handleRoomUpdated = async () => {
    if (selectedRoomForEdit) {
      // Reload the specific room to get updated data
      try {
        const updatedRoom = await roomsApi.getRoomById(selectedRoomForEdit.id);
        
        // Update the room in the state
        setVariantRooms(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(variantId => {
            updated[variantId] = updated[variantId].map(room => 
              room.id === selectedRoomForEdit.id ? updatedRoom : room
            );
          });
          return updated;
        });

        // Update products for this room with new room data (discount, area)
        await updateRoomProductsAfterRoomEdit(selectedRoomForEdit.id, updatedRoom);
        
        // Reload products to reflect the changes
        await loadRoomProducts(selectedRoomForEdit.id);
        
      } catch (error) {
        console.error('Error updating room:', error);
      }
    }
    setShowRoomEditModal(false);
    setSelectedRoomForEdit(null);
  };

  const handleProductAdded = async () => {
    if (selectedRoomForProducts) {
      // Reload products for this room
      await loadRoomProducts(selectedRoomForProducts.id);
    }
  };

  useEffect(() => {
    loadData();
  }, [phaseId, projectId]);

  // Load rooms when variants change and auto-expand them
  useEffect(() => {
    if (variants.length > 0) {
      // Auto-expand all variants and load their rooms
      const newExpanded = new Set<string>();
      variants.forEach(variant => {
        newExpanded.add(variant.id);
        loadRoomsForVariant(variant.id);
      });
      setExpandedVariants(newExpanded);
    }
  }, [variants]);

  // Load products when rooms change
  useEffect(() => {
    Object.entries(variantRooms).forEach(([variantId, rooms]) => {
      if (rooms.length > 0) {
        loadProductsForVariant(variantId);
      }
    });
  }, [variantRooms]);

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този вариант?')) {
      try {
        await variantsApi.deleteVariant(variantId);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Грешка при изтриване');
      }
    }
  };

  const handleEditVariant = (variant: PhaseVariant) => {
    setSelectedVariant(variant);
    setShowEditModal(true);
  };

  const handleVariantUpdated = async () => {
    await loadData();
    // Refresh rooms if the edited variant is expanded
    if (selectedVariant && expandedVariants.has(selectedVariant.id)) {
      await loadRoomsForVariant(selectedVariant.id);
    }
  };

  const toggleIncludeInOffer = async (variantId: string, currentValue: boolean) => {
    try {
      await variantsApi.updateVariant(variantId, {
        includeInOffer: !currentValue
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при обновяване');
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

  // Load room products for a specific room
  const loadRoomProducts = async (roomId: string) => {
    try {
      const response = await roomProductsApi.getRoomProducts(roomId);
      setRoomProducts(prev => ({
        ...prev,
        [roomId]: response.data
      }));
    } catch (error) {
      console.error('Failed to load room products:', error);
      // Set empty array on error
      setRoomProducts(prev => ({
        ...prev,
        [roomId]: []
      }));
    }
  };

  // Load products for all rooms in a variant
  const loadProductsForVariant = async (variantId: string) => {
    const rooms = variantRooms[variantId] || [];
    await Promise.all(rooms.map(room => loadRoomProducts(room.id)));
  };

  // Calculate room totals
  const calculateRoomTotals = (roomId: string) => {
    const products = roomProducts[roomId] || [];
    let totalQuantity = 0;
    let totalAmount = 0;

    products.forEach(roomProduct => {
      const quantity = roomProduct.quantity || 0;
      const unitPrice = roomProduct.unitPrice || 0;
      const discount = roomProduct.discountEnabled ? (roomProduct.discount || 0) : 0;
      const wastePercent = roomProduct.wastePercent || 0;

      const baseTotal = quantity * unitPrice;
      const discountAmount = baseTotal * (discount / 100);
      const afterDiscount = baseTotal - discountAmount;
      const wasteAmount = afterDiscount * (wastePercent / 100);
      const finalAmount = afterDiscount + wasteAmount;

      totalQuantity += quantity;
      totalAmount += finalAmount;
    });

    return {
      productCount: products.length,
      totalQuantity,
      totalAmount
    };
  };

  // Function to update room products after room edit
  const updateRoomProductsAfterRoomEdit = async (roomId: string, updatedRoom: VariantRoom) => {
    try {
      const roomProductsList = roomProducts[roomId] || [];
      
      for (const roomProduct of roomProductsList) {
        // Prepare update data - update products to inherit from room
        const updateData: any = {};
        let needsUpdate = false;

        // Update quantity to match room area
        if (updatedRoom.area && updatedRoom.area !== roomProduct.quantity) {
          updateData.quantity = updatedRoom.area;
          needsUpdate = true;
        }

        // Update discount to match room discount
        if (updatedRoom.discount !== undefined && updatedRoom.discount !== roomProduct.discount) {
          updateData.discount = updatedRoom.discount;
          needsUpdate = true;
        }

        // Update the product if needed
        if (needsUpdate) {
          await roomProductsApi.updateRoomProduct(roomProduct.id, updateData);
        }
      }
    } catch (error) {
      console.error('Error updating room products after room edit:', error);
    }
  };

  const handleRoomCardClick = (room: VariantRoom) => {
    setSelectedRoomForProducts(room);
    setShowProductModal(true);
  };

  // Calculate variant total
  const calculateVariantTotal = (variantId: string): number => {
    const rooms = variantRooms[variantId] || [];
    let total = 0;
    
    rooms.forEach(room => {
      const products = roomProducts[room.id] || [];
      products.forEach(product => {
        const basePrice = product.quantity * product.unitPrice;
        const discountAmount = basePrice * ((product.discount || 0) / 100);
        const wasteAmount = (basePrice - discountAmount) * ((product.wastePercent || 0) / 100);
        const finalPrice = basePrice - discountAmount + wasteAmount;
        total += finalPrice;
      });
    });
    
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Зареждане на варианти...</p>
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

  const includedVariants = variants.filter(v => v.includeInOffer);
  const totalOfferValue = includedVariants.reduce((sum, variant) => {
    return sum + calculateVariantTotal(variant.id);
  }, 0);

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
                  <span>{phase?.name || 'Зареждане...'}</span>
                </nav>
                <div className="flex items-center space-x-3">
                  <Link
                    href={`/projects/${projectId}`}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {phase?.name || 'Зареждане...'}
                  </h1>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Управление на варианти в тази фаза
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Нов вариант
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
                      Общо варианти
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {variants.length}
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
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Включени в оферта
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {includedVariants.length}
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
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Стойност на офертата
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(totalOfferValue)}
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
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      С архитект
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {variants.filter(v => v.architect).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variants List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Варианти ({variants.length})
            </h3>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени варианти</h3>
              <p className="mt-1 text-sm text-gray-500">
                Започнете с създаване на първия вариант за тази фаза
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Нов вариант
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {variants.map((variant, index) => (
                <div key={variant.id} className="overflow-hidden">
                  {/* Variant Card */}
                  <div 
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleVariantExpansion(variant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {expandedVariants.has(variant.id) ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {variant.variantOrder}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mr-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleIncludeInOffer(variant.id, variant.includeInOffer);
                              }}
                              className="text-gray-400 hover:text-blue-600"
                            >
                              {variant.includeInOffer ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {variant.name}
                              </h4>
                              {!variant.includeInOffer && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Изключен
                                </span>
                              )}
                            </div>
                            {variant.description && (
                              <p className="mt-1 text-sm text-gray-500 truncate">
                                {variant.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
                          {variant.designer && (
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span>Дизайнер: {variant.designer}</span>
                            </div>
                          )}
                          
                          {variant.architect && (
                            <div className="flex items-center">
                              <UserCheck className="w-4 h-4 mr-1" />
                              <span>Архитект: {variant.architect}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Home className="w-4 h-4 mr-1" />
                            <span>{variant._count?.rooms || 0} стаи</span>
                          </div>
                          
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            <span className="font-medium text-green-600">
                              {calculateVariantTotal(variant.id).toFixed(2)} лв.
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(variant.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateRoom(variant.id);
                          }}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          title="Създай нова стая"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Нова стая
                        </button>
                        <Link
                          href={`/projects/${projectId}/phases/${phaseId}/variants/${variant.id}/rooms`}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          title="Управление на стаи"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Home className="w-4 h-4 mr-1" />
                          Стаи ({variant._count?.rooms || 0})
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditVariant(variant);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Редактирай
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVariant(variant.id);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Изтрий
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Rooms Section */}
                  {expandedVariants.has(variant.id) && (
                    <div className="bg-gray-50 border-t border-gray-200">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Стаи в {variant.name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            Кликнете върху стая за добавяне на продукти
                          </span>
                        </div>

                        {loadingRooms[variant.id] ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-600">Зареждане на стаи...</span>
                          </div>
                        ) : variantRooms[variant.id]?.length === 0 ? (
                          <div className="text-center py-8">
                            <Home className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">
                              Няма създадени стаи в този вариант
                            </p>
                            <button
                              onClick={() => handleCreateRoom(variant.id)}
                              className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Създай първата стая
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {variantRooms[variant.id]?.map((room) => (
                              <div
                                key={room.id}
                                className="bg-white rounded-lg border border-gray-200 p-4 relative group hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleRoomCardClick(room)}
                              >
                                {/* Room action buttons - positioned absolutely */}
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditRoom(room);
                                    }}
                                    className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                    title="Редактирай стая"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRoomCardClick(room);
                                    }}
                                    className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors"
                                    title="Управление на продукти"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="pr-20"> {/* Add padding to avoid overlap with buttons */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 mb-2">{room.name}</h4>
                                      
                                      <div className="space-y-1 text-sm text-gray-600">
                                        {room.area && (
                                          <div className="flex items-center">
                                            <Ruler className="w-4 h-4 mr-1.5 text-gray-400" />
                                            <span>{room.area} м²</span>
                                          </div>
                                        )}
                                        
                                        {room.discountEnabled && room.discount && (
                                          <div className="flex items-center">
                                            <Percent className="w-4 h-4 mr-1.5 text-gray-400" />
                                            <span>Отстъпка: {room.discount}%</span>
                                          </div>
                                        )}

                                        {(() => {
                                          const roomTotals = calculateRoomTotals(room.id);
                                          return (
                                            <>
                                              <div className="flex items-center">
                                                <Package className="w-4 h-4 mr-1.5 text-gray-400" />
                                                <span>{roomTotals.productCount} продукта</span>
                                              </div>
                                              
                                              {roomTotals.totalAmount > 0 && (
                                                <div className="flex items-center">
                                                  <DollarSign className="w-4 h-4 mr-1.5 text-gray-400" />
                                                  <span className="font-medium text-green-600">
                                                    {roomTotals.totalAmount.toFixed(2)} лв.
                                                  </span>
                                                </div>
                                              )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Variant Modal */}
      {showCreateModal && (
        <VariantCreateModal
          phaseId={phaseId}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onVariantCreated={loadData}
        />
      )}

      {/* Create Room Modal */}
      {showRoomCreateModal && selectedVariantForRoom && (
        <RoomCreateModal
          variantId={selectedVariantForRoom}
          isOpen={showRoomCreateModal}
          onClose={() => {
            setShowRoomCreateModal(false);
            setSelectedVariantForRoom(null);
          }}
          onRoomCreated={handleRoomCreated}
        />
      )}

      {/* Room Edit Modal */}
      {showRoomEditModal && selectedRoomForEdit && (
        <RoomEditModal
          room={selectedRoomForEdit}
          isOpen={showRoomEditModal}
          onClose={() => {
            setShowRoomEditModal(false);
            setSelectedRoomForEdit(null);
          }}
          onRoomUpdated={handleRoomUpdated}
        />
      )}

      {/* Product Modal */}
      {showProductModal && selectedRoomForProducts && (
        <AddProductModal
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedRoomForProducts(null);
          }}
          roomId={selectedRoomForProducts.id}
          roomName={selectedRoomForProducts.name}
          onProductAdded={handleProductAdded}
          mode="edit"
        />
      )}

      {/* Edit Variant Modal */}
      {showEditModal && selectedVariant && (
        <VariantEditModal
          variant={selectedVariant}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onVariantUpdated={handleVariantUpdated}
        />
      )}
    </div>
  );
} 