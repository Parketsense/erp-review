import React from 'react';
import { MoreHorizontal, Edit, Archive, Trash2 } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { Project } from '@/types/project';

interface ProjectTableProps {
  projects: (Project & { clientName?: string; status?: 'active' | 'completed' | 'paused' | 'draft' })[];
  onProjectClick: (id: string) => void;
  onClientClick: (clientId: string) => void;
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const getProjectTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    apartment: 'Апартамент',
    house: 'Къща',
    office: 'Офис',
    commercial: 'Търговски обект',
    other: 'Друго'
  };
  return types[type] || 'Неизвестен';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('bg-BG');
};

export const ProjectsTable: React.FC<ProjectTableProps> = ({
  projects,
  onProjectClick,
  onClientClick,
  onEdit,
  onArchive,
  onDelete,
  className = ''
}) => {
  const getProjectStatus = (project: Project): 'active' | 'completed' | 'with-architect' => {
    if (project.status === 'completed') return 'completed';
    if (project.architectType !== 'none') return 'with-architect';
    return 'active';
  };

  return (
    <div className={`projects-table bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Проект</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Клиент</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Тип</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Архитект</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Статус</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Създаден</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Действия</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const status = getProjectStatus(project);
              const clientName = project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Неизвестен клиент';
              
              return (
                <tr 
                  key={project.id} 
                  className="border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer active:bg-blue-100"
                  style={{ padding: 'var(--space-4) var(--space-5)' }}
                  onClick={() => onProjectClick(project.id)}
                >
                  <td className="px-6 py-4">
                    <div
                      className="text-left font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      style={{ fontWeight: 600, color: 'var(--color-blue)' }}
                    >
                      {project.name}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div
                      className="text-left text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {clientName}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-gray-700">
                    {getProjectTypeLabel(project.projectType)}
                  </td>
                  
                  <td className="px-6 py-4 text-gray-700">
                    {project.architectName || '—'}
                  </td>
                  
                  <td className="px-6 py-4">
                    <StatusBadge status={status}>
                      {status === 'active' ? 'Активен' : 
                       status === 'completed' ? 'Завършен' : 'С архитект'}
                    </StatusBadge>
                  </td>
                  
                  <td className="px-6 py-4 text-gray-700">
                    {formatDate(project.createdAt)}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(project.id); }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Редактирай"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onArchive(project.id); }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Архивирай"
                      >
                        <Archive size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Изтрий"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 