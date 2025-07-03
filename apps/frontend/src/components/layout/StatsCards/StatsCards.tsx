import React from 'react';
import { StatCard } from './StatCard';
import styles from './StatsCards.module.css';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface StatsCardsProps {
  stats: DashboardStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Общо проекти',
      value: stats.totalProjects,
      icon: '📊',
      color: 'blue' as const,
    },
    {
      label: 'Активни проекти',
      value: stats.activeProjects,
      icon: '🚀',
      color: 'green' as const,
    },
    {
      label: 'Общ приход',
      value: `${stats.totalRevenue.toLocaleString()} лв.`,
      icon: '💰',
      color: 'purple' as const,
    },
    {
      label: 'Месечен ръст',
      value: `${stats.monthlyGrowth}%`,
      icon: '📈',
      color: 'orange' as const,
    },
  ];

  return (
    <div className={styles['stats-cards']}>
      {statCards.map((card, index) => (
        <StatCard
          key={index}
          label={card.label}
          value={card.value}
          icon={card.icon}
          color={card.color}
        />
      ))}
    </div>
  );
}; 