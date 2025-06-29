'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FolderOpen, ArrowLeft, Search, Calendar, User, Building, Archive } from 'lucide-react';
import { projectsApi, Project, ProjectsResponse } from '@/services/projectsApi';
import { clientsApi } from '@/services/clientsApi';

interface ProjectWithClient extends Project {
  clientName?: string;
  status?: 'active' | 'completed' | 'paused' | 'draft';
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithClient[]>([]);

  // Load projects from backend
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response: ProjectsResponse = await projectsApi.getProjects();
        
        // Enrich projects with client names
        const enrichedProjects = await Promise.all(
          response.data.map(async (project) => {
            try {
              const client = await clientsApi.getClientById(project.clientId);
              return {
                ...project,
                clientName: client ? `${client.firstName} ${client.lastName}` : 'Неизвестен клиент',
                status: 'active' as const // Default status since backend doesn't return it yet
              };
            } catch (error) {
              console.error('Error loading client for project:', project.id, error);
              return {
                ...project,
                clientName: 'Неизвестен клиент',
                status: 'active' as const
              };
            }
          })
        );
        
        setProjects(enrichedProjects);
        setFilteredProjects(enrichedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchLower) ||
      project.clientName?.toLowerCase().includes(searchLower) ||
      project.address?.toLowerCase().includes(searchLower) ||
      project.projectType.toLowerCase().includes(searchLower)
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Назад
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Проекти</h1>
                <p className="text-gray-600 mt-1">Управление на проекти</p>
              </div>
            </div>
            <Link
              href="/projects/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Нов проект
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">{projects.length}</h3>
                  <p className="text-sm text-gray-500">Общо проекти</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {projects.filter(p => p.status === 'active').length}
                  </h3>
                  <p className="text-sm text-gray-500">Активни</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <User className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {projects.filter(p => p.architectType === 'external' || p.architectType === 'client').length}
                  </h3>
                  <p className="text-sm text-gray-500">С архитект</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Archive className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {projects.filter(p => p.status === 'completed').length}
                  </h3>
                  <p className="text-sm text-gray-500">Завършени</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {!loading && projects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Търсене по име на проект, клиент, адрес или тип..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              Зареждане на проекти...
            </div>
          </div>
        )}

        {/* Projects List */}
        {!loading && filteredProjects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 gap-0">
              {filteredProjects.map((project) => (
                <div key={project.id} className="border-b border-gray-200 last:border-b-0">
                  <Link href={`/projects/${project.id}`} className="block p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getProjectTypeIcon(project.projectType)}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-500">{getProjectTypeLabel(project.projectType)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span>{project.clientName}</span>
                          </div>
                          
                          {project.address && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="w-4 h-4 mr-2" />
                              <span>{project.address}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Създаден: {formatDate(project.createdAt)}</span>
                          </div>

                          {project.architectName && (
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              <span>Архитект: {project.architectName}</span>
                            </div>
                          )}
                        </div>

                        {project.description && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{project.description}</p>
                        )}
                      </div>
                      
                      <div className="ml-4 flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status === 'active' ? 'Активен' :
                           project.status === 'completed' ? 'Завършен' :
                           project.status === 'draft' ? 'Чернова' : 'Неизвестен'}
                        </span>
                        
                        {project.architectType !== 'none' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            С архитект
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Няма проекти</h2>
            <p className="text-gray-500 mb-6">
              Започнете да създавате проекти за да управлявате работата си по-ефективно.
            </p>
            <Link
              href="/projects/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Създай първи проект
            </Link>
          </div>
        )}

        {/* No Search Results */}
        {!loading && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Няма намерени проекти</h2>
            <p className="text-gray-500 mb-4">
              Опитайте с различни ключови думи или премахнете филтрите.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Изчисти търсенето
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 