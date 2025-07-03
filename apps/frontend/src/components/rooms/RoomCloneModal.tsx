'use client';

import React, { useState, useEffect } from 'react';
import { Copy, X, ChevronDown, Home, Building, Package, Check } from 'lucide-react';
import { VariantRoom, RoomProduct } from '@/types/room';
import { PhaseVariant } from '@/types/variant';
import { ProjectPhase } from '@/services/phasesApi';
import { roomsApi } from '@/services/roomsApi';
import { variantsApi } from '@/services/variantsApi';
import { phasesApi } from '@/services/phasesApi';
import { roomProductsApi } from '@/services/roomProductsApi';

interface RoomCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: VariantRoom;
  currentVariantId: string;
  currentPhaseId: string;
  projectId: string;
  onCloned: () => void;
}

interface CloneOptions {
  targetPhaseId: string;
  targetVariantId: string;
  isCurrentPhase: boolean;
  isCurrentVariant: boolean;
  productCloneType: 'all' | 'selected' | 'none';
  selectedProductIds: string[];
  newName: string;
}

export default function RoomCloneModal({
  isOpen,
  onClose,
  room,
  currentVariantId,
  currentPhaseId,
  projectId,
  onCloned
}: RoomCloneModalProps) {
  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [variants, setVariants] = useState<PhaseVariant[]>([]);
  const [products, setProducts] = useState<RoomProduct[]>([]);
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false);
  const [showVariantDropdown, setShowVariantDropdown] = useState(false);
  
  const [options, setOptions] = useState<CloneOptions>({
    targetPhaseId: currentPhaseId,
    targetVariantId: currentVariantId,
    isCurrentPhase: true,
    isCurrentVariant: true,
    productCloneType: 'all',
    selectedProductIds: [],
    newName: `${room.name} (копие)`
  });

  // Load phases, variants and products
  useEffect(() => {
    if (isOpen) {
      loadPhases();
      loadProducts();
    }
  }, [isOpen, projectId, room.id]);

  useEffect(() => {
    if (options.targetPhaseId) {
      loadVariants(options.targetPhaseId);
    }
  }, [options.targetPhaseId]);

  const loadPhases = async () => {
    try {
      const phasesResponse = await phasesApi.getPhasesByProject(projectId);
      setPhases(phasesResponse.data);
    } catch (error) {
      console.error('Error loading phases:', error);
    }
  };

  const loadVariants = async (phaseId: string) => {
    try {
      const variantsData = await variantsApi.getVariantsByPhase(phaseId);
      setVariants(variantsData);
      
      // If changing phase, select first variant in the new phase
      if (phaseId !== currentPhaseId && variantsData.length > 0) {
        setOptions(prev => ({
          ...prev,
          targetVariantId: variantsData[0].id,
          isCurrentVariant: false
        }));
      }
    } catch (error) {
      console.error('Error loading variants:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const productsResponse = await roomProductsApi.getRoomProducts(room.id);
      setProducts(productsResponse.data);
      // Select all products by default
      setOptions(prev => ({
        ...prev,
        selectedProductIds: productsResponse.data.map(p => p.id)
      }));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handlePhaseChange = (phaseId: string) => {
    const isCurrentPhase = phaseId === currentPhaseId;
    setOptions(prev => ({
      ...prev,
      targetPhaseId: phaseId,
      isCurrentPhase,
      // Reset variant selection when phase changes
      targetVariantId: isCurrentPhase ? currentVariantId : '',
      isCurrentVariant: isCurrentPhase
    }));
    setShowPhaseDropdown(false);
  };

  const handleVariantChange = (variantId: string) => {
    const isCurrentVariant = variantId === currentVariantId;
    setOptions(prev => ({
      ...prev,
      targetVariantId: variantId,
      isCurrentVariant
    }));
    setShowVariantDropdown(false);
  };

  const handleProductToggle = (productId: string) => {
    setOptions(prev => ({
      ...prev,
      selectedProductIds: prev.selectedProductIds.includes(productId)
        ? prev.selectedProductIds.filter(id => id !== productId)
        : [...prev.selectedProductIds, productId]
    }));
  };

  const handleProductCloneTypeChange = (type: 'all' | 'selected' | 'none') => {
    setOptions(prev => ({
      ...prev,
      productCloneType: type,
      selectedProductIds: type === 'all' ? products.map(p => p.id) : 
                         type === 'none' ? [] : prev.selectedProductIds
    }));
  };

  const handleClone = async () => {
    if (!options.newName.trim()) {
      alert('Моля въведете име за новата стая');
      return;
    }

    if (!options.targetVariantId) {
      alert('Моля изберете целеви вариант');
      return;
    }

    if (options.productCloneType === 'selected' && options.selectedProductIds.length === 0) {
      alert('Моля изберете поне един продукт за клониране');
      return;
    }

    setLoading(true);
    try {
      await roomsApi.duplicateRoom(room.id, {
        name: options.newName,
        targetVariantId: options.targetVariantId,
        productCloneType: options.productCloneType,
        selectedProductIds: options.productCloneType === 'selected' ? options.selectedProductIds : undefined
      });
      
      onCloned();
      onClose();
    } catch (error) {
      console.error('Error cloning room:', error);
      alert('Грешка при клониране на стаята');
    } finally {
      setLoading(false);
    }
  };

  const selectedPhase = Array.isArray(phases) ? phases.find(p => p.id === options.targetPhaseId) : null;
  const selectedVariant = Array.isArray(variants) ? variants.find(v => v.id === options.targetVariantId) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Copy className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Клониране на стая</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current room info */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Клониране на:</h3>
            <p className="text-green-700">🏠 {room.name}</p>
            <p className="text-sm text-green-600 mt-1">
              {room.area}м² • {products.length} продукта
            </p>
          </div>

          {/* New name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Име на новата стая
            </label>
            <input
              type="text"
              value={options.newName}
              onChange={(e) => setOptions(prev => ({ ...prev, newName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Въведете име за новата стая"
            />
          </div>

          {/* Target phase */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Целева фаза
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPhaseDropdown(!showPhaseDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span>{selectedPhase?.name || 'Избери фаза'}</span>
                  {options.isCurrentPhase && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      настояща
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showPhaseDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {phases.map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => handlePhaseChange(phase.id)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                        options.targetPhaseId === phase.id ? 'bg-green-50 text-green-700' : ''
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>{phase.name}</span>
                      {phase.id === currentPhaseId && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-auto">
                          настояща
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Target variant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Целеви вариант
            </label>
            <div className="relative">
              <button
                onClick={() => setShowVariantDropdown(!showVariantDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span>{selectedVariant?.name || 'Избери вариант'}</span>
                  {options.isCurrentVariant && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      настоящ
                    </span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showVariantDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant.id)}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                        options.targetVariantId === variant.id ? 'bg-green-50 text-green-700' : ''
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>{variant.name}</span>
                      {variant.id === currentVariantId && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded ml-auto">
                          настоящ
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product clone type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Клониране на продукти
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="all"
                  checked={options.productCloneType === 'all'}
                  onChange={(e) => handleProductCloneTypeChange(e.target.value as 'all')}
                  className="w-4 h-4 text-green-600"
                />
                <Package className="w-4 h-4 text-gray-500" />
                <span>Всички продукти ({products.length})</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="selected"
                  checked={options.productCloneType === 'selected'}
                  onChange={(e) => handleProductCloneTypeChange(e.target.value as 'selected')}
                  className="w-4 h-4 text-green-600"
                />
                <Package className="w-4 h-4 text-gray-500" />
                <span>Избрани продукти</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="none"
                  checked={options.productCloneType === 'none'}
                  onChange={(e) => handleProductCloneTypeChange(e.target.value as 'none')}
                  className="w-4 h-4 text-green-600"
                />
                <Package className="w-4 h-4 text-gray-500" />
                <span>Без продукти (само стаята)</span>
              </label>
            </div>
          </div>

          {/* Product selection */}
          {options.productCloneType === 'selected' && products.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Избор на продукти</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {products.map((product) => (
                  <label key={product.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={options.selectedProductIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4 text-green-600"
                    />
                    <Package className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <span className="block font-medium">{product.product?.nameBg || 'Неизвестен продукт'}</span>
                      <span className="text-sm text-gray-500">
                        {product.quantity}м² • {product.unitPrice}лв/м²
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {(product.quantity * product.unitPrice).toFixed(2)}лв
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Избрани: {options.selectedProductIds.length} от {products.length} продукта
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Отказ
          </button>
          <button
            onClick={handleClone}
            disabled={loading || !options.newName.trim() || !options.targetVariantId}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Клониране...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Клонирай стая</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 