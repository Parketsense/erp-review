'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Send, 
  Eye, 
  FileText,
  Calendar,
  User,
  Building,
  DollarSign,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react';
import { offersApi } from '@/lib/api/admin/offers';

interface OfferPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string;
  onSend?: () => void;
}

interface OfferPreviewData {
  id: string;
  offerNumber: string;
  subject: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  validUntil: string;
  createdAt: string;
  status: string;
  totalValue: number;
  variants: Array<{
    id: string;
    name: string;
    description?: string;
    rooms: Array<{
      id: string;
      name: string;
      products: Array<{
        id: string;
        name: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        totalPrice: number;
      }>;
      totalPrice: number;
    }>;
    totalPrice: number;
  }>;
  installationPhase?: {
    id: string;
    name: string;
    description?: string;
  };
  terms: string[];
  emailTemplate: string;
}

export default function OfferPreviewModal({
  isOpen,
  onClose,
  offerId,
  onSend
}: OfferPreviewModalProps) {
  const [offer, setOffer] = useState<OfferPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'pdf' | 'email'>('preview');

  useEffect(() => {
    if (isOpen && offerId) {
      loadOfferPreview();
    }
  }, [isOpen, offerId]);

  const loadOfferPreview = async () => {
    try {
      setIsLoading(true);
      const response = await offersApi.getOfferPreview(offerId);
      setOffer(response as any);
    } catch (error) {
      console.error('Error loading offer preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    try {
      await offersApi.sendOffer(offerId);
      onSend?.();
      onClose();
    } catch (error) {
      console.error('Error sending offer:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // TODO: Implement PDF download
      console.log('Downloading PDF for offer:', offerId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) {
      return '0 лв.';
    }
    return `${amount.toLocaleString('bg-BG')} лв.`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Чернова',
      sent: 'Изпратена',
      viewed: 'Видяна',
      accepted: 'Приета',
      expired: 'Изтекла'
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Преглед на оферта
                </h2>
                {offer && (
                  <p className="text-sm text-gray-500">
                    {offer.offerNumber} - {offer.subject}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'preview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Преглед
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'pdf'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              PDF
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'email'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Email
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : offer ? (
            <>
              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Проект</p>
                          <p className="font-medium">{offer.projectName}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Клиент</p>
                          <p className="font-medium">{offer.clientName}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Валидна до</p>
                          <p className="font-medium">{formatDate(offer.validUntil)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Обща стойност</p>
                          <p className="font-medium text-lg">{formatCurrency(offer.totalValue)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Variants */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Варианти в офертата
                    </h3>
                    <div className="space-y-4">
                      {offer.variants?.map((variant) => (
                        <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{variant.name}</h4>
                            <span className="text-lg font-bold text-green-600">
                              {formatCurrency(variant.totalPrice)}
                            </span>
                          </div>
                          {variant.description && (
                            <p className="text-sm text-gray-600 mb-3">{variant.description}</p>
                          )}
                          
                          {/* Rooms */}
                          <div className="space-y-3">
                            {variant.rooms?.map((room) => (
                              <div key={room.id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-gray-800">{room.name}</h5>
                                  <span className="text-sm font-medium text-gray-600">
                                    {formatCurrency(room.totalPrice)}
                                  </span>
                                </div>
                                
                                {/* Products */}
                                <div className="space-y-1">
                                  {room.products?.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">
                                        {product.name} x{product.quantity}
                                      </span>
                                      <span className="text-gray-800">
                                        {formatCurrency(product.totalPrice)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Installation */}
                  {offer.installationPhase && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-900 mb-2">Монтаж</h3>
                      <p className="text-blue-800">{offer.installationPhase.name}</p>
                      {offer.installationPhase.description && (
                        <p className="text-sm text-blue-700 mt-1">{offer.installationPhase.description}</p>
                      )}
                    </div>
                  )}

                  {/* Terms */}
                  {offer.terms?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Условия</h3>
                      <ul className="space-y-2">
                        {offer.terms?.map((term, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{term}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* PDF Tab */}
              {activeTab === 'pdf' && (
                <div className="text-center py-12">
                  <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    PDF преглед
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Генерирайте PDF версия на офертата за изтегляне
                  </p>
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Изтегли PDF
                  </button>
                </div>
              )}

              {/* Email Tab */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Email настройки
                    </h3>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Получател</h4>
                    <div className="text-sm text-gray-600">
                      <p>{offer.clientName}</p>
                      <p className="text-blue-600">{offer.clientEmail}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email съдържание
                    </label>
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <div className="prose prose-sm max-w-none">
                        {offer.emailTemplate || (
                          <p className="text-gray-500 italic">
                            Няма зададен email шаблон
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-yellow-900">Важно</h4>
                        <p className="text-sm text-yellow-800">
                          Офертата ще бъде изпратена на клиента с генериран JWT токен за достъп
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Грешка при зареждане</h3>
              <p className="mt-1 text-sm text-gray-500">
                Неуспешно зареждане на офертата
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {offer && (
                <>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                    {getStatusText(offer.status)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Създадена: {formatDate(offer.createdAt)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Затвори
              </button>
              
              {offer && offer.status === 'draft' && (
                <button
                  onClick={handleSend}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Изпрати оферта
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 