import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Download } from 'lucide-react';
import { Project } from '@/services/projectsApi';

interface ProjectDetailsHeaderProps {
  project: Project;
  onEdit: () => void;
  onExport?: () => void;
}

export default function ProjectDetailsHeader({ project, onEdit, onExport }: ProjectDetailsHeaderProps) {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link 
          href="/" 
          className="hover:text-black transition-colors duration-200"
        >
          Начало
        </Link>
        <span>/</span>
        <Link 
          href="/projects" 
          className="hover:text-black transition-colors duration-200"
        >
          Проекти
        </Link>
        <span>/</span>
        <span className="text-black font-medium">{project.name}</span>
      </nav>

      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Project Icon */}
          <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl">
            {getProjectTypeIcon(project.projectType)}
          </div>

          {/* Project Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-semibold text-black">
                {project.name}
              </h1>
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                {getProjectTypeLabel(project.projectType)}
              </span>
            </div>
            
            {project.description && (
              <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onEdit}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            Редактирай
          </button>
          
          {onExport && (
            <button
              onClick={onExport}
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Експорт
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 