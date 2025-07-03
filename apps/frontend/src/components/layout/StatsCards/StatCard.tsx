import React from 'react';
import styles from './StatCard.module.css';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color,
}) => {
  const colorStyles = {
    blue: { backgroundColor: '#E3F2FD', color: '#1976D2' },
    purple: { backgroundColor: '#F3E5F5', color: '#7B1FA2' },
    green: { backgroundColor: '#E8F5E9', color: '#388E3C' },
    orange: { backgroundColor: '#FFF3E0', color: '#F57C00' },
  };

  return (
    <div className={styles['stat-card']}>
      <div className={styles['stat-icon']} style={colorStyles[color]}>
        <span className={styles['icon-emoji']}>{icon}</span>
      </div>
      <div className={styles['stat-content']}>
        <div className={styles['stat-value']}>{value}</div>
        <div className={styles['stat-label']}>{label}</div>
      </div>
    </div>
  );
}; 