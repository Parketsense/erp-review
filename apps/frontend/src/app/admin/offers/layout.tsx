'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeft, 
  FileText, 
  Plus, 
  BarChart3, 
  Settings, 
  Users, 
  Building2, 
  Package,
  Home,
  Menu,
  X
} from 'lucide-react';

interface AdminOffersLayoutProps {
  children: React.ReactNode;
}

export default function AdminOffersLayout({ children }: AdminOffersLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Начало', href: '/admin', icon: Home },
    { name: 'Оферти', href: '/admin/offers', icon: FileText },
    { name: 'Клиенти', href: '/admin/clients', icon: Users },
    { name: 'Проекти', href: '/admin/projects', icon: Building2 },
    { name: 'Продукти', href: '/admin/products', icon: Package },
    { name: 'Аналитика', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Настройки', href: '/admin/settings', icon: Settings },
  ];

  const offersSubmenu = [
    { name: 'Всички оферти', href: '/admin/offers' },
    { name: 'Създай оферта', href: '/admin/offers/create' },
    { name: 'Чернови', href: '/admin/offers?status=draft' },
    { name: 'Изпратени', href: '/admin/offers?status=sent' },
    { name: 'Прегледани', href: '/admin/offers?status=viewed' },
    { name: 'Приети', href: '/admin/offers?status=accepted' },
  ];

  const isActive = (href: string) => pathname === href;
  const isOffersActive = pathname.startsWith('/admin/offers');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
          <div className="flex items-center">
            <div className="text-xl font-bold text-white tracking-wide">
              PARKETSENSE
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${active 
                        ? 'bg-gray-800 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`
                      mr-3 h-5 w-5 transition-colors
                      ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}
                    `} />
                    {item.name}
                  </Link>
                  
                  {/* Offers submenu */}
                  {item.name === 'Оферти' && isOffersActive && (
                    <div className="ml-8 mt-2 space-y-1">
                      {offersSubmenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`
                            block px-3 py-2 text-sm rounded-md transition-colors
                            ${isActive(subItem.href)
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }
                          `}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Администратор</p>
              <p className="text-xs text-gray-400">admin@parketsense.bg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-lg font-medium text-gray-900">
                  Управление на оферти
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 