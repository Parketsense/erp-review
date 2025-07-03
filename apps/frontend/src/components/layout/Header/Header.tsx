import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import styles from './Header.module.css';

export interface HeaderProps {
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

export const Header: React.FC<HeaderProps> = ({ user, stats }) => {
  return (
    <header className={styles['dashboard-header']}>
      <div className={styles['header-content']}>
        <div className={styles['header-brand']}>
          <div className={styles['header-logo']}>
            <Image
              src="/parketsense-logo-mono-black.png"
              alt="PARKETSENSE"
              width={48}
              height={48}
              className={styles['logo-image']}
            />
          </div>
          <div className={styles['header-text']}>
            <h1 className={styles['header-title']}>PARKETSENSE ERP</h1>
            <p className={styles['header-subtitle']}>Професионална система за управление</p>
          </div>
          <div className={styles['version-badge']}>
            v2.0
          </div>
        </div>
        
        {user && (
          <div className={styles['header-user']}>
            <div className={styles['user-info']}>
              <span className={styles['user-name']}>{user.name}</span>
              <span className={styles['user-email']}>{user.email}</span>
            </div>
            <div className={styles['user-avatar']}>
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={32}
                  height={32}
                  className={styles['avatar-image']}
                />
              ) : (
                <User size={20} />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}; 