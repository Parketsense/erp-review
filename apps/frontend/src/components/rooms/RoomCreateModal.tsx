'use client';

import { useState, useEffect } from 'react';
import { X, Save, Home, Ruler, Percent, Package, Plus, Trash2, Edit, Search } from 'lucide-react';
import { CreateRoomDto } from '@/types/room';
import { PhaseVariant } from '@/types/variant';
import { roomsApi } from '@/services/roomsApi';
import { variantsApi } from '@/services/variantsApi';
import { productsApi } from '@/services/productsApi';
import { roomProductsApi } from '@/services/roomProductsApi';

interface Product {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  unit: string;
  wastage: number; // фира в проценти
}

interface RoomCreateModalProps {
  variantId: string;
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: () => void;
}

export default function RoomCreateModal({ variantId, isOpen, onClose, onRoomCreated }: RoomCreateModalProps) {
  const [formData, setFormData] = useState<CreateRoomDto>({
    name: '',
    area: 0,
    wastePercent: 0,
    discount: 0,
    discountEnabled: true
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [variantData, setVariantData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadAvailableProducts();
      loadVariantData();
    }
  }, [isOpen]);

  const loadVariantData = async () => {
    try {
      const variant = await variantsApi.getVariantById(variantId);
      setVariantData(variant);
      
      // Set default values from variant/phase if available
      if (variant?.phase) {
        setFormData(prev => ({
          ...prev,
          discount: variant.phase.phaseDiscount || 0,
          discountEnabled: variant.discountEnabled && variant.phase.discountEnabled
        }));
      }
    } catch (err) {
      console.error('Failed to load variant data:', err);
    }
  };

  useEffect(() => {
    const filtered = availableProducts.filter(product =>
      product.nameBg?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, availableProducts]);

  const loadAvailableProducts = async () => {
    try {
      setLoadingProducts(true);
      const productsResponse = await productsApi.getAll();
      setAvailableProducts(productsResponse.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleInputChange = (field: keyof CreateRoomDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addProduct = (product: any) => {
    const newProduct: Product = {
      productId: product.id,
      productName: product.nameBg || product.nameEn,
      quantity: formData.area || 0, // наследява от стаята
      unitPrice: product.saleBgn || product.costBgn || 0, // използва saleBgn или costBgn
      discount: formData.discount || 0, // наследява от стаята
      unit: product.unit || 'м²',
      wastage: formData.wastePercent || 0 // наследява от стаята
    };
    
    setProducts(prev => [newProduct, ...prev]); // новият продукт най-отгоре
    setSearchTerm('');
  };

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    setProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    ));
  };

  const calculateQuantityAfterWastage = (quantity: number, wastage: number) => {
    return quantity * (1 + wastage / 100);
  };

  const calculateFinalPrice = (unitPrice: number, discount: number) => {
    return unitPrice * (1 - discount / 100);
  };

  const calculateTotalAmount = (product: Product) => {
    const quantityAfterWastage = calculateQuantityAfterWastage(product.quantity, product.wastage);
    const finalPrice = calculateFinalPrice(product.unitPrice, product.discount);
    return quantityAfterWastage * finalPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Създаваме стаята
      const createdRoom = await roomsApi.createRoom(variantId, formData);

      // Добавяме продуктите към стаята
      if (products.length > 0) {
        for (const product of products) {
          await roomProductsApi.addProductToRoom({
            roomId: createdRoom.id,
            productId: product.productId,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            discount: product.discount,
            wastePercent: product.wastage
          });
        }
      }

      onRoomCreated();
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Създаване на нова стая
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Основна информация за стаята */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Име на стаята
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Площ (м²)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.area}
                onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фира (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.wastePercent}
                onChange={(e) => handleInputChange('wastePercent', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Отстъпка (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Секция за продукти */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Продукти
            </h3>

            {/* Търсачка за продукти */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Търсене на продукт
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Въведете име или код на продукт..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Резултати от търсенето */}
              {searchTerm && filteredProducts.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addProduct(product)}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{product.nameBg || product.nameEn}</div>
                      <div className="text-sm text-gray-600">
                        Код: {product.code} | Цена: {product.price} лв.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Списък с добавени продукти */}
            {products.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Добавени продукти:</h4>
                {products.map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="font-medium text-gray-900">{product.productName}</h5>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-3 text-sm">
                      {/* 1. Количество */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Количество
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={product.quantity}
                          onChange={(e) => updateProduct(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>

                      {/* 2. Фира */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Фира (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={product.wastage}
                          onChange={(e) => updateProduct(index, 'wastage', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>

                      {/* 3. Количество след фира */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Количество след фира
                        </label>
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {calculateQuantityAfterWastage(product.quantity, product.wastage).toFixed(2)}
                        </div>
                      </div>

                      {/* 4. Единична цена */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Ед. цена
                        </label>
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {product.unitPrice.toFixed(2)} лв.
                        </div>
                      </div>

                      {/* 5. Отстъпка */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Отстъпка (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={product.discount}
                          onChange={(e) => updateProduct(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>

                      {/* 6. Крайна цена */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Крайна цена
                        </label>
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                          {calculateFinalPrice(product.unitPrice, product.discount).toFixed(2)} лв.
                        </div>
                      </div>

                      {/* 7. Обща сума */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Обща сума
                        </label>
                        <div className="px-2 py-1 bg-blue-100 rounded text-xs font-bold text-blue-800">
                          {calculateTotalAmount(product).toFixed(2)} лв.
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Бутони */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Създаване...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Създай стая
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 