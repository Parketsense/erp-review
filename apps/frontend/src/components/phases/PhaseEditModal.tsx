'use client';

import React, { useState, useEffect } from 'react';
import { CreatePhaseDto, Phase } from '../../types/phase';

interface PhaseEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: CreatePhaseDto) => Promise<void>;
  initialData?: Phase | null;
}

export default function PhaseEditModal({ isOpen, onClose, onSave, initialData }: PhaseEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'created' as 'created' | 'quoted' | 'won' | 'lost' | 'archived',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description || '',
          status: initialData.status,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          status: 'created',
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Името на фазата е задължително';
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
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
      };

      await onSave(phaseData);
      onClose();

    } catch (error) {
      console.error('Save error:', error);
      setErrors({ submit: 'Грешка при запазването: ' + (error instanceof Error ? error.message : 'Неизвестна грешка') });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-light text-gray-900">
            {isEditMode ? 'Редактиране на фаза' : 'Нова фаза'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {errors.submit && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Име на фазата <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Например: Проектиране, Изпълнение, Финализиране"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Подробно описание на дейностите във фазата"
              />
            </div>

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
                <option value="quoted">Офертирана</option>
                <option value="won">Спечелена</option>
                <option value="lost">Загубена</option>
                <option value="archived">Архивирана</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Запазване...' : (isEditMode ? 'Обнови фаза' : 'Създай фаза')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 