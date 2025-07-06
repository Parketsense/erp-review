'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Mail, 
  Copy, 
  MoreVertical,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Offer, OfferStatus } from '@/types/offer';
import { adminOffersApi, AdminOfferFilters } from '@/lib/api/admin/offers';

interface OffersListProps {
  initialOffers?: Offer[];
  onOfferAction?: (action: string, offerId: string) => void;
  showFilters?: boolean;
  showBulkActions?: boolean;
}

export function OffersList({ 
  initialOffers = [], 
  onOfferAction,
  showFilters = true,
  showBulkActions = true 
}: OffersListProps) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [loading, setLoading] = useState(!initialOffers.length);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState<AdminOfferFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OfferStatus | 'all'>('all');

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminOffersApi.getAllOffers({
        ...filters,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      
      setOffers(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждането');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialOffers.length) {
      loadOffers();
    }
  }, [filters, searchTerm, statusFilter]);

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази оферта?')) {
      return;
    }

    try {
      await adminOffersApi.deleteOffer(offerId);
      setOffers(offers.filter(o => o.id !== offerId));
      onOfferAction?.('delete', offerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изтриването');
    }
  };

  const handleSendOffer = async (offerId: string) => {
    try {
      await adminOffersApi.sendOffer(offerId, {
        emailSubject: 'Вашата оферта от PARKETSENSE',
        emailBody: 'Прикачена е вашата персонализирана оферта.',
      });
      await loadOffers();
      onOfferAction?.('send', offerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изпращането');
    }
  };

  const handleDuplicateOffer = async (offerId: string) => {
    try {
      const duplicatedOffer = await adminOffersApi.duplicateOffer(offerId, {
        offerNumber: `COPY-${Date.now()}`,
      });
      setOffers([...offers, duplicatedOffer]);
      onOfferAction?.('duplicate', offerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при дублирането');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Сигурни ли сте, че искате да изтриете ${selectedOffers.length} оферти?`)) {
      return;
    }

    try {
      await adminOffersApi.bulkDeleteOffers(selectedOffers);
      setOffers(offers.filter(o => !selectedOffers.includes(o.id)));
      setSelectedOffers([]);
      onOfferAction?.('bulk-delete', '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при масовото изтриване');
    }
  };

  const handleBulkSend = async () => {
    try {
      await adminOffersApi.bulkSendOffers(selectedOffers, {
        emailSubject: 'Вашата оферта от PARKETSENSE',
        emailBody: 'Прикачена е вашата персонализирана оферта.',
      });
      await loadOffers();
      setSelectedOffers([]);
      onOfferAction?.('bulk-send', '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при масовото изпращане');
    }
  };

  const getStatusIcon = (status: OfferStatus) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-green-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: OfferStatus) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'viewed':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OfferStatus) => {
    switch (status) {
      case 'draft':
        return 'Чернова';
      case 'sent':
        return 'Изпратена';
      case 'viewed':
        return 'Прегледана';
      case 'accepted':
        return 'Приета';
      case 'rejected':
        return 'Отхвърлена';
      case 'expired':
        return 'Изтекла';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
    }).format(amount);
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === offers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(offers.map(o => o.id));
    }
  };

  const handleSelectOffer = (offerId: string) => {
    setSelectedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Зареждане на оферти...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-800">Грешка: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Филтри</h3>
            <button
              onClick={() => setFilters({})}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Изчисти филтри
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Търсене
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Търси по номер, клиент, проект..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OfferStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Всички статуси</option>
                <option value="draft">Чернови</option>
                <option value="sent">Изпратени</option>
                <option value="viewed">Прегледани</option>
                <option value="accepted">Приети</option>
                <option value="rejected">Отхвърлени</option>
                <option value="expired">Изтекли</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Действия
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={loadOffers}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Приложи
                </button>
                <button
                  onClick={() => adminOffersApi.exportOffers(filters, 'excel')}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Експорт
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {showBulkActions && selectedOffers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              Избрани {selectedOffers.length} оферти
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkSend}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Изпрати всички
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Изтрий всички
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offers Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {showBulkActions && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOffers.length === offers.length && offers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Оферта
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Клиент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Проект
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Стойност
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  {showBulkActions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOffers.includes(offer.id)}
                        onChange={() => handleSelectOffer(offer.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {offer.offerNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {offer.subject}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {offer.client?.name || `${offer.client?.firstName} ${offer.client?.lastName}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          {offer.client?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {offer.projectName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {offer.project?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(offer.status as OfferStatus)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status as OfferStatus)}`}>
                        {getStatusText(offer.status as OfferStatus)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {offer.totalAmount ? formatCurrency(offer.totalAmount) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(offer.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link href={`/admin/offers/${offer.id}/preview`}>
                        <button className="text-blue-600 hover:text-blue-900" title="Преглед">
                          <Eye className="w-4 h-4" />
                        </button>
                      </Link>
                      <Link href={`/admin/offers/${offer.id}`}>
                        <button className="text-gray-600 hover:text-gray-900" title="Редактирай">
                          <Edit className="w-4 h-4" />
                        </button>
                      </Link>
                      {offer.status === 'draft' && (
                        <button 
                          onClick={() => handleSendOffer(offer.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Изпрати"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDuplicateOffer(offer.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Дублирай"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setDropdownOpen(dropdownOpen === offer.id ? null : offer.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {dropdownOpen === offer.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => handleDeleteOffer(offer.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Изтрий
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {offers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Няма оферти</h3>
            <p className="mt-1 text-sm text-gray-500">
              Започнете с създаването на първата оферта.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 