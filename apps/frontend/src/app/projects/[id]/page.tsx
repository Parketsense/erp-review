'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Calendar, MapPin } from 'lucide-react';

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/projects"
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                Назад
              </Link>
              <div className="h-4 border-l border-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Проект #{params.id}</h1>
                <p className="text-gray-600 mt-1">Детайли за проекта</p>
              </div>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500">
              <Edit className="w-4 h-4 mr-2" />
              Редактирай
            </button>
          </div>
        </div>

        {/* Content Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Проект в разработка</h2>
          <p className="text-gray-500 mb-6">
            Тази страница ще бъде развита след като се завърши Backend API за проекти.
          </p>
          <div className="text-sm text-gray-400">
            ID: {params.id}
          </div>
        </div>
      </div>
    </div>
  );
} 