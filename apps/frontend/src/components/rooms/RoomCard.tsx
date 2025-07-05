'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Home, 
  Package, 
  Image as ImageIcon, 
  Ruler, 
  Percent, 
  Edit2, 
  Trash2, 
  Copy,
  Calendar,
  Settings,
  ArrowRight
} from 'lucide-react';
import { VariantRoom } from '@/types/room';

interface RoomCardProps {
  room: VariantRoom;
  projectId: string;
  phaseId: string;
  variantId: string;
  onEdit: (room: VariantRoom) => void;
  onDelete: (roomId: string) => void;
  onDuplicate: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  projectId,
  phaseId,
  variantId,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = () => {
    const productCount = room._count?.products || 0;
    const imageCount = room._count?.images || 0;
    
    if (productCount > 0 && imageCount > 0) return 'bg-green-100 text-green-800';
    if (productCount > 0) return 'bg-blue-100 text-blue-800';
    if (imageCount > 0) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    const productCount = room._count?.products || 0;
    const imageCount = room._count?.images || 0;
    
    if (productCount > 0 && imageCount > 0) return 'Пълна';
    if (productCount > 0) return 'С продукти';
    if (imageCount > 0) return 'С изображения';
    return 'Празна';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {room.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
                <span className="text-sm text-gray-500">
                  Създадена {formatDate(room.createdAt)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDuplicate(room.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Дублирай стая"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(room)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Редактирай стая"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(room.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Изтрий стая"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {room.area && (
            <div className="flex items-center space-x-2">
              <Ruler className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{room.area} м²</p>
                <p className="text-xs text-gray-500">Площ</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{room._count?.products || 0}</p>
              <p className="text-xs text-gray-500">Продукти</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{room._count?.images || 0}</p>
              <p className="text-xs text-gray-500">Снимки</p>
            </div>
          </div>

          {room.discount && room.discount > 0 && (
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{room.discount}%</p>
                <p className="text-xs text-gray-500">Отстъпка</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link
            href={`/projects/${projectId}/phases/${phaseId}/variants/${variantId}/rooms/${room.id}/products`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="w-4 h-4 mr-2" />
            Управлявай продукти
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(room)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-1" />
              Настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard; 