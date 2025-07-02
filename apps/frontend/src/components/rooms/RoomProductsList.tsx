'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Calculator, Percent } from 'lucide-react';
import { roomProductsApi, type RoomProduct, type CreateRoomProductDto, type UpdateRoomProductDto } from '@/services/roomProductsApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';

interface RoomProductsListProps {
  roomId: string;
  roomName: string;
}

export default function RoomProductsList({ roomId, roomName }: RoomProductsListProps) {
  const [products, setProducts] = useState<RoomProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<RoomProduct | null>(null);

  // Load products when component mounts
  useEffect(() => {
    loadProducts();
  }, [roomId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomProductsApi.getRoomProducts(roomId);
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Сигурни ли сте, че искате да премахнете този продукт от стаята?')) {
      return;
    }

    try {
      await roomProductsApi.deleteRoomProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const calculateProductTotal = (product: RoomProduct) => {
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

  const calculateRoomTotal = () => {
    return products.reduce((sum, product) => sum + calculateProductTotal(product), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Продукти в стая: {roomName}
          </h3>
          <p className="text-sm text-gray-500">
            {products.length} {products.length === 1 ? 'продукт' : 'продукта'}
            {products.length > 0 && (
              <span className="ml-2">
                • Обща стойност: {calculateRoomTotal().toFixed(2)} лв.
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добави продукт
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Products List */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Няма добавени продукти
          </h3>
          <p className="text-gray-500 mb-4">
            Започнете да добавяте продукти в тази стая
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добави първия продукт
          </button>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Продукт
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Производител
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Количество
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ед. цена
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Отстъпка
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Отпадък
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Общо
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.product?.nameBg || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.product?.code || 'Без код'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.product?.manufacturer?.displayName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.quantity} {product.product?.unit || 'бр.'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.unitPrice.toFixed(2)} лв.
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.discountEnabled && product.discount ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {product.discount}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.wastePercent ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {product.wastePercent}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {calculateProductTotal(product).toFixed(2)} лв.
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Редактирай"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Изтрий"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Summary */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">
                Общо за стаята:
              </span>
              <span className="text-lg font-bold text-gray-900">
                {calculateRoomTotal().toFixed(2)} лв.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        roomId={roomId}
        roomName={roomName}
        onProductAdded={loadProducts}
      />

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProductModal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          onProductUpdated={loadProducts}
        />
      )}
    </div>
  );
} 