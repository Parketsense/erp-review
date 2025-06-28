import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Package, 
  FileText, 
  Receipt, 
  ShoppingCart, 
  Warehouse, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Bell,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';

const ParketsenseDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'Ниска наличност за паркет Хикс Дъб Натурал', time: '5 мин' },
    { id: 2, type: 'info', message: 'Нова поръчка от клиент Иван Петров', time: '1 час' },
    { id: 3, type: 'success', message: 'Фактура PF2025-001512 е платена', time: '2 часа' }
  ]);

  // Симулирани данни
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 156780,
      monthlyGrowth: 12.5,
      activeProjects: 18,
      pendingOrders: 7
    },
    recentActivity: [
      { id: 1, action: 'Нов проект', description: 'Апартамент София - Иван Петров', time: '10 мин', type: 'project' },
      { id: 2, action: 'Платена фактура', description: 'PF2025-001498 - €3,250.00', time: '45 мин', type: 'payment' },
      { id: 3, action: 'Доставка', description: 'Поръчка #1524 от Хикс', time: '2 часа', type: 'delivery' },
      { id: 4, action: 'Нов клиент', description: 'Мария Димитрова', time: '3 часа', type: 'client' }
    ],
    quickStats: {
      clients: { total: 342, new: 5 },
      projects: { active: 18, completed: 156 },
      products: { total: 1284, lowStock: 12 },
      orders: { pending: 7, delivered: 89 }
    }
  });

  const menuItems = [
    { icon: Users, label: 'Клиенти', path: '/clients', color: 'text-blue-600' },
    { icon: Briefcase, label: 'Проекти', path: '/projects', color: 'text-green-600' },
    { icon: Package, label: 'Продукти', path: '/products', color: 'text-purple-600' },
    { icon: FileText, label: 'Оферти', path: '/offers', color: 'text-orange-600' },
    { icon: Receipt, label: 'Фактури', path: '/invoices', color: 'text-red-600' },
    { icon: ShoppingCart, label: 'Поръчки', path: '/orders', color: 'text-indigo-600' },
    { icon: Warehouse, label: 'Склад', path: '/warehouse', color: 'text-yellow-600' },
    { icon: MessageSquare, label: 'Комуникация', path: '/communication', color: 'text-pink-600' }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const NotificationBadge = ({ type, message, time }) => {
    const getTypeIcon = () => {
      switch(type) {
        case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
        case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'info': return <Bell className="w-4 h-4 text-blue-500" />;
        default: return <Bell className="w-4 h-4 text-gray-500" />;
      }
    };

    return (
      <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getTypeIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 font-medium">{message}</p>
          <p className="text-xs text-gray-500 mt-1">{time} назад</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PS</span>
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">Паркетсенс</span>
          </div>
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <item.icon className={`w-5 h-5 mr-3 ${item.color} group-hover:scale-110 transition-transform`} />
              <span className="font-medium">{item.label}</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Дашборд</h1>
              <p className="text-sm text-gray-600">Добре дошли обратно, Георги</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Търсене..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">ГП</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Георги Петков</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Общи приходи"
              value={`€${dashboardData.overview.totalRevenue.toLocaleString()}`}
              change={dashboardData.overview.monthlyGrowth}
              icon={DollarSign}
              color="text-green-600"
            />
            <StatCard
              title="Активни проекти"
              value={dashboardData.overview.activeProjects}
              icon={Target}
              color="text-blue-600"
            />
            <StatCard
              title="Чакащи поръчки"
              value={dashboardData.overview.pendingOrders}
              icon={Clock}
              color="text-orange-600"
            />
            <StatCard
              title="Месечен ръст"
              value={`${dashboardData.overview.monthlyGrowth}%`}
              icon={TrendingUp}
              color="text-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Последна активност
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex-shrink-0 mr-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'project' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                          activity.type === 'delivery' ? 'bg-orange-100 text-orange-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {activity.type === 'project' && <Briefcase className="w-5 h-5" />}
                          {activity.type === 'payment' && <DollarSign className="w-5 h-5" />}
                          {activity.type === 'delivery' && <Package className="w-5 h-5" />}
                          {activity.type === 'client' && <Users className="w-5 h-5" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">{activity.action}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{activity.time} назад</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications & Quick Stats */}
            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-yellow-600" />
                    Нотификации
                  </h3>
                </div>
                <div className="p-3">
                  {notifications.map((notification) => (
                    <NotificationBadge
                      key={notification.id}
                      type={notification.type}
                      message={notification.message}
                      time={notification.time}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Бърз преглед</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Клиенти</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{dashboardData.quickStats.clients.total}</span>
                      <span className="text-xs text-green-600 ml-2">+{dashboardData.quickStats.clients.new} нови</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Активни проекти</span>
                    <span className="text-sm font-semibold text-gray-900">{dashboardData.quickStats.projects.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Продукти</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{dashboardData.quickStats.products.total}</span>
                      <span className="text-xs text-red-600 ml-2">{dashboardData.quickStats.products.lowStock} малко</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Чакащи поръчки</span>
                    <span className="text-sm font-semibold text-gray-900">{dashboardData.quickStats.orders.pending}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Бързи действия</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Нов клиент</h4>
                  <p className="text-sm text-gray-600">Добави нов клиент в системата</p>
                </button>
                <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                  <Briefcase className="w-8 h-8 text-green-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Нов проект</h4>
                  <p className="text-sm text-gray-600">Започни нов проект за клиент</p>
                </button>
                <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                  <Package className="w-8 h-8 text-purple-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Нов продукт</h4>
                  <p className="text-sm text-gray-600">Добави продукт в каталога</p>
                </button>
                <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
                  <Receipt className="w-8 h-8 text-orange-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">Нова фактура</h4>
                  <p className="text-sm text-gray-600">Създай проформа или фактура</p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParketsenseDashboard;