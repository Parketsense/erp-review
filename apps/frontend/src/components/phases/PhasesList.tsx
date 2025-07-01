'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phase, PhaseStats, CreatePhaseDto } from '../../types/phase';
import { phasesApi } from '../../services/phasesApi';
import { projectsApi, Project } from '../../services/projectsApi';
import PhaseCreateModal from './PhaseCreateModal';
import PhaseEditModal from './PhaseEditModal';
import { Plus, Edit2, Trash2, Eye, FileText, CheckCircle, Clock, AlertCircle, DollarSign } from 'lucide-react';

interface PhasesListProps {
  projectId: string;
  projectName?: string;
}

export default function PhasesList({ projectId }: PhasesListProps) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<PhaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);

  const loadData = useCallback(async () => {
    try {
      console.log('PhasesList: Starting data load for project:', projectId);
      setLoading(true);
      setError(null);
      
      console.log('PhasesList: Making API calls...');
      const [phasesResponse, statsResponse, projectResponse] = await Promise.all([
        phasesApi.getPhasesByProject(projectId),
        phasesApi.getPhaseStats(),
        projectsApi.getProjectById(projectId)
      ]);
      
      console.log('PhasesList: API responses received:', {
        phases: phasesResponse,
        stats: statsResponse,
        project: projectResponse
      });
      
      let filteredPhases = phasesResponse;
      
      if (searchTerm) {
        filteredPhases = filteredPhases.filter(phase => 
          phase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (phase.description && phase.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (filters.status) {
        filteredPhases = filteredPhases.filter(phase => phase.status === filters.status);
      }
      
      setPhases(filteredPhases);
      setStats(statsResponse);
      setProject(projectResponse);
      console.log('PhasesList: Data loaded successfully');
    } catch (err) {
      console.error('PhasesList: Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setLoading(false);
    }
  }, [projectId, searchTerm, filters.status]);

  const handleCreatePhase = async (phaseData: CreatePhaseDto) => {
    await phasesApi.createPhase(projectId, phaseData);
    await loadData();
  };

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase);
    setIsEditModalOpen(true);
  };

  const handleUpdatePhase = async (phaseData: CreatePhaseDto) => {
    if (editingPhase) {
      await phasesApi.updatePhase(editingPhase.id, phaseData);
      await loadData();
      setEditingPhase(null);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете тази фаза?')) {
      try {
        await phasesApi.deletePhase(phaseId);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Грешка при изтриване');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'created':
        return {
          label: 'Създадена',
          icon: Clock,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'quoted':
        return {
          label: 'Оферирано',
          icon: FileText,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'won':
        return {
          label: 'Спечелена',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'lost':
        return {
          label: 'Загубена',
          icon: AlertCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'archived':
        return {
          label: 'Архивирана',
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      default:
        return {
          label: 'Неизвестен',
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Зареждане на фази...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg">Грешка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header с проектна информация */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project?.name || 'Зареждане...'}
                </h1>
                {project && (
                  <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>Проект: {project.id}</span>
                    </div>
                    {project.address && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Адрес: {project.address}</span>
                      </div>
                    )}
                    {project.city && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Град: {project.city}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Нова фаза
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Главно съдържание */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Общо фази
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {phases.length}
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
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Спечелени
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {phases.filter(p => p.status === 'won').length}
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
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      В процес
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {phases.filter(p => p.status !== 'won' && p.status !== 'lost' && p.status !== 'archived').length}
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
                    <span className="text-white font-bold text-sm">лв</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Обща стойност
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      0.00 лв
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Списък с фази */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Фази на проекта
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Управление на етапите от развитието на проекта
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {phases.map((phase) => {
              const statusInfo = getStatusInfo(phase.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <li key={phase.id}>
                  <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {phase.name}
                          </h4>
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>
                        {phase.description && (
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {phase.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span>Създадена: {new Date(phase.createdAt).toLocaleDateString('bg-BG')}</span>
                          <span>Ред: {phase.phaseOrder}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Преглед"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditPhase(phase)}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Редактиране"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePhase(phase.id)}
                        className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Изтриване"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {phases.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени фази</h3>
            <p className="mt-1 text-sm text-gray-500">
              Започнете чрез създаване на първата фаза на проекта.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Създай фаза
              </button>
            </div>
          </div>
        )}
      </div>
      
      <PhaseCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePhase}
        projectId={projectId}
      />

      <PhaseEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPhase(null);
        }}
        onSave={handleUpdatePhase}
        initialData={editingPhase}
      />
    </div>
  );
} 