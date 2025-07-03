'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Home,
  DollarSign,
  Users,
  Calendar,
  Edit,
  Settings
} from 'lucide-react';
import { phasesApi, ProjectPhase } from '@/services/phasesApi';
import { projectsApi, Project } from '@/services/projectsApi';
import ArchitectPaymentsList from '@/components/phases/ArchitectPaymentsList';
import PhaseEditModal from '@/components/phases/PhaseEditModal';

type TabType = 'variants' | 'payments';

export default function PhaseDetailPage() {
  const { id: projectId, phaseId } = useParams() as { id: string; phaseId: string };
  const [phase, setPhase] = useState<ProjectPhase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('variants');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [phaseId, projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [phaseResponse, projectResponse] = await Promise.all([
        phasesApi.getPhaseById(phaseId),
        projectsApi.getProjectById(projectId)
      ]);
      
      setPhase(phaseResponse);
      setProject(projectResponse);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhase = async (data: any) => {
    if (!phase) return;
    
    try {
      const updatedPhase = await phasesApi.updatePhase(phase.id, data);
      setPhase(updatedPhase);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating phase:', err);
      alert('Грешка при обновяване на фаза');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      created: 'Създадена',
      quoted: 'Оферирана',
      won: 'Спечелена',
      lost: 'Загубена'
    };
    return labels[status as keyof typeof labels] || 'Неизвестно';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-gray-100 text-gray-800';
      case 'quoted':
        return 'bg-yellow-100 text-yellow-800';
      case 'won':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !phase || !project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">
            <p>{error || 'Фазата не е намерена'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
              <Link href="/projects" className="hover:text-gray-700">
                Проекти
              </Link>
              <span>/</span>
              <Link href={`/projects/${projectId}`} className="hover:text-gray-700">
                {project.name}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{phase.name}</span>
            </div>

            {/* Phase Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{phase.name}</h1>
                {phase.description && (
                  <p className="text-gray-600 mt-1">{phase.description}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Редактирай
                </button>
              </div>
            </div>

            {/* Phase Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Създадена</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(phase.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Settings className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Статус</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                    {getStatusLabel(phase.status)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                <Home className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Ред</p>
                  <p className="text-sm font-medium text-gray-900">
                    {phase.phaseOrder}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Архитект</p>
                  <p className="text-sm font-medium text-gray-900">
                    {phase.includeArchitectCommission ? 'Да' : 'Не'}
                  </p>
                </div>
              </div>
              
              {phase.includeArchitectCommission && (
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Комисионна</p>
                    <p className="text-sm font-medium text-gray-900">
                      {phase.architectCommissionPercent || 0}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('variants')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'variants'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Варианти
            </button>
            
            {phase.includeArchitectCommission && (
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-4 h-4 inline mr-2" />
                Плащания към архитект
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'variants' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Варианти на фазата
              </h3>
              <p className="text-gray-500 mb-4">
                Управлявайте вариантите на тази фаза
              </p>
              <Link
                href={`/projects/${projectId}/phases/${phaseId}/variants`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Преглед на варианти
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'payments' && phase.includeArchitectCommission && (
          <ArchitectPaymentsList
            phaseId={phaseId}
            phaseName={phase.name}
            expectedCommission={phase.commissionDue || 0}
          />
        )}
      </div>

      {/* Edit Modal */}
      <PhaseEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdatePhase}
        initialData={phase}
      />
    </div>
  );
} 