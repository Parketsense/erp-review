'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  GripVertical
} from 'lucide-react';
import { ProjectPhase } from '@/services/phasesApi';

interface PhasesListProps {
  projectId: string;
  phases: ProjectPhase[];
  onCreatePhase: () => void;
  onEditPhase: (phase: ProjectPhase) => void;
  onDeletePhase: (phaseId: string) => void;
  onReorderPhases?: (phases: ProjectPhase[]) => void;
  loading?: boolean;
}

export default function PhasesList({ 
  projectId, 
  phases, 
  onCreatePhase, 
  onEditPhase, 
  onDeletePhase,
  onReorderPhases,
  loading = false 
}: PhasesListProps) {
  const [draggedPhase, setDraggedPhase] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localPhases, setLocalPhases] = useState<ProjectPhase[]>(phases);

  // Update local phases when props change
  React.useEffect(() => {
    setLocalPhases(phases);
  }, [phases]);

  const handleDragStart = (e: React.DragEvent, phaseId: string) => {
    setDraggedPhase(phaseId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedPhase) return;

    const draggedIndex = localPhases.findIndex(p => p && p.id === draggedPhase);
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedPhase(null);
      setDragOverIndex(null);
      return;
    }

    // Create new array with reordered phases
    const newPhases = [...localPhases];
    const [draggedItem] = newPhases.splice(draggedIndex, 1);
    newPhases.splice(dropIndex, 0, draggedItem);

    // Update phase orders
    const reorderedPhases = newPhases.map((phase, index) => ({
      ...phase,
      phaseOrder: index + 1
    }));

    setLocalPhases(reorderedPhases);
    setDraggedPhase(null);
    setDragOverIndex(null);

    // Notify parent component
    if (onReorderPhases) {
      onReorderPhases(reorderedPhases);
    }
  };

  const handleDragEnd = () => {
    setDraggedPhase(null);
    setDragOverIndex(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'quoted':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'won':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'lost':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Фази</h2>
          <button
            disabled
            className="flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Създай фаза
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Фази</h2>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {phases.length}
          </span>
        </div>
        <button
          onClick={onCreatePhase}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Създай фаза
        </button>
      </div>

      {phases.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Няма фази</h3>
          <p className="text-gray-500 mb-6">
            Започнете да създавате фази за да организирате работата по проекта.
          </p>
          <button
            onClick={onCreatePhase}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Създай първа фаза
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {localPhases.filter(phase => phase && phase.id).map((phase, index) => (
            <div
              key={phase.id}
              className={`border rounded-lg p-4 transition-all ${
                draggedPhase === phase.id ? 'opacity-50 scale-95' : 'hover:shadow-md'
              } ${
                dragOverIndex === index ? 'border-blue-400 bg-blue-50' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, phase.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                      {getStatusIcon(phase.status)}
                      <span className="ml-1">{getStatusLabel(phase.status)}</span>
                    </span>
                    {phase.includeArchitectCommission && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Users className="w-3 h-3 mr-1" />
                        Архитект
                      </span>
                    )}
                  </div>

                  {phase.description && (
                    <p className="text-gray-600 mb-3 text-sm">{phase.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Създадена: {formatDate(phase.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Ред: {phase.phaseOrder}</span>
                    </div>

                    {phase.variantsCount !== undefined && (
                      <div className="flex items-center text-gray-600">
                        <span>{phase.variantsCount} варианта</span>
                      </div>
                    )}

                    {phase.totalValue !== undefined && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>{formatCurrency(phase.totalValue)}</span>
                      </div>
                    )}
                  </div>

                  {phase.includeArchitectCommission && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-700 font-medium">Архитект комисионна:</span>
                        <div className="flex items-center space-x-4">
                          {phase.commissionDue !== undefined && (
                            <span className="text-purple-900">
                              Дължима: {formatCurrency(phase.commissionDue)}
                            </span>
                          )}
                          {phase.commissionPaid !== undefined && (
                            <span className="text-purple-900">
                              Платена: {formatCurrency(phase.commissionPaid)}
                            </span>
                          )}
                          {phase.paymentStatus && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              phase.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-800' :
                              phase.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                              phase.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              phase.paymentStatus === 'overpaid' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {phase.paymentStatus === 'unpaid' ? 'Неплатена' :
                               phase.paymentStatus === 'partial' ? 'Частично' :
                               phase.paymentStatus === 'paid' ? 'Платена' :
                               phase.paymentStatus === 'overpaid' ? 'Надплатена' : 'Неизвестно'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/projects/${projectId}/phases/${phase.id}`}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Преглед на фаза"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onEditPhase(phase)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Редактирай фаза"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePhase(phase.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Изтрии фаза"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 