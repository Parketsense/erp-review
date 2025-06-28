import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface Order {
  id: string;
  orderNumber: string;
  client: {
    firstName: string;
    lastName: string;
    companyName?: string;
  };
  project: {
    name: string;
  };
  variant: {
    name: string;
  };
  phase: {
    name: string;
  };
  orderDate: string;
  expectedDeliveryDate?: string;
  infoStatus: 'not_confirmed' | 'confirmed';
  paymentStatus: 'not_paid' | 'advance_paid' | 'fully_paid';
  deliveryStatus: 'pending' | 'partial' | 'completed';
  currentTotalAmountBgn: number;
  paidAmountBgn: number;
  remainingAmountBgn: number;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data - в реалност ще идва от API
  const allOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      client: {
        firstName: 'Иван',
        lastName: 'Сивков',
        companyName: 'Архитектурно студио Сивков ЕООД'
      },
      project: { name: 'Луксозен хол - София' },
      variant: { name: 'Вариант А - Дъбов паркет' },
      phase: { name: 'Фаза 1 - Основни материали' },
      orderDate: '2024-12-20',
      expectedDeliveryDate: '2025-01-15',
      infoStatus: 'confirmed',
      paymentStatus: 'advance_paid',
      deliveryStatus: 'pending',
      currentTotalAmountBgn: 12500,
      paidAmountBgn: 8750,
      remainingAmountBgn: 3750
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      client: {
        firstName: 'Мария',
        lastName: 'Георгиева',
        companyName: 'Интериор Дизайн ООД'
      },
      project: { name: 'Офис ремонт - Пловдив' },
      variant: { name: 'Вариант Б - Бамбуков паркет' },
      phase: { name: 'Фаза 1 - Покритие' },
      orderDate: '2024-12-22',
      expectedDeliveryDate: '2025-01-20',
      infoStatus: 'not_confirmed',
      paymentStatus: 'not_paid',
      deliveryStatus: 'pending',
      currentTotalAmountBgn: 8900,
      paidAmountBgn: 0,
      remainingAmountBgn: 8900
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      client: {
        firstName: 'Стефан',
        lastName: 'Димитров'
      },
      project: { name: 'Спалня - Варна' },
      variant: { name: 'Вариант В - Ясен паркет' },
      phase: { name: 'Фаза 1 - Основни материали' },
      orderDate: '2024-12-23',
      expectedDeliveryDate: '2025-01-10',
      infoStatus: 'confirmed',
      paymentStatus: 'fully_paid',
      deliveryStatus: 'completed',
      currentTotalAmountBgn: 6500,
      paidAmountBgn: 6500,
      remainingAmountBgn: 0
    }
  ];

  const filteredOrders = useMemo(() => {
    let filtered = allOrders.filter(order => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          order.orderNumber.toLowerCase().includes(searchLower) ||
          `${order.client.firstName} ${order.client.lastName}`.toLowerCase().includes(searchLower) ||
          order.client.companyName?.toLowerCase().includes(searchLower) ||
          order.project.name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'info' && order.infoStatus !== 'confirmed') return false;
        if (statusFilter === 'payment' && order.paymentStatus === 'not_paid') return false;
        if (statusFilter === 'delivery' && order.deliveryStatus !== 'completed') return false;
      }

      return true;
    });

    return filtered;
  }, [allOrders, searchTerm, statusFilter]);

  const getStatusColor = (status: string, type: string) => {
    if (type === 'info') {
      return status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    }
    if (type === 'payment') {
      if (status === 'fully_paid') return 'bg-green-100 text-green-800';
      if (status === 'advance_paid') return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    }
    if (type === 'delivery') {
      if (status === 'completed') return 'bg-green-100 text-green-800';
      if (status === 'partial') return 'bg-blue-100 text-blue-800';
      return 'bg-gray-100 text-gray-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, type: string) => {
    if (type === 'info') {
      return status === 'confirmed' ? 'Потвърдена' : 'Непотвърдена';
    }
    if (type === 'payment') {
      if (status === 'fully_paid') return 'Платена';
      if (status === 'advance_paid') return 'Аванс';
      return 'Неплатена';
    }
    if (type === 'delivery') {
      if (status === 'completed') return 'Доставена';
      if (status === 'partial') return 'Частично';
      return 'Чакаща';
    }
    return status;
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-light">Поръчки</h1>
        <div className="flex gap-4">
          <Button variant="primary" onClick={() => navigate('/orders/create')}>
            + Нова поръчка
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{allOrders.length}</div>
          <div className="text-gray-600 text-sm mt-2">Общо поръчки</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {allOrders.filter(o => o.infoStatus === 'confirmed').length}
          </div>
          <div className="text-gray-600 text-sm mt-2">Потвърдени</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-yellow-600">
            {allOrders.filter(o => o.paymentStatus === 'advance_paid').length}
          </div>
          <div className="text-gray-600 text-sm mt-2">С аванс</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-purple-600">
            {allOrders.filter(o => o.deliveryStatus === 'completed').length}
          </div>
          <div className="text-gray-600 text-sm mt-2">Доставени</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Търсене по номер, клиент, проект..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Всички статуси</option>
            <option value="info">Само потвърдени</option>
            <option value="payment">Само платени</option>
            <option value="delivery">Само доставени</option>
          </select>

          <Button variant="outline" onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}>
            Изчисти филтрите
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Поръчка
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Клиент
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Проект
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Вариант
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сума
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{order.orderNumber}</div>
                  <div className="text-sm text-gray-500">{order.phase.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {order.client.firstName} {order.client.lastName}
                  </div>
                  {order.client.companyName && (
                    <div className="text-sm text-gray-500">{order.client.companyName}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{order.project.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{order.variant.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">
                    {new Date(order.orderDate).toLocaleDateString('bg-BG')}
                  </div>
                  {order.expectedDeliveryDate && (
                    <div className="text-sm text-gray-500">
                      До: {new Date(order.expectedDeliveryDate).toLocaleDateString('bg-BG')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.infoStatus, 'info')}`}>
                      {getStatusText(order.infoStatus, 'info')}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.paymentStatus, 'payment')}`}>
                      {getStatusText(order.paymentStatus, 'payment')}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.deliveryStatus, 'delivery')}`}>
                      {getStatusText(order.deliveryStatus, 'delivery')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {order.currentTotalAmountBgn.toLocaleString('bg-BG')} лв.
                  </div>
                  <div className="text-sm text-gray-500">
                    Платено: {order.paidAmountBgn.toLocaleString('bg-BG')} лв.
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}`);
                      }}
                    >
                      Детайли
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}/edit`);
                      }}
                    >
                      Редакция
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📦</div>
            <p>Няма намерени поръчки</p>
            <p className="text-sm">Опитайте да промените филтрите или да създадете нова поръчка</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage; 