import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';

const PhaseVariantsScreen = () => {
  const [variants, setVariants] = useState([
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
  const [selectedVariantToClone, setSelectedVariantToClone] = useState(null);
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
        architect: newVariant.architect,
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

  const handleDeleteVariant = (variantId) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете този вариант?')) {
      setVariants(variants.filter(v => v.id !== variantId));
    }
  };

  const toggleIncludeInOffer = (variantId) => {
    setVariants(variants.map(v => 
      v.id === variantId 
        ? { ...v, includeInOffer: !v.includeInOffer }
        : v
    ));
  };

  const handleMoveVariant = (variantId, direction) => {
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

  const handleCloneVariant = (variantId, targetPhaseId) => {
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
                  <span>{phase.project}</span>
                  <span>/</span>
                  <span>{phase.client}</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">
                  {phase.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Управление на варианти в тази фаза
                </p>
              </div>
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

      {/* Статистики */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                      Включени в оферта
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

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Стойност оферта
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {totalOfferValue.toLocaleString('bg-BG', {
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

        {/* Списък с варианти */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Варианти в офертата
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Подредете вариантите според желания ред в офертата
            </p>
          </div>
          
          {variants.length === 0 ? (
            <div className="text-center py-12">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени варианти</h3>
              <p className="mt-1 text-sm text-gray-500">
                Започнете чрез създаване на първия вариант за тази фаза.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Създай вариант
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {variants.map((variant, index) => (
                <li key={variant.id}>
                  <div className="px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        {/* Drag handle */}
                        <div className="flex flex-col space-y-1 mr-3">
                          <button
                            onClick={() => handleMoveVariant(variant.id, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <GripVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Include in offer checkbox */}
                        <div className="flex items-center mr-4">
                          <button
                            onClick={() => toggleIncludeInOffer(variant.id)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            {variant.includeInOffer ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {variant.name}
                            </h4>
                            {!variant.includeInOffer && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Изключен
                              </span>
                            )}
                          </div>
                          {variant.description && (
                            <p className="mt-1 text-sm text-gray-500 truncate">
                              {variant.description}
                            </p>
                          )}
                          
                          <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              <span>{variant.designer || 'Без дизайнер'}</span>
                            </div>
                            {variant.architect && (
                              <div className="flex items-center">
                                <UserCheck className="w-4 h-4 mr-1" />
                                <span>{variant.architect} ({variant.architectPercent}%)</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Home className="w-4 h-4 mr-1" />
                              <span>{variant.rooms} стаи</span>
                            </div>
                            <div className="flex items-center">
                              <Image className="w-4 h-4 mr-1" />
                              <span>{variant.gallery} снимки</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{new Date(variant.createdDate).toLocaleDateString('bg-BG')}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {variant.totalValue.toLocaleString('bg-BG', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} лв
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          title="Преглед"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVariantToClone(variant);
                            setShowCloneModal(true);
                          }}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          title="Клониране"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          title="Редактиране"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                          title="Изтриване"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Модал за създаване на нов вариант */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Създаване на нов вариант
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Име на вариант *
                  </label>
                  <input
                    type="text"
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                    placeholder="напр. Рибена кост - Дъб натурал"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={newVariant.description}
                    onChange={(e) => setNewVariant({...newVariant, description: e.target.value})}
                    placeholder="Кратко описание на варианта..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дизайнер
                  </label>
                  <select
                    value={newVariant.designer}
                    onChange={(e) => setNewVariant({...newVariant, designer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Избери дизайнер</option>
                    {designers.map(designer => (
                      <option key={designer} value={designer}>{designer}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Архитект
                  </label>
                  <select
                    value={newVariant.architect}
                    onChange={(e) => setNewVariant({...newVariant, architect: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Без архитект</option>
                    {architects.map(architect => (
                      <option key={architect} value={architect}>{architect}</option>
                    ))}
                  </select>
                </div>
                {newVariant.architect && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Комисионна архитект (%)
                    </label>
                    <input
                      type="number"
                      value={newVariant.architectPercent}
                      onChange={(e) => setNewVariant({...newVariant, architectPercent: Number(e.target.value)})}
                      min="0"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  onClick={handleCreateVariant}
                  disabled={!newVariant.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Създай
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модал за клониране */}
      {showCloneModal && selectedVariantToClone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Клониране на вариант
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Клониране на "{selectedVariantToClone.name}" в друга фаза:
              </p>
              <div className="space-y-3">
                {phases.filter(p => p.id !== phase.id).map(targetPhase => (
                  <button
                    key={targetPhase.id}
                    onClick={() => handleCloneVariant(selectedVariantToClone.id, targetPhase.id)}
                    className="w-full text-left px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="font-medium text-gray-900">{targetPhase.name}</div>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCloneModal(false);
                    setSelectedVariantToClone(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отказ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseVariantsScreen;