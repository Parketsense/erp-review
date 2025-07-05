import React from 'react';
import { 
  Plus, 
  Calendar, 
  Users, 
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { ProjectPhase } from '@/services/phasesApi';

interface ProjectPhasesSectionProps {
  phases: ProjectPhase[];
  onCreatePhase: () => void;
  onEditPhase: (phase: ProjectPhase) => void;
  onDeletePhase: (phaseId: string) => void;
  onViewVariants: (phaseId: string) => void;
  onViewPayments: (phaseId: string) => void;
  loading?: boolean;
}

export default function ProjectPhasesSection({
  phases,
  onCreatePhase,
  onEditPhase,
  onDeletePhase,
  onViewVariants,
  onViewPayments,
  loading = false
}: ProjectPhasesSectionProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-gray-100 text-gray-800';
      case 'quoted': return 'bg-yellow-100 text-yellow-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      created: 'Създадена',
      quoted: 'Оферирана',
      won: 'Спечелена',
      lost: 'Загубена'
    };
    return labels[status as keyof typeof labels] || 'Неизвестна';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-black">Фази</h2>
        <button
          onClick={onCreatePhase}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Създай фаза
        </button>
      </div>

      {/* Phases List */}
      <div className="space-y-4">
        {phases.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Няма създадени фази</p>
            <button
              onClick={onCreatePhase}
              className="mt-3 inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Създай първа фаза
            </button>
          </div>
        ) : (
          phases.map((phase, index) => (
            <div 
              key={phase.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {/* Phase Info */}
              <div className="flex items-center space-x-4">
                {/* Phase Number */}
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>

                {/* Phase Details */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-medium text-black">{phase.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                      {getStatusLabel(phase.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(phase.createdAt)}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {phase.variantsCount || 0} варианта
                    </span>
                    {phase.includeArchitectCommission && (
                      <span className="flex items-center text-purple-600">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {phase.project?.architectCommission || 0}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onViewVariants(phase.id)}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Варианти ({phase.variantsCount || 0})
                </button>
                
                {phase.includeArchitectCommission && (
                  <button
                    onClick={() => onViewPayments(phase.id)}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md hover:bg-purple-200 transition-colors duration-200"
                  >
                    Плащания
                  </button>
                )}

                <div className="relative group">
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => onEditPhase(phase)}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Редактирай
                    </button>
                    <button
                      onClick={() => onDeletePhase(phase.id)}
                      className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Изтрий
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 