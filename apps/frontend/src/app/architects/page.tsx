'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building, Percent, Search, ArrowLeft, UserPlus } from 'lucide-react';
import { architectsApi } from '@/services/architectsApi';
import { clientsApi } from '@/services/clientsApi';
import { Client, CreateClientDto } from '@/types/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import ClientModal from '@/components/clients/ClientModal';

export default function ArchitectsPage() {
  const router = useRouter();
  const [architects, setArchitects] = useState<Client[]>([]);
  const [filteredArchitects, setFilteredArchitects] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState<Client | null>(null);

  // Load architects from API
  useEffect(() => {
    const loadArchitects = async () => {
      setLoading(true);
      try {
        const response = await architectsApi.getArchitects({
          limit: 200
        });
        setArchitects(response.data);
        setFilteredArchitects(response.data);
      } catch (error) {
        console.error('Error loading architects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArchitects();
  }, []);

  // Filter architects based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredArchitects(architects);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = architects.filter(architect => 
      architect.firstName.toLowerCase().includes(searchLower) ||
      architect.lastName.toLowerCase().includes(searchLower) ||
      architect.email?.toLowerCase().includes(searchLower) ||
      architect.phone?.toLowerCase().includes(searchLower) ||
      architect.companyName?.toLowerCase().includes(searchLower)
    );
    setFilteredArchitects(filtered);
  }, [searchTerm, architects]);

  const handleEditArchitect = (architect: Client) => {
    setSelectedArchitect(architect);
    setShowClientModal(true);
  };

  const handleArchitectSave = async (architectData: CreateClientDto) => {
    try {
      let savedArchitect: Client;
      if (selectedArchitect) {
        // Update existing
        savedArchitect = await clientsApi.updateClient(selectedArchitect.id, {
          ...architectData,
          isArchitect: true // Ensure architect flag is maintained
        });
        setArchitects(prev => prev.map(a => a.id === selectedArchitect.id ? savedArchitect : a));
      } else {
        // Create new
        savedArchitect = await clientsApi.createClient({
          ...architectData,
          isArchitect: true // Ensure new architect has flag set
        });
        setArchitects(prev => [...prev, savedArchitect]);
      }
      
      setShowClientModal(false);
      setSelectedArchitect(null);
    } catch (error) {
      console.error('Error saving architect:', error);
    }
  };

  const handleNewArchitect = () => {
    setSelectedArchitect(null);
    setShowClientModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Архитекти</h1>
                  <p className="text-sm text-gray-500">Управление на архитекти в системата</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleNewArchitect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Нов архитект
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общо архитекти</p>
                <p className="text-2xl font-bold text-gray-900">{architects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">С фирма</p>
                <p className="text-2xl font-bold text-gray-900">{architects.filter(a => a.hasCompany).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Физически лица</p>
                <p className="text-2xl font-bold text-gray-900">{architects.filter(a => !a.hasCompany).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Percent className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Средна комисионна</p>
                <p className="text-2xl font-bold text-gray-900">
                  {architects.length > 0 
                    ? Math.round(architects.reduce((sum, a) => sum + (a.commissionPercent || 0), 0) / architects.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Търсене по име, телефон, имейл, фирма..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Architects List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Списък архитекти ({filteredArchitects.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredArchitects.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма намерени архитекти</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Опитайте с различна търсачка' : 'Започнете като добавите първия архитект'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Архитект
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Контакт
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Фирма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Комисионна
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredArchitects.map((architect) => (
                    <tr key={architect.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {architect.firstName} {architect.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {architect.phone && (
                          <div className="text-sm text-gray-900 flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {architect.phone}
                          </div>
                        )}
                        {architect.email && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-1 text-gray-400" />
                            {architect.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {architect.hasCompany ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {architect.companyName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ЕИК: {architect.eikBulstat}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Физическо лице</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {architect.commissionPercent || 0}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditArchitect(architect)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Редактирай
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Client Modal for architects */}
      {showClientModal && (
        <ClientModal
          isOpen={showClientModal}
          initialData={selectedArchitect}
          onSave={handleArchitectSave}
          onClose={() => {
            setShowClientModal(false);
            setSelectedArchitect(null);
          }}
        />
      )}
    </div>
  );
} 