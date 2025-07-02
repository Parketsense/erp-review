'use client';

import { useState, useEffect } from 'react';
import { X, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { roomProductsApi, type RoomProduct, type UpdateRoomProductDto } from '@/services/roomProductsApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: RoomProduct;
  onProductUpdated: () => void;
}

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  onProductUpdated,
}: EditProductModalProps) {
  // Form state
  const [formData, setFormData] = useState<UpdateRoomProductDto>({
    quantity: product.quantity,
    unitPrice: product.unitPrice,
    discount: product.discount || 0,
    discountEnabled: product.discountEnabled,
    wastePercent: product.wastePercent || 10,
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when product changes or modal opens
  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        quantity: product.quantity,
        unitPrice: product.unitPrice,
        discount: product.discount || 0,
        discountEnabled: product.discountEnabled,
        wastePercent: product.wastePercent || 10,
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, product]);

  const handleFormChange = (field: keyof UpdateRoomProductDto, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculateTotal = () => {
    const baseTotal = (formData.quantity || 0) * (formData.unitPrice || 0);
    const discountAmount = formData.discountEnabled && formData.discount 
      ? baseTotal * ((formData.discount || 0) / 100) 
      : 0;
    const afterDiscount = baseTotal - discountAmount;
    const wasteAmount = formData.wastePercent 
      ? afterDiscount * ((formData.wastePercent || 0) / 100)
      : 0;
    return afterDiscount + wasteAmount;
  };

  const hasChanges = () => {
    return (
      formData.quantity !== product.quantity ||
      formData.unitPrice !== product.unitPrice ||
      formData.discount !== (product.discount || 0) ||
      formData.discountEnabled !== product.discountEnabled ||
      formData.wastePercent !== (product.wastePercent || 10)
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      await roomProductsApi.updateRoomProduct(product.id, formData);
      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onProductUpdated();
        onClose();
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Редактирай продукт
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Success State */}
          {success && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Продуктът е обновен успешно!
              </h3>
              <p className="text-gray-600">
                Промените са запазени.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!success && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {product.product?.nameBg || 'Неизвестен продукт'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Код: {product.product?.code || 'N/A'} • {product.product?.manufacturer?.displayName || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Количество ({product.product?.unit || 'бр.'}) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.quantity || ''}
                    onChange={(e) => handleFormChange('quantity', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Единична цена (лв.) *
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.unitPrice || ''}
                    onChange={(e) => handleFormChange('unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Discount */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="discountEnabled"
                      checked={formData.discountEnabled || false}
                      onChange={(e) => handleFormChange('discountEnabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="discountEnabled" className="text-sm font-medium text-gray-700">
                      Прилагане на отстъпка (%)
                    </label>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.discount || ''}
                    onChange={(e) => handleFormChange('discount', parseFloat(e.target.value) || 0)}
                    disabled={!formData.discountEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Waste Percent */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отпадък (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.wastePercent || ''}
                    onChange={(e) => handleFormChange('wastePercent', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Price Calculation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Изчисление на цена</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Основна сума:</span>
                    <span>{((formData.quantity || 0) * (formData.unitPrice || 0)).toFixed(2)} лв.</span>
                  </div>
                  {formData.discountEnabled && (formData.discount || 0) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Отстъпка ({formData.discount}%):</span>
                      <span>-{(((formData.quantity || 0) * (formData.unitPrice || 0)) * ((formData.discount || 0) / 100)).toFixed(2)} лв.</span>
                    </div>
                  )}
                  {(formData.wastePercent || 0) > 0 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>Отпадък ({formData.wastePercent}%):</span>
                      <span>+{((((formData.quantity || 0) * (formData.unitPrice || 0)) - (formData.discountEnabled && formData.discount ? ((formData.quantity || 0) * (formData.unitPrice || 0)) * ((formData.discount || 0) / 100) : 0)) * ((formData.wastePercent || 0) / 100)).toFixed(2)} лв.</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-medium border-t pt-2">
                    <span>Обща сума:</span>
                    <span>{calculateTotal().toFixed(2)} лв.</span>
                  </div>
                </div>
              </div>

              {/* Changes indicator */}
              {hasChanges() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Имате незапазени промени
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отказ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !hasChanges() || (formData.quantity || 0) <= 0 || (formData.unitPrice || 0) <= 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && <LoadingSpinner />}
              Запази промените
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
