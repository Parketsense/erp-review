'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PhaseVariant, CreateVariantDto } from '../../types/variant';
import { Phase } from '../../types/phase';
import { variantsApi } from '../../services/variantsApi';
import { phasesApi } from '../../services/phasesApi';
import { projectsApi, Project } from '../../services/projectsApi';
import VariantCreateModal from './VariantCreateModal';
import VariantCloneModal from './VariantCloneModal';
import { Plus, Edit2, Trash2, Copy, ArrowLeft, Home, Layers, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface VariantsListProps {
  projectId: string;
  phaseId: string;
}

export default function VariantsList({ projectId, phaseId }: VariantsListProps) {
  const router = useRouter();
  const [variants, setVariants] = useState<PhaseVariant[]>([]);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<PhaseVariant | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [variantsData, phaseData, projectData] = await Promise.all([
        variantsApi.getByPhase(phaseId).catch(() => []), // Return empty array if fails
        phasesApi.getPhaseById(phaseId),
        projectsApi.getProjectById(projectId),
      ]);
      
      setVariants(variantsData);
      setPhase(phaseData);
      setProject(projectData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Възникна грешка при зареждането');
    } finally {
      setLoading(false);
    }
  }, [phaseId, projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateVariant = async (data: CreateVariantDto) => {
    try {
      await variantsApi.create(phaseId, data);
      setShowCreateModal(false);
      await fetchData();
    } catch (err) {
      console.error('Failed to create variant:', err);
      alert('Грешка при създаване на вариант. Моля опитайте отново.');
    }
  };

  const handleCloneVariant = async (targetPhaseId: string, includeRooms: boolean, includeProducts: boolean) => {
    if (!selectedVariant) return;
    
    try {
      await variantsApi.clone(selectedVariant.id, {
        name: `${selectedVariant.name} (копие)`,
        description: selectedVariant.description,
        targetPhaseId,
        includeRooms,
        includeProducts,
      });
      setShowCloneModal(false);
      setSelectedVariant(null);
      await fetchData();
    } catch (err) {
      console.error('Failed to clone variant:', err);
      alert('Грешка при клониране на вариант. Моля опитайте отново.');
    }
  };

  const handleDeleteVariant = async (id: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този вариант?')) {
      try {
        await variantsApi.delete(id);
        await fetchData();
      } catch (err) {
        console.error('Failed to delete variant:', err);
        alert('Грешка при изтриване на вариант. Моля опитайте отново.');
      }
    }
  };

  const handleBackToPhases = () => {
    router.push(`/projects/${projectId}`);
  };

  const getVariantStatusIcon = (variant: PhaseVariant) => {
    if (variant.isTemplate) return <Layers className="w-4 h-4" />;
    if (!variant.isActive) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getVariantStatusColor = (variant: PhaseVariant) => {
    if (variant.isTemplate) return 'text-purple-600 bg-purple-100';
    if (!variant.isActive) return 'text-gray-600 bg-gray-100';
    return 'text-green-600 bg-green-100';
  };

  const getVariantStatusText = (variant: PhaseVariant) => {
    if (variant.isTemplate) return 'Шаблон';
    if (!variant.isActive) return 'Неактивен';
    return 'Активен';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Зарежда се...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-2">Грешка при зареждането</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-x-3">
              <button
                onClick={fetchData}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Опитай отново
              </button>
              <button
                onClick={handleBackToPhases}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Назад към фази
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToPhases}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад към фази
                </button>
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Home className="w-4 h-4" />
                    <span className="font-medium">{project?.name}</span>
                    <span>→</span>
                    <span className="font-medium">{phase?.name}</span>
                    <span>→</span>
                    <span>Варианти</span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Варианти за фаза: {phase?.name}
                  </h1>
                  {phase?.description && (
                    <p className="text-gray-600 mt-1">{phase.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {variants.length === 0 ? (
          // Empty state - Centered and elegant
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                <Layers className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Няма създадени варианти</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Започнете като създадете първия вариант за тази фаза. 
                Вариантите ви позволяват да експериментирате с различни подходи и решения.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Създай първия вариант
                </button>
                <div>
                  <button
                    onClick={handleBackToPhases}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    или се върни към фазите
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Variants list
          <div>
            {/* Action Bar */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {variants.length} {variants.length === 1 ? 'вариант' : 'варианта'}
                </h2>
                <p className="text-sm text-gray-600">Управлявайте вариантите за тази фаза</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Нов вариант
              </button>
            </div>

            {/* Variants Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                          {variant.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getVariantStatusColor(variant)}`}>
                          {getVariantStatusIcon(variant)}
                          <span className="ml-1">{getVariantStatusText(variant)}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setSelectedVariant(variant);
                            setShowCloneModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Клонирай вариант"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Navigate to variant edit
                            alert('Редактирането ще бъде добавено скоро');
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Редактирай"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Изтрий"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {variant.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{variant.description}</p>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-1" />
                          <span>{variant._count?.rooms || 0} стаи</span>
                        </div>
                        {variant.totalCost && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="font-medium">{variant.totalCost.toFixed(2)} лв.</span>
                          </div>
                        )}
                      </div>
                      {variant.architect && (
                        <div className="flex items-center">
                          <span className="text-xs">Архитект: {variant.architect}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <VariantCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateVariant}
          phaseId={phaseId}
        />
      )}

      {showCloneModal && selectedVariant && (
        <VariantCloneModal
          isOpen={showCloneModal}
          onClose={() => {
            setShowCloneModal(false);
            setSelectedVariant(null);
          }}
          onClone={handleCloneVariant}
          variant={selectedVariant}
          projectId={projectId}
        />
      )}
    </div>
  );
} 