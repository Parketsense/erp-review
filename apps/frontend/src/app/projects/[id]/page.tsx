'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi, Project } from '@/services/projectsApi';
import { phasesApi, ProjectPhase } from '@/services/phasesApi';
import { variantsApi } from '@/services/variantsApi';
import PhaseCreateModal from '@/components/phases/PhaseCreateModal';
import PhaseEditModal from '@/components/phases/PhaseEditModal';
import ProjectEditModal from '@/components/projects/ProjectEditModal';
import {
  ProjectDetailsHeader,
  ProjectInfoGrid,
  ProjectPhaseStats,
  ProjectPhasesSection
} from '@/components/projects';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ProjectWithClient is no longer needed since Project already includes client data

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
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
        
        // Project data already includes client information
        setProject(projectData);
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
      setPhases(reorderedPhases);
    } catch (err) {
      console.error('Error reordering phases:', err);
      alert('Грешка при пренареждане на фази');
    }
  };

  const handleEditProject = () => {
    setShowEditProjectModal(true);
  };

  const handleUpdateProject = async (projectData: any) => {
    try {
      const updatedProject = await projectsApi.updateProject(id, projectData);
      setProject(prev => prev ? { ...prev, ...updatedProject } : null);
      setShowEditProjectModal(false);
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Грешка при обновяване на проект');
    }
  };

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleViewVariants = (phaseId: string) => {
    router.push(`/projects/${id}/phases/${phaseId}/variants`);
  };

  const handleViewPayments = (phaseId: string) => {
    router.push(`/projects/${id}/phases/${phaseId}`);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Експорт функционалността ще бъде имплементирана скоро');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
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
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-red-600 mb-4">
              {error || 'Проект не е намерен'}
            </div>
            <button
              onClick={() => router.push('/projects')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Назад към проекти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Project Header */}
        <ProjectDetailsHeader
          project={project}
          onEdit={handleEditProject}
          onExport={handleExport}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Information Cards */}
            <ProjectInfoGrid
              project={project}
              onClientClick={handleClientClick}
            />

            {/* Phase Statistics */}
            <ProjectPhaseStats phases={phases} />

            {/* Phases Section */}
            <ProjectPhasesSection
              phases={phases}
              onCreatePhase={handleCreatePhase}
              onEditPhase={handleEditPhase}
              onDeletePhase={handleDeletePhase}
              onViewVariants={handleViewVariants}
              onViewPayments={handleViewPayments}
              loading={phasesLoading}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* TODO: Add ProjectArchitectCard component when implemented */}
          </div>
        </div>

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