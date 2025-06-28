import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, Users, Building } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';
  address: string;
  city: string;
  client: {
    firstName: string;
    lastName: string;
    companyName?: string;
  };
  status: 'active' | 'completed' | 'on-hold';
  phases: number;
  totalValue: number;
  createdAt: string;
}

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Mock data
  const projects: Project[] = [
    {
      id: '1',
      name: 'Къща Иванови',
      projectType: 'house',
      address: 'София, кв. Лозенец',
      city: 'София',
      client: {
        firstName: 'Иван',
        lastName: 'Петров'
      },
      status: 'active',
      phases: 3,
      totalValue: 45000,
      createdAt: '2024-06-15'
    },
    {
      id: '2',
      name: 'Апартамент Мария',
      projectType: 'apartment',
      address: 'София, кв. Изток',
      city: 'София',
      client: {
        firstName: 'Мария',
        lastName: 'Иванова',
        companyName: 'Дизайн Студио ЕООД'
      },
      status: 'completed',
      phases: 2,
      totalValue: 28000,
      createdAt: '2024-05-20'
    },
    {
      id: '3',
      name: 'Офис Бизнес Център',
      projectType: 'office',
      address: 'София, кв. Център',
      city: 'София',
      client: {
        firstName: 'Георги',
        lastName: 'Стоянов'
      },
      status: 'on-hold',
      phases: 1,
      totalValue: 15000,
      createdAt: '2024-06-10'
    }
  ];

  const projectTypes = [
    { value: 'apartment', label: 'Апартамент', icon: '🏠' },
    { value: 'house', label: 'Къща', icon: '🏡' },
    { value: 'office', label: 'Офис', icon: '🏢' },
    { value: 'commercial', label: 'Търговски обект', icon: '🏪' },
    { value: 'other', label: 'Друго', icon: '📋' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Всички' },
    { value: 'active', label: 'Активни' },
    { value: 'completed', label: 'Завършени' },
    { value: 'on-hold', label: 'На пауза' }
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Активен',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'completed':
        return {
          label: 'Завършен',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'on-hold':
        return {
          label: 'На пауза',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          label: 'Неизвестен',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const getProjectTypeInfo = (type: string) => {
    return projectTypes.find(t => t.value === type) || projectTypes[4];
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${project.client.firstName} ${project.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.projectType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalValue: projects.reduce((sum, p) => sum + p.totalValue, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Проекти
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Управление на всички проекти
                </p>
              </div>
              <Link
                to="/projects/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Нов проект
              </Link>
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
                    <Building className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Общо проекти
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
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
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Активни
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.active}
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
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Завършени
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.completed}
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
                    <span className="text-white font-bold">лв</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Обща стойност
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalValue.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Търсене по име, адрес или клиент..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Всички типове</option>
                {projectTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Projects list */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Списък проекти ({filteredProjects.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredProjects.map((project) => {
              const statusInfo = getStatusInfo(project.status);
              const typeInfo = getProjectTypeInfo(project.projectType);
              
              return (
                <div key={project.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{typeInfo.icon}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900 truncate">
                              {project.name}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {project.address}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {project.client.firstName} {project.client.lastName}
                              {project.client.companyName && ` (${project.client.companyName})`}
                            </div>
                            <div>
                              {project.phases} фази
                            </div>
                            <div className="font-medium text-gray-900">
                              {project.totalValue.toLocaleString()} лв.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/projects/${project.id}/phases`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Фази
                      </Link>
                      <Link
                        to={`/projects/${project.id}`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Детайли
                      </Link>
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Редактирай
                      </Link>
                      <button
                        onClick={() => {
                          if (window.confirm('Сигурни ли сте, че искате да изтриете този проект?')) {
                            console.log('Delete project:', project.id);
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Изтрий
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма намерени проекти</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Променете филтрите или търсенето'
                  : 'Започнете с създаване на първия проект'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                <div className="mt-6">
                  <Link
                    to="/projects/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Нов проект
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage; 