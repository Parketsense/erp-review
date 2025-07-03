'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FolderOpen, ArrowLeft, Search, Calendar, User, Building, Archive } from 'lucide-react';
import { projectsApi, Project, ProjectsResponse } from '@/services/projectsApi';
import { clientsApi } from '@/services/clientsApi';
import CreateProjectModal from '@/components/projects/CreateProjectModal';

interface ProjectWithClient extends Project {
  clientName?: string;
  status?: 'active' | 'completed' | 'paused' | 'draft';
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithClient[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

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
        setFilteredProjects(enrichedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchLower) ||
      project.clientName?.toLowerCase().includes(searchLower) ||
      project.address?.toLowerCase().includes(searchLower) ||
      project.projectType.toLowerCase().includes(searchLower)
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment': return '🏠';
      case 'house': return '🏡';
      case 'office': return '🏢';
      case 'commercial': return '🏬';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  const getProjectTypeLabel = (type: string) => {
    const types = {
      apartment: 'Апартамент',
      house: 'Къща',
      office: 'Офис', 
      commercial: 'Търговски обект',
      other: 'Друго'
    };
    return types[type as keyof typeof types] || 'Неизвестен';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      setCreateLoading(true);
      
      // Create the project via API (contacts will be added later in full implementation)
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

      // Add to projects list
      const enrichedProject = {
        ...newProject,
        clientName: 'Нов клиент', // Will be loaded properly on refresh
        status: 'active' as const
      };

      setProjects(prev => [enrichedProject, ...prev]);
      setFilteredProjects(prev => [enrichedProject, ...prev]);
      setShowCreateModal(false);
      
      // Show success message
      alert('Проектът е създаден успешно!');
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Грешка при създаване на проект. Моля опитайте отново.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="projects-page">
      <div className="projects-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <Link href="/" className="back-link">
                <ArrowLeft className="back-icon" />
                Назад
              </Link>
              <div className="header-text">
                <h1 className="page-title">Проекти</h1>
                <p className="page-subtitle">Управление на проекти</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="create-button"
            >
              <Plus className="button-icon" />
              Нов проект
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && projects.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon stat-icon-blue">
                  <FolderOpen className="stat-icon-svg" />
                </div>
                <div className="stat-text">
                  <h3 className="stat-value">{projects.length}</h3>
                  <p className="stat-label">Общо проекти</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon stat-icon-green">
                  <Calendar className="stat-icon-svg" />
                </div>
                <div className="stat-text">
                  <h3 className="stat-value">
                    {projects.filter(p => p.status === 'active').length}
                  </h3>
                  <p className="stat-label">Активни</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon stat-icon-yellow">
                  <User className="stat-icon-svg" />
                </div>
                <div className="stat-text">
                  <h3 className="stat-value">
                    {projects.filter(p => p.architectType === 'external' || p.architectType === 'client').length}
                  </h3>
                  <p className="stat-label">С архитект</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-icon stat-icon-purple">
                  <Archive className="stat-icon-svg" />
                </div>
                <div className="stat-text">
                  <h3 className="stat-value">
                    {projects.filter(p => p.status === 'completed').length}
                  </h3>
                  <p className="stat-label">Завършени</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {!loading && projects.length > 0 && (
          <div className="search-container">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Търсене по име на проект, клиент, адрес или тип..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <span className="loading-text">Зареждане на проекти...</span>
            </div>
          </div>
        )}

        {/* Projects List */}
        {!loading && filteredProjects.length > 0 && (
          <div className="projects-list">
            {filteredProjects.map((project) => (
              <div key={project.id} className="project-item">
                <Link href={`/projects/${project.id}`} className="project-link">
                  <div className="project-content">
                    <div className="project-main">
                      <div className="project-header">
                        <span className="project-type-icon">{getProjectTypeIcon(project.projectType)}</span>
                        <div className="project-info">
                          <h3 className="project-name">{project.name}</h3>
                          <p className="project-type">{getProjectTypeLabel(project.projectType)}</p>
                        </div>
                      </div>
                      
                      <div className="project-details">
                        <div className="detail-item">
                          <User className="detail-icon" />
                          <span className="detail-text">{project.clientName}</span>
                        </div>
                        
                        {project.address && (
                          <div className="detail-item">
                            <Building className="detail-icon" />
                            <span className="detail-text">{project.address}</span>
                          </div>
                        )}
                        
                        <div className="detail-item">
                          <Calendar className="detail-icon" />
                          <span className="detail-text">Създаден: {formatDate(project.createdAt)}</span>
                        </div>

                        {project.architectName && (
                          <div className="detail-item">
                            <User className="detail-icon" />
                            <span className="detail-text">Архитект: {project.architectName}</span>
                          </div>
                        )}
                      </div>

                      {project.description && (
                        <p className="project-description">{project.description}</p>
                      )}
                    </div>
                    
                    <div className="project-status">
                      <span className={`status-badge status-${project.status}`}>
                        {project.status === 'active' ? 'Активен' :
                         project.status === 'completed' ? 'Завършен' :
                         project.status === 'draft' ? 'Чернова' : 'Неизвестен'}
                      </span>
                      
                      {project.architectType !== 'none' && (
                        <span className="architect-badge">
                          С архитект
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="empty-state">
            <FolderOpen className="empty-icon" />
            <h2 className="empty-title">Няма проекти</h2>
            <p className="empty-description">
              Започнете да създавате проекти за да управлявате работата си по-ефективно.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="empty-button"
            >
              <Plus className="button-icon" />
              Създай първи проект
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && projects.length > 0 && filteredProjects.length === 0 && (
          <div className="empty-state">
            <Search className="empty-icon" />
            <h2 className="empty-title">Няма намерени проекти</h2>
            <p className="empty-description">
              Опитайте с различни ключови думи или премахнете филтрите.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="clear-search-button"
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

      <style jsx>{`
        .projects-page {
          min-height: 100vh;
          background: var(--background-light);
          padding: var(--space-lg);
        }

        .projects-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .back-link {
          display: flex;
          align-items: center;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: var(--text-primary);
        }

        .back-icon {
          width: 20px;
          height: 20px;
          margin-right: var(--space-xs);
        }

        .page-title {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin: 0;
        }

        .page-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: var(--space-xs) 0 0 0;
        }

        .create-button {
          display: flex;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          background: var(--color-primary);
          color: var(--white);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .create-button:hover {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        .button-icon {
          width: 16px;
          height: 16px;
          margin-right: var(--space-sm);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .stat-card {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: var(--space-lg);
          border: 1px solid var(--border-light);
        }

        .stat-content {
          display: flex;
          align-items: center;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--space-md);
        }

        .stat-icon-blue {
          background: var(--color-info-light);
          color: var(--color-info);
        }

        .stat-icon-green {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .stat-icon-yellow {
          background: var(--color-warning-light);
          color: var(--color-warning);
        }

        .stat-icon-purple {
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        .stat-icon-svg {
          width: 24px;
          height: 24px;
        }

        .stat-value {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin: 0;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: var(--space-xs) 0 0 0;
        }

        .search-container {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: var(--space-md);
          margin-bottom: var(--space-lg);
        }

        .search-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: var(--space-sm);
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: var(--text-secondary);
        }

        .search-input {
          width: 100%;
          padding: var(--space-sm) var(--space-md);
          padding-left: calc(var(--space-md) + 16px + var(--space-sm));
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-family: var(--font-family);
          background: var(--background-white);
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-light);
        }

        .loading-container {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: var(--space-2xl);
          text-align: center;
        }

        .loading-content {
          display: inline-flex;
          align-items: center;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--color-primary);
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: var(--space-md);
        }

        .loading-text {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .projects-list {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        .project-item {
          border-bottom: 1px solid var(--border-light);
        }

        .project-item:last-child {
          border-bottom: none;
        }

        .project-link {
          display: block;
          padding: var(--space-lg);
          text-decoration: none;
          color: inherit;
          transition: background-color 0.2s ease;
        }

        .project-link:hover {
          background: var(--background-light);
        }

        .project-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .project-main {
          flex: 1;
        }

        .project-header {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .project-type-icon {
          font-size: var(--text-2xl);
        }

        .project-name {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin: 0;
        }

        .project-type {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: var(--space-xs) 0 0 0;
        }

        .project-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .detail-item {
          display: flex;
          align-items: center;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .detail-icon {
          width: 16px;
          height: 16px;
          margin-right: var(--space-sm);
        }

        .detail-text {
          color: var(--text-secondary);
        }

        .project-description {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .project-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--space-sm);
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
        }

        .status-active {
          background: var(--color-success-light);
          color: var(--color-success);
        }

        .status-completed {
          background: var(--color-info-light);
          color: var(--color-info);
        }

        .status-draft {
          background: var(--color-warning-light);
          color: var(--color-warning);
        }

        .architect-badge {
          display: inline-flex;
          align-items: center;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          background: var(--color-primary-light);
          color: var(--color-primary);
        }

        .empty-state {
          background: var(--background-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          padding: var(--space-2xl);
          text-align: center;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          color: var(--text-secondary);
          margin: 0 auto var(--space-lg);
        }

        .empty-title {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin: 0 0 var(--space-sm) 0;
        }

        .empty-description {
          color: var(--text-secondary);
          margin: 0 0 var(--space-lg) 0;
        }

        .empty-button {
          display: inline-flex;
          align-items: center;
          padding: var(--space-sm) var(--space-md);
          background: var(--color-primary);
          color: var(--white);
          border: none;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .empty-button:hover {
          background: var(--color-primary-dark);
          transform: translateY(-1px);
        }

        .clear-search-button {
          color: var(--color-primary);
          background: none;
          border: none;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .clear-search-button:hover {
          color: var(--color-primary-dark);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .projects-page {
            padding: var(--space-md);
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-md);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .project-content {
            flex-direction: column;
            gap: var(--space-md);
          }

          .project-status {
            align-items: flex-start;
          }

          .project-details {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
} 