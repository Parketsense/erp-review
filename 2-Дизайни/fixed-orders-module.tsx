import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown,
  ExternalLink,
  Truck,
  DollarSign,
  FileText
} from 'lucide-react';

const OrdersModule = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    supplier: 'all',
    dateRange: 'all',
    search: ''
  });

  // Симулирани данни с правилна статус логика
  useEffect(() => {
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'ORD-2025-001',
        project: 'Апартамент София',
        client: 'Иван Петров',
        phase: 'Всекидневна',
        variant: 'Вариант 1',
        supplier: 'Хикс',
        orderDate: '2025-06-20',
        expectedDelivery: '2025-07-05',
        totalAmount: 2850.00,
        currency: 'EUR',
        // 3-статусова система
        confirmationStatus: 'confirmed', // pending, confirmed, rejected
        paymentStatus: 'paid', // unpaid, partial, paid
        deliveryStatus: 'delivered', // pending, in_transit, delivered
        // Детайли за статусите
        paymentDetails: {
          totalAmount: 2850.00,
          paidAmount: 2850.00,
          payments: [
            { amount: 1995.00, date: '2025-06-21', type: 'advance' },
            { amount: 855.00, date: '2025-06-28', type: 'final' }
          ]
        },
        deliveryDetails: {
          deliveredDate: '2025-06-30',
          trackingNumber: 'TR123456789',
          receivedBy: 'Иван Петров'
        }
      },
      {
        id: 2,
        orderNumber: 'ORD-2025-002', 
        project: 'Офис Пловдив',
        client: 'Мария Димитрова',
        phase: 'Приемна',
        variant: 'Вариант 2',
        supplier: 'Паркетсенс',
        orderDate: '2025-06-22',
        expectedDelivery: '2025-07-10',
        totalAmount: 1650.00,
        currency: 'EUR',
        confirmationStatus: 'confirmed',
        paymentStatus: 'partial',
        deliveryStatus: 'in_transit',
        paymentDetails: {
          totalAmount: 1650.00,
          paidAmount: 1155.00,
          payments: [
            { amount: 1155.00, date: '2025-06-23', type: 'advance' }
          ]
        },
        deliveryDetails: {
          expectedDate: '2025-07-10',
          trackingNumber: 'TR987654321'
        }
      },
      {
        id: 3,
        orderNumber: 'ORD-2025-003',
        project: 'Къща Варна', 
        client: 'Георги Стойков',
        phase: 'Спалня',
        variant: 'Вариант 1',
        supplier: 'Egger',
        orderDate: '2025-06-25',
        expectedDelivery: '2025-07-15',
        totalAmount: 3200.00,
        currency: 'EUR',
        confirmationStatus: 'pending',
        paymentStatus: 'unpaid',
        deliveryStatus: 'pending'
      },
      {
        id: 4,
        orderNumber: 'ORD-2025-004',
        project: 'Магазин София',
        client: 'Петя Василева', 
        phase: 'Търговска зала',
        variant: 'Вариант 3',
        supplier: 'Хикс',
        orderDate: '2025-06-24',
        expectedDelivery: '2025-07-08',
        totalAmount: 4100.00,
        currency: 'EUR',
        confirmationStatus: 'confirmed',
        paymentStatus: 'paid',
        deliveryStatus: 'pending',
        paymentDetails: {
          totalAmount: 4100.00,
          paidAmount: 4100.00,
          payments: [
            { amount: 2870.00, date: '2025-06-25', type: 'advance' },
            { amount: 1230.00, date: '2025-06-26', type: 'final' }
          ]
        }
      }
    ];
    setOrders(mockOrders);
  }, []);

  // КЛЮЧОВА ЛОГИКА: Определяне на общия статус на поръчката
  const getOverallStatus = (order) => {
    // Ако не е потвърдена - това е най-ниският статус
    if (order.confirmationStatus !== 'confirmed') {
      return {
        status: 'НЕПОТВЪРДЕНА',
        color: 'bg-gray-100 text-gray-800',
        priority: 1
      };
    }

    // Ако не е платена - това блокира напредъка
    if (order.paymentStatus === 'unpaid') {
      return {
        status: 'НЕПЛАТЕНА', 
        color: 'bg-red-100 text-red-800',
        priority: 2
      };
    }

    // Ако е частично платена
    if (order.paymentStatus === 'partial') {
      return {
        status: 'ЧАСТИЧНО ПЛАТЕНА',
        color: 'bg-orange-100 text-orange-800', 
        priority: 3
      };
    }

    // Ако е платена, но не е доставена
    if (order.paymentStatus === 'paid' && order.deliveryStatus === 'pending') {
      return {
        status: 'ОЧАКВАМЕ ДОСТАВКА',
        color: 'bg-blue-100 text-blue-800',
        priority: 4
      };
    }

    // Ако е в транзит
    if (order.deliveryStatus === 'in_transit') {
      return {
        status: 'В ДОСТАВКА',
        color: 'bg-purple-100 text-purple-800',
        priority: 5
      };
    }

    // Най-високият статус - доставена
    if (order.deliveryStatus === 'delivered') {
      return {
        status: 'ДОСТАВЕНА',
        color: 'bg-green-100 text-green-800',
        priority: 6
      };
    }

    // Fallback
    return {
      status: 'НЕИЗВЕСТНА',
      color: 'bg-gray-100 text-gray-800',
      priority: 0
    };
  };

  // Филтриране на поръчки
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.project.toLowerCase().includes(filters.search.toLowerCase()) ||
                         order.client.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === 'all' || getOverallStatus(order).status === filters.status;
    
    const matchesSupplier = filters.supplier === 'all' || order.supplier === filters.supplier;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // Уникални доставчици за филтъра
  const suppliers = [...new Set(orders.map(order => order.supplier))];

  const StatusBadge = ({ order }) => {
    const status = getOverallStatus(order);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
        {status.status}
      </span>
    );
  };

  const PaymentIndicator = ({ order }) => {
    if (order.paymentStatus === 'paid') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (order.paymentStatus === 'partial') {
      return <Clock className="w-4 h-4 text-orange-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const DeliveryIndicator = ({ order }) => {
    if (order.deliveryStatus === 'delivered') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (order.deliveryStatus === 'in_transit') {
      return <Truck className="w-4 h-4 text-purple-600" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const overallStatus = getOverallStatus(order);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Детайли за поръчка {order.orderNumber}</h2>
                <p className="text-sm text-gray-600 mt-1">Проект: {order.project} - {order.client}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Статус секция */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Общ статус</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <StatusBadge order={order} />
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Приоритет: {overallStatus.priority}/6</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-статусова система */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Потвърждение */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Потвърждение</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Статус:</span>
                    <span className={`text-sm font-medium ${
                      order.confirmationStatus === 'confirmed' ? 'text-green-600' :
                      order.confirmationStatus === 'pending' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {order.confirmationStatus === 'confirmed' ? 'Потвърдена' :
                       order.confirmationStatus === 'pending' ? 'Чака потвърждение' : 'Отказана'}
                    </span>
                  </div>
                  {order.confirmationStatus === 'confirmed' && (
                    <div className="text-xs text-gray-500">
                      ✅ Поръчката е потвърдена от доставчика
                    </div>
                  )}
                </div>
              </div>

              {/* Плащане */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Плащане</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Статус:</span>
                    <div className="flex items-center">
                      <PaymentIndicator order={order} />
                      <span className={`text-sm font-medium ml-2 ${
                        order.paymentStatus === 'paid' ? 'text-green-600' :
                        order.paymentStatus === 'partial' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {order.paymentStatus === 'paid' ? 'Платена' :
                         order.paymentStatus === 'partial' ? 'Частично' : 'Неплатена'}
                      </span>
                    </div>
                  </div>
                  {order.paymentDetails && (
                    <div className="text-xs text-gray-500">
                      Платено: €{order.paymentDetails.paidAmount} / €{order.paymentDetails.totalAmount}
                    </div>
                  )}
                </div>
              </div>

              {/* Доставка */}
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Package className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Доставка</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Статус:</span>
                    <div className="flex items-center">
                      <DeliveryIndicator order={order} />
                      <span className={`text-sm font-medium ml-2 ${
                        order.deliveryStatus === 'delivered' ? 'text-green-600' :
                        order.deliveryStatus === 'in_transit' ? 'text-purple-600' : 'text-gray-600'
                      }`}>
                        {order.deliveryStatus === 'delivered' ? 'Доставена' :
                         order.deliveryStatus === 'in_transit' ? 'В доставка' : 'Очаква'}
                      </span>
                    </div>
                  </div>
                  {order.deliveryDetails?.trackingNumber && (
                    <div className="text-xs text-gray-500">
                      Tracking: {order.deliveryDetails.trackingNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Основна информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Информация за проекта</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Проект:</span>
                    <span className="font-medium">{order.project}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Клиент:</span>
                    <span className="font-medium">{order.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Фаза:</span>
                    <span className="font-medium">{order.phase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Вариант:</span>
                    <span className="font-medium">{order.variant}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Информация за поръчката</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Доставчик:</span>
                    <span className="font-medium">{order.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дата на поръчка:</span>
                    <span className="font-medium">{order.orderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Очаквана доставка:</span>
                    <span className="font-medium">{order.expectedDelivery}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Обща сума:</span>
                    <span className="font-medium text-lg">{order.currency} {order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Затвори
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Редактирай
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-600" />
                  Управление на поръчки
                </h1>
                <p className="text-gray-600 mt-1">Преглед и управление на всички поръчки с правилни статуси</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Експорт
                </button>
                <button 
                  onClick={() => setLoading(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Обнови
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Търсене по номер, проект или клиент..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Всички статуси</option>
              <option value="НЕПОТВЪРДЕНА">Непотвърдена</option>
              <option value="НЕПЛАТЕНА">Неплатена</option>
              <option value="ЧАСТИЧНО ПЛАТЕНА">Частично платена</option>
              <option value="ОЧАКВАМЕ ДОСТАВКА">Очакваме доставка</option>
              <option value="В ДОСТАВКА">В доставка</option>
              <option value="ДОСТАВЕНА">Доставена</option>
            </select>

            <select
              value={filters.supplier}
              onChange={(e) => setFilters(prev => ({...prev, supplier: e.target.value}))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Всички доставчици</option>
              {suppliers.map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Поръчка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Проект / Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Доставчик
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Плащане
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Доставка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сума
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{order.orderDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.project}</div>
                        <div className="text-sm text-gray-500">{order.client}</div>
                        <div className="text-xs text-gray-400">{order.phase} - {order.variant}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.supplier}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge order={order} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PaymentIndicator order={order} />
                        <span className="ml-2 text-sm text-gray-600">
                          {order.paymentStatus === 'paid' ? 'Платена' :
                           order.paymentStatus === 'partial' ? 'Частично' : 'Неплатена'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DeliveryIndicator order={order} />
                        <span className="ml-2 text-sm text-gray-600">
                          {order.deliveryStatus === 'delivered' ? 'Доставена' :
                           order.deliveryStatus === 'in_transit' ? 'В доставка' : 'Очаква'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.currency} {order.totalAmount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Обобщение</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredOrders.length}</div>
              <div className="text-sm text-gray-600">Общо поръчки</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredOrders.filter(o => getOverallStatus(o).status === 'ДОСТАВЕНА').length}
              </div>
              <div className="text-sm text-gray-600">Доставени</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredOrders.filter(o => getOverallStatus(o).status === 'ОЧАКВАМЕ ДОСТАВКА').length}
              </div>
              <div className="text-sm text-gray-600">Очакват</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredOrders.filter(o => getOverallStatus(o).status === 'ЧАСТИЧНО ПЛАТЕНА').length}
              </div>
              <div className="text-sm text-gray-600">Частично</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredOrders.filter(o => getOverallStatus(o).status === 'НЕПЛАТЕНА').length}
              </div>
              <div className="text-sm text-gray-600">Неплатени</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {filteredOrders.filter(o => getOverallStatus(o).status === 'НЕПОТВЪРДЕНА').length}
              </div>
              <div className="text-sm text-gray-600">Непотвърдени</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default OrdersModule;