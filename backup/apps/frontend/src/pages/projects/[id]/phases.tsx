import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, FileText, CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

interface Phase {
  id: number;
  name: string;
  description: string;
  status: 'created' | 'quoted' | 'won' | 'lost';
  createdDate: string;
  variants: number;
  totalValue: number;
}

const ProjectPhasesPage = () => {
  const { id } = useParams<{ id: string }>();
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 1,
      name: 'Етаж 1 - Продажба',
      description: 'Продажба на продукти за първи етаж',
      status: 'created',
      createdDate: '2024-06-20',
      variants: 3,
      totalValue: 12850.50
    },
    {
      id: 2,
      name: 'Етаж 1 - Монтаж',
      description: 'Монтажни услуги за първи етаж',
      status: 'quoted',
      createdDate: '2024-06-21',
      variants: 1,
      totalValue: 2400.00
    },
    {
      id: 3,
      name: 'Етаж 2',
      description: 'Комплексно обзавеждане втори етаж',
      status: 'won',
      createdDate: '2024-06-15',
      variants: 2,
      totalValue: 18750.25
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPhase, setNewPhase] = useState({
    name: '',
    description: ''
  });

  // Демо данни за проекта
  const project = {
    id: 'PR-2024-001',
    name: 'Къща Иванови',
    client: 'Иван Петров',
    address: 'София, кв. Лозенец'
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'created':
        return {
          label: 'Създадена',
          icon: Clock,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'quoted':
        return {
          label: 'Оферирано',
          icon: FileText,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'won':
        return {
          label: 'Спечелена',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'lost':
        return {
          label: 'Загубена',
          icon: AlertCircle,
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          label: 'Неизвестен',
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const handleCreatePhase = () => {
    if (newPhase.name.trim()) {
      const newId = Math.max(...phases.map(p => p.id)) + 1;
      setPhases([...phases, {
        id: newId,
        name: newPhase.name,
        description: newPhase.description,
        status: 'created',
        createdDate: new Date().toISOString().split('T')[0],
        variants: 0,
        totalValue: 0
      }]);
      setNewPhase({ name: '', description: '' });
      setShowCreateModal(false);
    }
  };

  const handleDeletePhase = (phaseId: number) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази фаза?')) {
      setPhases(phases.filter(p => p.id !== phaseId));
    }
  };

  const stats = {
    total: phases.length,
    won: phases.filter(p => p.status === 'won').length,
    inProgress: phases.filter(p => p.status !== 'won' && p.status !== 'lost').length,
    totalValue: phases.reduce((sum, p) => sum + p.totalValue, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header с проектна информация */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Link to="/projects" className="hover:text-gray-700">
                    Проекти
                  </Link>
                  <span>/</span>
                  <Link to={`/projects/${id}`} className="hover:text-gray-700">
                    {project.name}
                  </Link>
                  <span>/</span>
                  <span>Фази</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {project.name}
                </h1>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>Проект: {project.id}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>Клиент: {project.client}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>Адрес: {project.address}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Нова фаза
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Главно съдържание */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Статистики */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Общо фази
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
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Спечелени
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.won}
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
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      В процес
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.inProgress}
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
                    <span className="text-white font-bold text-sm">лв</span>
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

        {/* Списък фази */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Фази на проекта ({phases.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {phases.map((phase) => {
              const statusInfo = getStatusInfo(phase.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div key={phase.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">
                              {phase.name}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {phase.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Създадена: {phase.createdDate}</span>
                            <span>{phase.variants} варианта</span>
                            <span className="font-medium text-gray-900">
                              {phase.totalValue.toLocaleString()} лв.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/projects/${id}/phases/${phase.id}/variants`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Варианти
                      </Link>
                      <button
                        onClick={() => {
                          // TODO: Implement edit phase
                          console.log('Edit phase:', phase.id);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Редактирай
                      </button>
                      <button
                        onClick={() => handleDeletePhase(phase.id)}
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

          {phases.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени фази</h3>
              <p className="mt-1 text-sm text-gray-500">
                Започнете с създаване на първата фаза за този проект
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Нова фаза
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal за създаване на фаза */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Нова фаза
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Име на фазата *
                  </label>
                  <input
                    type="text"
                    value={newPhase.name}
                    onChange={(e) => setNewPhase(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Напр. Етаж 1 - Продажба"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={newPhase.description}
                    onChange={(e) => setNewPhase(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Кратко описание на фазата..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  onClick={handleCreatePhase}
                  disabled={!newPhase.name.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Създай фаза
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPhasesPage; 