import React from 'react';
import Link from 'next/link';
import styles from './NavCard.module.css';

export interface NavCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export const NavCard: React.FC<NavCardProps> = ({
  title,
  description,
  icon,
  href,
  color,
}) => {
  return (
    <Link href={href} className={styles['nav-card']}>
      <div className={styles['nav-card-icon']} style={{ backgroundColor: color }}>
        <span className={styles['icon-emoji']}>{icon}</span>
      </div>
      <div className={styles['nav-card-content']}>
        <h3 className={styles['nav-card-title']}>{title}</h3>
        <p className={styles['nav-card-description']}>{description}</p>
      </div>
    </Link>
  );
}; 