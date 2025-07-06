'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, User, ChevronDown } from 'lucide-react';
import styles from './HeaderV1.module.css';

interface DropdownItem {
  label: string;
  path: string;
}

interface NavItem {
  label: string;
  path: string;
  dropdown?: DropdownItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Начало',
    path: '/',
  },
  {
    label: 'Клиенти',
    path: '/clients',
    dropdown: [
      { label: 'Всички клиенти', path: '/clients' },
      { label: 'Добави клиент', path: '/clients/create' },
      { label: 'Архитекти', path: '/architects' },
      { label: 'Импорт/Експорт', path: '/clients/import' },
    ],
  },
  {
    label: 'Проекти',
    path: '/projects',
    dropdown: [
      { label: 'Активни проекти', path: '/projects' },
      { label: 'Създай проект', path: '/projects/create' },
      { label: 'Фази и варианти', path: '/projects/phases' },
      { label: 'Архив', path: '/projects/archive' },
    ],
  },
  {
    label: 'Продукти',
    path: '/products',
  },
  {
    label: 'Поръчки',
    path: '/orders',
  },
  {
    label: 'Оферти',
    path: '/offers',
    dropdown: [
      { label: 'Всички оферти', path: '/offers' },
      { label: 'Създай оферта', path: '/offers/create' },
      { label: 'Чернови', path: '/offers?status=draft' },
      { label: 'Изпратени', path: '/offers?status=sent' },
      { label: 'Приети', path: '/offers?status=accepted' },
      { label: 'Админ панел', path: '/admin/offers' },
    ],
  },
  {
    label: 'Документи',
    path: '/documents',
    dropdown: [
      { label: 'Фактури', path: '/invoices' },
      { label: 'Складови документи', path: '/warehouse' },
      { label: 'Доставки', path: '/deliveries' },
    ],
  },
];

export const HeaderV1: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3); // mock

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleMainClick = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const handleDropdownClick = (path: string) => {
    router.push(path);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  // Responsive: show dropdown on click for mobile, hover for desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 900;

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        {/* Logo */}
        <div className={styles.logoSection} onClick={() => handleMainClick('/')}> 
          <img src="/parketsense-logo-mono-black.png" alt="PARKETSENSE" className={styles.logoImg} />
          <span className={styles.brandText}>PARKETSENSE ERP</span>
        </div>
        {/* Navigation */}
        <nav className={styles.navigation}>
          {navItems.map((item) => (
            <div
              key={item.label}
              className={styles.navItem + (isActive(item.path) ? ' ' + styles.active : '')}
              onMouseEnter={() => !isMobile && item.dropdown && setActiveDropdown(item.label)}
              onMouseLeave={() => !isMobile && setActiveDropdown(null)}
            >
              <button
                className={styles.navButton}
                onClick={() => handleMainClick(item.path)}
                aria-haspopup={!!item.dropdown}
                aria-expanded={activeDropdown === item.label}
              >
                {item.label}
                {item.dropdown && <ChevronDown className={styles.chevron} size={16} />}
              </button>
              {/* Dropdown */}
              {item.dropdown && activeDropdown === item.label && (
                <div className={styles.dropdown}>
                  {item.dropdown.map((d) => (
                    <button
                      key={d.path}
                      className={styles.dropdownItem}
                      onClick={() => handleDropdownClick(d.path)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        {/* User menu */}
        <div className={styles.userMenu}>
          <div className={styles.notifications}>
            <Bell className={styles.notificationIcon} size={20} />
            {notificationCount > 0 && (
              <span className={styles.notificationBadge}>{notificationCount}</span>
            )}
          </div>
          <div className={styles.userAvatar}>
            <User className={styles.avatarIcon} size={20} />
            <span className={styles.userInitials}>АМ</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderV1; 