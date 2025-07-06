'use client';

import { useState } from 'react';
import { 
  Edit, 
  Mail, 
  Copy, 
  Download,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Phone,
  Mail as MailIcon
} from 'lucide-react';
import { Offer, OfferStatus } from '@/types/offer';
import { adminOffersApi } from '@/lib/api/admin/offers';

interface OfferDetailsViewProps {
  offer: Offer;
  onUpdate: () => void;
}

export function OfferDetailsView({ offer, onUpdate }: OfferDetailsViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOffer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await adminOffersApi.sendOffer(offer.id, {
        emailSubject: 'Вашата оферта от PARKETSENSE',
        emailBody: 'Прикачена е вашата персонализирана оферта.',
      });
      
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изпращането');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateOffer = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const duplicatedOffer = await adminOffersApi.duplicateOffer(offer.id, {
        offerNumber: `COPY-${Date.now()}`,
      });
      
      // Redirect to the new offer
      window.location.href = `/admin/offers/${duplicatedOffer.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при дублирането');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OfferStatus) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'sent':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'viewed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800">Грешка: {error}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Детайли на офертата</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDuplicateOffer}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <Copy className="w-4 h-4 mr-2" />
            Дублирай
          </button>
          
          {offer.status === 'draft' && (
            <button
              onClick={handleSendOffer}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'Изпращане...' : 'Изпрати'}
            </button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Основна информация</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Номер на оферта</span>
                <span className="text-sm text-gray-900 font-mono">{offer.offerNumber}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Тема</span>
                <span className="text-sm text-gray-900">{offer.subject}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Статус</span>
                <div className="flex items-center">
                  {getStatusIcon(offer.status as OfferStatus)}
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status as OfferStatus)}`}>
                    {getStatusText(offer.status as OfferStatus)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Създадена</span>
                <span className="text-sm text-gray-900">{formatDate(offer.createdAt)}</span>
              </div>
              
              {offer.validUntil && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Валидна до</span>
                  <span className="text-sm text-gray-900">{formatDate(offer.validUntil)}</span>
                </div>
              )}
              
              {offer.lastSentAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Последно изпратена</span>
                  <span className="text-sm text-gray-900">{formatDate(offer.lastSentAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Финансова информация</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Обща стойност</span>
                <span className="text-lg font-bold text-gray-900">
                  {offer.totalAmount ? formatCurrency(offer.totalAmount) : '-'}
                </span>
              </div>
              
              {offer.discountAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Отстъпка</span>
                  <span className="text-sm text-gray-900">{formatCurrency(offer.discountAmount)}</span>
                </div>
              )}
              
              {offer.taxAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">ДДС</span>
                  <span className="text-sm text-gray-900">{formatCurrency(offer.taxAmount)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Client Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Информация за клиента</h4>
            {offer.client && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h5 className="text-sm font-medium text-gray-900">
                      {offer.client.firstName} {offer.client.lastName}
                    </h5>
                    <p className="text-sm text-gray-500">{offer.client.email}</p>
                  </div>
                </div>
                
                {offer.client.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {offer.client.phone}
                  </div>
                )}
                
                {offer.client.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    {offer.client.address}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <MailIcon className="w-4 h-4 mr-2" />
                  {offer.client.email}
                </div>
              </div>
            )}
          </div>

          {/* Project Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Информация за проекта</h4>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-gray-900">{offer.projectName}</h5>
                  <p className="text-sm text-gray-500">{offer.project?.name}</p>
                </div>
              </div>
              
              {offer.project?.description && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Описание</span>
                  <p className="text-sm text-gray-900 mt-1">{offer.project.description}</p>
                </div>
              )}
              
              {offer.project?.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {offer.project.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conditions */}
      {offer.conditions && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Условия и забележки</h4>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-900 whitespace-pre-wrap">{offer.conditions}</p>
          </div>
        </div>
      )}

      {/* Items/Variants */}
      {offer.items && offer.items.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Варианти и продукти</h4>
          <div className="space-y-3">
            {offer.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div>
                  <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">История на активността</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Офертата е създадена</p>
              <p className="text-xs text-gray-500">{formatDate(offer.createdAt)}</p>
            </div>
          </div>
          
          {offer.lastSentAt && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Офертата е изпратена</p>
                <p className="text-xs text-gray-500">{formatDate(offer.lastSentAt)}</p>
              </div>
            </div>
          )}
          
          {offer.status === 'viewed' && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Офертата е прегледана</p>
                <p className="text-xs text-gray-500">От клиента</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 