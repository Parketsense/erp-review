'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  MapPin, 
  User, 
  Building, 
  Phone, 
  Mail, 
  Users, 
  DollarSign,
  Home,
  Briefcase
} from 'lucide-react';
import { projectsApi, Project } from '@/services/projectsApi';
import { phasesApi, ProjectPhase } from '@/services/phasesApi';
import { variantsApi } from '@/services/variantsApi';
import PhasesList from '@/components/phases/PhasesList';
import PhaseCreateModal from '@/components/phases/PhaseCreateModal';
import PhaseEditModal from '@/components/phases/PhaseEditModal';
import ProjectEditModal from '@/components/projects/ProjectEditModal';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ProjectWithClient extends Project {
  clientName?: string;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const [project, setProject] = useState<ProjectWithClient | null>(null);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [phasesLoading, setPhasesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreatePhaseModal, setShowCreatePhaseModal] = useState(false);
  const [showEditPhaseModal, setShowEditPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const projectData = await projectsApi.getProjectById(id);
        
        // Use client data that's already included in the project response
        const clientName = projectData.client 
          ? `${projectData.client.firstName} ${projectData.client.lastName}`
          : 'Неизвестен клиент';
          
        setProject({
          ...projectData,
          clientName
        });
      } catch (err) {
        console.error('Error loading project:', err);
        setError(err instanceof Error ? err.message : 'Грешка при зареждане на проект');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  // Load phases with variants count
  useEffect(() => {
    const loadPhases = async () => {
      try {
        setPhasesLoading(true);
        const phasesResponse = await phasesApi.getPhasesByProject(id);
        const phasesData = phasesResponse.data || [];
        
        // Load variants count for each phase
        const phasesWithVariantsCount = await Promise.all(
          phasesData.map(async (phase) => {
            try {
              const variants = await variantsApi.getVariantsByPhase(phase.id);
              return {
                ...phase,
                variantsCount: variants.length
              };
            } catch (err) {
              console.error(`Error loading variants for phase ${phase.id}:`, err);
              return {
                ...phase,
                variantsCount: 0
              };
            }
          })
        );
        
        setPhases(phasesWithVariantsCount);
      } catch (err) {
        console.error('Error loading phases:', err);
        setPhases([]);
      } finally {
        setPhasesLoading(false);
      }
    };

    loadPhases();
  }, [id]);

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment': return '🏠';
      case 'house': return '🏡';
      case 'office': return '🏢';
      case 'commercial': return '🏬';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  const getProjectTypeLabel = (type: string) => {
    const types = {
      apartment: 'Апартамент',
      house: 'Къща',
      office: 'Офис',
      commercial: 'Търговски обект',
      other: 'Друго'
    };
    return types[type as keyof typeof types] || 'Неизвестен';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const handleCreatePhase = () => {
    setShowCreatePhaseModal(true);
  };

  const handleSavePhase = async (phaseData: any) => {
    try {
      const newPhase = await phasesApi.createPhase(id, phaseData);
      const phaseWithVariantsCount = {
        ...newPhase,
        variantsCount: 0 // New phases start with 0 variants
      };
      setPhases(prev => [...prev, phaseWithVariantsCount]);
      setShowCreatePhaseModal(false);
    } catch (err) {
      console.error('Error creating phase:', err);
      alert('Грешка при създаване на фаза');
    }
  };

  const handleEditPhase = (phase: ProjectPhase) => {
    setEditingPhase(phase);
    setShowEditPhaseModal(true);
  };

  const handleUpdatePhase = async (phaseData: any) => {
    if (!editingPhase) return;
    
    try {
      const updatedPhase = await phasesApi.updatePhase(editingPhase.id, phaseData);
      setPhases(prev => prev.map(p => 
        p.id === editingPhase.id 
          ? { ...updatedPhase, variantsCount: p.variantsCount } 
          : p
      ));
      setShowEditPhaseModal(false);
      setEditingPhase(null);
    } catch (err) {
      console.error('Error updating phase:', err);
      alert('Грешка при обновяване на фаза');
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази фаза?')) return;
    
    try {
      await phasesApi.deletePhase(phaseId);
      setPhases(prev => prev.filter(p => p.id !== phaseId));
    } catch (err) {
      console.error('Error deleting phase:', err);
      alert('Грешка при изтриване на фаза');
    }
  };

  const handleReorderPhases = async (reorderedPhases: ProjectPhase[]) => {
    try {
      const phaseOrders = reorderedPhases.map((phase, index) => ({
        phaseId: phase.id,
        newOrder: index + 1
      }));

      await phasesApi.reorderPhases(id, phaseOrders);
      
      // Update local phases state
      setPhases(reorderedPhases);
    } catch (err) {
      console.error('Error reordering phases:', err);
      alert('Грешка при преподреждане на фазите');
      
      // Reload phases to reset the order
      try {
        const phasesResponse = await phasesApi.getPhasesByProject(id);
        setPhases(phasesResponse.data || []);
      } catch (reloadErr) {
        console.error('Error reloading phases:', reloadErr);
      }
    }
  };

  const handleEditProject = () => {
    setShowEditProjectModal(true);
  };

  const handleUpdateProject = async (projectData: any) => {
    try {
      const updatedProject = await projectsApi.updateProject(id, projectData);
      
      // Update project state with new data
      const clientName = updatedProject.client 
        ? `${updatedProject.client.firstName} ${updatedProject.client.lastName}`
        : 'Неизвестен клиент';
        
      setProject({
        ...updatedProject,
        clientName
      });
      
      setShowEditProjectModal(false);
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Грешка при обновяване на проект');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              Зареждане на проект...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-red-600 mb-4">
              {error || 'Проект не е намерен'}
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад към проекти
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/projects"
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Назад
              </Link>
              <div className="h-4 border-l border-gray-300"></div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getProjectTypeIcon(project.projectType)}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-gray-600 mt-1">{getProjectTypeLabel(project.projectType)}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleEditProject}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              <Edit className="w-4 h-4 mr-2" />
              Редактирай
            </button>
          </div>
        </div>

        {/* Project Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Основна информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>Клиент: {project.clientName}</span>
              </div>
              
              {project.address && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{project.address}</span>
                </div>
              )}
              
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Създаден: {formatDate(project.createdAt)}</span>
              </div>

              {project.totalArea && (
                <div className="flex items-center text-gray-600">
                  <Home className="w-4 h-4 mr-2" />
                  <span>Площ: {project.totalArea} м²</span>
                </div>
              )}

              {project.roomsCount && (
                <div className="flex items-center text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  <span>Стаи: {project.roomsCount}</span>
                </div>
              )}

              {project.estimatedBudget && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Бюджет: {new Intl.NumberFormat('bg-BG', { style: 'currency', currency: 'BGN' }).format(project.estimatedBudget)}</span>
                </div>
              )}
            </div>

            {project.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Описание</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
            )}
          </div>

          {/* Architect Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Архитект</h2>
            
            {project.architectType === 'none' ? (
              <div className="text-center py-6">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Няма архитект</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Тип:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.architectType === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {project.architectType === 'client' ? 'Клиентът' : 'Външен'}
                  </span>
                </div>

                {project.architectName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Име:</span>
                    <span className="font-medium">{project.architectName}</span>
                  </div>
                )}

                {project.architectPhone && (
                  <div className="flex items-center justify-between">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{project.architectPhone}</span>
                  </div>
                )}

                {project.architectEmail && (
                  <div className="flex items-center justify-between">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{project.architectEmail}</span>
                  </div>
                )}

                {project.architectCommission && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Комисионна:</span>
                      <span className="font-medium text-purple-900">{project.architectCommission}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{phases.length}</h3>
                <p className="text-sm text-gray-500">Фази</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {phases.filter(p => p && p.status === 'won').length}
                </h3>
                <p className="text-sm text-gray-500">Спечелени</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {phases.filter(p => p && p.status === 'quoted').length}
                </h3>
                <p className="text-sm text-gray-500">Оферирани</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {phases.filter(p => p && p.includeArchitectCommission).length}
                </h3>
                <p className="text-sm text-gray-500">С архитект</p>
              </div>
            </div>
          </div>
        </div>

        {/* Phases Section */}
        <PhasesList
          projectId={id}
          phases={phases}
          onCreatePhase={handleCreatePhase}
          onEditPhase={handleEditPhase}
          onDeletePhase={handleDeletePhase}
          onReorderPhases={handleReorderPhases}
          loading={phasesLoading}
        />

        {/* Modals */}
        <PhaseCreateModal
          isOpen={showCreatePhaseModal}
          onClose={() => setShowCreatePhaseModal(false)}
          onSave={handleSavePhase}
          projectId={id}
        />

        <PhaseEditModal
          isOpen={showEditPhaseModal}
          onClose={() => {
            setShowEditPhaseModal(false);
            setEditingPhase(null);
          }}
          onSave={handleUpdatePhase}
          initialData={editingPhase}
        />

        <ProjectEditModal
          isOpen={showEditProjectModal}
          onClose={() => setShowEditProjectModal(false)}
          onSave={handleUpdateProject}
          initialData={project}
        />
      </div>
    </div>
  );
} 