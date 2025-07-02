'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, Users, Percent } from 'lucide-react';
import { CreatePhaseDto, ProjectPhase } from '@/services/phasesApi';

interface PhaseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: CreatePhaseDto) => Promise<void>;
  projectId: string;
}

export default function PhaseCreateModal({ isOpen, onClose, onSave, projectId }: PhaseCreateModalProps) {
  const [formData, setFormData] = useState<CreatePhaseDto>({
    name: '',
    description: '',
    includeArchitectCommission: false,
    discountEnabled: false,
    phaseDiscount: 0,
    status: 'created',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        name: '',
        description: '',
        includeArchitectCommission: false,
        discountEnabled: false,
        phaseDiscount: 0,
        status: 'created',
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? Number(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Името на фазата е задължително';
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Името не може да бъде по-дълго от 100 символа';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Описанието не може да бъде по-дълго от 500 символа';
    }

    if (formData.phaseDiscount && (formData.phaseDiscount < 0 || formData.phaseDiscount > 100)) {
      newErrors.phaseDiscount = 'Отстъпката трябва да бъде между 0 и 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const phaseData: CreatePhaseDto = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        includeArchitectCommission: formData.includeArchitectCommission,
        discountEnabled: formData.discountEnabled,
        phaseDiscount: formData.discountEnabled ? formData.phaseDiscount : 0,
        status: formData.status,
      };

      await onSave(phaseData);
      onClose();

    } catch (error) {
      console.error('Error creating phase:', error);
      setErrors({ 
        submit: 'Грешка при създаване на фаза: ' + (error instanceof Error ? error.message : 'Неизвестна грешка') 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Нова фаза</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <div className="flex items-center">
              <span className="font-medium">Грешка:</span>
              <span className="ml-2">{errors.submit}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Phase Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Име на фазата <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Например: Етаж 1 - Продажба, Етаж 2 - Монтаж"
                maxLength={100}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.name.length}/100 символа
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                } focus:outline-none focus:ring-2`}
                placeholder="Подробно описание на дейностите във фазата..."
                maxLength={500}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {(formData.description || '').length}/500 символа
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created">Създадена</option>
                <option value="quoted">Оферирана</option>
                <option value="won">Спечелена</option>
                <option value="lost">Загубена</option>
              </select>
            </div>

            {/* Include Architect Commission */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="includeArchitectCommission"
                id="includeArchitectCommission"
                checked={formData.includeArchitectCommission}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="includeArchitectCommission" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Включи архитект комисионна
                </label>
                <p className="text-sm text-gray-500">
                  Ако е избрано, комисионната за архитект ще се включи в тази фаза
                </p>
              </div>
              <Users className="w-5 h-5 text-purple-500 mt-0.5" />
            </div>

            {/* Phase Discount Settings */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="discountEnabled"
                  id="discountEnabled"
                  checked={formData.discountEnabled}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div className="flex-1">
                  <label htmlFor="discountEnabled" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Активирай отстъпка за фазата
                  </label>
                  <p className="text-sm text-gray-500">
                    Ако е избрано, ще се приложи отстъпка към всички продукти в тази фаза
                  </p>
                </div>
                <Percent className="w-5 h-5 text-green-500 mt-0.5" />
              </div>

              {/* Discount Percentage */}
              {formData.discountEnabled && (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Процент отстъпка
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="phaseDiscount"
                      value={formData.phaseDiscount || ''}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        errors.phaseDiscount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                      } focus:outline-none focus:ring-2 pr-12`}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  {errors.phaseDiscount && (
                    <p className="mt-1 text-sm text-red-600">{errors.phaseDiscount}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Тази отстъпка ще се приложи към всички варианти и стаи в фазата
                  </p>
                </div>
              )}
            </div>

            {/* Architect Commission Info */}
            {formData.includeArchitectCommission && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Архитект комисионна</span>
                </div>
                <p className="text-sm text-purple-700">
                  Комисионната ще се изчисли автоматично на базата на общата стойност на фазата и процента определен в настройките на проекта.
                </p>
              </div>
            )}

            {/* Discount Info */}
            {formData.discountEnabled && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Percent className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Отстъпка на фазата</span>
                </div>
                <p className="text-sm text-green-700">
                  Отстъпката от {formData.phaseDiscount}% ще се приложи автоматично към всички варианти в тази фаза. Потребителите могат да override-ят тази стойност в отделните стаи.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Създаване...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Създай фаза
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 