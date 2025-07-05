import React from 'react';
import Link from 'next/link';
import { 
  User, 
  Calendar, 
  MapPin, 
  Building, 
  Home, 
  DollarSign,
  TrendingUp,
  Circle
} from 'lucide-react';
import { Project } from '@/services/projectsApi';

interface ProjectInfoGridProps {
  project: Project;
  onClientClick?: (clientId: string) => void;
}

export default function ProjectInfoGrid({ project, onClientClick }: ProjectInfoGridProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bg-BG', { 
      style: 'currency', 
      currency: 'BGN' 
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Активен',
      completed: 'Завършен',
      draft: 'Чернова',
      cancelled: 'Отменен'
    };
    return labels[status as keyof typeof labels] || 'Неизвестен';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Basic Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-gray-600" />
          Основна информация
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center text-gray-600">
            <User className="w-4 h-4 mr-3 text-gray-500" />
            <span className="text-sm">Клиент: </span>
            {onClientClick ? (
              <button
                onClick={() => onClientClick(project.clientId)}
                className="ml-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                {project.client?.firstName} {project.client?.lastName}
              </button>
            ) : (
              <span className="ml-1 font-medium text-sm">
                {project.client?.firstName} {project.client?.lastName}
              </span>
            )}
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-3 text-gray-500" />
            <span className="text-sm">Създаден: </span>
            <span className="ml-1 font-medium text-sm">
              {formatDate(project.createdAt)}
            </span>
          </div>

          {project.address && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-sm">Локация: </span>
              <span className="ml-1 font-medium text-sm">
                {project.address}
              </span>
            </div>
          )}

          {project.roomsCount && (
            <div className="flex items-center text-gray-600">
              <Building className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-sm">Брой стаи: </span>
              <span className="ml-1 font-medium text-sm">
                {project.roomsCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Financial Information Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-black mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-gray-600" />
          Финансова информация
        </h2>
        
        <div className="space-y-4">
          {project.totalArea && (
            <div className="flex items-center text-gray-600">
              <Home className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-sm">Площ: </span>
              <span className="ml-1 font-medium text-sm">
                {project.totalArea} м²
              </span>
            </div>
          )}

          {project.estimatedBudget && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-sm">Бюджет: </span>
              <span className="ml-1 font-medium text-sm">
                {formatCurrency(project.estimatedBudget)}
              </span>
            </div>
          )}

          {/* Status removed as it's not available in the Project type */}

          {/* Progress placeholder - can be enhanced with actual progress data */}
          <div className="flex items-center text-gray-600">
            <TrendingUp className="w-4 h-4 mr-3 text-gray-500" />
            <span className="text-sm">Прогрес: </span>
            <span className="ml-1 font-medium text-sm">
              0%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 