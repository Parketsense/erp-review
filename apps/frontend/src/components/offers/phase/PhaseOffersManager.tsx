'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Edit, 
  Send, 
  Copy, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calendar,
  User,
  DollarSign,
  Plus,
  Search
} from 'lucide-react';
import { offersApi } from '@/lib/api/admin/offers';
import { OfferSummary } from '@/types/offers';

interface Offer {
  id: string;
  offerNumber: string;
  projectName: string;
  subject: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'expired';
  validUntil: string;
  createdAt: string;
  lastSentAt?: string;
  lastSentTo?: string;
  versionNumber: number;
  parentOfferId?: string;
  totalValue?: number;
}

interface PhaseOffersManagerProps {
  phaseId: string;
  projectId: string;
  clientId: string;
  onOfferCreated?: () => void;
  onOfferSelected?: (offerId: string) => void;
}

export default function PhaseOffersManager({
  phaseId,
  projectId,
  clientId,
  onOfferCreated,
  onOfferSelected
}: PhaseOffersManagerProps) {
  const [offers, setOffers] = useState<OfferSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load offers for this phase
  const loadOffers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading offers for phase:', phaseId);
      
      const response = await offersApi.getPhaseOffers(phaseId);
      
      console.log('Offers API response:', response);
      
      // Убеди се че response е масив
      if (Array.isArray(response)) {
        setOffers(response);
      } else {
        console.warn('API response is not an array:', response);
        setOffers([]); // Fallback към празен масив
      }
    } catch (error) {
      console.error('Error loading phase offers:', error);
      setError('Неуспешно зареждане на офертите. Моля опитайте отново.');
      setOffers([]); // Важно: Set като празен масив при грешка
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (phaseId) {
      loadOffers();
    }
  }, [phaseId]);

  // Безопасен filter - винаги проверявай дали offers е масив
  const filteredOffers = Array.isArray(offers) ? offers.filter(offer => {
    const matchesSearch = offer.offerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Send },
      viewed: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'draft' && 'Чернова'}
        {status === 'sent' && 'Изпратена'}
        {status === 'viewed' && 'Видяна'}
        {status === 'accepted' && 'Приета'}
        {status === 'expired' && 'Изтекла'}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('bg-BG')} лв.`;
  };

  // Handle offer actions
  const handlePreview = (offerId: string) => {
    onOfferSelected?.(offerId);
  };

  const handleEdit = (offerId: string) => {
    // Navigate to edit page
    window.open(`/admin/offers/${offerId}/edit`, '_blank');
  };

  const handleSend = async (offerId: string) => {
    try {
      await offersApi.sendOffer(offerId);
      await loadOffers();
    } catch (error) {
      console.error('Error sending offer:', error);
    }
  };

  const handleDuplicate = async (offerId: string) => {
    try {
      await offersApi.duplicateOffer(offerId);
      await loadOffers();
      onOfferCreated?.();
    } catch (error) {
      console.error('Error duplicating offer:', error);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете тази оферта?')) {
      try {
        await offersApi.deleteOffer(offerId);
        await loadOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 mb-2">{error}</p>
        <button 
          onClick={loadOffers}
          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Опитай отново
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Оферти за фазата</h3>
            <p className="text-sm text-gray-500 mt-1">
              {filteredOffers.length} оферти общо
            </p>
          </div>
          <button
            onClick={() => onOfferCreated?.()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Нова оферта
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Търси оферти..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Всички статуси</option>
            <option value="draft">Чернови</option>
            <option value="sent">Изпратени</option>
            <option value="viewed">Видяни</option>
            <option value="accepted">Приети</option>
            <option value="expired">Изтекли</option>
          </select>
        </div>
      </div>

      {/* Offers List */}
      <div className="p-6">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Няма оферти</p>
            <p className="text-sm mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Няма оферти отговарящи на филтрите' 
                : 'Няма създадени оферти за тази фаза'
              }
            </p>
            <button
              onClick={() => onOfferCreated?.()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Създай първата оферта
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedOffer === offer.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {offer.offerNumber}
                      </h4>
                      <StatusBadge status={offer.status} />
                    </div>
                    <p className="text-gray-600 mb-2">{offer.subject}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(offer.createdAt)}
                      </span>
                      {offer.validUntil && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Валидна до: {formatDate(offer.validUntil)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {offer.totalValue && (
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(offer.totalValue)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePreview(offer.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Преглед"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(offer.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                        title="Редактирай"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSend(offer.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Изпрати"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(offer.id)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="Дублирай"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Изтрий"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 