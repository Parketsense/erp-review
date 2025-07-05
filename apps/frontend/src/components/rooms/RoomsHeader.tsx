'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Home, 
  Settings,
  RefreshCw,
  Filter,
  Search,
  Grid3X3,
  List
} from 'lucide-react';

interface RoomsHeaderProps {
  projectId: string;
  phaseId: string;
  variantId: string;
  projectName: string;
  phaseName: string;
  variantName: string;
  onCreateRoom: () => void;
  onRefresh: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const RoomsHeader: React.FC<RoomsHeaderProps> = ({
  projectId,
  phaseId,
  variantId,
  projectName,
  phaseName,
  variantName,
  onCreateRoom,
  onRefresh,
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link 
              href="/projects" 
              className="hover:text-gray-700 transition-colors flex items-center"
            >
              <Home className="w-4 h-4 mr-1" />
              Проекти
            </Link>
            <span>/</span>
            <Link 
              href={`/projects/${projectId}`} 
              className="hover:text-gray-700 transition-colors"
            >
              {projectName || 'Зареждане...'}
            </Link>
            <span>/</span>
            <Link 
              href={`/projects/${projectId}/phases/${phaseId}/variants`} 
              className="hover:text-gray-700 transition-colors"
            >
              {phaseName || 'Зареждане...'}
            </Link>
            <span>/</span>
            <Link 
              href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}`} 
              className="hover:text-gray-700 transition-colors"
            >
              {variantName || 'Зареждане...'}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Стаи</span>
          </nav>

          {/* Main Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}`}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Назад към варианта"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Управление на стаи
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Вариант: {variantName || 'Зареждане...'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Грид изглед"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Списък изглед"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Търси стаи..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Filter */}
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button>

              {/* Refresh */}
              <button 
                onClick={onRefresh}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Обнови"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* Create Room */}
              <button
                onClick={onCreateRoom}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Нова стая
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsHeader; 