import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, FileText, Euro } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Offer {
  id: string;
  offerNumber: string;
  type: 'MATERIALS' | 'INSTALLATION' | 'COMPLETE' | 'LUXURY' | 'CUSTOM';
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  projectName: string;
  clientName: string;
  totalAmount: number;
  currency: string;
  validUntil: string;
  createdAt: string;
}

const mockOffers: Offer[] = [
  {
    id: '1',
    offerNumber: 'OF2025-001512',
    type: 'MATERIALS',
    status: 'ACCEPTED',
    projectName: 'Линднер Парк А16',
    clientName: 'Линднер-Даниел Павлов',
    totalAmount: 46269.30,
    currency: 'EUR',
    validUntil: '2025-12-31',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    offerNumber: 'IN2025-001678',
    type: 'INSTALLATION',
    status: 'SENT',
    projectName: 'Линднер Парк А16',
    clientName: 'Линднер-Даниел Павлов',
    totalAmount: 15250.00,
    currency: 'EUR',
    validUntil: '2025-12-31',
    createdAt: '2025-06-20',
  },
  {
    id: '3',
    offerNumber: 'CP2025-000023',
    type: 'COMPLETE',
    status: 'ACCEPTED',
    projectName: 'Линднер Парк А16',
    clientName: 'Линднер-Даниел Павлов',
    totalAmount: 61519.30,
    currency: 'EUR',
    validUntil: '2025-12-31',
    createdAt: '2025-07-10',
  },
  {
    id: '4',
    offerNumber: 'IN2025-000045',
    type: 'INSTALLATION',
    status: 'DRAFT',
    projectName: 'Апартамент Георги Петров',
    clientName: 'Георги Петров',
    totalAmount: 8500.00,
    currency: 'EUR',
    validUntil: '2025-12-31',
    createdAt: '2025-08-01',
  },
  {
    id: '5',
    offerNumber: 'LX2025-000012',
    type: 'LUXURY',
    status: 'SENT',
    projectName: 'Вила Елена',
    clientName: 'Елена Иванова',
    totalAmount: 125000.00,
    currency: 'EUR',
    validUntil: '2025-12-31',
    createdAt: '2025-08-15',
  },
];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'MATERIALS': return 'bg-blue-100 text-blue-800';
    case 'INSTALLATION': return 'bg-green-100 text-green-800';
    case 'COMPLETE': return 'bg-purple-100 text-purple-800';
    case 'LUXURY': return 'bg-amber-100 text-amber-800';
    case 'CUSTOM': return 'bg-indigo-100 text-indigo-800';
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
    case 'MATERIALS': return 'Материали';
    case 'INSTALLATION': return 'Монтаж';
    case 'COMPLETE': return 'Комплексна';
    case 'LUXURY': return 'Луксозна';
    case 'CUSTOM': return 'Персонализирана';
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

export default function OffersPage() {
  const [offers] = useState<Offer[]>(mockOffers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = 
      offer.offerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || offer.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || offer.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalAmount = offers
    .filter(offer => offer.status === 'ACCEPTED')
    .reduce((sum, offer) => sum + offer.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Оферти</h1>
              <p className="text-sm text-gray-600 mt-1">
                Управление на всички оферти и проформи
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Експорт
              </Button>
              <Link to="/offers/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Нова оферта
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общо оферти</p>
                <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Приети оферти</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offers.filter(o => o.status === 'ACCEPTED').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Euro className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Обща стойност</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Чернови</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offers.filter(o => o.status === 'DRAFT').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Търсене
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Търси по номер, проект, клиент..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип оферта
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Всички типове</option>
                  <option value="MATERIALS">Материали</option>
                  <option value="INSTALLATION">Монтаж</option>
                  <option value="COMPLETE">Комплексни</option>
                  <option value="LUXURY">Луксозни</option>
                  <option value="CUSTOM">Персонализирани</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Всички статуси</option>
                  <option value="DRAFT">Чернови</option>
                  <option value="SENT">Изпратени</option>
                  <option value="ACCEPTED">Приети</option>
                  <option value="REJECTED">Отхвърлени</option>
                  <option value="EXPIRED">Изтекли</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Проект
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сума
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {offer.offerNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(offer.type)}`}>
                        {getTypeLabel(offer.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{offer.projectName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{offer.clientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        €{offer.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(offer.status)}`}>
                        {getStatusLabel(offer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(offer.createdAt).toLocaleDateString('bg-BG')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/offers/${offer.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/offers/${offer.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 