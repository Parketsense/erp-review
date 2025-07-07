'use client';

import React, { useState, useEffect } from 'react';
import { CreateClientDto, Client } from '../../types/client';
import { X, User, Building2, Briefcase, AlertCircle, Info, CheckCircle, FolderPlus } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: CreateClientDto) => Promise<void>;
  initialData?: Client | null;
  onCreateProject?: (client: Client) => void;
}

export default function ClientModal({ isOpen, onClose, onSave, initialData, onCreateProject }: ClientModalProps) {
  // Local form state interface for better type safety
  interface FormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    hasCompany: boolean;
    companyName: string;
    eikBulstat: string;
    vatNumber: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    companyMol: string;
    isArchitect: boolean;
    commissionPercent: number;
    notes: string;
  }

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    hasCompany: false,
    companyName: '',
    eikBulstat: '',
    vatNumber: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyMol: '',
    isArchitect: false,
    commissionPercent: 10,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState('');

  const isEditMode = !!initialData;

  // Populate form when editing  
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        hasCompany: initialData.hasCompany || false,
        companyName: initialData.companyName || '',
        eikBulstat: initialData.eikBulstat || '',
        vatNumber: initialData.vatNumber || '',
        companyAddress: initialData.companyAddress || '',
        companyPhone: initialData.companyPhone || '',
        companyEmail: initialData.companyEmail || '',
        companyMol: initialData.companyMol || '',
        isArchitect: initialData.isArchitect || false,
        commissionPercent: initialData.commissionPercent || 10,
        notes: initialData.notes || '',
      });
    } else {
      // Reset form for new client
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        hasCompany: false,
        companyName: '',
        eikBulstat: '',
        vatNumber: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        companyMol: '',
        isArchitect: false,
        commissionPercent: 10,
        notes: '',
      });
    }
    setErrors({});
    setShowSuccess(false);
    setPhoneWarning('');
  }, [initialData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? (value === '' ? 10 : Number(value)) : 
              (value || '')
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEIK = (eik: string) => {
    if (!eik.trim()) return '';
    
    if (!/^\d{9}$|^\d{13}$/.test(eik)) {
      return 'ЕИК трябва да е 9 или 13 цифри';
    }
    
    // Simulate check for duplicate EIK
    if (eik === '123456789') {
      return 'Фирма с този ЕИК вече съществува!';
    }
    
    return '';
  };

  const checkPhoneForDuplicates = (phone: string) => {
    if (!phone.trim()) {
      setPhoneWarning('');
      return;
    }
    
    // Simulate check for similar phone numbers
    if (phone.includes('888123456') || phone.includes('899234567')) {
      setPhoneWarning('Внимание: Има клиент с подобен телефон');
    } else {
      setPhoneWarning('');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Името е задължително';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилията е задължителна';
    }

    if (formData.hasCompany) {
      if (!formData.companyName?.trim()) {
        newErrors.companyName = 'Името на фирмата е задължително';
      }
      
      if (!formData.eikBulstat?.trim()) {
        newErrors.eikBulstat = 'ЕИК-ът е задължителен';
      } else {
        const eikError = validateEIK(formData.eikBulstat || '');
        if (eikError) {
          newErrors.eikBulstat = eikError;
        }
      }
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
      
      // Convert form data to CreateClientDto
      const clientData: CreateClientDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        hasCompany: formData.hasCompany,
        companyName: formData.hasCompany ? formData.companyName || undefined : undefined,
        eikBulstat: formData.hasCompany ? formData.eikBulstat || undefined : undefined,
        vatNumber: formData.hasCompany ? formData.vatNumber || undefined : undefined,
        companyAddress: formData.hasCompany ? formData.companyAddress || undefined : undefined,
        companyPhone: formData.hasCompany ? formData.companyPhone || undefined : undefined,
        companyEmail: formData.hasCompany ? formData.companyEmail || undefined : undefined,
        companyMol: formData.hasCompany ? formData.companyMol || undefined : undefined,
        isArchitect: formData.isArchitect,
        commissionPercent: formData.isArchitect ? formData.commissionPercent : undefined,
        notes: formData.notes || undefined,
      };

      console.log('ClientModal onSave', clientData);
      await onSave(clientData);
      
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 1000);

    } catch (error) {
      console.error('Save error:', error);
      setErrors({ submit: 'Грешка при запазването: ' + (error instanceof Error ? error.message : 'Неизвестна грешка') });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (Object.values(formData).some(value => typeof value === 'string' && value.trim()) || formData.hasCompany || formData.isArchitect) {
      if (confirm('Сигурни ли сте? Всички въведени данни ще бъдат загубени.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-light text-gray-900">
            {isEditMode ? 'Редактиране на клиент' : 'Нов клиент'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>✅ Клиентът е успешно {isEditMode ? 'обновен' : 'създаден'}!</span>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-8">
            {/* Personal Information Section */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-100">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-medium text-gray-900">Лични данни</h3>
              </div>

              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-blue-800">
                  <strong>Съвет:</strong> Започнете с личните данни на клиента. 
                  Фирмени данни можете да добавите сега или по-късно.
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Име <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg text-base transition-colors ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Въведете име"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фамилия <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg text-base transition-colors ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Въведете фамилия"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Contact fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    onBlur={(e) => checkPhoneForDuplicates(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+359 888 123 456"
                  />
                  {phoneWarning && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {phoneWarning}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Град, улица, номер"
                />
              </div>

              {/* Company Section */}
              <div className={`mt-8 border-2 border-dashed rounded-lg p-6 transition-all ${
                formData.hasCompany 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}>
                <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="hasCompany"
                    checked={formData.hasCompany}
                    onChange={handleInputChange}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="font-semibold text-gray-900">Клиентът представлява фирма</span>
                </label>

                {formData.hasCompany && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Име на фирма <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg text-base transition-colors ${
                          errors.companyName ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="ООД, ЕООД, АД..."
                      />
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ЕИК/Булстат <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="eikBulstat"
                          value={formData.eikBulstat || ''}
                          onChange={handleInputChange}
                          onBlur={(e) => {
                            const error = validateEIK(e.target.value);
                            if (error) {
                              setErrors(prev => ({ ...prev, eikBulstat: error }));
                            }
                          }}
                          className={`w-full px-4 py-3 border rounded-lg text-base transition-colors ${
                            errors.eikBulstat ? 'border-red-500' : 'border-gray-300'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="123456789"
                        />
                        {errors.eikBulstat && (
                          <p className="mt-1 text-sm text-red-600">{errors.eikBulstat}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ДДС номер
                        </label>
                        <input
                          type="text"
                          name="vatNumber"
                          value={formData.vatNumber || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="BG123456789"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Фирмен телефон
                        </label>
                        <input
                          type="tel"
                          name="companyPhone"
                          value={formData.companyPhone || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+359 2 123 456"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Фирмен email
                        </label>
                        <input
                          type="email"
                          name="companyEmail"
                          value={formData.companyEmail || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="office@company.bg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес по регистрация
                      </label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={formData.companyAddress || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Адрес на фирмата"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        МОЛ (Материално отговорно лице)
                      </label>
                      <input
                        type="text"
                        name="companyMol"
                        value={formData.companyMol || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Име на МОЛ"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Architect Section */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isArchitect"
                    checked={formData.isArchitect}
                    onChange={handleInputChange}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="font-semibold text-gray-900">Клиентът е архитект/дизайнер</span>
                </label>

                {formData.isArchitect && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Комисионна %
                    </label>
                    <input
                      type="number"
                      name="commissionPercent"
                      value={formData.commissionPercent || 10}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-32 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-gray-600">
                      Стандартната комисионна е 10%
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Бележки
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Допълнителна информация за клиента..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отказ
            </button>
            
            <div className="flex gap-3">
              {isEditMode && onCreateProject && initialData && (
                <button
                  type="button"
                  onClick={() => onCreateProject(initialData)}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  Създай проект
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                💾 {loading ? 'Запазва...' : (isEditMode ? 'Запази промените' : 'Запази и продължи')}
              </button>
              
              {!isEditMode && (
                                 <button
                   type="button"
                   onClick={async () => {
                     if (validateForm()) {
                       try {
                         setLoading(true);
                         
                         // Convert form data to CreateClientDto
                         const clientData: CreateClientDto = {
                           firstName: formData.firstName,
                           lastName: formData.lastName,
                           phone: formData.phone || undefined,
                           email: formData.email || undefined,
                           address: formData.address || undefined,
                           hasCompany: formData.hasCompany,
                           companyName: formData.hasCompany ? formData.companyName || undefined : undefined,
                           eikBulstat: formData.hasCompany ? formData.eikBulstat || undefined : undefined,
                           vatNumber: formData.hasCompany ? formData.vatNumber || undefined : undefined,
                           companyAddress: formData.hasCompany ? formData.companyAddress || undefined : undefined,
                           companyPhone: formData.hasCompany ? formData.companyPhone || undefined : undefined,
                           companyEmail: formData.hasCompany ? formData.companyEmail || undefined : undefined,
                           companyMol: formData.hasCompany ? formData.companyMol || undefined : undefined,
                           isArchitect: formData.isArchitect,
                           commissionPercent: formData.isArchitect ? formData.commissionPercent : undefined,
                           notes: formData.notes || undefined,
                         };

                         await onSave(clientData);
                         setShowSuccess(true);
                         setTimeout(() => {
                           onClose();
                           setShowSuccess(false);
                         }, 1000);
                       } catch (error) {
                         setErrors({ submit: 'Грешка при запазването' });
                       } finally {
                         setLoading(false);
                       }
                     }
                   }}
                   disabled={loading}
                   className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                 >
                   ✓ Запази и затвори
                 </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Quick Tips Panel */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs hidden lg:block">
        <div className="font-semibold text-blue-600 mb-2">💡 Полезни съвети</div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Телефонът не е задължителен</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Можете да добавите фирма по-късно</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>ЕИК-то трябва да е уникално</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-500 font-bold">•</span>
            <span>Архитектската комисионна е опционална</span>
          </div>
        </div>
      </div>
    </div>
  );
} 