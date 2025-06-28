'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, ArrowLeft } from 'lucide-react';
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
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showLoading, hideLoading } = useLoading('products');

  const loadProducts = async () => {
    try {
      showLoading('Зареждане на продукти...');
      const response = await apiClient.get('/products');
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

  useEffect(() => {
    loadProducts();
  }, []);

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

  const filteredProducts = products.filter(product => {
    const name = product.name || '';
    const code = product.code || '';
    const manufacturerName = product.manufacturer?.displayName || '';
    
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           code.toLowerCase().includes(searchTerm.toLowerCase()) ||
           manufacturerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const uniqueManufacturers = Array.from(new Set(
    products
      .map(p => p.manufacturer?.displayName || '')
      .filter(m => m)
  ));

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/">
                <button className="p-2 bg-white border rounded-lg hover:bg-gray-50">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Продукти</h1>
                <p className="text-gray-600">Каталог продукти</p>
              </div>
            </div>

            {/* Search and Add */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Търси продукти..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Нов продукт
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Общо продукти</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Производители</p>
                  <p className="text-2xl font-bold">{uniqueManufacturers.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Намерени</p>
                  <p className="text-2xl font-bold">{filteredProducts.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">
                Списък продукти ({filteredProducts.length})
              </h3>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Няма продукти
                </h3>
                <p className="text-gray-600">
                  Добавете първия си продукт за да започнете
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                    <p className="text-gray-600 text-sm mb-1">Код: {product.code}</p>
                    {product.manufacturer && (
                      <p className="text-blue-600 text-sm mb-2">
                        {product.manufacturer.displayName}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{Object.keys(product.attributes || {}).length} атрибута</span>
                      <span>{product.mediaFiles?.length || 0} файла</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Product Modal */}
          <ProductCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateProduct}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
} 