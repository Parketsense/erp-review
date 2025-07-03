import React from 'react';
import { StatsCards } from '../layout/StatsCards/StatsCards';
import { NavigationGrid } from './NavigationGrid/NavigationGrid';
import styles from './DashboardLayout.module.css';

export interface DashboardLayoutProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  stats?: {
    totalProjects: number;
    activeProjects: number;
    totalRevenue: number;
    monthlyGrowth: number;
  };
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  user, 
  stats 
}) => {
  return (
    <div className={styles['dashboard-layout']}>
      <StatsCards stats={stats || {
        totalProjects: 0,
        activeProjects: 0,
        totalRevenue: 0,
        monthlyGrowth: 0
      }} />
      <NavigationGrid />
    </div>
  );
};

const defaultStats = {
  totalProjects: 24,
  activeProjects: 8,
  totalRevenue: 125000,
  monthlyGrowth: 12.5,
}; 