import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Package, Building, FileText } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Клиенти',
      href: '/clients',
      icon: Users,
      current: location.pathname.startsWith('/clients') || location.pathname === '/'
    },
    {
      name: 'Поръчки',
      href: '/orders',
      icon: Package,
      current: location.pathname.startsWith('/orders')
    },
    {
      name: 'Проекти',
      href: '/projects',
      icon: Building,
      current: location.pathname.startsWith('/projects')
    },
    {
      name: 'Оферти',
      href: '/offers',
      icon: FileText,
      current: location.pathname.startsWith('/offers')
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                ParketSense ERP
              </h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      item.current
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 