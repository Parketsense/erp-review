'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Copy, 
  Edit, 
  Trash2, 
  Package, 
  CheckCircle, 
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Eye,
  Calendar,
  Home,
  Palette,
  Euro,
  Camera,
  Image,
  Percent
} from 'lucide-react';

// Import API services
import { variantsApi, Variant } from '@/services/variantsApi';

// Types for App Router
interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
}

interface Room {
  id: string;
  name: string;
  variantId: string;
  images: RoomImage[];
  products: RoomProduct[];
  totalValue?: number;
  discountEnabled?: boolean;
}

interface RoomImage {
  id: string;
  url: string;
  filename: string;
}

interface RoomProduct {
  id: string;
  quantity: number;
  discountPercent?: number;
  product: {
    id: string;
    name: string;
    priceBgn: number;
    unit: string;
  };
}

const ProjectVariantsPage: React.FC = () => {
  const params = useParams();
  const projectId = params?.id as string;
  
  // State management
  const [project, setProject] = useState<Project | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({});
  const [variantDiscounts, setVariantDiscounts] = useState<Record<string, boolean>>({});
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load data on component mount
  useEffect(() => {
    if (projectId) {
      loadProjectData();
      loadVariants();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // This endpoint should exist in backend
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const projectData = await response.json();
        setProject(projectData);
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Грешка при зареждане на проекта');
    }
  };

  const loadVariants = async () => {
    try {
      setLoading(true);
      // Using existing API service - adapted for project variants
      const variantsData = await variantsApi.getByProject(projectId);
      setVariants(variantsData);
    } catch (err) {
      console.error('Error loading variants:', err);
      setError('Грешка при зареждане на вариантите');
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleCreateVariant = async () => {
    try {
      // Open modal or redirect to create page
      alert('Create variant functionality - to be implemented');
    } catch (err) {
      console.error('Error creating variant:', err);
    }
  };

  const handleEditVariant = async (variantId: string) => {
    try {
      alert(`Edit variant ${variantId} - to be implemented`);
    } catch (err) {
      console.error('Error editing variant:', err);
    }
  };

  const handleCloneVariant = async (variantId: string) => {
    try {
      await variantsApi.duplicate(variantId);
      await loadVariants(); // Refresh list
    } catch (err) {
      console.error('Error cloning variant:', err);
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този вариант?')) {
      try {
        await variantsApi.delete(variantId);
        await loadVariants(); // Refresh list
      } catch (err) {
        console.error('Error deleting variant:', err);
      }
    }
  };

  const handleToggleDiscount = async (variantId: string) => {
    setVariantDiscounts(prev => ({
      ...prev,
      [variantId]: !prev[variantId]
    }));
  };

  const toggleRoom = (roomId: string) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; dot: string }> = {
      draft: { 
        label: 'Чернова', 
        color: 'bg-gray-100 text-gray-700',
        dot: 'bg-gray-400'
      },
      ready: { 
        label: 'Готов', 
        color: 'bg-blue-100 text-blue-700',
        dot: 'bg-blue-500'
      },
      sent: { 
        label: 'Изпратен', 
        color: 'bg-green-100 text-green-700',
        dot: 'bg-green-500'
      }
    };
    return configs[status] || configs.draft;
  };

  // Calculate stats from variants data
  const stats = [
    { 
      icon: Package, 
      number: variants.length.toString(), 
      label: "Общо варианти", 
      trend: "+12%", 
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    { 
      icon: CheckCircle, 
      number: variants.filter(v => v.status === 'sent').length.toString(), 
      label: "Изпратени варианти", 
      trend: "3%", 
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    { 
      icon: Euro, 
      number: `${variants.reduce((sum, v) => sum + (v.totalPrice || 0), 0).toLocaleString('bg-BG')} лв.`, 
      label: "Обща стойност", 
      trend: "0%", 
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    { 
      icon: TrendingUp, 
      number: variants.length > 0 ? `${Math.round(variants.reduce((sum, v) => sum + (v.totalPrice || 0), 0) / variants.length).toLocaleString('bg-BG')} лв.` : "0 лв.", 
      label: "Средна стойност", 
      trend: "0%", 
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600"
    }
  ];

  // Filter variants
  const filteredVariants = variants.filter(variant => {
    const matchesStatus = filterStatus === 'all' || variant.status === filterStatus;
    const matchesSearch = variant.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Опитай отново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{projectId}</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {project ? `Проект: ${project.name}` : 'Зареждане...'}
                </h1>
                <p className="text-sm text-gray-500">
                  {project?.client?.name && `Клиент: ${project.client.name}`}
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleCreateVariant}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Създай вариант</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} className={stat.iconColor} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">{stat.trend}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Търси по име на вариант..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-80"
                />
              </div>
              
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Всички статуси</option>
                <option value="draft">Чернови</option>
                <option value="ready">Готови</option>
                <option value="sent">Изпратени</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {filteredVariants.length} от {variants.length} варианта
              </span>
            </div>
          </div>
        </div>

        {/* Variants List */}
        <div className="space-y-8">
          {filteredVariants.map((variant, index) => {
            const statusConfig = getStatusConfig(variant.status || 'draft');
            const isExpanded = expandedVariant === variant.id;
            
            return (
              <div key={variant.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-gray-300">
                {/* Variant Header */}
                <div 
                  className="p-8 cursor-pointer hover:bg-gray-50/50"
                  onClick={() => setExpandedVariant(isExpanded ? null : variant.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6 flex-1">
                      {/* Expand Toggle & ID */}
                      <div className="flex items-center space-x-3">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          {isExpanded ? <ChevronDown size={24} className="text-gray-600" /> : <ChevronRight size={24} className="text-gray-600" />}
                        </button>
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                          <span className="font-bold text-white text-lg">{index + 1}</span>
                        </div>
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title & Status */}
                        <div className="flex items-center space-x-4 mb-4">
                          <h3 className="text-xl font-bold text-gray-900">{variant.name}</h3>
                          <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${statusConfig.color} border`}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${statusConfig.dot}`}></div>
                              <span>{statusConfig.label}</span>
                            </div>
                          </span>
                        </div>
                        
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Home size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">{variant.rooms?.length || 0}</div>
                              <div className="text-xs text-gray-500 font-medium">Стаи</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Package size={18} className="text-green-600" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">{variant.products?.length || 0}</div>
                              <div className="text-xs text-gray-500 font-medium">Продукта</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Euro size={18} className="text-purple-600" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">{(variant.totalPrice || 0).toLocaleString('bg-BG')} лв.</div>
                              <div className="text-xs text-gray-500 font-medium">Стойност</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Camera size={18} className="text-orange-600" />
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">{variant.images?.length || 0}</div>
                              <div className="text-xs text-gray-500 font-medium">Снимки</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <Calendar size={18} className="text-red-600" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{new Date(variant.updatedAt || variant.createdAt).toLocaleDateString('bg-BG')}</div>
                              <div className="text-xs text-gray-500 font-medium">Промяна</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Progress & Actions */}
                    <div className="flex items-center space-x-6 ml-6">
                      {/* Enhanced Progress Ring */}
                      <div className="relative">
                        <div className="relative w-16 h-16">
                          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                            />
                            <path
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke={variant.status === 'sent' ? "#10b981" : "#3b82f6"}
                              strokeWidth="3"
                              strokeDasharray={`${variant.status === 'sent' ? 100 : 75}, 100`}
                              className="drop-shadow-sm"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-700">{variant.status === 'sent' ? '100' : '75'}%</span>
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <div className="text-xs font-medium text-gray-500">Готовност</div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloneVariant(variant.id);
                            }}
                            className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 rounded-xl transition-all duration-200 group shadow-sm relative"
                          >
                            <Copy size={20} />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              Копирай
                            </div>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditVariant(variant.id);
                            }}
                            className="p-3 bg-green-50 text-green-600 hover:bg-green-100 hover:scale-105 rounded-xl transition-all duration-200 group shadow-sm relative"
                          >
                            <Edit size={20} />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              Редактирай
                            </div>
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Camera functionality - TBD');
                            }}
                            className="p-3 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:scale-105 rounded-xl transition-all duration-200 group shadow-sm relative"
                          >
                            <Camera size={20} />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              Добави снимки
                            </div>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleDiscount(variant.id);
                            }}
                            className={`p-3 hover:scale-105 rounded-xl transition-all duration-200 group shadow-sm relative ${
                              variantDiscounts[variant.id] 
                                ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            }`}
                          >
                            <Percent size={20} />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {variantDiscounts[variant.id] ? 'Изключи отстъпки' : 'Включи отстъпки'}
                            </div>
                          </button>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVariant(variant.id);
                          }}
                          className="p-3 bg-red-50 text-red-600 hover:bg-red-100 hover:scale-105 rounded-xl transition-all duration-200 group shadow-sm relative w-full"
                        >
                          <Trash2 size={20} />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Изтрий
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content - Rooms details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-8 bg-gradient-to-r from-gray-50 to-white">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">Детайли за варианта</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="font-semibold text-gray-600">Стаи</div>
                          <div className="text-xl font-bold text-blue-600">{variant.rooms?.length || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="font-semibold text-gray-600">Продукти</div>
                          <div className="text-xl font-bold text-green-600">{variant.products?.length || 0}</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="font-semibold text-gray-600">Стойност</div>
                          <div className="text-xl font-bold text-purple-600">{(variant.totalPrice || 0).toLocaleString('bg-BG')} лв.</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                          <div className="font-semibold text-gray-600">Статус</div>
                          <div className="text-xl font-bold text-gray-600">{statusConfig.label}</div>
                        </div>
                      </div>
                      <p className="text-gray-500 mt-6">Детайлите за стаи и продукти ще бъдат добавени в следващата версия</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredVariants.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Package size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Няма намерени варианти</h3>
            <p className="text-gray-500 mb-8 text-lg">Пробвайте с различни филтри или създайте нов вариант</p>
            <button 
              onClick={handleCreateVariant}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 mx-auto transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus size={24} />
              <span>Създай първи вариант</span>
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={handleCreateVariant}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl shadow-2xl hover:shadow-3xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        >
          <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Създай нов вариант
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProjectVariantsPage;