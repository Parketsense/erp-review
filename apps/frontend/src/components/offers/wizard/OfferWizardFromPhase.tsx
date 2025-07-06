'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  FileText,
  Package,
  Settings,
  Mail,
  Eye,
  Calendar,
  Users,
  DollarSign,
  Building,
  Home
} from 'lucide-react';
import { adminOffersApi } from '@/lib/api/admin/offers';
import { phasesApi } from '@/services/phasesApi';
import { projectsApi } from '@/services/projectsApi';
import { VariantForOffer, PhaseOfferData } from '@/types/offers';

interface OfferWizardFromPhaseProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phaseId: string;
  projectId: string;
  clientId: string;
}

interface RoomSummary {
  id: string;
  name: string;
  productCount: number;
  totalPrice: number;
}

const WIZARD_STEPS = [
  { id: 'basic', title: 'Основни настройки', icon: FileText },
  { id: 'variants', title: 'Избор на варианти', icon: Package },
  { id: 'installation', title: 'Монтаж', icon: Settings },
  { id: 'email', title: 'Email настройки', icon: Mail },
  { id: 'preview', title: 'Преглед', icon: Eye }
];

export default function OfferWizardFromPhase({
  isOpen,
  onClose,
  onSuccess,
  phaseId,
  projectId,
  clientId
}: OfferWizardFromPhaseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [phase, setPhase] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [variants, setVariants] = useState<VariantForOffer[]>([]);
  const [availablePhases, setAvailablePhases] = useState<any[]>([]);
  const [existingOffers, setExistingOffers] = useState<any[]>([]);
  
  // Form data
  const [formData, setFormData] = useState<PhaseOfferData>({
    selectedVariantIds: [],
    installationPhaseId: '',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    subject: '',
    status: 'draft'
  });

  // Additional form data for offer creation
  const [offerNumber, setOfferNumber] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('');

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen, phaseId, projectId, clientId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [offersData, variantsData] = await Promise.allSettled([
        adminOffersApi.getPhaseOffers(phaseId),
        adminOffersApi.getPhaseVariantsForOffer(phaseId)
      ]);
      if (offersData.status === 'fulfilled') {
        setExistingOffers(offersData.value);
      } else {
        console.warn('Could not load existing offers:', offersData.reason);
        setExistingOffers([]);
      }
      if (variantsData.status === 'fulfilled') {
        setVariants(variantsData.value);
      } else {
        throw new Error('Неуспешно зареждане на вариантите');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Възникна грешка при зареждането';
      setError(errorMessage);
      console.error('Error in loadInitialData:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateOfferNumber = (project: any, phase: any) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${project.name.substring(0, 3).toUpperCase()}-${phase.name.substring(0, 3).toUpperCase()}-${year}${month}${day}`;
  };

  const generateSubject = (project: any, phase: any) => {
    return `Оферта за ${phase.name} - ${project.name}`;
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Form handlers
  const handleVariantToggle = (variantId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedVariantIds: (prev.selectedVariantIds || []).includes(variantId)
        ? (prev.selectedVariantIds || []).filter(id => id !== variantId)
        : [...(prev.selectedVariantIds || []), variantId]
    }));
  };

  const handleFormChange = (field: keyof PhaseOfferData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit offer
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const offerData = {
        ...formData,
        offerNumber,
        emailTemplate
      };
      await adminOffersApi.createOfferFromPhase(phaseId, offerData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating offer:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('bg-BG')} лв.`;
  };

  // Calculate total
  const calculateTotal = () => {
    return variants
      .filter(v => (formData.selectedVariantIds || []).includes(v.id))
      .reduce((sum, v) => sum + v.totalPrice, 0);
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadInitialData}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Опитай отново
        </button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Създаване на оферта
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {project?.name} - {phase?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Step 1: Basic Settings */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Основни настройки на офертата
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Номер на офертата
                        </label>
                        <input
                          type="text"
                          value={offerNumber}
                          onChange={(e) => setOfferNumber(e.target.value)}
                          placeholder="Автоматично генериран номер..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Заглавие на офертата
                        </label>
                        <input
                          type="text"
                          value={formData.subject || ''}
                          onChange={(e) => handleFormChange('subject', e.target.value)}
                          placeholder="Въведете заглавие на офертата..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Валидна до
                        </label>
                        <input
                          type="date"
                          value={formData.validUntil || ''}
                          onChange={(e) => handleFormChange('validUntil', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Информация за проекта</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Проект:</span>
                        <span className="ml-2 font-medium">{project?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Home className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Фаза:</span>
                        <span className="ml-2 font-medium">{phase?.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">Клиент:</span>
                        <span className="ml-2 font-medium">
                          {client?.firstName} {client?.lastName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Variants Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Избор на варианти за офертата
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Изберете вариантите, които искате да включите в офертата
                    </p>
                  </div>

                  <div className="space-y-4">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          (formData.selectedVariantIds || []).includes(variant.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleVariantToggle(variant.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={(formData.selectedVariantIds || []).includes(variant.id)}
                              onChange={() => handleVariantToggle(variant.id)}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <h4 className="font-medium text-gray-900">{variant.name}</h4>
                              {variant.description && (
                                <p className="text-sm text-gray-500">{variant.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <span>{variant.rooms.length} стаи</span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(variant.totalPrice)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {(formData.selectedVariantIds || []).includes(variant.id) && (
                          <div className="mt-4 pl-7">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Стаи в варианта:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {variant.rooms.map((room) => (
                                <div key={room.id} className="text-sm text-gray-600">
                                  • {room.name} ({room.productCount} продукта) - {formatCurrency(room.totalPrice)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {formData.selectedVariantIds && formData.selectedVariantIds.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">
                          Избрани варианти: {formData.selectedVariantIds.length}
                        </span>
                        <span className="text-lg font-bold text-green-800">
                          Обща стойност: {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Installation */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Настройки за монтаж
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Изберете фаза за монтажи или оставете празно ако няма монтаж
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фаза за монтажи
                    </label>
                    <select
                      value={formData.installationPhaseId || ''}
                      onChange={(e) => handleFormChange('installationPhaseId', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Без монтаж</option>
                      {availablePhases.map((phase) => (
                        <option key={phase.id} value={phase.id}>
                          {phase.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.installationPhaseId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        Монтажът ще се извърши в: {availablePhases.find(p => p.id === formData.installationPhaseId)?.name}
                      </h4>
                      <p className="text-sm text-blue-700">
                        Монтажните услуги ще бъдат включени в офертата
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Email Settings */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Email настройки
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email шаблон
                    </label>
                    <textarea
                      value={emailTemplate}
                      onChange={(e) => setEmailTemplate(e.target.value)}
                      rows={6}
                      placeholder="Въведете текст за email съобщението..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Получател</h4>
                    <div className="text-sm text-gray-600">
                      {client?.firstName} {client?.lastName}
                      {client?.email && (
                        <div className="text-blue-600">{client.email}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Preview */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Преглед на офертата
                    </h3>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Основна информация</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-600">Номер:</span> {offerNumber}</div>
                          <div><span className="text-gray-600">Заглавие:</span> {formData.subject}</div>
                          <div><span className="text-gray-600">Валидна до:</span> {formData.validUntil}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Избрани варианти</h4>
                        <div className="space-y-2 text-sm">
                          {variants
                            .filter(v => (formData.selectedVariantIds || []).includes(v.id))
                            .map(variant => (
                              <div key={variant.id} className="flex justify-between">
                                <span>{variant.name}</span>
                                <span className="font-medium">{formatCurrency(variant.totalPrice)}</span>
                              </div>
                            ))}
                          <div className="border-t pt-2 font-bold">
                            <div className="flex justify-between">
                              <span>Обща стойност:</span>
                              <span>{formatCurrency(calculateTotal())}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.installationPhaseId && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Монтаж</h4>
                        <p className="text-sm text-gray-600">
                          {availablePhases.find(p => p.id === formData.installationPhaseId)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Назад
            </button>

            <div className="flex items-center space-x-3">
              {currentStep < WIZARD_STEPS.length - 1 ? (
                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Напред
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.selectedVariantIds || formData.selectedVariantIds.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Създаване...' : 'Създай оферта'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 