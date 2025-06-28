'use client';

import React, { useState, useEffect } from 'react';
import AttributeValueForm from './AttributeValueForm';
import ValuePreview from './ValuePreview';

export interface AttributeValue {
  id?: string;
  nameBg: string;
  nameEn: string;
  manufacturerId: string;
  sortOrder: number;
  description?: string;
  colorCode?: string;
  icon?: string;
  isActive: boolean;
  isDefault: boolean;
}

interface AddAttributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: AttributeValue) => void;
  attributeName: string;
  manufacturers: Array<{ id: string; name: string; code: string }>;
}

const AddAttributeModal: React.FC<AddAttributeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  attributeName,
  manufacturers
}) => {
  const [formData, setFormData] = useState<AttributeValue>({
    nameBg: '',
    nameEn: '',
    manufacturerId: '',
    sortOrder: 1,
    description: '',
    colorCode: '#4169E1',
    icon: '',
    isActive: true,
    isDefault: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        manufacturerId: ''
      }));
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof AttributeValue, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCopyToEn = () => {
    if (formData.nameBg.trim()) {
      setFormData(prev => ({
        ...prev,
        nameEn: prev.nameBg
      }));
    }
  };

  const handleCopyToBg = () => {
    if (formData.nameEn.trim()) {
      setFormData(prev => ({
        ...prev,
        nameBg: prev.nameEn
      }));
    }
  };

  const handleSave = async () => {
    if (!formData.nameBg.trim() || !formData.nameEn.trim()) {
      alert('Моля въведете стойности на двата езика');
      return;
    }

    setIsLoading(true);

    try {
      await onSave(formData);
      setIsSuccess(true);
    } catch (error) {
      alert('Грешка при запазване на стойността');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseNewValue = () => {
    onClose();
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsSuccess(false);
      setFormData({
        nameBg: '',
        nameEn: '',
        manufacturerId: '',
        sortOrder: 1,
        description: '',
        colorCode: '#4169E1',
        icon: '',
        isActive: true,
        isDefault: false
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  // Don't render if manufacturers array is not available
  if (!manufacturers || manufacturers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-lg p-4">
          <h3>Debug: No manufacturers found</h3>
          <p>manufacturers: {JSON.stringify(manufacturers)}</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden shadow-lg animate-in slide-in-from-top-2 duration-300">
        {/* Header */}
        <div className="bg-gray-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="text-sm font-medium">Добавяне на нова стойност</div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-white hover:bg-white hover:bg-opacity-10 rounded p-1 w-7 h-7 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[calc(90vh-120px)] overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <div className="text-base font-medium text-gray-800 mb-2">
                Стойността е добавена успешно!
              </div>
              <div className="text-sm text-gray-600">
                &ldquo;{formData.nameBg} / {formData.nameEn}&rdquo; е добавена към атрибут &ldquo;{attributeName}&rdquo;
              </div>
            </div>
          ) : (
            <>
              {/* Info Box */}
              <div className="bg-gray-100 border border-gray-300 rounded p-3 mb-4 text-xs text-gray-700">
                <span className="mr-1">💡</span>
                <strong>Контекст:</strong>
                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                  Добавете нова стойност за атрибута &ldquo;{attributeName}&rdquo;. 
                  Стойността ще бъде валидна за всички производители, 
                  освен ако не е избран конкретен производител в полето &ldquo;Производител&rdquo;.
                </div>
              </div>

              {/* Form */}
              <AttributeValueForm
                formData={formData}
                onInputChange={handleInputChange}
                onCopyToEn={handleCopyToEn}
                onCopyToBg={handleCopyToBg}
                manufacturers={manufacturers}
                currentManufacturer=""
              />

              {/* Preview */}
              <ValuePreview formData={formData} />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-600">
            {isSuccess 
              ? 'Стойността е веднага достъпна за избор при създаване на продукти'
              : 'Стойността ще бъде веднага достъпна за избор'
            }
          </div>
          <div className="flex gap-2">
            {isSuccess ? (
              <>
                <button
                  onClick={handleUseNewValue}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                >
                  Използвай сега
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                >
                  Затвори
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Отказ
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !formData.nameBg.trim() || !formData.nameEn.trim()}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Запазване...' : 'ПОТВЪРДИ'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAttributeModal; 