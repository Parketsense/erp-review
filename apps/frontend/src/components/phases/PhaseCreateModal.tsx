'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreatePhaseDto } from '../../types/phase';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  isArchitect: boolean;
  commissionPercent?: number;
}

interface PhaseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (phase: CreatePhaseDto) => Promise<void>;
  projectId: string;
}

export default function PhaseCreateModal({ isOpen, onClose, onSave, projectId }: PhaseCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'created' as const,
    architectId: '',
  });

  const [architects, setArchitects] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingArchitects, setLoadingArchitects] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Нови state-ове за търсачката
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState<Client | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Зареждане на архитектите при отваряне на модала
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        status: 'created',
        architectId: '',
      });
      setErrors({});
      setSearchQuery('');
      setSelectedArchitect(null);
      setIsDropdownOpen(false);
      loadArchitects();
    }
  }, [isOpen]);

  // Затваряне на dropdown при клик извън него
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadArchitects = async () => {
    try {
      setLoadingArchitects(true);
      const response = await fetch('/api/clients');
      
      if (!response.ok) {
        throw new Error('Грешка при зареждането на клиентите');
      }
      
      const data = await response.json();
      // Филтрираме само архитектите
      const architectsOnly = data.data?.filter((client: Client) => client.isArchitect) || [];
      setArchitects(architectsOnly);
    } catch (error) {
      console.error('Error loading architects:', error);
      setErrors({ architects: 'Грешка при зареждането на архитектите' });
    } finally {
      setLoadingArchitects(false);
    }
  };

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

  // Филтриране на архитектите според търсенето
  const filteredArchitects = architects.filter(architect => {
    const fullName = `${architect.firstName} ${architect.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleArchitectSelect = (architect: Client | null) => {
    setSelectedArchitect(architect);
    setFormData(prev => ({
      ...prev,
      architectId: architect?.id || ''
    }));
    setSearchQuery(architect ? `${architect.firstName} ${architect.lastName}` : '');
    setIsDropdownOpen(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(value.length > 0 || true); // Показваме dropdown винаги когато има фокус
    
    // Ако полето е празно, премахваме избраният архитект
    if (value === '') {
      setSelectedArchitect(null);
      setFormData(prev => ({ ...prev, architectId: '' }));
    }
  };

  const handleSearchInputFocus = () => {
    setIsDropdownOpen(true);
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
        architectId: formData.architectId || undefined,
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
          <h2 className="text-2xl font-light text-gray-900">Нова фаза</h2>
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

        {errors.architects && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
            {errors.architects}
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

            <div ref={dropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Архитект
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
                  disabled={loadingArchitects}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Търсете архитект или оставете празно"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {isDropdownOpen && !loadingArchitects && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {/* Опция без архитект */}
                  <div
                    onClick={() => handleArchitectSelect(null)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="text-gray-600 italic">Без архитект</div>
                  </div>

                  {filteredArchitects.length === 0 && searchQuery ? (
                    <div className="px-4 py-3 text-gray-500 italic">
                      Няма намерени архитекти
                    </div>
                  ) : (
                    filteredArchitects.map((architect) => (
                      <div
                        key={architect.id}
                        onClick={() => handleArchitectSelect(architect)}
                        className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                          selectedArchitect?.id === architect.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {architect.firstName} {architect.lastName}
                        </div>
                        {architect.commissionPercent && (
                          <div className="text-sm text-gray-500">
                            {architect.commissionPercent}% комисионна
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {loadingArchitects && (
                <p className="mt-1 text-sm text-gray-500">Зареждане на архитектите...</p>
              )}
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
              {loading ? 'Запазване...' : 'Създай фаза'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 