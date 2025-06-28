import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface OfferItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
  unit: string;
}

export default function EditOfferPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState({
    offerNumber: '',
    type: 'ADVANCE',
    projectId: '',
    variantId: '',
    roomId: '',
    clientId: '',
    currency: 'EUR',
    validUntil: '',
    notes: '',
    terms: '',
    conditions: '',
  });

  const [items, setItems] = useState<OfferItem[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  // Mock data for editing
  const mockOfferData = {
    id: '1',
    offerNumber: 'PF2025-001512',
    type: 'ADVANCE',
    projectId: '1',
    variantId: '1',
    roomId: '1',
    clientId: '1',
    currency: 'EUR',
    validUntil: '2025-12-31',
    notes: 'Оферта за авансово плащане за паркетни материали за дневната стая.',
    terms: 'Плащане 50% аванс при поръчка, останалата сума при доставка.',
    conditions: 'Доставка в рамките на 14 дни след потвърждение на поръчката.',
    items: [
      {
        id: '1',
        productName: 'Паркет Дъб Натурален',
        quantity: 25.5,
        unitPrice: 45.50,
        totalPrice: 1160.25,
        description: 'Дъбов паркет с естествена обработка, дебелина 14мм',
        unit: 'м²',
      },
      {
        id: '2',
        productName: 'Подложка за паркет',
        quantity: 25.5,
        unitPrice: 8.20,
        totalPrice: 209.10,
        description: 'Полиетиленова подложка 3мм дебелина',
        unit: 'м²',
      },
    ],
  };

  const mockProjects = [
    { id: '1', name: 'Линднер Парк А16', clientName: 'Линднер-Даниел Павлов' },
    { id: '2', name: 'Апартамент Георги Петров', clientName: 'Георги Петров' },
    { id: '3', name: 'Вила Елена', clientName: 'Елена Иванова' },
  ];

  const mockVariants = [
    { id: '1', name: 'Вариант Дневна', projectId: '1' },
    { id: '2', name: 'Вариант Спалня', projectId: '1' },
    { id: '3', name: 'Вариант Кухня', projectId: '2' },
  ];

  const mockRooms = [
    { id: '1', name: 'Дневна', variantId: '1', area: 25.5 },
    { id: '2', name: 'Спалня', variantId: '2', area: 18.2 },
    { id: '3', name: 'Кухня', variantId: '3', area: 12.8 },
  ];

  useEffect(() => {
    // Load offer data for editing
    setFormData({
      offerNumber: mockOfferData.offerNumber,
      type: mockOfferData.type as any,
      projectId: mockOfferData.projectId,
      variantId: mockOfferData.variantId,
      roomId: mockOfferData.roomId,
      clientId: mockOfferData.clientId,
      currency: mockOfferData.currency,
      validUntil: mockOfferData.validUntil,
      notes: mockOfferData.notes,
      terms: mockOfferData.terms,
      conditions: mockOfferData.conditions,
    });
    setItems(mockOfferData.items);
    setSelectedProject(mockOfferData.projectId);
    setSelectedVariant(mockOfferData.variantId);
    setSelectedRoom(mockOfferData.roomId);
  }, [id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
      newItems[index].totalPrice = quantity * unitPrice;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    const newItem: OfferItem = {
      id: Date.now().toString(),
      productName: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      description: '',
      unit: 'м²',
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the updated data to the API
    console.log('Updating offer:', { ...formData, items, totalAmount });
    navigate(`/offers/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to={`/offers/${id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Редактиране на оферта</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Редактирайте оферта {formData.offerNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Преглед
              </Button>
              <Button onClick={handleSubmit}>
                <Save className="w-4 h-4 mr-2" />
                Запази промените
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Основна информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер на оферта
                </label>
                <input
                  type="text"
                  value={formData.offerNumber}
                  onChange={(e) => handleInputChange('offerNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PF2025-001512"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип оферта
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ADVANCE">Авансова</option>
                  <option value="INTERIM">Междинна</option>
                  <option value="FINAL">Окончателна</option>
                  <option value="CREDIT">Кредитна</option>
                  <option value="MONTAGE">Монтаж</option>
                  <option value="LUXURY">Луксозна</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Валута
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="EUR">EUR</option>
                  <option value="BGN">BGN</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Валидна до
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Project Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Избор на проект</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Проект
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Изберете проект</option>
                  {mockProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Вариант
                </label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedProject}
                >
                  <option value="">Изберете вариант</option>
                  {mockVariants
                    .filter(variant => variant.projectId === selectedProject)
                    .map(variant => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Стая
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!selectedVariant}
                >
                  <option value="">Изберете стая</option>
                  {mockRooms
                    .filter(room => room.variantId === selectedVariant)
                    .map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.area} м²)
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Позиции</h2>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Добави позиция
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Продукт
                      </label>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Наименование на продукта"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Количество
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Единична цена
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Обща цена
                      </label>
                      <input
                        type="number"
                        value={item.totalPrice}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Допълнително описание на продукта..."
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 flex justify-end">
              <div className="text-right">
                <div className="text-sm text-gray-600">Обща сума:</div>
                <div className="text-2xl font-bold text-gray-900">
                  €{totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Допълнителна информация</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Бележки
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Допълнителни бележки за офертата..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Условия
                </label>
                <textarea
                  value={formData.conditions}
                  onChange={(e) => handleInputChange('conditions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Условия за плащане и доставка..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Общи условия
                </label>
                <textarea
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Общи условия на договора..."
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 