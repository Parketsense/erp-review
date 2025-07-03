'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Search, Package, Save, AlertCircle, CheckCircle, Percent, Edit3, Trash2, Eye } from 'lucide-react';
import { roomProductsApi, type CreateRoomProductDto, type RoomProduct, type UpdateRoomProductDto } from '@/services/roomProductsApi';
import { productsApi } from '@/services/productsApi';
import { roomsApi } from '@/services/roomsApi';
import { type Product } from '@/types/product';
import { type VariantRoom } from '@/types/room';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  onProductAdded: () => void;
  mode?: 'add' | 'edit';
}

interface ProductInCart {
  id: string; // Временно ID за списъка
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountEnabled: boolean;
  wastePercent: number;
  overrides: {
    quantity?: boolean;
    unitPrice?: boolean;
    discount?: boolean;
    wastePercent?: boolean;
  };
}

export default function AddProductModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  onProductAdded,
  mode = 'add',
}: AddProductModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Cart state
  const [productsInCart, setProductsInCart] = useState<ProductInCart[]>([]);
  const [nextId, setNextId] = useState(1);
  
  // Modal state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [addedProductsCount, setAddedProductsCount] = useState(0);
  
  // Room and existing products state
  const [room, setRoom] = useState<VariantRoom | null>(null);
  const [existingProducts, setExistingProducts] = useState<RoomProduct[]>([]);
  const [loadingExistingProducts, setLoadingExistingProducts] = useState(false);
  const [showExistingProducts, setShowExistingProducts] = useState(false);
  const [editingExistingProducts, setEditingExistingProducts] = useState<Record<string, RoomProduct>>({});

  // Initialize modal state
  useEffect(() => {
    if (isOpen) {
      resetModal();
      loadRoomData();
      if (mode === 'edit') {
        loadExistingProducts();
        setShowExistingProducts(true);
      }
    }
  }, [isOpen, roomId, mode]);

  const resetModal = () => {
    setSearchQuery('');
    setSearchResults([]);
    setProductsInCart([]);
    setNextId(1);
    setError(null);
    setSuccess(false);
    setAddedProductsCount(0);
    setExistingProducts([]);
    setEditingExistingProducts({});
    setShowExistingProducts(false);
  };

  const loadRoomData = async () => {
    try {
      setLoading(true);
      const roomData = await roomsApi.getRoomById(roomId);
      setRoom(roomData);
    } catch (err) {
      console.error('Failed to load room data:', err);
      setError('Неуспешно зареждане на данните за стаята');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingProducts = async () => {
    try {
      setLoadingExistingProducts(true);
      const response = await roomProductsApi.getRoomProducts(roomId);
      setExistingProducts(response.data);
      
      // Initialize editing state for existing products
      const editingState: Record<string, RoomProduct> = {};
      response.data.forEach(product => {
        editingState[product.id] = { ...product };
      });
      setEditingExistingProducts(editingState);
    } catch (err) {
      console.error('Failed to load existing products:', err);
      setError('Неуспешно зареждане на съществуващите продукти');
    } finally {
      setLoadingExistingProducts(false);
    }
  };

  // Update existing product field
  const updateExistingProduct = (productId: string, field: keyof RoomProduct, value: any) => {
    setEditingExistingProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  // Save changes to existing product
  const saveExistingProduct = async (productId: string) => {
    try {
      const editedProduct = editingExistingProducts[productId];
      if (!editedProduct) return;

      const updateData: UpdateRoomProductDto = {
        quantity: editedProduct.quantity,
        unitPrice: editedProduct.unitPrice,
        discount: editedProduct.discount,
        discountEnabled: editedProduct.discountEnabled,
        wastePercent: editedProduct.wastePercent,
      };

      await roomProductsApi.updateRoomProduct(productId, updateData);
      
      // Update the existing products list
      setExistingProducts(prev => 
        prev.map(p => p.id === productId ? editedProduct : p)
      );
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to update product:', err);
      setError('Неуспешно запазване на промените');
    }
  };

  // Delete existing product
  const deleteExistingProduct = async (productId: string) => {
    if (!confirm('Сигурни ли сте, че искате да премахнете този продукт от стаята?')) {
      return;
    }

    try {
      await roomProductsApi.deleteRoomProduct(productId);
      
      // Remove from existing products list
      setExistingProducts(prev => prev.filter(p => p.id !== productId));
      delete editingExistingProducts[productId];
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      onProductAdded(); // Trigger refresh
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Неуспешно изтриване на продукта');
    }
  };

  // Calculate totals for existing product
  const calculateExistingProductTotal = (product: RoomProduct) => {
    const baseTotal = product.quantity * product.unitPrice;
    const discountAmount = product.discountEnabled && product.discount 
      ? baseTotal * (product.discount / 100) 
      : 0;
    const afterDiscount = baseTotal - discountAmount;
    const wasteAmount = product.wastePercent 
      ? afterDiscount * (product.wastePercent / 100)
      : 0;
    return afterDiscount + wasteAmount;
  };

  const loadProducts = async (search?: string) => {
    try {
      setIsSearching(true);
      setError(null);
      const response = await productsApi.getAll({
        limit: 100,
        search: search || searchQuery,
      });
      setSearchResults(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setSearchQuery(search);
      if (search.trim()) {
        loadProducts(search);
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const addProductToCart = (product: Product) => {
    // Check if product already in cart
    const existingInCart = productsInCart.find(item => item.product.id === product.id);
    if (existingInCart) {
      setError(`Продуктът "${product.nameBg}" вече е добавен в списъка`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if product already exists in room
    const existingInRoom = existingProducts.find(item => item.productId === product.id);
    if (existingInRoom) {
      setError(`Продуктът "${product.nameBg}" вече съществува в тази стая`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    const defaultQuantity = room?.area || 1;

    const newProductInCart: ProductInCart = {
      id: `temp-${nextId}`,
      product,
      quantity: defaultQuantity,
      unitPrice: product.saleBgn || product.costBgn || 0,
      discount: room?.discountEnabled && room?.discount !== undefined ? room.discount : 0,
      discountEnabled: room?.discountEnabled || false,
      wastePercent: room?.wastePercent || 10,
      overrides: {
        // Mark quantity as override only if it's different from default (1)
        quantity: defaultQuantity !== 1
      }
    };

    setProductsInCart(prev => [...prev, newProductInCart]);
    setNextId(prev => prev + 1);
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeProductFromCart = (id: string) => {
    setProductsInCart(prev => prev.filter(item => item.id !== id));
  };

  const updateProductInCart = (id: string, field: keyof ProductInCart, value: any) => {
    setProductsInCart(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Mark as override if it's not the default value
        const defaultQuantity = room?.area || 1;
        if (field === 'quantity' && value !== defaultQuantity) {
          updated.overrides.quantity = true;
        } else if (field === 'quantity' && value === defaultQuantity) {
          updated.overrides.quantity = false;
        } else if (field === 'unitPrice' && value !== (item.product.saleBgn || item.product.costBgn || 0)) {
          updated.overrides.unitPrice = true;
        } else if (field === 'unitPrice' && value === (item.product.saleBgn || item.product.costBgn || 0)) {
          updated.overrides.unitPrice = false;
        } else if (field === 'discount' && value !== (room?.discount || 0)) {
          updated.overrides.discount = true;
        } else if (field === 'discount' && value === (room?.discount || 0)) {
          updated.overrides.discount = false;
        } else if (field === 'wastePercent' && value !== (room?.wastePercent || 10)) {
          updated.overrides.wastePercent = true;
        } else if (field === 'wastePercent' && value === (room?.wastePercent || 10)) {
          updated.overrides.wastePercent = false;
        }

        return updated;
      }
      return item;
    }));
  };

  const calculateProductTotal = (item: ProductInCart) => {
    const baseTotal = item.quantity * item.unitPrice;
    const discountAmount = item.discountEnabled && item.discount 
      ? baseTotal * (item.discount / 100) 
      : 0;
    const afterDiscount = baseTotal - discountAmount;
    const wasteAmount = item.wastePercent 
      ? afterDiscount * (item.wastePercent / 100)
      : 0;
    return afterDiscount + wasteAmount;
  };

  const calculateGrandTotal = () => {
    return productsInCart.reduce((total, item) => total + calculateProductTotal(item), 0);
  };

  const calculateExistingTotal = () => {
    return existingProducts.reduce((total, item) => total + calculateExistingProductTotal(item), 0);
  };

  const handleSaveAll = async () => {
    if (productsInCart.length === 0) {
      setError('Добавете поне един продукт');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Save all products
      for (const item of productsInCart) {
        const productData: CreateRoomProductDto = {
          roomId,
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          discountEnabled: item.discountEnabled,
          wastePercent: item.wastePercent,
        };

        await roomProductsApi.addProductToRoom(productData);
      }

      setSuccess(true);
      setAddedProductsCount(productsInCart.length);
      onProductAdded(); // Refresh parent component
      
      // Show success message briefly, then close
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save products');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const modalTitle = mode === 'edit' 
    ? `Редактирай продукти в стая: ${roomName}`
    : `Добави продукти в стая: ${roomName}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {modalTitle}
            </h2>
            {room && (
              <p className="text-sm text-gray-600 mt-1">
                {room.area && `Площ: ${room.area} ${room.area > 1 ? 'кв.м' : 'кв.м'}`}
                {room.discount && room.discountEnabled && ` • Отстъпка: ${room.discount}%`}
                {room.wastePercent && ` • Отпадък: ${room.wastePercent}%`}
              </p>
            )}
            {addedProductsCount > 0 && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Добавени {addedProductsCount} продукт{addedProductsCount === 1 ? '' : 'а'} в тази сесия
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Промените са запазени успешно!
            </div>
          )}

          {/* Existing Products Section - Always visible in edit mode */}
          {mode === 'edit' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Съществуващи продукти в стаята
                </h3>
                <span className="text-sm text-gray-500">
                  {existingProducts.length} продукта
                </span>
              </div>
              
              {loadingExistingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : existingProducts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Няма продукти в тази стая</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {existingProducts.map((product) => {
                    const editedProduct = editingExistingProducts[product.id] || product;
                    return (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                        {/* Product Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {product.product?.nameBg || 'Неизвестен продукт'}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Код: {product.product?.code} • {product.product?.manufacturer?.displayName}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveExistingProduct(product.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Запази
                            </button>
                            <button
                              onClick={() => deleteExistingProduct(product.id)}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {/* Quantity */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Количество {room?.area && '(к.м.)'}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editedProduct.quantity || ''}
                              onChange={(e) => updateExistingProduct(product.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>

                          {/* Unit Price */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Ед. цена (лв.)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editedProduct.unitPrice || ''}
                              onChange={(e) => updateExistingProduct(product.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>

                          {/* Discount */}
                          <div>
                            <div className="flex items-center mb-1">
                              <input
                                type="checkbox"
                                checked={editedProduct.discountEnabled || false}
                                onChange={(e) => updateExistingProduct(product.id, 'discountEnabled', e.target.checked)}
                                className="mr-1"
                              />
                              <label className="text-xs font-medium text-gray-700">
                                Отстъпка (%)
                              </label>
                            </div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={editedProduct.discount || ''}
                              onChange={(e) => updateExistingProduct(product.id, 'discount', parseFloat(e.target.value) || 0)}
                              disabled={!editedProduct.discountEnabled}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                            />
                          </div>

                          {/* Waste Percent */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Отпадък (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={editedProduct.wastePercent || ''}
                              onChange={(e) => updateExistingProduct(product.id, 'wastePercent', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>

                          {/* Total */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Общо (лв.)
                            </label>
                            <div className="px-2 py-1 bg-gray-100 border rounded text-sm font-medium">
                              {calculateExistingProductTotal(editedProduct).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Existing Products Toggle (for add mode) */}
          {mode === 'add' && (
            <div className="mb-6">
              <button
                onClick={() => {
                  if (!showExistingProducts && existingProducts.length === 0) {
                    loadExistingProducts();
                  }
                  setShowExistingProducts(!showExistingProducts);
                }}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Eye className="w-4 h-4 mr-1" />
                {showExistingProducts ? 'Скрий' : 'Покажи'} съществуващи продукти
              </button>
            </div>
          )}

          {/* Show existing products in add mode when toggled */}
          {mode === 'add' && showExistingProducts && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Съществуващи продукти в стаята ({existingProducts.length})
              </h3>
              {loadingExistingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : existingProducts.length === 0 ? (
                <p className="text-sm text-gray-500">Няма добавени продукти</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {existingProducts.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.product?.nameBg || 'Неизвестен продукт'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Код: {item.product?.code} • {item.product?.manufacturer?.displayName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {item.quantity} × {item.unitPrice.toFixed(2)} лв.
                          </div>
                          <div className="text-xs text-gray-500">
                            Общо: {calculateExistingProductTotal(item).toFixed(2)} лв.
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Общо за съществуващите продукти:</span>
                      <span className="text-lg font-bold text-green-600">
                        {existingProducts.reduce((sum, item) => sum + calculateExistingProductTotal(item), 0).toFixed(2)} лв.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add New Products Section - Always visible */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {mode === 'edit' ? 'Добави нови продукти' : 'Търси и добавяй продукти'}
            </h3>

            {/* Search Section */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Търси продукти..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="mt-4 flex items-center justify-center py-8">
                  <LoadingSpinner />
                </div>
              )}

              {searchError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {searchError}
                </div>
              )}

              {/* Search Results Display */}
              {searchResults.length > 0 && (
                <div className="mt-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => addProductToCart(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.nameBg}</h4>
                          <p className="text-sm text-gray-500">
                            Код: {product.code} • {product.manufacturer?.displayName}
                          </p>
                          <p className="text-sm font-medium text-green-600">
                            {product.saleBgn ? `${product.saleBgn.toFixed(2)} лв.` : 'Без цена'}
                          </p>
                        </div>
                        <button className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                          Добави
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products in Cart */}
            {productsInCart.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Продукти за добавяне ({productsInCart.length})
                </h4>

                {productsInCart.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                    {/* Product Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.product.nameBg}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Код: {item.product.code} • {item.product.manufacturer?.displayName}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProductFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Product Fields */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {/* Quantity */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Количество {room?.area && '(к.м.)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateProductInCart(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Ед. цена (лв.)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateProductInCart(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      {/* Discount */}
                      <div>
                        <div className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            checked={item.discountEnabled}
                            onChange={(e) => updateProductInCart(item.id, 'discountEnabled', e.target.checked)}
                            className="mr-1"
                          />
                          <label className="text-xs font-medium text-gray-700">
                            Отстъпка (%)
                          </label>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.discount}
                          onChange={(e) => updateProductInCart(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          disabled={!item.discountEnabled}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                        />
                      </div>

                      {/* Waste Percent */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Отпадък (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.wastePercent}
                          onChange={(e) => updateProductInCart(item.id, 'wastePercent', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>

                      {/* Total */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Общо (лв.)
                        </label>
                        <div className="px-2 py-1 bg-gray-100 border rounded text-sm font-medium">
                          {calculateProductTotal(item).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Cart Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Общо за новите продукти:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {calculateGrandTotal().toFixed(2)} лв.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {mode === 'edit' 
                ? `${existingProducts.length} съществуващи продукта`
                : 'Избери продукти и натисни "Запази всички"'
              }
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {mode === 'edit' ? 'Затвори' : 'Отказ'}
              </button>
              
              {/* Show Save button only for new products in cart */}
              {productsInCart.length > 0 && (
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Запазване...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Запази всички ({productsInCart.length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Debounce function
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