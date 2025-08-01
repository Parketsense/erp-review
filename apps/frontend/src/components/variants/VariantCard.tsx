'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  Copy, 
  Trash2, 
  CheckCircle,
  Circle,
  Users,
  Home,
  Package,
  DollarSign,
  Percent,
  Star,
  Calendar,
  User,
  Plus
} from 'lucide-react';
import { PhaseVariant, VariantRoom } from '@/types/variant';
import RoomCreateModal from '../rooms/RoomCreateModal';

interface VariantCardProps {
  variant: PhaseVariant;
  onEdit: (variantId: string) => void;
  onDuplicate: (variantId: string) => void;
  onDelete: (variantId: string) => void;
  onToggleSelection: (variantId: string) => void;
  onRoomEdit: (roomId: string) => void;
  onRoomDuplicate: (roomId: string) => void;
  onRoomDelete: (roomId: string) => void;
  calculateVariantTotal: (variantId: string) => number;
  formatCurrency: (amount: number) => string;
  onCreateRoom: () => void;
}

const VariantCard: React.FC<VariantCardProps> = ({
  variant,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleSelection,
  onRoomEdit,
  onRoomDuplicate,
  onRoomDelete,
  calculateVariantTotal,
  formatCurrency,
  onCreateRoom
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [rooms, setRooms] = useState(variant.rooms || []);

  // Обновявай rooms, ако variant.rooms се промени отвън
  React.useEffect(() => {
    setRooms(variant.rooms || []);
  }, [variant.rooms]);

  const handleRoomCreated = async () => {
    try {
      const res = await fetch(`/api/rooms/variant/${variant.id}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data.data);
        if (variant.rooms) {
          variant.rooms = data.data;
        }
      }
    } catch (e) {
      console.error('Failed to refresh rooms:', e);
    }
  };

  const toggleRoomExpansion = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const variantTotal = calculateVariantTotal(variant.id);
  const roomCount = variant.rooms?.length || 0;
  const productCount = variant.rooms?.reduce((sum, room) => sum + (room.products?.length || 0), 0) || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.98] transform">
      {/* Variant Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleSelection(variant.id)}
              className={`p-2 rounded-lg transition-colors ${
                variant.isSelected 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {variant.isSelected ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              {variant.isSelected && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {variant.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Variant Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Home className="w-4 h-4" />
            <span>{roomCount} стаи</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Package className="w-4 h-4" />
            <span>{productCount} продукти</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">{formatCurrency(variantTotal)}</span>
          </div>
          {variant.architectCommission && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Percent className="w-4 h-4" />
              <span>{variant.architectCommission}% комисия</span>
            </div>
          )}
        </div>

        {/* Variant Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {variant.designer && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>Дизайнер: {variant.designer}</span>
              </div>
            )}
            {variant.architect && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>Архитект: {variant.architect}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={onCreateRoom}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              title="Създай нова стая"
            >
              <Plus className="w-4 h-4" />
              <span>Създай стая</span>
            </button>
            <button
              onClick={() => onEdit(variant.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Редактирай вариант"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(variant.id)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              title="Дублирай вариант"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(variant.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Изтрий вариант"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">Стаи в варианта</h4>
              <button
                onClick={onCreateRoom}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-200"
                title="Създай нова стая"
              >
                <Plus className="w-3 h-3" />
                <span>Добави стая</span>
              </button>
            </div>
            
            {rooms && rooms.length > 0 ? (
              <div className="space-y-3">
                {rooms.map((room) => {
                  const roomTotal = room.products?.reduce((sum, product) => {
                    return sum + (product.quantity * product.unitPrice * (1 - (product.discount || 0) / 100));
                  }, 0) || 0;
                  const isRoomExpanded = expandedRooms.has(room.id);

                  return (
                    <div key={room.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {/* Room Header - Non-clickable area with buttons */}
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <h5 className="font-medium text-gray-900">{room.name}</h5>
                            {room.area && (
                              <span className="text-sm text-gray-500">({room.area} м²)</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="text-sm text-gray-600">
                              {room.products?.length || 0} продукти
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(roomTotal)}
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => onRoomEdit(room.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                                title="Редактирай стая"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onRoomDuplicate(room.id)}
                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                                title="Клонирай стая"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onRoomDelete(room.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                                title="Изтрий стая"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clickable area for expansion - only the left part with chevron */}
                      <div 
                        className="border-t border-gray-100 cursor-pointer active:scale-[0.98] transform transition-all duration-200"
                        onClick={() => toggleRoomExpansion(room.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-1 text-gray-400">
                              {isRoomExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                            <span className="text-sm text-gray-600">Кликнете за разгъване/сгъване</span>
                          </div>
                        </div>
                      </div>

                      {/* Room Products */}
                      {isRoomExpanded && room.products && room.products.length > 0 && (
                        <div className="border-t border-gray-100 bg-gray-50">
                          <div className="p-4">
                            <h6 className="text-sm font-medium text-gray-700 mb-3">Продукти в стаята</h6>
                            <div className="space-y-3">
                              {room.products.map((product) => {
                                // Calculate values
                                const quantityAfterWaste = product.quantity * (1 + (product.wastePercent || 0) / 100);
                                const discountToUse = product.discount !== undefined ? product.discount : (variant.variantDiscount || 0);
                                const unitPriceAfterDiscount = product.unitPrice * (1 - discountToUse / 100);
                                const productTotal = quantityAfterWaste * unitPriceAfterDiscount;
                                
                                return (
                                  <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                                      {/* Product Name */}
                                      <div className="col-span-2 md:col-span-1">
                                        <div className="font-medium text-gray-900 truncate" title={product.product?.nameBg || 'Неизвестен продукт'}>
                                          {product.product?.nameBg || 'Неизвестен продукт'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {product.product?.code || 'Няма код'}
                                        </div>
                                      </div>
                                      
                                      {/* Quantity */}
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium">Количество</div>
                                        <div className="font-medium text-gray-900">
                                          {product.quantity?.toFixed(2) || '0.00'}
                                        </div>
                                      </div>
                                      
                                      {/* Waste Factor */}
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium">Фира %</div>
                                        <div className="font-medium text-gray-900">
                                          {(product.wastePercent || 0).toFixed(1)}%
                                        </div>
                                      </div>
                                      
                                      {/* Quantity After Waste */}
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium">Кол. след фира</div>
                                        <div className="font-medium text-gray-900">
                                          {quantityAfterWaste.toFixed(2)}
                                        </div>
                                      </div>
                                      
                                      {/* Unit Price */}
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium">Ед. цена</div>
                                        <div className="font-medium text-gray-900">
                                          {formatCurrency(product.unitPrice || 0)}
                                        </div>
                                      </div>
                                      
                                      {/* Discount */}
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium">
                                          Отстъпка
                                          {product.discount !== undefined && (
                                            <span className="text-blue-600 ml-1">(override)</span>
                                          )}
                                        </div>
                                        <div className="font-medium text-gray-900">
                                          {discountToUse.toFixed(1)}%
                                        </div>
                                      </div>
                                      
                                      {/* Unit Price After Discount */}
                                      <div>
                                        <div className="text-xs text-gray-500 font-medium">Ед. цена след отстъпка</div>
                                        <div className="font-medium text-gray-900">
                                          {formatCurrency(unitPriceAfterDiscount)}
                                        </div>
                                      </div>
                                      
                                      {/* Total for Product */}
                                      <div className="col-span-2 md:col-span-1">
                                        <div className="text-xs text-gray-500 font-medium">Обща сума</div>
                                        <div className="font-bold text-green-600">
                                          {formatCurrency(productTotal)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Room Total */}
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Обща сума за стаята:</span>
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency(room.products.reduce((total, product) => {
                                    const quantityAfterWaste = product.quantity * (1 + (product.wastePercent || 0) / 100);
                                    const discountToUse = product.discount !== undefined ? product.discount : (variant.variantDiscount || 0);
                                    const unitPriceAfterDiscount = product.unitPrice * (1 - discountToUse / 100);
                                    return total + (quantityAfterWaste * unitPriceAfterDiscount);
                                  }, 0))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-4">Няма създадени стаи в този вариант</p>
                <button
                  onClick={onCreateRoom}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Създай първата стая</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RoomCreateModal */}
      {/* Премахнато - вече се управлява глобално */}
    </div>
  );
};

export default VariantCard; 