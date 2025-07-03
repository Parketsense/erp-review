import React from 'react';
import { SearchInput } from '../ui/SearchInput';
import { FilterDropdown } from '../ui/FilterDropdown';
import { ActionButton } from '../ui/ActionButton';
import { Plus } from 'lucide-react';

interface ActionBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onCreateProject: () => void;
  className?: string;
}

const statusOptions = [
  { value: 'all', label: 'Всички проекти' },
  { value: 'active', label: 'Активни' },
  { value: 'completed', label: 'Завършени' },
  { value: 'with-architect', label: 'С архитект' }
];

export const ProjectsActionBar: React.FC<ActionBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onCreateProject,
  className = ''
}) => {
  return (
    <div className={`projects-action-bar bg-white rounded-lg p-6 mb-6 border border-gray-200 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Търсене по име на проект, клиент, адрес или тип..."
            className="flex-1"
          />
          <FilterDropdown
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={statusOptions}
            placeholder="Филтър по статус"
            className="w-full sm:w-48"
          />
        </div>
        
        <div className="flex-shrink-0">
          <ActionButton
            variant="primary"
            icon={Plus}
            onClick={onCreateProject}
            className="w-full sm:w-auto"
          >
            Нов проект
          </ActionButton>
        </div>
      </div>
    </div>
  );
}; 