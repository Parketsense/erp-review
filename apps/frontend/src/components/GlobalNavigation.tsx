'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Package, 
  Settings, 
  Factory, 
  Truck, 
  FolderOpen, 
  HardHat,
  Home,
  Menu,
  X,
  Building2,
  Calculator,
  FileText,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

const GlobalNavigation = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
      icon: Home, 
      label: 'Начало', 
      path: '/', 
      color: 'var(--color-neutral-600)' 
    },
    { 
      icon: Users, 
      label: 'Клиенти', 
      path: '/clients', 
      color: 'var(--color-info)' 
    },
    { 
      icon: HardHat, 
      label: 'Архитекти', 
      path: '/architects', 
      color: 'var(--color-primary)' 
    },
    { 
      icon: FolderOpen, 
      label: 'Проекти', 
      path: '/projects', 
      color: 'var(--color-primary)' 
    },
    { 
      icon: Package, 
      label: 'Продукти', 
      path: '/products', 
      color: 'var(--color-success)' 
    },
    { 
      icon: Factory, 
      label: 'Производители', 
      path: '/manufacturers', 
      color: 'var(--color-warning)' 
    },
    { 
      icon: Truck, 
      label: 'Доставчици', 
      path: '/suppliers', 
      color: 'var(--color-success)' 
    },
    { 
      icon: Settings, 
      label: 'Атрибути', 
      path: '/attributes', 
      color: 'var(--color-primary)' 
    },
    { 
      icon: Building2, 
      label: 'Складове', 
      path: '/warehouse', 
      color: 'var(--color-info)' 
    },
    { 
      icon: Calculator, 
      label: 'Калкулатор', 
      path: '/calculator', 
      color: 'var(--color-warning)' 
    },
    { 
      icon: FileText, 
      label: 'Документи', 
      path: '/documents', 
      color: 'var(--color-success)' 
    },
    { 
      icon: BarChart3, 
      label: 'Отчети', 
      path: '/reports', 
      color: 'var(--color-primary)' 
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="global-nav">
        <Link href="/" className="global-nav-brand">
          <div className="global-nav-logo">
            <Image
              src="/parketsense-logo-mono-black.png"
              alt="PARKETSENSE"
              width={32}
              height={32}
              className="logo-image"
            />
          </div>
          <span className="brand-text">PARKETSENSE ERP</span>
        </Link>

        <div className="global-nav-menu">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={index}
                href={item.path}
                className={`global-nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent 
                  className="nav-icon" 
                  style={{ color: isActive ? 'var(--white)' : item.color }}
                />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="menu-icon" />
          ) : (
            <Menu className="menu-icon" />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-content">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.path;
                
                return (
                  <Link
                    key={index}
                    href={item.path}
                    className={`mobile-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="mobile-menu-item-content">
                      <IconComponent 
                        className="mobile-menu-icon" 
                        style={{ color: isActive ? 'var(--color-primary)' : item.color }}
                      />
                      <span className="mobile-menu-label">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .global-nav {
          background: var(--color-primary);
          color: var(--white);
          padding: var(--space-lg) var(--space-xl);
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 100;
          min-height: 80px;
        }

        .global-nav-brand {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          text-decoration: none;
          color: var(--white);
          font-weight: var(--font-semibold);
          font-size: var(--text-lg);
          min-width: 200px;
        }

        .global-nav-logo {
          width: 32px;
          height: 32px;
          background: var(--white);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-xs);
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-text {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
        }

        .global-nav-menu {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          flex: 1;
          justify-content: center;
          flex-wrap: wrap;
        }

        .global-nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--white);
          font-size: var(--text-base);
          font-weight: var(--font-medium);
          transition: all 0.2s ease;
          opacity: 0.9;
          white-space: nowrap;
          border: 1px solid transparent;
        }

        .global-nav-item:hover {
          background: rgba(255, 255, 255, 0.15);
          opacity: 1;
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .global-nav-item.active {
          background: rgba(255, 255, 255, 0.25);
          opacity: 1;
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .nav-label {
          display: block;
          font-weight: var(--font-medium);
        }

        .mobile-menu-button {
          display: none;
          padding: var(--space-sm);
          border-radius: var(--radius-md);
          background: transparent;
          border: none;
          color: var(--white);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .mobile-menu-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .menu-icon {
          width: 24px;
          height: 24px;
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.5);
        }

        .mobile-menu {
          position: absolute;
          top: 64px;
          left: 0;
          right: 0;
          background: var(--white);
          box-shadow: var(--shadow-lg);
          border-bottom: 1px solid var(--border-light);
          max-height: 80vh;
          overflow-y: auto;
        }

        .mobile-menu-content {
          padding: var(--space-md) 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-xs);
        }

        .mobile-menu-item {
          display: block;
          padding: var(--space-sm) var(--space-lg);
          text-decoration: none;
          color: var(--text-primary);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          transition: all 0.2s ease;
          border-right: 3px solid transparent;
        }

        .mobile-menu-item:hover {
          background: var(--background-light);
        }

        .mobile-menu-item.active {
          background: var(--color-primary);
          color: var(--white);
          border-right-color: var(--white);
        }

        .mobile-menu-item-content {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .mobile-menu-icon {
          width: 20px;
          height: 20px;
        }

        .mobile-menu-label {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .global-nav-menu {
            gap: var(--space-xs);
          }
          
          .global-nav-item {
            padding: var(--space-xs) var(--space-sm);
            font-size: var(--text-xs);
          }
          
          .nav-icon {
            width: 16px;
            height: 16px;
          }
        }

        @media (max-width: 1200px) {
          .global-nav-menu {
            justify-content: flex-start;
            overflow-x: auto;
            padding: var(--space-xs) 0;
          }
          
          .global-nav-item {
            flex-shrink: 0;
          }
        }

        @media (max-width: 768px) {
          .global-nav-menu {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }

          .mobile-overlay {
            display: block;
          }

          .global-nav-brand {
            min-width: auto;
          }

          .brand-text {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .global-nav {
            padding: var(--space-sm) var(--space-md);
          }

          .mobile-menu-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default GlobalNavigation; 