'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Package, Settings, Factory, Truck, FolderOpen, HardHat } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PARKETSENSE ERP
          </h1>
          <p className="text-xl text-gray-600">
            Система за управление на паркетна компания
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Version 2.0.0
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Clients */}
          <Link href="/clients">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 mx-auto">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Клиенти
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Управление на клиенти
              </p>
            </div>
          </Link>

          {/* Architects */}
          <Link href="/architects">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                <HardHat className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Архитекти
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Управление на архитекти
              </p>
            </div>
          </Link>

          {/* Projects */}
          <Link href="/projects">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4 mx-auto">
                <FolderOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Проекти
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Управление на проекти
              </p>
            </div>
          </Link>

          {/* Products */}
          <Link href="/products">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Продукти
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Каталог продукти
              </p>
            </div>
          </Link>

          {/* Manufacturers */}
          <Link href="/manufacturers">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4 mx-auto">
                <Factory className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Производители
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Управление на производители
              </p>
            </div>
          </Link>

          {/* Suppliers */}
          <Link href="/suppliers">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4 mx-auto">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Доставчици
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Управление на доставчици
              </p>
            </div>
          </Link>

          {/* Attributes */}
          <Link href="/attributes">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4 mx-auto">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                Атрибути
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Система атрибути
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
