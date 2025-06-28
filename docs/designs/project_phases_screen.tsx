import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ProjectPhasesScreen = () => {
  const [phases, setPhases] = useState([
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

  const getStatusInfo = (status) => {
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

  const handleDeletePhase = (phaseId) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази фаза?')) {
      setPhases(phases.filter(p => p.id !== phaseId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header с проектна информация */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
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
                      {phases.length}
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
                      {phases.filter(p => p.status === 'won').length}
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
                      {phases.filter(p => p.status !== 'won').length}
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
                      {phases.reduce((sum, phase) => sum + phase.totalValue, 0).toLocaleString('bg-BG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} лв
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Списък с фази */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Фази на проекта
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Управление на етапите от развитието на проекта
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {phases.map((phase) => {
              const statusInfo = getStatusInfo(phase.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <li key={phase.id}>
                  <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {phase.name}
                          </h4>
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.className}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>
                        {phase.description && (
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            {phase.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                          <span>Създадена: {new Date(phase.createdDate).toLocaleDateString('bg-BG')}</span>
                          <span>Варианти: {phase.variants}</span>
                          <span>Стойност: {phase.totalValue.toLocaleString('bg-BG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} лв</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Преглед"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Редактиране"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePhase(phase.id)}
                        className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        title="Изтриване"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {phases.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени фази</h3>
            <p className="mt-1 text-sm text-gray-500">
              Започнете чрез създаване на първата фаза на проекта.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Създай фаза
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Модал за създаване на нова фаза */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Създаване на нова фаза
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Име на фаза *
                  </label>
                  <input
                    type="text"
                    value={newPhase.name}
                    onChange={(e) => setNewPhase({...newPhase, name: e.target.value})}
                    placeholder="напр. Етаж 1, Монтаж, Дневна..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={newPhase.description}
                    onChange={(e) => setNewPhase({...newPhase, description: e.target.value})}
                    placeholder="Кратко описание на фазата..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Отказ
                </button>
                <button
                  onClick={handleCreatePhase}
                  disabled={!newPhase.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Създай
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPhasesScreen;