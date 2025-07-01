'use client';

import React, { use } from 'react';
import VariantsList from '../../../../../../components/variants/VariantsList';
import Link from 'next/link';

interface VariantsPageProps {
  params: Promise<{
    id: string;
    phaseId: string;
  }>;
}

export default function VariantsPage({ params }: VariantsPageProps) {
  const { id, phaseId } = use(params);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 py-4 text-sm">
            <Link 
              href="/projects" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Проекти
            </Link>
            <span className="text-gray-500">/</span>
            <Link 
              href={`/projects/${id}`}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Проект
            </Link>
            <span className="text-gray-500">/</span>
            <span className="text-gray-900 font-medium">Варианти</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Варианти за фаза
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Управлявайте вариантите за избраната фаза
              </p>
            </div>
            <Link
              href={`/projects/${id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Обратно към фази
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VariantsList projectId={id} phaseId={phaseId} />
      </div>
    </div>
  );
} 