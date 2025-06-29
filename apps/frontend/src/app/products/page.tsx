'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, ArrowLeft, Edit, Trash2, MoreVertical, Factory, Tag, Eye, Image, FileText, Calendar, Power, EyeOff } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useLoading } from '../../components/LoadingProvider';
import { apiClient } from '../../lib/api';
import ProductCreateModal from '../../components/products/ProductCreateModal';

interface Manufacturer {
  displayName: string;
  colorCode?: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  manufacturer?: Manufacturer;
  attributes: Record<string, any>;
  mediaFiles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading('products');

  const loadProducts = async () => {
    try {
      showLoading('Зареждане на продукти...');
      const params = showInactive ? '?includeInactive=true' : '';
      const response = await apiClient.get(`/products${params}`);
      console.log('🔍 Products API response:', response);
      
      // Handle the API response structure correctly
      if (response.success && response.data) {
        setProducts(response.data || []);
        console.log('✅ Products loaded:', response.data.length);
      } else {
        console.error('❌ Invalid products response:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setProducts([]);
    } finally {
      hideLoading();
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      showLoading('Създаване на продукт...');
      const response = await apiClient.post('/products', productData);
      
      if (response.success) {
        // Reload products list
        await loadProducts();
        alert('Продуктът беше създаден успешно!');
      } else {
        throw new Error(response.message || 'Грешка при създаването');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Възникна грешка при създаването на продукта');
    } finally {
      hideLoading();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този продукт?')) {
      return;
    }
    
    try {
      showLoading('Изтриване...');
      await apiClient.delete(`/products/${productId}`);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Грешка при изтриването на продукта');
    } finally {
      hideLoading();
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'деактивирате' : 'активирате';
    if (!confirm(`Сигурни ли сте, че искате да ${action} този продукт?`)) {
      return;
    }
    
    try {
      showLoading(`${currentStatus ? 'Деактивиране' : 'Активиране'}...`);
      await apiClient.patch(`/products/${productId}/toggle-active`);
      await loadProducts();
      setDropdownOpen(null);
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert(`Грешка при ${currentStatus ? 'деактивирането' : 'активирането'} на продукта`);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadProducts();
  }, [showInactive]);

  const filteredProducts = products.filter(product => {
    const name = product.name || '';
    const code = product.code || '';
    const manufacturerName = product.manufacturer?.displayName || '';
    const description = product.description || '';
    const searchLower = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(searchLower) ||
           code.toLowerCase().includes(searchLower) ||
           manufacturerName.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower);
  });

  const uniqueManufacturers = Array.from(new Set(
    products
      .map(p => p.manufacturer?.displayName || '')
      .filter(m => m)
  ));

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive !== false);
  const inactiveProducts = products.filter(p => p.isActive === false);
  const withMediaCount = activeProducts.filter(p => p.mediaFiles && p.mediaFiles.length > 0).length;
  const withAttributesCount = activeProducts.filter(p => p.attributes && Object.keys(p.attributes).length > 0).length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </Link>
                <div className="text-xl font-bold tracking-wide">PARKETSENSE</div>
              </div>
              <div className="text-sm text-gray-300">
                Система за управление на продукти
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">Продукти</h1>
            <p className="text-gray-600">Управление на каталога продукти</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Общо продукти</p>
                  <p className="text-2xl font-bold text-gray-900">{activeProducts.length}</p>
                  {showInactive && inactiveProducts.length > 0 && (
                    <p className="text-sm text-gray-500">+{inactiveProducts.length} неактивни</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Factory className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Производители</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueManufacturers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">С медия</p>
                  <p className="text-2xl font-bold text-gray-900">{withMediaCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Tag className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">С атрибути</p>
                  <p className="text-2xl font-bold text-gray-900">{withAttributesCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Add */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Търси по име, код, производител..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`px-4 py-3 rounded-lg flex items-center gap-2 border transition-colors ${
                    showInactive 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={showInactive ? 'Скрий деактивираните' : 'Покажи деактивираните'}
                >
                  <EyeOff className="w-5 h-5" />
                  {showInactive ? 'Скрий деактивирани' : 'Покажи деактивирани'}
                </button>
              </div>
              
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Нов продукт
              </button>
            </div>

            {searchTerm && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Намерени {filteredProducts.length} от {totalProducts} продукти
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-blue-600 underline hover:text-blue-800"
                    >
                      Изчисти търсенето
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Products List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Списък продукти ({filteredProducts.length})
              </h3>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Няма намерени продукти' : 'Няма продукти'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Опитайте с различни ключови думи за търсене'
                    : 'Добавете първия си продукт за да започнете'
                  }
                </p>
                {!searchTerm && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Добави продукт
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <div key={product.id} className={`p-6 hover:bg-gray-50 transition-colors ${!product.isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Product Icon */}
                          <div className={`w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg ${!product.isActive ? 'grayscale' : ''}`}>
                            {product.name?.charAt(0) || 'P'}
                          </div>

                          <div className="flex-1">
                            {/* Name and Code */}
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {product.name}
                              </h4>
                              {!product.isActive && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  <Power className="w-3 h-3" />
                                  Деактивиран
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                <Tag className="w-3 h-3" />
                                {product.code}
                              </span>
                              {product.mediaFiles && product.mediaFiles.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                  <Image className="w-3 h-3" />
                                  {product.mediaFiles.length} файла
                                </span>
                              )}
                            </div>

                            {/* Manufacturer */}
                            {product.manufacturer && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Factory className="w-4 h-4 text-gray-600" />
                                  <p className="font-medium text-gray-900">{product.manufacturer.displayName}</p>
                                </div>
                              </div>
                            )}

                            {/* Description */}
                            {product.description && (
                              <div className="mb-3 text-sm text-gray-600 line-clamp-2">
                                {product.description}
                              </div>
                            )}

                            {/* Attributes Info */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              {product.attributes && Object.keys(product.attributes).length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  <span>{Object.keys(product.attributes).length} атрибута</span>
                                </div>
                              )}
                              {product.mediaFiles && product.mediaFiles.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  <span>{product.mediaFiles.length} медийни файла</span>
                                </div>
                              )}
                            </div>

                            {/* Creation Info */}
                            <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Създаден на {new Date(product.createdAt).toLocaleDateString('bg-BG')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 relative ml-4">
                        <button 
                          onClick={() => setDropdownOpen(dropdownOpen === product.id ? null : product.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {dropdownOpen === product.id && (
                          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  console.log('Edit product:', product.id);
                                  setDropdownOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                                Редактирай
                              </button>
                              <button
                                onClick={() => {
                                  console.log('View product:', product.id);
                                  setDropdownOpen(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <Eye className="w-4 h-4" />
                                Преглед
                              </button>
                              <button
                                onClick={() => handleToggleActive(product.id, product.isActive)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <Power className="w-4 h-4" />
                                {product.isActive ? 'Деактивирай' : 'Активирай'}
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Изтрий
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Product Modal */}
        <ProductCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateProduct}
        />

        {/* Click outside to close dropdown */}
        {dropdownOpen && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setDropdownOpen(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
} 