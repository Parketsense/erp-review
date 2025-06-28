import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  GripVertical, 
  Image, 
  Copy, 
  CheckSquare, 
  Square,
  User,
  UserCheck,
  Home,
  DollarSign,
  Calendar,
  ArrowLeft
} from 'lucide-react';

interface Variant {
  id: number;
  name: string;
  description: string;
  designer: string;
  architect: string | null;
  architectPercent: number;
  includeInOffer: boolean;
  rooms: number;
  totalValue: number;
  gallery: number;
  createdDate: string;
  order: number;
}

const PhaseVariantsPage = () => {
  const { id: projectId, phaseId } = useParams<{ id: string; phaseId: string }>();
  const [variants, setVariants] = useState<Variant[]>([
    {
      id: 1,
      name: 'Рибена кост - Дъб натурал',
      description: 'Класически дъб в рибена кост с естествен цвят',
      designer: 'Мария Петрова',
      architect: 'Арх. Николай Иванов',
      architectPercent: 10,
      includeInOffer: true,
      rooms: 3,
      totalValue: 8450.50,
      gallery: 5,
      createdDate: '2024-06-20',
      order: 1
    },
    {
      id: 2,
      name: 'Право редене - Орех американски',
      description: 'Американски орех в традиционно право редене',
      designer: 'Мария Петрова',
      architect: 'Арх. Николай Иванов',
      architectPercent: 10,
      includeInOffer: true,
      rooms: 3,
      totalValue: 9200.00,
      gallery: 3,
      createdDate: '2024-06-20',
      order: 2
    },
    {
      id: 3,
      name: 'Френски паркет - Ясен беж',
      description: 'Ясен във френски стил с беж оттенък',
      designer: 'Елена Георгиева',
      architect: null,
      architectPercent: 0,
      includeInOffer: false,
      rooms: 2,
      totalValue: 6750.25,
      gallery: 2,
      createdDate: '2024-06-21',
      order: 3
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [selectedVariantToClone, setSelectedVariantToClone] = useState<Variant | null>(null);
  const [newVariant, setNewVariant] = useState({
    name: '',
    description: '',
    designer: '',
    architect: '',
    architectPercent: 10
  });

  // Демо данни
  const phase = {
    id: 1,
    name: 'Етаж 1 - Продажба',
    project: 'Къща Иванови',
    client: 'Иван Петров'
  };

  const designers = [
    'Мария Петрова',
    'Елена Георгиева', 
    'Стефан Димитров',
    'Анна Тодорова'
  ];

  const architects = [
    'Арх. Николай Иванов',
    'Арх. Петя Стоянова',
    'Арх. Димитър Василев'
  ];

  const phases = [
    { id: 1, name: 'Етаж 1 - Продажба' },
    { id: 2, name: 'Етаж 1 - Монтаж' },
    { id: 3, name: 'Етаж 2' }
  ];

  const handleCreateVariant = () => {
    if (newVariant.name.trim()) {
      const newId = Math.max(...variants.map(v => v.id)) + 1;
      const maxOrder = Math.max(...variants.map(v => v.order));
      
      setVariants([...variants, {
        id: newId,
        name: newVariant.name,
        description: newVariant.description,
        designer: newVariant.designer,
        architect: newVariant.architect || null,
        architectPercent: newVariant.architectPercent,
        includeInOffer: true,
        rooms: 0,
        totalValue: 0,
        gallery: 0,
        createdDate: new Date().toISOString().split('T')[0],
        order: maxOrder + 1
      }]);
      
      setNewVariant({
        name: '',
        description: '',
        designer: '',
        architect: '',
        architectPercent: 10
      });
      setShowCreateModal(false);
    }
  };

  const handleDeleteVariant = (variantId: number) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този вариант?')) {
      setVariants(variants.filter(v => v.id !== variantId));
    }
  };

  const toggleIncludeInOffer = (variantId: number) => {
    setVariants(variants.map(v => 
      v.id === variantId 
        ? { ...v, includeInOffer: !v.includeInOffer }
        : v
    ));
  };

  const handleMoveVariant = (variantId: number, direction: 'up' | 'down') => {
    const variantIndex = variants.findIndex(v => v.id === variantId);
    if (
      (direction === 'up' && variantIndex > 0) ||
      (direction === 'down' && variantIndex < variants.length - 1)
    ) {
      const newVariants = [...variants];
      const targetIndex = direction === 'up' ? variantIndex - 1 : variantIndex + 1;
      
      // Swap positions
      [newVariants[variantIndex], newVariants[targetIndex]] = 
      [newVariants[targetIndex], newVariants[variantIndex]];
      
      // Update order values
      newVariants.forEach((variant, index) => {
        variant.order = index + 1;
      });
      
      setVariants(newVariants);
    }
  };

  const handleCloneVariant = (variantId: number, targetPhaseId: number) => {
    const variantToClone = variants.find(v => v.id === variantId);
    if (variantToClone) {
      // В реалната система тук би се направил API call
      console.log('Клониране на вариант', variantToClone.name, 'във фаза', targetPhaseId);
      setShowCloneModal(false);
      setSelectedVariantToClone(null);
    }
  };

  const includedVariants = variants.filter(v => v.includeInOffer);
  const totalOfferValue = includedVariants.reduce((sum, variant) => sum + variant.totalValue, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Link to="/projects" className="hover:text-gray-700">
                    Проекти
                  </Link>
                  <span>/</span>
                  <Link to={`/projects/${projectId}`} className="hover:text-gray-700">
                    {phase.project}
                  </Link>
                  <span>/</span>
                  <Link to={`/projects/${projectId}/phases`} className="hover:text-gray-700">
                    Фази
                  </Link>
                  <span>/</span>
                  <span>{phase.name}</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">
                  {phase.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Управление на варианти в тази фаза
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Нов вариант
                </button>
              </div>
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
                      В офертата
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
                      Стойност оферта
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalOfferValue.toLocaleString()}
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
                    <Image className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Общо снимки
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {variants.reduce((sum, v) => sum + v.gallery, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variants list */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Варианти ({variants.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {variants.map((variant, index) => (
              <div key={variant.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {variant.order}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {variant.name}
                          </h4>
                          <button
                            onClick={() => toggleIncludeInOffer(variant.id)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              variant.includeInOffer
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {variant.includeInOffer ? (
                              <CheckSquare className="w-3 h-3 mr-1" />
                            ) : (
                              <Square className="w-3 h-3 mr-1" />
                            )}
                            {variant.includeInOffer ? 'В офертата' : 'Изключен'}
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {variant.description}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            <span>Дизайнер: {variant.designer}</span>
                          </div>
                          {variant.architect && (
                            <div className="flex items-center">
                              <UserCheck className="w-4 h-4 mr-1" />
                              <span>Архитект: {variant.architect} ({variant.architectPercent}%)</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Home className="w-4 h-4 mr-1" />
                            <span>{variant.rooms} стаи</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="font-medium text-gray-900">
                              {variant.totalValue.toLocaleString()} лв.
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Image className="w-4 h-4 mr-1" />
                            <span>{variant.gallery} снимки</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleMoveVariant(variant.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveVariant(variant.id, 'down')}
                        disabled={index === variants.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      to={`/projects/${projectId}/phases/${phaseId}/variants/${variant.id}/rooms`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Стаи
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedVariantToClone(variant);
                        setShowCloneModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Клонирай
                    </button>
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

          {variants.length === 0 && (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени варианти</h3>
              <p className="mt-1 text-sm text-gray-500">
                Започнете с създаване на първия вариант за тази фаза
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Нов вариант
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal за създаване на вариант */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Нов вариант
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Име на варианта *
                  </label>
                  <input
                    type="text"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Напр. Рибена кост - Дъб натурал"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={newVariant.description}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Кратко описание на варианта..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дизайнер
                  </label>
                  <select
                    value={newVariant.designer}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, designer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Изберете дизайнер</option>
                    {designers.map((designer) => (
                      <option key={designer} value={designer}>{designer}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Архитект
                  </label>
                  <select
                    value={newVariant.architect}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, architect: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Без архитект</option>
                    {architects.map((architect) => (
                      <option key={architect} value={architect}>{architect}</option>
                    ))}
                  </select>
                </div>

                {newVariant.architect && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Комисионна на архитект (%)
                    </label>
                    <input
                      type="number"
                      value={newVariant.architectPercent}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, architectPercent: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      max="50"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  onClick={handleCreateVariant}
                  disabled={!newVariant.name.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Създай вариант
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal за клониране на вариант */}
      {showCloneModal && selectedVariantToClone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Клониране на вариант
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Клониране на: <strong>{selectedVariantToClone.name}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Изберете целева фаза
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    {phases.map((phase) => (
                      <option key={phase.id} value={phase.id}>{phase.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCloneModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  onClick={() => handleCloneVariant(selectedVariantToClone.id, 1)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Клонирай
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseVariantsPage; 