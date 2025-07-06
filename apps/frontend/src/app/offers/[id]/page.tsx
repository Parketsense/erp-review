'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, FileText, Calendar, User, Building2, Eye, Send, CheckCircle, XCircle } from 'lucide-react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useLoading } from '../../../components/LoadingProvider';
import { apiClient } from '../../../lib/api';
import { OfferDetails } from '../../../components/offers';
import { Offer } from '../../../types/offer';

export default function OfferDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;
  
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { showLoading, hideLoading } = useLoading('offer-details');

  const loadOffer = async () => {
    if (!offerId) return;
    
    try {
      showLoading('Зареждане на офертата...');
      setError(null);
      
      const response = await apiClient.get(`/offers/${offerId}`) as { success: boolean; data: Offer };
      setOffer(response.data);
    } catch (err) {
      console.error('Error loading offer:', err);
      setError(err instanceof Error ? err.message : 'Възникна грешка при зареждането');
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setIsEditModalOpen(true);
  };

  const handleDeleteOffer = async (offer: Offer) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази оферта?')) {
      return;
    }
    
    try {
      showLoading('Изтриване...');
      await apiClient.delete(`/offers/${offer.id}`);
      router.push('/offers');
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('Грешка при изтриването на офертата');
    } finally {
      hideLoading();
    }
  };

  const handleSaveOffer = async (offerData: any) => {
    try {
      showLoading('Запазване...');
      await apiClient.patch(`/offers/${offerId}`, offerData);
      await loadOffer(); // Reload the offer data
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving offer:', error);
      throw error;
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadOffer();
  }, [offerId]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'draft': return 'Чернова';
      case 'sent': return 'Изпратена';
      case 'viewed': return 'Прегледана';
      case 'accepted': return 'Приета';
      case 'rejected': return 'Отхвърлена';
      default: return 'Чернова';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Зареждане на офертата...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Грешка</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <div className="mt-6">
              <Link href="/offers">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад към офертите
                </button>
              </Link>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!offer) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Офертата не е намерена</h2>
            <p className="mt-2 text-gray-600">Офертата, която търсите, не съществува или е била изтрита.</p>
            <div className="mt-6">
              <Link href="/offers">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад към офертите
                </button>
              </Link>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/offers">
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </Link>
                <div className="text-xl font-bold tracking-wide">PARKETSENSE</div>
              </div>
              <div className="text-sm text-gray-300">
                Детайли на оферта
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  Начало
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <Link href="/offers" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                    Оферти
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-sm font-medium text-gray-500">{offer.offerNumber}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Page Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-light text-gray-900 mb-2">
                  {offer.offerNumber}
                </h1>
                <p className="text-gray-600">
                  {offer.projectName || offer.project?.name || 'Без име на проект'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(offer.status)}`}>
                  {getStatusText(offer.status)}
                </span>
                <button
                  onClick={() => handleEditOffer(offer)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Редактирай
                </button>
                <button
                  onClick={() => handleDeleteOffer(offer)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Изтрий
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Проект</p>
                  <p className="text-sm text-gray-900">{offer.projectName || offer.project?.name || 'Неизвестен проект'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Клиент</p>
                  <p className="text-sm text-gray-900">{offer.client?.name || 'Неизвестен клиент'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Създадена</p>
                  <p className="text-sm text-gray-900">{formatDate(offer.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Offer Details Component */}
          <OfferDetails
            offerId={offerId}
            onEdit={handleEditOffer}
            onDelete={handleDeleteOffer}
            onClose={() => router.push('/offers')}
          />
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && offer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Редактиране на оферта</h2>
                {/* Here you would render the edit form component */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Отказ
                  </button>
                  <button
                    onClick={() => {
                      // Handle save
                      setIsEditModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Запази
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
} 