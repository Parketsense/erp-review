'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Package, Plus, AlertCircle, CheckCircle, Percent } from 'lucide-react';
import { roomProductsApi, type CreateRoomProductDto } from '@/services/roomProductsApi';
import { productsApi } from '@/services/productsApi';
import { roomsApi } from '@/services/roomsApi';
import { type Product } from '@/types/product';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  onProductAdded: () => void;
}

interface Room {
  id: string;
  name: string;
  discount?: number;
  discountEnabled?: boolean;
}

interface ProductSelection {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountEnabled: boolean;
  wastePercent: number;
}

export default function AddProductModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  onProductAdded,
}: AddProductModalProps) {
  // Room and product data
  const [room, setRoom] = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Omit<CreateRoomProductDto, 'roomId' | 'productId'>>({
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    discountEnabled: true,
    wastePercent: 10,
  });
  
  // UI state
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load room information when modal opens
  useEffect(() => {
    if (isOpen && roomId) {
      loadRoomInfo();
      resetForm();
    }
  }, [isOpen, roomId]);

  const loadRoomInfo = async () => {
    try {
      setLoadingRoom(true);
      const roomData = await roomsApi.getRoomById(roomId);
      setRoom(roomData);
    } catch (err) {
      console.error('Failed to load room:', err);
      // Don't show error to user, room info is optional
    } finally {
      setLoadingRoom(false);
    }
  };

  const loadProducts = async (search?: string) => {
    try {
      setProductsLoading(true);
      setError(null);
      const response = await productsApi.getAll({
        limit: 100,
        search: search || searchTerm,
      });
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setSearchTerm(search);
      if (search.trim()) {
        loadProducts(search);
      } else {
        setProducts([]);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setProducts([]);
    setFormData({
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      discountEnabled: true,
      wastePercent: 10,
    });
    setStep('select');
    setError(null);
    setSuccess(false);
    setSearchTerm('');
    setSearchInput('');
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      unitPrice: product.saleBgn || product.costBgn || 0,
      // Auto-populate discount from room when product is selected
      discount: room?.discountEnabled && room?.discount !== undefined 
        ? room.discount 
        : 0,
      discountEnabled: true,
    }));
    setStep('configure');
  };

  const handleFormChange = (field: keyof typeof formData, value: number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDiscountEnabledChange = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      discountEnabled: enabled,
      // Auto-populate discount from room when enabling discount
      discount: enabled && room?.discount !== undefined 
        ? room.discount 
        : (enabled ? 0 : 0)
    }));
  };

  const calculateTotal = () => {
    const baseTotal = formData.quantity * formData.unitPrice;
    const discountAmount = formData.discountEnabled && formData.discount 
      ? baseTotal * (formData.discount / 100) 
      : 0;
    const afterDiscount = baseTotal - discountAmount;
    const wasteAmount = formData.wastePercent 
      ? afterDiscount * (formData.wastePercent / 100)
      : 0;
    return afterDiscount + wasteAmount;
  };

  const handleSubmit = async () => {
    if (!selectedProduct) return;

    try {
      setLoading(true);
      setError(null);

      const productData: CreateRoomProductDto = {
        roomId,
        productId: selectedProduct.id,
        ...formData,
      };

      await roomProductsApi.addProductToRoom(productData);
      setSuccess(true);
      
      // Auto-close after success
      setTimeout(() => {
        onProductAdded();
        onClose();
      }, 1500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setStep('select');
    setSelectedProduct(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Добави продукт в стая: {roomName}
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
                Продуктът е добавен успешно!
              </h3>
              <p className="text-gray-600">
                Стаята сега съдържа новия продукт.
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
            <>
              {/* Step 1: Product Selection */}
              {step === 'select' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Избери продукт
                    </h3>
                    
                    {/* Search */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Търси продукт по име или код..."
                        value={searchInput}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => handleSearchChange(e.target.value)}
                      />
                    </div>

                    {/* Products Loading */}
                    {productsLoading && (
                      <div className="flex items-center justify-center py-8">
                        <LoadingSpinner />
                      </div>
                    )}

                    {/* Products List */}
                    {!productsLoading && (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {!searchInput ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Започнете да търсите продукт
                            </h4>
                            <p className="text-gray-500">
                              Въведете име, код или производител за търсене на продукти
                            </p>
                          </div>
                        ) : products.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                              Няма намерени продукти
                            </h4>
                            <p className="text-gray-500">
                              Опитайте с различни ключови думи
                            </p>
                          </div>
                        ) : (
                          products.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleProductSelect(product)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {product.nameBg}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      Код: {product.code} • {product.manufacturer?.displayName}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {product.saleBgn?.toFixed(2) || 'N/A'} лв.
                                </p>
                                <p className="text-sm text-gray-500">
                                  за {product.unit}
                                </p>
                              </div>
                              <Plus className="w-5 h-5 text-gray-400 ml-4" />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Configure Product */}
              {step === 'configure' && selectedProduct && (
                <div className="space-y-6">
                  {/* Selected Product Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {selectedProduct.nameBg}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Код: {selectedProduct.code} • {selectedProduct.manufacturer?.displayName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Количество ({selectedProduct.unit}) *
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.quantity}
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
                        value={formData.unitPrice}
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
                          checked={formData.discountEnabled}
                          onChange={(e) => handleDiscountEnabledChange(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="discountEnabled" className="text-sm font-medium text-gray-700">
                          Прилагане на отстъпка (%)
                          {room?.discount !== undefined && room.discount > 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              (отстъпката на стаята: {room.discount}%)
                            </span>
                          )}
                        </label>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.discount}
                        onChange={(e) => handleFormChange('discount', parseFloat(e.target.value) || 0)}
                        disabled={!formData.discountEnabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                      {room?.discount !== undefined && room.discount > 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          Първоначално попълнено от стаята ({room.discount}%). Можете да промените стойността.
                        </p>
                      )}
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
                        value={formData.wastePercent}
                        onChange={(e) => handleFormChange('wastePercent', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Room Discount Info */}
                  {formData.discountEnabled && room?.discount !== undefined && room.discount > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Наследяване на отстъпка</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Отстъпката от {formData.discount}% е наследена от стаята "{roomName}". Можете да я промените за този конкретен продукт.
                      </p>
                    </div>
                  )}

                  {/* Price Calculation */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Изчисление на цена</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Основна сума:</span>
                        <span>{(formData.quantity * formData.unitPrice).toFixed(2)} лв.</span>
                      </div>
                      {formData.discountEnabled && (formData.discount || 0) > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Отстъпка ({formData.discount || 0}%):</span>
                          <span>-{((formData.quantity * formData.unitPrice) * ((formData.discount || 0) / 100)).toFixed(2)} лв.</span>
                        </div>
                      )}
                      {(formData.wastePercent || 0) > 0 && (
                        <div className="flex justify-between text-yellow-600">
                          <span>Отпадък ({formData.wastePercent || 0}%):</span>
                          <span>+{(((formData.quantity * formData.unitPrice) - (formData.discountEnabled && formData.discount ? (formData.quantity * formData.unitPrice) * ((formData.discount || 0) / 100) : 0)) * ((formData.wastePercent || 0) / 100)).toFixed(2)} лв.</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-medium border-t pt-2">
                        <span>Обща сума:</span>
                        <span>{calculateTotal().toFixed(2)} лв.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            {step === 'configure' && (
              <button
                onClick={handleBackToSelection}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Назад
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отказ
            </button>
            {step === 'configure' && (
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedProduct || formData.quantity <= 0 || formData.unitPrice <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading && <LoadingSpinner />}
                Добави продукт
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 