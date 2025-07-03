import React from 'react';
import { FileText, Activity, User, CheckCircle, LucideIcon } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { ProjectStats } from '@/types/project';

interface StatData {
  title: string;
  value: number;
  change: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onClick?: () => void;
}

interface ProjectsStatsGridProps {
  stats: ProjectStats;
  onStatClick?: (metric: keyof ProjectStats) => void;
  className?: string;
}

export const ProjectsStatsGrid: React.FC<ProjectsStatsGridProps> = ({
  stats,
  onStatClick,
  className = ''
}) => {
  const statsConfig: StatData[] = [
    {
      title: 'Общо проекти',
      value: stats.total,
      change: `+${stats.thisMonth} този месец`,
      icon: FileText,
      color: 'blue',
      onClick: onStatClick ? () => onStatClick('total') : undefined
    },
    {
      title: 'Активни',
      value: stats.active,
      change: 'Всички активни',
      icon: Activity,
      color: 'green',
      onClick: onStatClick ? () => onStatClick('active') : undefined
    },
    {
      title: 'С архитект',
      value: stats.withArchitect,
      change: `${stats.total > 0 ? Math.round((stats.withArchitect / stats.total) * 100) : 0}% от общо`,
      icon: User,
      color: 'orange',
      onClick: onStatClick ? () => onStatClick('withArchitect') : undefined
    },
    {
      title: 'Завършени',
      value: stats.completed,
      change: 'Готови за завършване',
      icon: CheckCircle,
      color: 'purple',
      onClick: onStatClick ? () => onStatClick('completed') : undefined
    }
  ];

  return (
    <div className={`projects-stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${className}`}>
      {statsConfig.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
}; 