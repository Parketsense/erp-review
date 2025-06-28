import React, { useState } from 'react';

interface SearchFiltersProps {
  onSearch: (searchTerm: string) => void;
  onFilterChange: (filters: {
    type: string;
    architect: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    architect: 'all',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (sortBy: string) => {
    const newSortOrder: 'asc' | 'desc' = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    const newFilters = { ...filters, sortBy, sortOrder: newSortOrder };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Търсене по име, фирма, телефон или email..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Тип:</label>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Всички</option>
            <option value="individual">Частни лица</option>
            <option value="company">Фирми</option>
          </select>
        </div>

        {/* Architect Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Архитект:</label>
          <select
            value={filters.architect}
            onChange={(e) => handleFilterChange('architect', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Всички</option>
            <option value="architect">Само архитекти</option>
            <option value="not-architect">Не архитекти</option>
          </select>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm font-medium text-gray-700">Подреди по:</label>
          <div className="flex gap-1">
            <button
              onClick={() => handleSortChange('name')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                filters.sortBy === 'name'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Име {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('createdAt')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                filters.sortBy === 'createdAt'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Дата {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('projects')}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                filters.sortBy === 'projects'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Проекти {filters.sortBy === 'projects' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchTerm || filters.type !== 'all' || filters.architect !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              const resetFilters = { type: 'all', architect: 'all', sortBy: 'name', sortOrder: 'asc' as const };
              setFilters(resetFilters);
              onSearch('');
              onFilterChange(resetFilters);
            }}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Изчисти филтрите
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(searchTerm || filters.type !== 'all' || filters.architect !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Търсене: "{searchTerm}"
                <button
                  onClick={() => {
                    setSearchTerm('');
                    onSearch('');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Тип: {filters.type === 'individual' ? 'Частни лица' : 'Фирми'}
                <button
                  onClick={() => handleFilterChange('type', 'all')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.architect !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Архитект: {filters.architect === 'architect' ? 'Само архитекти' : 'Не архитекти'}
                <button
                  onClick={() => handleFilterChange('architect', 'all')}
                  className="ml-1 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 