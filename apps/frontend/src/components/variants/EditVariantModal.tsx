'use client';

import React, { useState, useEffect } from 'react';
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
  Trash2,
  Edit3,
  Settings
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { PhaseVariant, UpdateVariantDto } from '@/types/variant';
import { variantsApi } from '@/services/variantsApi';

interface EditVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant: PhaseVariant;
  phaseId: string;
  onSuccess: () => void;
}

const EditVariantModal: React.FC<EditVariantModalProps> = ({
  isOpen,
  onClose,
  variant,
  phaseId,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UpdateVariantDto>({
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when variant changes
  useEffect(() => {
    if (variant) {
      setFormData({
        name: variant.name || '',
        description: variant.description || '',
        designer: variant.designer || '',
        architect: variant.architect || '',
        architectCommission: variant.architectCommission || 0,
        isSelected: variant.isSelected || false,
        includeInOffer: variant.includeInOffer ?? true,
        discountEnabled: variant.discountEnabled || false,
        variantDiscount: variant.variantDiscount || 0
      });
    }
  }, [variant]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Името на варианта е задължително';
    }

    if (formData.name && formData.name.length > 100) {
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
      await variantsApi.updateVariant(variant.id, formData);
      onSuccess();
      onClose();
      setErrors({});
    } catch (error) {
      console.error('Error updating variant:', error);
      setErrors({ submit: 'Грешка при обновяване на варианта. Моля, опитайте отново.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      await variantsApi.deleteVariant(variant.id);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting variant:', error);
      setErrors({ delete: 'Грешка при изтриване на варианта. Моля, опитайте отново.' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleInputChange = (field: keyof UpdateVariantDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Редактиране на вариант"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Messages */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-red-700 text-sm">{errors.submit}</div>
          </div>
        )}

        {errors.delete && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-red-700 text-sm">{errors.delete}</div>
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
              <div className="relative">
                <input
                  type="number"
                  value={formData.architectCommission}
                  onChange={(e) => handleInputChange('architectCommission', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.architectCommission ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
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
            <Settings className="w-5 h-5 text-purple-600" />
            <span>Настройки</span>
          </h4>
          
          <div className="space-y-4">
            {/* Include in Offer */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Включи в офертата</h5>
                <p className="text-sm text-gray-500">Вариантът ще бъде включен в генерираната оферта</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.includeInOffer}
                  onChange={(e) => handleInputChange('includeInOffer', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Is Selected */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h5 className="font-medium text-gray-900">Избран вариант</h5>
                <p className="text-sm text-gray-500">Маркирайте като основен вариант за фазата</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSelected}
                  onChange={(e) => handleInputChange('isSelected', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Discount Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Активирай отстъпка</h5>
                  <p className="text-sm text-gray-500">Приложи отстъпка към всички продукти в варианта</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.discountEnabled}
                    onChange={(e) => handleInputChange('discountEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.discountEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отстъпка на варианта (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.variantDiscount}
                      onChange={(e) => handleInputChange('variantDiscount', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.variantDiscount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                showDeleteConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
              } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {showDeleteConfirm ? (isDeleting ? 'Изтриване...' : 'Потвърди изтриване') : 'Изтрий вариант'}
            </button>
            
            {showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Отказ
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Отказ
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
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
        </div>
      </form>
    </Modal>
  );
};

export default EditVariantModal;
