'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Calendar,
  MapPin,
  FileText,
  Users,
  Building,
  Package,
  CheckCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  ArrowRight,
  Settings,
  Layers,
  Euro,
  User,
  Activity,
  BarChart3,
  Target
} from 'lucide-react';
import PhaseEditModal from '@/components/phases/PhaseEditModal';
import PhaseCreateModal from '@/components/phases/PhaseCreateModal';
import { phasesApi, CreatePhaseDto, UpdatePhaseDto, ProjectPhase } from '@/services/phasesApi';
import { projectsApi, Project as ApiProject } from '@/services/projectsApi';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  clientId: string;
  architectId?: string;
  architectName?: string;
  architectCommission?: number;
  startDate?: string;
  endDate?: string;
  address?: string;
  budget?: number;
  phases: Phase[];
  client?: {
    name: string;
    email: string;
    contact: string;
  };
}

interface Phase {
  id: string;
  name: string;
  description?: string;
  order: number;
  status: string;
  variants: Variant[];
  progress?: number;
  estimatedCost?: number;
  actualCost?: number;
  includeArchitectCommission?: boolean;
  architectCommissionPercent?: number;
  architectCommissionAmount?: number;
  discountEnabled?: boolean;
  phaseDiscount?: number;
}

interface Variant {
  id: string;
  name: string;
  status: string;
  rooms: number;
  products: number;
  value: string;
  progress?: number;
  lastUpdated?: string;
}

const ProjectOverviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);
  
  // Phase edit modal state
  const [showEditPhaseModal, setShowEditPhaseModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  
  // Phase create modal state
  const [showCreatePhaseModal, setShowCreatePhaseModal] = useState(false);

  const loadProjectData = async () => {
    if (!projectId || !params?.id) return;
    
    try {
      setLoading(true);
      console.log('Loading project data for ID:', projectId);
      
      // Load project data from API
      const apiProject = await projectsApi.getProjectById(projectId);
      console.log('API Project data:', apiProject);
      
      // Load phases for this project
      const phasesResponse = await phasesApi.getPhasesByProject(projectId);
      console.log('Phases data:', phasesResponse);
      
      // Transform API data to match our interface
      const transformedProject: Project = {
        id: apiProject.id,
        name: apiProject.name,
        description: apiProject.description,
        status: apiProject.isActive ? 'active' : 'inactive',
        clientId: apiProject.clientId,
        architectId: apiProject.architectId,
        architectName: apiProject.architectName,
        architectCommission: apiProject.architectCommission,
        startDate: apiProject.createdAt,
        endDate: apiProject.updatedAt,
        address: apiProject.address,
        budget: apiProject.estimatedBudget,
        client: apiProject.client ? {
          name: `${apiProject.client.firstName} ${apiProject.client.lastName}`,
          email: apiProject.client.email,
          contact: apiProject.client.phone
        } : undefined,
        phases: phasesResponse.data.map(phase => ({
          id: phase.id,
          name: phase.name,
          description: phase.description,
          order: phase.phaseOrder,
          status: phase.status,
          progress: 0, // TODO: Calculate from variants
          estimatedCost: 0, // TODO: Calculate from variants
          actualCost: 0, // TODO: Calculate from variants
          includeArchitectCommission: phase.includeArchitectCommission,
          architectCommissionPercent: phase.architectCommissionPercent,
          architectCommissionAmount: phase.architectCommissionAmount,
          discountEnabled: phase.discountEnabled,
          phaseDiscount: phase.phaseDiscount,
          variants: [] // TODO: Load variants for each phase
        }))
      };
      
      console.log('Transformed project data:', transformedProject);
      setProject(transformedProject);
    } catch (error) {
      console.error('Error loading project data:', error);
      // Fallback to mock data if API fails
      const mockProject: Project = {
        id: projectId,
        name: "Хотел Бургас",
        description: "Луксозен хотел в центъра на Бургас",
        status: "active",
        clientId: "client_1",
        startDate: "2024-01-15",
        endDate: "2024-12-31",
        address: "ул. Александровска 1, Бургас",
        budget: 2500000,
        client: {
          name: "Хотели ЕООД",
          email: "manager@hotels-bg.com",
          contact: "Георги Петров"
        },
        phases: [
          {
            id: "phase_1",
            name: "Първа фаза - Основна конструкция",
            description: "Стаи и общи помещения",
            order: 1,
            status: "completed",
            progress: 100,
            estimatedCost: 850000,
            actualCost: 820000,
            variants: [
              { 
                id: "1", 
                name: "SALIS", 
                status: "draft", 
                rooms: 2, 
                products: 0, 
                value: "0 лв.",
                progress: 15,
                lastUpdated: "2024-06-28"
              },
              { 
                id: "2", 
                name: "FOGLIE D'ORO", 
                status: "ready", 
                rooms: 3, 
                products: 5, 
                value: "2456.00 лв.",
                progress: 100,
                lastUpdated: "2024-06-29"
              }
            ]
          },
          {
            id: "phase_2", 
            name: "Втора фаза - Обзавеждане",
            description: "Мебели и декорация",
            order: 2,
            status: "in_progress",
            progress: 65,
            estimatedCost: 1200000,
            actualCost: 780000,
            variants: [
              { 
                id: "3", 
                name: "PREMIUM", 
                status: "ready", 
                rooms: 5, 
                products: 12, 
                value: "5670.00 лв.",
                progress: 95,
                lastUpdated: "2024-06-30"
              }
            ]
          },
          {
            id: "phase_3",
            name: "Трета фаза - Финализиране", 
            description: "Последни щрихи",
            order: 3,
            status: "planned",
            progress: 0,
            estimatedCost: 450000,
            actualCost: 0,
            variants: []
          }
        ]
      };
      
      setProject(mockProject);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId && params?.id) {
      loadProjectData();
    }
  }, [projectId, params?.id]);

  // Navigate to phase variants
  const handlePhaseVariantsClick = (phaseId: string) => {
    router.push(`/projects/${project?.id}/phases/${phaseId}/variants`);
  };

  // Navigate to specific variant
  const handleVariantClick = (phaseId: string, variantId: string) => {
    router.push(`/projects/${project?.id}/phases/${phaseId}/variants`);
  };

  // Phase edit handlers
  const handleEditPhase = (phase: Phase) => {
    console.log('Opening edit modal for phase:', phase);
    setSelectedPhase(phase);
    setShowEditPhaseModal(true);
  };

  const handleEditPhaseSubmit = async (data: UpdatePhaseDto) => {
    try {
      if (!selectedPhase) {
        console.error('No phase selected for editing');
        return;
      }
      
      console.log('Updating phase with data:', data);
      console.log('Selected phase ID:', selectedPhase.id);
      
      const updatedPhase = await phasesApi.updatePhase(selectedPhase.id, data);
      console.log('Phase updated successfully:', updatedPhase);
      
      // Refresh project data
      await loadProjectData();
      
      setShowEditPhaseModal(false);
      setSelectedPhase(null);
      
      // Show success message
      alert('Фазата е обновена успешно!');
    } catch (error) {
      console.error('Error updating phase:', error);
      alert('Грешка при обновяване на фазата: ' + (error as Error).message);
      throw error;
    }
  };

  // Phase create handlers
  const handleCreatePhase = () => {
    console.log('Opening create phase modal');
    setShowCreatePhaseModal(true);
  };

  const handleCreatePhaseSubmit = async (phaseData: CreatePhaseDto) => {
    try {
      console.log('Creating phase with data:', phaseData);
      console.log('Project ID:', projectId);
      
      const newPhase = await phasesApi.createPhase(projectId, phaseData);
      console.log('Phase created successfully:', newPhase);
      
      // Refresh project data
      await loadProjectData();
      
      setShowCreatePhaseModal(false);
      
      // Show success message
      alert('Фазата е създадена успешно!');
    } catch (error) {
      console.error('Error creating phase:', error);
      alert('Грешка при създаване на фазата: ' + (error as Error).message);
      throw error;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Завършена',
          color: 'bg-green-100 text-green-800 border-green-200',
          gradient: 'from-green-500 to-emerald-600',
          dot: 'bg-green-500',
          icon: CheckCircle,
          bgGradient: 'from-green-50 to-emerald-50'
        };
      case 'in_progress':
        return {
          label: 'В процес',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          gradient: 'from-yellow-500 to-orange-600',
          dot: 'bg-yellow-500',
          icon: Activity,
          bgGradient: 'from-yellow-50 to-orange-50'
        };
      case 'planned':
        return {
          label: 'Планирана',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          gradient: 'from-gray-500 to-slate-600',
          dot: 'bg-gray-500',
          icon: Clock,
          bgGradient: 'from-gray-50 to-slate-50'
        };
      default:
        return {
          label: 'Неизвестен',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          gradient: 'from-gray-500 to-slate-600',
          dot: 'bg-gray-500',
          icon: Clock,
          bgGradient: 'from-gray-50 to-slate-50'
        };
    }
  };

  const getVariantStatusConfig = (status: string) => {
    switch (status) {
      case 'ready':
        return {
          label: 'Готов',
          color: 'bg-green-100 text-green-800 border-green-200',
          dot: 'bg-green-500'
        };
      case 'draft':
        return {
          label: 'Чернова',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          dot: 'bg-gray-400'
        };
      default:
        return {
          label: 'В процес',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dot: 'bg-yellow-500'
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('bg-BG')} лв.`;
  };

  const calculatePhaseTotal = (phase: Phase) => {
    return phase.variants.reduce((total, variant) => {
      const value = parseFloat(variant.value.replace(' лв.', '').replace(',', ''));
      return total + (isNaN(value) ? 0 : value);
    }, 0);
  };

  const getProjectStats = () => {
    if (!project) return { totalEstimated: 0, totalActual: 0, completedPhases: 0, totalVariants: 0, avgProgress: 0 };
    
    const totalEstimated = project.phases.reduce((sum, phase) => sum + (phase.estimatedCost || 0), 0);
    const totalActual = project.phases.reduce((sum, phase) => sum + (phase.actualCost || 0), 0);
    const completedPhases = project.phases.filter(p => p.status === 'completed').length;
    const totalVariants = project.phases.reduce((sum, phase) => sum + phase.variants.length, 0);
    const avgProgress = project.phases.reduce((sum, phase) => sum + (phase.progress || 0), 0) / project.phases.length;

    return {
      totalEstimated,
      totalActual,
      completedPhases,
      totalVariants,
      avgProgress: Math.round(avgProgress)
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Зареждане на проекта...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Проектът не е намерен</h2>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  const stats = getProjectStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => router.back()}
                className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-2 text-white/70">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{project.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{project.client?.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/projects/${projectId}/edit`)}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg"
              >
                <Edit className="h-5 w-5" />
                <span>Редактирай проект</span>
              </button>
              <button 
                onClick={handleCreatePhase}
                className="px-6 py-3 bg-gradient-to-r from-white to-gray-100 text-black rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 font-semibold flex items-center space-x-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Създай фаза</span>
              </button>
              <button className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white">
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 -mt-12 relative z-10">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgProgress}%</div>
                <div className="text-sm text-gray-600">Общ прогрес</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.completedPhases}</div>
                <div className="text-sm text-gray-600">Завършени фази</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalVariants}</div>
                <div className="text-sm text-gray-600">Общо варианти</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                <Euro className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalActual)}</div>
                <div className="text-sm text-gray-600">Реална стойност</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalEstimated)}</div>
                <div className="text-sm text-gray-600">Планирана стойност</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Building className="h-6 w-6 text-gray-600" />
            <span>Информация за проекта</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Начална дата</p>
                <p className="text-lg font-bold text-gray-900">{project.startDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Крайна дата</p>
                <p className="text-lg font-bold text-gray-900">{project.endDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Клиент</p>
                <p className="text-lg font-bold text-gray-900">{project.client?.contact}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Euro className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 font-medium">Бюджет</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(project.budget || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Phases Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <Layers className="h-8 w-8 text-gray-600" />
              <span>Фази на проекта</span>
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {project.phases.length} фази
              </span>
              <button className="text-sm text-black hover:text-gray-800 font-medium">
                Управление на фази
              </button>
            </div>
          </div>

          {/* Phases Cards */}
          <div className="space-y-6">
            {project.phases.map((phase) => {
              const statusConfig = getStatusConfig(phase.status);
              const isHovered = hoveredPhase === phase.id;
              const StatusIcon = statusConfig.icon;
              const phaseTotal = calculatePhaseTotal(phase);

              return (
                <div
                  key={phase.id}
                  className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 transform cursor-pointer ${
                    isHovered ? 'scale-[1.02] shadow-2xl' : 'hover:shadow-xl'
                  }`}
                  onMouseEnter={() => setHoveredPhase(phase.id)}
                  onMouseLeave={() => setHoveredPhase(null)}
                  onClick={() => handlePhaseVariantsClick(phase.id)}
                >
                  {/* Phase Header */}
                  <div className={`bg-gradient-to-r ${statusConfig.bgGradient} p-8 border-b border-gray-100`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        {/* Phase Number & Icon */}
                        <div className={`w-16 h-16 bg-gradient-to-br ${statusConfig.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <span className="text-2xl font-bold text-white">{phase.order}</span>
                        </div>

                        {/* Phase Info */}
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{phase.name}</h3>
                          <p className="text-gray-600 text-lg">{phase.description}</p>
                          <div className="flex items-center space-x-6 mt-3">
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${statusConfig.color}`}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="text-sm font-medium">{statusConfig.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPhase(phase);
                          }}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Edit className="h-5 w-5" />
                          <span>Редактирай фаза</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePhaseVariantsClick(phase.id);
                          }}
                          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <ArrowRight className="h-5 w-5" />
                          <span>Отвори варианти</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {phase.progress !== undefined && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Прогрес</span>
                          <span className="text-sm font-bold text-gray-900">{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-white/60 rounded-full h-3 shadow-inner">
                          <div
                            className={`h-3 bg-gradient-to-r ${statusConfig.gradient} rounded-full transition-all duration-700 shadow-lg`}
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Phase Stats */}
                    <div className="grid grid-cols-6 gap-4 mt-6">
                      <div className="bg-white/60 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{phase.variants.length}</div>
                        <div className="text-sm text-gray-600">Варианти</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {phase.variants.reduce((sum, v) => sum + v.rooms, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Стаи</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 text-center">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(phase.actualCost || 0)}</div>
                        <div className="text-sm text-gray-600">Реална стойност</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 text-center">
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(phaseTotal)}</div>
                        <div className="text-sm text-gray-600">Варианти стойност</div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {phase.includeArchitectCommission ? (
                            <span className="text-green-600">✓ Архитект</span>
                          ) : (
                            <span className="text-gray-400">✗ Архитект</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {phase.includeArchitectCommission ? (
                            <div>
                              <div>{project?.architectName || 'Не е посочен'}</div>
                              <div className="text-xs text-gray-500">
                                {project?.architectCommission ? `${project.architectCommission}%` : '0%'} комисионна
                              </div>
                            </div>
                          ) : (
                            'Комисионна'
                          )}
                        </div>
                      </div>
                      <div className="bg-white/60 rounded-xl p-4 text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {phase.discountEnabled ? (
                            <span className="text-blue-600">✓ Отстъпка</span>
                          ) : (
                            <span className="text-gray-400">✗ Отстъпка</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {phase.phaseDiscount ? `${phase.phaseDiscount}%` : 'Процент'}
                        </div>
                      </div>
                    </div>
                  </div>


                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Phase Modal */}
      {selectedPhase && (
        <PhaseEditModal
          isOpen={showEditPhaseModal}
          onClose={() => {
            setShowEditPhaseModal(false);
            setSelectedPhase(null);
          }}
          onSave={handleEditPhaseSubmit}
          initialData={{
            id: selectedPhase.id,
            name: selectedPhase.name,
            description: selectedPhase.description || '',
            status: (selectedPhase.status === 'created' || selectedPhase.status === 'quoted' || selectedPhase.status === 'won' || selectedPhase.status === 'lost') 
              ? selectedPhase.status as 'created' | 'quoted' | 'won' | 'lost' 
              : 'created',
            projectId: project?.id || '',
            phaseOrder: selectedPhase.order,
            includeArchitectCommission: selectedPhase.includeArchitectCommission || false,
            discountEnabled: selectedPhase.discountEnabled || false,
            phaseDiscount: selectedPhase.phaseDiscount || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            variantsCount: selectedPhase.variants?.length || 0,
            totalValue: 0 // TODO: Calculate from phase data
          }}
        />
      )}

      {/* Create Phase Modal */}
      <PhaseCreateModal
        isOpen={showCreatePhaseModal}
        onClose={() => setShowCreatePhaseModal(false)}
        onSave={handleCreatePhaseSubmit}
        projectId={project?.id || ''}
      />
    </div>
  );
};

export default ProjectOverviewPage;