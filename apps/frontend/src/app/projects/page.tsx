'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ProjectsPageHeader,
  ProjectsActionBar,
  ProjectsStatsGrid,
  ProjectsTable,
  ProjectsPagination
} from '@/components/projects';
import { projectsApi, Project, ProjectsResponse } from '@/services/projectsApi';
import { clientsApi } from '@/services/clientsApi';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import { ProjectStats, ProjectFilters } from '@/types/project';

interface ProjectWithClient extends Project {
  clientName?: string;
  status?: 'active' | 'completed' | 'paused' | 'draft';
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Filters and search
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: 'all'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Load projects from backend
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const response: ProjectsResponse = await projectsApi.getProjects();
        
        // Enrich projects with client names
        const enrichedProjects = await Promise.all(
          response.data.map(async (project) => {
            try {
              const client = await clientsApi.getClientById(project.clientId);
              return {
                ...project,
                clientName: client ? `${client.firstName} ${client.lastName}` : 'Неизвестен клиент',
                status: 'active' as const // Default status since backend doesn't return it yet
              };
            } catch (error) {
              console.error('Error loading client for project:', project.id, error);
              return {
                ...project,
                clientName: 'Неизвестен клиент',
                status: 'active' as const
              };
            }
          })
        );
        
        setProjects(enrichedProjects);
        setTotalItems(response.meta.total);
        setTotalPages(response.meta.totalPages);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Calculate project stats
  const projectStats: ProjectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    drafts: projects.filter(p => p.status === 'draft').length,
    thisMonth: projects.filter(p => {
      const createdAt = new Date(p.createdAt);
      const now = new Date();
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
    }).length,
    withArchitect: projects.filter(p => p.architectType === 'external' || p.architectType === 'client').length
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !filters.search || 
      project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.clientName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.address?.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.projectType.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' && project.status === 'active') ||
      (filters.status === 'completed' && project.status === 'completed') ||
      (filters.status === 'with-architect' && (project.architectType === 'external' || project.architectType === 'client'));

    return matchesSearch && matchesStatus;
  });

  // Paginate filtered projects
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  const handleCreateProject = async (projectData: any) => {
    try {
      setCreateLoading(true);
      
      const newProject = await projectsApi.createProject({
        name: projectData.name,
        clientId: projectData.clientId,
        projectType: projectData.projectType,
        address: projectData.address,
        description: projectData.description,
        city: 'София',
        architectType: projectData.architectType,
        architectName: projectData.architectName,
        architectCommission: projectData.architectCommission
      });

      const enrichedProject = {
        ...newProject,
        clientName: 'Нов клиент',
        status: 'active' as const
      };

      setProjects(prev => [enrichedProject, ...prev]);
      setShowCreateModal(false);
      
      alert('Проектът е създаден успешно!');
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Грешка при създаване на проект. Моля опитайте отново.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStatClick = (metric: keyof ProjectStats) => {
    // Filter based on clicked stat
    switch (metric) {
      case 'active':
        setFilters(prev => ({ ...prev, status: 'active' }));
        break;
      case 'completed':
        setFilters(prev => ({ ...prev, status: 'completed' }));
        break;
      case 'withArchitect':
        setFilters(prev => ({ ...prev, status: 'with-architect' }));
        break;
      default:
        setFilters(prev => ({ ...prev, status: 'all' }));
    }
    setCurrentPage(1);
  };

  const handleProjectClick = (id: string) => {
    router.push(`/projects/${id}`);
  };

  const handleClientClick = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/projects/${id}/edit`);
  };

  const handleArchive = (id: string) => {
    // TODO: Implement archive functionality
    console.log('Archive project:', id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете този проект?')) {
      // TODO: Implement delete functionality
      console.log('Delete project:', id);
    }
  };

  return (
    <div className="projects-page min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectsPageHeader />
        
        <ProjectsActionBar
          searchQuery={filters.search}
          onSearchChange={(query) => setFilters(prev => ({ ...prev, search: query }))}
          statusFilter={filters.status}
          onStatusFilterChange={(status) => setFilters(prev => ({ ...prev, status: status as any }))}
          onCreateProject={() => setShowCreateModal(true)}
        />

        {!loading && projects.length > 0 && (
          <ProjectsStatsGrid
            stats={projectStats}
            onStatClick={handleStatClick}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="inline-flex items-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              Зареждане на проекти...
            </div>
          </div>
        )}

        {/* Projects Table */}
        {!loading && filteredProjects.length > 0 && (
          <>
            <ProjectsTable
              projects={paginatedProjects}
              onProjectClick={handleProjectClick}
              onClientClick={handleClientClick}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
            
            <ProjectsPagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProjects.length / itemsPerPage)}
              totalItems={filteredProjects.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Няма проекти</h2>
            <p className="text-gray-500 mb-6">
              Започнете да създавате проекти за да управлявате работата си по-ефективно.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-black"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Създай първи проект
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Няма намерени проекти</h2>
            <p className="text-gray-500 mb-4">
              Опитайте с различни ключови думи или премахнете филтрите.
            </p>
            <button
              onClick={() => setFilters({ search: '', status: 'all' })}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Изчисти търсенето
            </button>
          </div>
        )}

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateProject}
        />
      </div>
    </div>
  );
} 