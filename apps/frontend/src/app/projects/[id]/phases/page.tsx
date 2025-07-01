'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PhasesList from '../../../../components/phases/PhasesList';

interface PhasesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PhasesPage({ params }: PhasesPageProps) {
  const { id } = use(params);
  const [projectName, setProjectName] = useState<string>('');

  // In a real app, you would fetch the project details here
  useEffect(() => {
    // Mock project name - in real app this would come from an API call
    setProjectName(`Проект #${id}`);
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--primary-black)',
        color: 'var(--white)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px var(--shadow-light)'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}>
          PARKETSENSE
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span>Анатоли Миланов</span>
          <button className="btn-secondary" style={{ color: 'var(--white)', borderColor: 'var(--white)' }}>
            Изход
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '60px',
          backgroundColor: 'var(--primary-dark)',
          padding: '1rem 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'var(--text-secondary)',
            borderRadius: '5px',
            cursor: 'pointer'
          }} title="Клиенти"></div>
          <div style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'var(--text-secondary)',
            borderRadius: '5px',
            cursor: 'pointer'
          }} title="Продукти"></div>
          <div style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'var(--success-green)',
            borderRadius: '5px',
            cursor: 'pointer'
          }} title="Проекти"></div>
          <div style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'var(--warning-orange)',
            borderRadius: '5px',
            cursor: 'pointer'
          }} title="Фази"></div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto'
        }}>
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link 
                href="/projects" 
                className="hover:text-blue-600 transition-colors"
              >
                Проекти
              </Link>
              <span>→</span>
              <Link 
                href={`/projects/${id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {projectName}
              </Link>
              <span>→</span>
              <span className="text-gray-900 font-medium">Фази</span>
            </nav>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <Link
              href={`/projects/${id}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад към проекта
            </Link>
          </div>

          {/* Phases List Component */}
          <PhasesList 
            projectId={id}
            projectName={projectName}
          />
        </main>
      </div>
    </div>
  );
} 