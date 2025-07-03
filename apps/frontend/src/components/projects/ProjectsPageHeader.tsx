import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ProjectsPageHeaderProps {
  className?: string;
}

export const ProjectsPageHeader: React.FC<ProjectsPageHeaderProps> = ({
  className = ''
}) => {
  return (
    <div className={`projects-page-header ${className}`}>
      <div className="flex items-center space-x-4 mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Проекти
        </h1>
        <p className="text-lg text-gray-600">
          Управление на проекти и оферти
        </p>
      </div>
    </div>
  );
}; 