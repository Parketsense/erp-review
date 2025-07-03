'use client';

import { useState, useEffect } from 'react';
import { X, Save, Percent } from 'lucide-react';
import { UpdateVariantDto, PhaseVariant } from '@/types/variant';
import { variantsApi } from '@/services/variantsApi';
import { phasesApi } from '@/services/phasesApi';

interface VariantEditModalProps {
  variant: PhaseVariant;
  isOpen: boolean;
  onClose: () => void;
  onVariantUpdated: () => void;
}

interface Phase {
  id: string;
  name: string;
  phaseDiscount?: number;
  discountEnabled?: boolean;
}

export default function VariantEditModal({
  variant,
  isOpen,
  onClose,
  onVariantUpdated
}: VariantEditModalProps) {
  const [phase, setPhase] = useState<Phase | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(false);
  const [formData, setFormData] = useState<UpdateVariantDto>({
    name: '',
    description: '',
    includeInOffer: true,
    discountEnabled: false,
    variantDiscount: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when variant changes
  useEffect(() => {
    if (variant) {
      setFormData({
        name: variant.name || '',
        description: variant.description || '',
        includeInOffer: variant.includeInOffer ?? true,
        discountEnabled: variant.discountEnabled ?? false,
        variantDiscount: variant.variantDiscount || 0
      });
    }
  }, [variant]);

  // Load phase information when modal opens
  useEffect(() => {
    if (isOpen && variant?.phaseId) {
      loadPhaseInfo();
    }
  }, [isOpen, variant?.phaseId]);

  const loadPhaseInfo = async () => {
    try {
      setLoadingPhase(true);
      const phaseData = await phasesApi.getPhaseById(variant.phaseId);
      setPhase(phaseData);
    } catch (err) {
      console.error('Failed to load phase:', err);
      // Don't show error to user, phase info is optional
    } finally {
      setLoadingPhase(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Името на варианта е задължително');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const dataToSubmit = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        variantDiscount: formData.discountEnabled ? (formData.variantDiscount || 0) : 0
      };
      
      await variantsApi.updateVariant(variant.id, dataToSubmit);
      onVariantUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка при обновяването');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateVariantDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleDiscountEnabledChange = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      discountEnabled: enabled,
      // Keep existing discount if disabling, or use phase discount if enabling and no current discount
      variantDiscount: enabled 
        ? (prev.variantDiscount || phase?.phaseDiscount || 0)
        : prev.variantDiscount
    }));
    
    if (error) {
      setError(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-8 mx-auto p-5 border max-w-2xl shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Редактиране на вариант: {variant.name}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Form content */}
          <div className="mt-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Основна информация</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Име на варианта *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Въведете име на варианта"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Описание
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Въведете описание на варианта"
                  />
                </div>
              </div>
            </div>

            {/* Offer Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Настройки на офертата</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="includeInOffer"
                    type="checkbox"
                    checked={formData.includeInOffer}
                    onChange={(e) => handleInputChange('includeInOffer', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeInOffer" className="ml-2 block text-sm text-gray-700">
                    Включи в офертата
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="discountEnabled"
                    type="checkbox"
                    checked={formData.discountEnabled}
                    onChange={(e) => handleDiscountEnabledChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="discountEnabled" className="ml-2 block text-sm text-gray-700">
                    Активирай отстъпка
                    {phase?.phaseDiscount !== undefined && phase.phaseDiscount > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        (отстъпката на фазата: {phase.phaseDiscount}%)
                      </span>
                    )}
                  </label>
                </div>
                
                {formData.discountEnabled && (
                  <div>
                    <label htmlFor="variantDiscount" className="block text-sm font-medium text-gray-700">
                      <Percent className="w-4 h-4 inline mr-1" />
                      Отстъпка (%)
                    </label>
                    <input
                      type="number"
                      id="variantDiscount"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.variantDiscount}
                      onChange={(e) => handleInputChange('variantDiscount', parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                    {phase?.phaseDiscount !== undefined && phase.phaseDiscount > 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Отстъпката на фазата е {phase.phaseDiscount}%. Можете да промените стойността за този вариант.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phase Discount Info */}
            {formData.discountEnabled && phase?.phaseDiscount !== undefined && phase.phaseDiscount > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Percent className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Наследяване на отстъпка</span>
                </div>
                <p className="text-sm text-blue-700">
                  Отстъпката от {formData.variantDiscount}% ще се приложи автоматично към всички стаи в този вариант. Потребителите могат да override-ят тази стойност в отделните стаи.
                </p>
              </div>
            )}

            {/* Variant Info */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Информация за варианта</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Пореден номер:</span> {variant.variantOrder}
                </div>
                <div>
                  <span className="font-medium">Стаи:</span> {variant._count?.rooms || 0}
                </div>
                <div>
                  <span className="font-medium">Дизайнер:</span> {variant.designer || 'Не е зададен'}
                </div>
                <div>
                  <span className="font-medium">Архитект:</span> {variant.architect || 'Не е зададен'}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name?.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Запазване...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Запази промените
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 