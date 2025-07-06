'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Eye, 
  Copy, 
  Trash2, 
  Download,
  Calendar,
  User,
  Building2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Activity,
  TrendingUp
} from 'lucide-react';
import { OfferDetailsView } from '@/components/offers/admin/OfferDetailsView';
import { OfferAnalytics } from '@/components/offers/admin/OfferAnalytics';
import { adminOffersApi } from '@/lib/api/admin/offers';
import { Offer, OfferStatus } from '@/types/offer';

export default function OfferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'analytics' | 'activity'>('details');

  useEffect(() => {
    if (offerId) {
      loadOffer();
    }
  }, [offerId]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      setError(null);
      const offerData = await adminOffersApi.getOfferById(offerId);
      setOffer(offerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждането');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async () => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази оферта?')) {
      return;
    }

    try {
      await adminOffersApi.deleteOffer(offerId);
      router.push('/admin/offers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изтриването');
    }
  };

  const handleSendOffer = async () => {
    try {
      await adminOffersApi.sendOffer(offerId, {
        emailSubject: 'Вашата оферта от PARKETSENSE',
        emailBody: 'Прикачена е вашата персонализирана оферта.',
      });
      await loadOffer();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изпращането');
    }
  };

  const handleDuplicateOffer = async () => {
    try {
      const duplicatedOffer = await adminOffersApi.duplicateOffer(offerId, {
        offerNumber: `COPY-${Date.now()}`,
      });
      router.push(`/admin/offers/${duplicatedOffer.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при дублирането');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Зареждане на оферта...</span>
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

  if (!offer) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Офертата не е намерена</h3>
        <p className="mt-1 text-sm text-gray-500">
          Офертата, която търсите, не съществува или е била изтрита.
        </p>
        <div className="mt-6">
          <Link href="/admin/offers">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад към офертите
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/offers">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-light text-gray-900">{offer.offerNumber}</h1>
              <p className="text-gray-600">{offer.subject}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              {getStatusIcon(offer.status as OfferStatus)}
              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(offer.status as OfferStatus)}`}>
                {getStatusText(offer.status as OfferStatus)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/admin/offers/${offer.id}/preview`}>
                <button className="p-2 text-blue-600 hover:text-blue-900 transition-colors" title="Преглед">
                  <Eye className="w-4 h-4" />
                </button>
              </Link>
              
              <Link href={`/admin/offers/${offer.id}/edit`}>
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors" title="Редактирай">
                  <Edit className="w-4 h-4" />
                </button>
              </Link>
              
              {offer.status === 'draft' && (
                <button 
                  onClick={handleSendOffer}
                  className="p-2 text-green-600 hover:text-green-900 transition-colors"
                  title="Изпрати"
                >
                  <Mail className="w-4 h-4" />
                </button>
              )}
              
              <button 
                onClick={handleDuplicateOffer}
                className="p-2 text-purple-600 hover:text-purple-900 transition-colors"
                title="Дублирай"
              >
                <Copy className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleDeleteOffer}
                className="p-2 text-red-600 hover:text-red-900 transition-colors"
                title="Изтрий"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Създадена</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDate(offer.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Клиент</p>
              <p className="text-lg font-bold text-gray-900">
                {offer.client?.name || `${offer.client?.firstName} ${offer.client?.lastName}`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Проект</p>
              <p className="text-lg font-bold text-gray-900">
                {offer.projectName}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Стойност</p>
              <p className="text-lg font-bold text-gray-900">
                {offer.totalAmount ? formatCurrency(offer.totalAmount) : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Детайли
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Аналитика
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Активност
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <OfferDetailsView offer={offer} onUpdate={loadOffer} />
          )}
          
          {activeTab === 'analytics' && (
            <OfferAnalytics offerId={offer.id} />
          )}
          
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">История на активността</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Офертата е създадена</p>
                    <p className="text-xs text-gray-500">{formatDate(offer.createdAt)}</p>
                  </div>
                </div>
                
                {offer.lastSentAt && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Офертата е изпратена</p>
                      <p className="text-xs text-gray-500">{formatDate(offer.lastSentAt)}</p>
                    </div>
                  </div>
                )}
                
                {offer.status === 'viewed' && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Eye className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Офертата е прегледана</p>
                      <p className="text-xs text-gray-500">От клиента</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 