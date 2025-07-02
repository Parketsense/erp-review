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
  ArrowLeft
} from 'lucide-react';
import { PhaseVariant } from '@/types/variant';
import { variantsApi } from '@/services/variantsApi';
import { phasesApi, ProjectPhase } from '@/services/phasesApi';
import { projectsApi, Project } from '@/services/projectsApi';
import VariantCreateModal from '@/components/variants/VariantCreateModal';

export default function VariantsPage() {
  const { id: projectId, phaseId } = useParams() as { id: string; phaseId: string };
  const [variants, setVariants] = useState<PhaseVariant[]>([]);
  const [phase, setPhase] = useState<ProjectPhase | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  useEffect(() => {
    loadData();
  }, [phaseId, projectId]);

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
    // Calculate total value based on rooms and products
    // This is a placeholder - we'd need room/product data for real calculation
    return sum + (variant._count?.rooms || 0) * 1000; // Demo calculation
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
                <div key={variant.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {variant.variantOrder}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center mr-4">
                          <button
                            onClick={() => toggleIncludeInOffer(variant.id, variant.includeInOffer)}
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

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
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
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(variant.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/projects/${projectId}/phases/${phaseId}/variants/${variant.id}/rooms`}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        title="Управление на стаи"
                      >
                        <Home className="w-4 h-4 mr-1" />
                        Стаи ({variant._count?.rooms || 0})
                      </Link>
                      <button
                        onClick={() => {
                          // TODO: Implement edit variant
                          console.log('Edit variant:', variant.id);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Редактирай
                      </button>
                      <button
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Изтрий
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <VariantCreateModal
          phaseId={phaseId}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onVariantCreated={loadData}
        />
      )}
    </div>
  );
} 