import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Eye, Printer, Mail, Euro, Calendar, User, Building } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface OfferItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
  unit: string;
}

interface Offer {
  id: string;
  offerNumber: string;
  type: 'ADVANCE' | 'INTERIM' | 'FINAL' | 'CREDIT' | 'MONTAGE' | 'LUXURY';
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  projectName: string;
  clientName: string;
  totalAmount: number;
  currency: string;
  validUntil: string;
  createdAt: string;
  notes: string;
  terms: string;
  conditions: string;
  items: OfferItem[];
}

const mockOffer: Offer = {
  id: '1',
  offerNumber: 'PF2025-001512',
  type: 'ADVANCE',
  status: 'ACCEPTED',
  projectName: 'Линднер Парк А16',
  clientName: 'Линднер-Даниел Павлов',
  totalAmount: 46269.30,
  currency: 'EUR',
  validUntil: '2025-12-31',
  createdAt: '2025-01-15',
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
    {
      id: '3',
      productName: 'Монтаж на паркет',
      quantity: 25.5,
      unitPrice: 25.00,
      totalPrice: 637.50,
      description: 'Професионален монтаж включващ подготовка, полагане и завършване',
      unit: 'м²',
    },
  ],
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'ADVANCE': return 'bg-green-100 text-green-800';
    case 'INTERIM': return 'bg-yellow-100 text-yellow-800';
    case 'FINAL': return 'bg-red-100 text-red-800';
    case 'CREDIT': return 'bg-purple-100 text-purple-800';
    case 'MONTAGE': return 'bg-blue-100 text-blue-800';
    case 'LUXURY': return 'bg-amber-100 text-amber-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'bg-gray-100 text-gray-800';
    case 'SENT': return 'bg-blue-100 text-blue-800';
    case 'ACCEPTED': return 'bg-green-100 text-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    case 'EXPIRED': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'ADVANCE': return 'Авансова';
    case 'INTERIM': return 'Междинна';
    case 'FINAL': return 'Окончателна';
    case 'CREDIT': return 'Кредитна';
    case 'MONTAGE': return 'Монтаж';
    case 'LUXURY': return 'Луксозна';
    default: return type;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'Чернова';
    case 'SENT': return 'Изпратена';
    case 'ACCEPTED': return 'Приета';
    case 'REJECTED': return 'Отхвърлена';
    case 'EXPIRED': return 'Изтекла';
    default: return status;
  }
};

export default function OfferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const offer = mockOffer; // In real app, fetch by id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/offers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад към офертите
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{offer.offerNumber}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {getTypeLabel(offer.type)} оферта - {offer.projectName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Печат
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="w-4 h-4 mr-2" />
                Изпрати
              </Button>
              <Link to={`/offers/${id}/edit`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактирай
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Offer Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Информация за офертата</h2>
                <div className="flex space-x-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(offer.type)}`}>
                    {getTypeLabel(offer.type)}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(offer.status)}`}>
                    {getStatusLabel(offer.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Проект</p>
                      <p className="font-medium text-gray-900">{offer.projectName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Клиент</p>
                      <p className="font-medium text-gray-900">{offer.clientName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Създадена на</p>
                      <p className="font-medium text-gray-900">
                        {new Date(offer.createdAt).toLocaleDateString('bg-BG')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Euro className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Обща сума</p>
                      <p className="text-2xl font-bold text-gray-900">
                        €{offer.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Валидна до</p>
                      <p className="font-medium text-gray-900">
                        {new Date(offer.validUntil).toLocaleDateString('bg-BG')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-gray-400">€</div>
                    <div>
                      <p className="text-sm text-gray-600">Валута</p>
                      <p className="font-medium text-gray-900">{offer.currency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Позиции</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Продукт
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Количество
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ед. цена
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Обща цена
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {offer.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </div>
                            {item.description && (
                              <div className="text-sm text-gray-500">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          €{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          €{item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Обща сума:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        €{offer.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes and Conditions */}
            {(offer.notes || offer.conditions || offer.terms) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Допълнителна информация</h3>
                <div className="space-y-6">
                  {offer.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Бележки</h4>
                      <p className="text-sm text-gray-900">{offer.notes}</p>
                    </div>
                  )}
                  
                  {offer.conditions && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Условия</h4>
                      <p className="text-sm text-gray-900">{offer.conditions}</p>
                    </div>
                  )}
                  
                  {offer.terms && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Общи условия</h4>
                      <p className="text-sm text-gray-900">{offer.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Бързи действия</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Преглед PDF
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Печат
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Изпрати по имейл
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Свали PDF
                </Button>
              </div>
            </div>

            {/* Status History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">История на статуса</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Приета</p>
                    <p className="text-xs text-gray-500">15.01.2025 14:30</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Изпратена</p>
                    <p className="text-xs text-gray-500">15.01.2025 10:15</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Създадена</p>
                    <p className="text-xs text-gray-500">15.01.2025 09:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Offers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Свързани оферти</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">IF2025-001678</p>
                  <p className="text-xs text-gray-500">Междинна оферта</p>
                  <p className="text-xs text-gray-500">€15,250.00</p>
                </div>
                <div className="p-3 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">CR2025-000023</p>
                  <p className="text-xs text-gray-500">Кредитна оферта</p>
                  <p className="text-xs text-gray-500">-€2,000.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 