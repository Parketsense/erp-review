'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, FolderOpen, ArrowLeft } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Назад
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Проекти</h1>
                <p className="text-gray-600 mt-1">Управление на проекти</p>
              </div>
            </div>
            <Link
              href="/projects/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Нов проект
            </Link>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Няма проекти</h2>
          <p className="text-gray-500 mb-6">
            Започнете да създавате проекти за да управлявате работата си по-ефективно.
          </p>
          <Link
            href="/projects/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Създай първи проект
          </Link>
        </div>
      </div>
    </div>
  );
} 