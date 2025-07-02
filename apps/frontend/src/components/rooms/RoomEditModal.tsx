'use client';

import { useState, useEffect } from 'react';
import { X, Save, Home, Ruler, Percent } from 'lucide-react';
import { UpdateRoomDto, VariantRoom } from '@/types/room';
import { PhaseVariant } from '@/types/variant';
import { roomsApi } from '@/services/roomsApi';
import { variantsApi } from '@/services/variantsApi';

interface RoomEditModalProps {
  room: VariantRoom;
  isOpen: boolean;
  onClose: () => void;
  onRoomUpdated: () => void;
}

export default function RoomEditModal({
  room,
  isOpen,
  onClose,
  onRoomUpdated
}: RoomEditModalProps) {
  const [variant, setVariant] = useState<PhaseVariant | null>(null);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const [formData, setFormData] = useState<UpdateRoomDto>({
    name: room.name,
    area: room.area,
    discount: room.discount,
    discountEnabled: room.discountEnabled,
    wastePercent: room.wastePercent
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when room changes or modal opens
  useEffect(() => {
    if (isOpen && room) {
      setFormData({
        name: room.name,
        area: room.area,
        discount: room.discount,
        discountEnabled: room.discountEnabled,
        wastePercent: room.wastePercent
      });
      setError(null);
    }
  }, [isOpen, room]);

  // Load variant information when modal opens
  useEffect(() => {
    if (isOpen && room.variantId) {
      loadVariantInfo();
    }
  }, [isOpen, room.variantId]);

  const loadVariantInfo = async () => {
    try {
      setLoadingVariant(true);
      const variantData = await variantsApi.getVariantById(room.variantId);
      setVariant(variantData);
    } catch (err) {
      console.error('Failed to load variant:', err);
      // Don't show error to user, variant info is optional
    } finally {
      setLoadingVariant(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Името на стаята е задължително');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const dataToSubmit = {
        name: formData.name.trim(),
        area: formData.area || undefined,
        discount: formData.discountEnabled ? (formData.discount || 0) : undefined,
        discountEnabled: formData.discountEnabled,
        wastePercent: formData.wastePercent || undefined
      };
      
      await roomsApi.updateRoom(room.id, dataToSubmit);
      onRoomUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка при обновяването');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateRoomDto, value: any) => {
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
      // Auto-populate discount from variant when enabling discount (only if current discount is 0 or undefined)
      discount: enabled && (!prev.discount || prev.discount === 0) && variant?.variantDiscount !== undefined 
        ? variant.variantDiscount 
        : prev.discount
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
              Редактиране на стая: {room.name}
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
                    <Home className="w-4 h-4 inline mr-1" />
                    Име на стаята *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="напр. Хол, Спалня, Кухня"
                  />
                </div>
                
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                    <Ruler className="w-4 h-4 inline mr-1" />
                    Площ (м²)
                  </label>
                  <input
                    type="number"
                    id="area"
                    min="0"
                    step="0.01"
                    value={formData.area || ''}
                    onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="wastePercent" className="block text-sm font-medium text-gray-700">
                    <Percent className="w-4 h-4 inline mr-1" />
                    Процент отпадък (%)
                  </label>
                  <input
                    type="number"
                    id="wastePercent"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.wastePercent || ''}
                    onChange={(e) => handleInputChange('wastePercent', parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Процент за отпадък при монтаж на материали
                  </p>
                </div>
              </div>
            </div>

            {/* Discount Settings */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Настройки за отстъпка</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="discountEnabled"
                    type="checkbox"
                    checked={formData.discountEnabled || false}
                    onChange={(e) => handleDiscountEnabledChange(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="discountEnabled" className="ml-2 block text-sm text-gray-700">
                    Активирай отстъпка за стаята
                    {variant?.variantDiscount !== undefined && variant.variantDiscount > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        (отстъпката на варианта: {variant.variantDiscount}%)
                      </span>
                    )}
                  </label>
                </div>
                
                {formData.discountEnabled && (
                  <div>
                    <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                      <Percent className="w-4 h-4 inline mr-1" />
                      Отстъпка (%)
                    </label>
                    <input
                      type="number"
                      id="discount"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.discount || ''}
                      onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || undefined)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                    />
                    {variant?.variantDiscount !== undefined && variant.variantDiscount > 0 && (
                      <p className="mt-1 text-sm text-gray-500">
                        Отстъпката на варианта е {variant.variantDiscount}%. Можете да промените стойността.
                      </p>
                    )}
                  </div>
                )}
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
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Обновяване...
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
