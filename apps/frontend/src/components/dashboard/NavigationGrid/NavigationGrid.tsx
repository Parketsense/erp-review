import React from 'react';
import { NavCard } from './NavCard';
import styles from './NavigationGrid.module.css';

export interface NavCardData {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export interface NavigationGridProps {
  cards?: NavCardData[];
}

export const NavigationGrid: React.FC<NavigationGridProps> = ({ 
  cards = defaultNavCards 
}) => {
  return (
    <div className={styles['navigation-grid']}>
      {cards.map((card, index) => (
        <NavCard
          key={index}
          title={card.title}
          description={card.description}
          icon={card.icon}
          href={card.href}
          color={card.color}
        />
      ))}
    </div>
  );
};

const defaultNavCards: NavCardData[] = [
  { 
    title: 'Клиенти', 
    description: 'Управление на клиенти и контакти',
    icon: '👥',
    href: '/clients',
    color: '#E3F2FD'
  },
  { 
    title: 'Архитекти', 
    description: 'Архитекти и комисионни',
    icon: '🏗️',
    href: '/architects',
    color: '#F3E5F5'
  },
  { 
    title: 'Проекти', 
    description: 'Създаване и управление на проекти',
    icon: '📋',
    href: '/projects',
    color: '#EDE7F6'
  },
  { 
    title: 'Продукти', 
    description: 'Каталог с продукти и цени',
    icon: '🏷️',
    href: '/products',
    color: '#E8F5E9'
  },
  { 
    title: 'Производители', 
    description: 'Управление на производители',
    icon: '🏭',
    href: '/manufacturers',
    color: '#FFF3E0'
  },
  { 
    title: 'Доставчици', 
    description: 'Доставчици и склад',
    icon: '🚚',
    href: '/suppliers',
    color: '#FFEBEE'
  },
  { 
    title: 'Атрибути', 
    description: 'Система за атрибути',
    icon: '⚙️',
    href: '/attributes',
    color: '#E0F2F1'
  },
  { 
    title: 'Анализи', 
    description: 'Отчети и статистики',
    icon: '📊',
    href: '/analytics',
    color: '#F3E5F5'
  }
]; 