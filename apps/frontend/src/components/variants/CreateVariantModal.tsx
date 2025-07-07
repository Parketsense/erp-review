'use client';

import React, { useState } from 'react';
import { 
  Save, 
  X, 
  User, 
  Building, 
  Percent, 
  FileText, 
  Package,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { CreateVariantDto } from '@/types/variant';
import { variantsApi } from '@/services/variantsApi';

interface CreateVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseId: string;
  onSuccess: () => void;
}

const CreateVariantModal: React.FC<CreateVariantModalProps> = ({
  isOpen,
  onClose,
  phaseId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateVariantDto>({
    phaseId,
    name: '',
    description: '',
    designer: '',
    architect: '',
    architectCommission: 0,
    isSelected: false,
    includeInOffer: true,
    discountEnabled: false,
    variantDiscount: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Името на варианта е задължително';
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Името не може да бъде по-дълго от 100 символа';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Описанието не може да бъде по-дълго от 500 символа';
    }

    if (formData.architectCommission && (formData.architectCommission < 0 || formData.architectCommission > 100)) {
      newErrors.architectCommission = 'Комисионната трябва да бъде между 0 и 100%';
    }

    if (formData.variantDiscount && (formData.variantDiscount < 0 || formData.variantDiscount > 100)) {
      newErrors.variantDiscount = 'Отстъпката трябва да бъде между 0 и 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await variantsApi.create(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        phaseId,
        name: '',
        description: '',
        designer: '',
        architect: '',
        architectCommission: 0,
        isSelected: false,
        includeInOffer: true,
        discountEnabled: false,
        variantDiscount: 0
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating variant:', error);
      setErrors({ submit: 'Грешка при създаване на варианта. Моля, опитайте отново.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateVariantDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Създаване на нов вариант"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-red-700 text-sm">{errors.submit}</div>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Основна информация</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Име на варианта *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Въведете име на варианта"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Въведете описание на варианта (по желание)"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Team Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <User className="w-5 h-5 text-green-600" />
            <span>Екип</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Designer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дизайнер
              </label>
              <input
                type="text"
                value={formData.designer}
                onChange={(e) => handleInputChange('designer', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Въведете име на дизайнера"
              />
            </div>

            {/* Architect */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Архитект
              </label>
              <input
                type="text"
                value={formData.architect}
                onChange={(e) => handleInputChange('architect', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Въведете име на архитекта"
              />
            </div>

            {/* Architect Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комисионна на архитекта (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.architectCommission}
                onChange={(e) => handleInputChange('architectCommission', parseFloat(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.architectCommission ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.architectCommission && (
                <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.architectCommission}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Building className="w-5 h-5 text-purple-600" />
            <span>Настройки</span>
          </h4>
          
          <div className="space-y-4">
            {/* Include in Offer */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeInOffer"
                checked={formData.includeInOffer}
                onChange={(e) => handleInputChange('includeInOffer', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="includeInOffer" className="text-sm font-medium text-gray-700">
                Включи в офертата
              </label>
            </div>

            {/* Is Selected */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isSelected"
                checked={formData.isSelected}
                onChange={(e) => handleInputChange('isSelected', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isSelected" className="text-sm font-medium text-gray-700">
                Избран вариант
              </label>
            </div>

            {/* Discount Settings */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="discountEnabled"
                  checked={formData.discountEnabled}
                  onChange={(e) => handleInputChange('discountEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="discountEnabled" className="text-sm font-medium text-gray-700">
                  Активирай отстъпка за варианта
                </label>
              </div>

              {formData.discountEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отстъпка за варианта (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.variantDiscount}
                    onChange={(e) => handleInputChange('variantDiscount', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.variantDiscount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.variantDiscount && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.variantDiscount}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors flex items-center space-x-2"
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            <span>Отказ</span>
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Създаване...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Създай вариант</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateVariantModal; 