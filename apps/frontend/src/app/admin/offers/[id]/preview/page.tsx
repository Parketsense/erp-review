'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Mail, Copy } from 'lucide-react';
import InteractiveOfferPage from '@/components/offers/interactive/InteractiveOfferPage';
import { adminOffersApi } from '@/lib/api/admin/offers';
import { Offer } from '@/types/offer';

export default function OfferPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  useEffect(() => {
    if (offerId) {
      loadOfferAndGenerateToken();
    }
  }, [offerId]);

  const loadOfferAndGenerateToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load offer data
      const offerData = await adminOffersApi.getOfferById(offerId);
      setOffer(offerData);
      
      // Generate preview token
      const tokenData = await adminOffersApi.generateOfferToken(offerId);
      setPreviewToken(tokenData.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждането');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async () => {
    if (!offer) return;
    
    try {
      await adminOffersApi.sendOffer(offer.id, {
        emailSubject: 'Вашата оферта от PARKETSENSE',
        emailBody: 'Прикачена е вашата персонализирана оферта.',
      });
      router.push(`/admin/offers/${offer.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при изпращането');
    }
  };

  const handleCopyLink = async () => {
    if (!previewToken) return;
    
    const previewUrl = `${window.location.origin}/offer/${previewToken}`;
    
    try {
      await navigator.clipboard.writeText(previewUrl);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Зареждане на преглед...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-800">Грешка: {error}</span>
        </div>
      </div>
    );
  }

  if (!offer || !previewToken) {
    return (
      <div className="text-center py-12">
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
    <div className="min-h-screen bg-gray-50">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={`/admin/offers/${offer.id}`}>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-lg font-medium text-gray-900">
                  Преглед на оферта: {offer.offerNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  Това е точно какво вижда клиентът
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Copy className="w-4 h-4 mr-2" />
                Копирай линк
              </button>
              
              {offer.status === 'draft' && (
                <button
                  onClick={handleSendOffer}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Изпрати оферта
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <InteractiveOfferPage
            token={previewToken}
            offerId={offer.id}
          />
        </div>
      </div>

      {/* Preview Footer */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Преглед режим • Оферта: {offer.offerNumber}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Валидна до: {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString('bg-BG') : '-'}
              </span>
              <Link href={`/admin/offers/${offer.id}`}>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Редактирай оферта
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 