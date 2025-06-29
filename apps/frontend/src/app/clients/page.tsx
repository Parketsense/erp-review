'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, ArrowLeft, Edit, Trash2, MoreVertical, Building2, User, Briefcase, Eye, Phone, Mail, MapPin, Power, EyeOff } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useLoading } from '../../components/LoadingProvider';
import { apiClient } from '../../lib/api';
import ClientModal from '../../components/clients/ClientModal';
import { Client, CreateClientDto } from '../../types/client';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading('clients');

  const loadClients = async () => {
    try {
      showLoading('Зареждане на клиенти...');
      const params = showInactive ? '?includeInactive=true' : '';
      const response = await apiClient.get(`/clients${params}`);
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      hideLoading();
    }
  };

  const handleSaveClient = async (clientData: CreateClientDto) => {
    try {
      showLoading(editingClient ? 'Запазване...' : 'Създаване...');
      
      if (editingClient) {
        await apiClient.patch(`/clients/${editingClient.id}`, clientData);
      } else {
        await apiClient.post('/clients', clientData);
      }
      
      await loadClients();
      setIsModalOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
      throw error; // Let the modal handle the error display
    } finally {
      hideLoading();
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този клиент?')) {
      return;
    }
    
    try {
      showLoading('Изтриване...');
      await apiClient.delete(`/clients/${clientId}`);
      await loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Грешка при изтриването на клиента');
    } finally {
      hideLoading();
    }
  };

  const handleToggleActive = async (clientId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'деактивирате' : 'активирате';
    if (!confirm(`Сигурни ли сте, че искате да ${action} този клиент?`)) {
      return;
    }
    
    try {
      showLoading(`${currentStatus ? 'Деактивиране' : 'Активиране'}...`);
      await apiClient.patch(`/clients/${clientId}/toggle-active`);
      await loadClients();
      setDropdownOpen(null);
    } catch (error) {
      console.error('Error toggling client status:', error);
      alert(`Грешка при ${currentStatus ? 'деактивирането' : 'активирането'} на клиента`);
    } finally {
      hideLoading();
    }
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
    setDropdownOpen(null);
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  useEffect(() => {
    loadClients();
  }, [showInactive]);

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`;
    const searchLower = searchTerm.toLowerCase();
    return fullName.toLowerCase().includes(searchLower) ||
           (client.email && client.email.toLowerCase().includes(searchLower)) ||
           (client.phone && client.phone.toLowerCase().includes(searchLower)) ||
           (client.companyName && client.companyName.toLowerCase().includes(searchLower)) ||
           (client.eikBulstat && client.eikBulstat.toLowerCase().includes(searchLower));
  });

  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isActive);
  const inactiveClients = clients.filter(c => !c.isActive);
  const companiesCount = activeClients.filter(c => c.hasCompany).length;
  const individualsCount = activeClients.filter(c => !c.hasCompany).length;
  const architectsCount = activeClients.filter(c => c.isArchitect).length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </Link>
                <div className="text-xl font-bold tracking-wide">PARKETSENSE</div>
              </div>
              <div className="text-sm text-gray-300">
                Система за управление на клиенти
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">Клиенти</h1>
            <p className="text-gray-600">Управление на клиентската база</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Общо клиенти</p>
                  <p className="text-2xl font-bold text-gray-900">{activeClients.length}</p>
                  {showInactive && inactiveClients.length > 0 && (
                    <p className="text-sm text-gray-500">+{inactiveClients.length} неактивни</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Фирми</p>
                  <p className="text-2xl font-bold text-gray-900">{companiesCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Физически лица</p>
                  <p className="text-2xl font-bold text-gray-900">{individualsCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Архитекти</p>
                  <p className="text-2xl font-bold text-gray-900">{architectsCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Add */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Търси по име, email, телефон, фирма..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`px-4 py-3 rounded-lg flex items-center gap-2 border transition-colors ${
                    showInactive 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={showInactive ? 'Скрий деактивираните' : 'Покажи деактивираните'}
                >
                  <EyeOff className="w-5 h-5" />
                  {showInactive ? 'Скрий деактивирани' : 'Покажи деактивирани'}
                </button>
              </div>
              
              <button 
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Нов клиент
              </button>
            </div>

            {searchTerm && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Намерени {filteredClients.length} от {totalClients} клиенти
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 text-blue-600 underline hover:text-blue-800"
                    >
                      Изчисти търсенето
                    </button>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Clients List */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Списък клиенти ({filteredClients.length})
              </h3>
            </div>

            {filteredClients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Няма намерени клиенти' : 'Няма клиенти'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Опитайте с различни ключови думи за търсене'
                    : 'Добавете първия си клиент за да започнете'
                  }
                </p>
                {!searchTerm && (
                  <button 
                    onClick={openCreateModal}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Добави клиент
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <div key={client.id} className={`p-6 hover:bg-gray-50 transition-colors ${!client.isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg ${!client.isActive ? 'grayscale' : ''}`}>
                            {client.firstName?.charAt(0) || 'C'}{client.lastName?.charAt(0) || ''}
                          </div>

                          <div className="flex-1">
                            {/* Name and Company */}
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {client.firstName} {client.lastName}
                              </h4>
                              {!client.isActive && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                  <Power className="w-3 h-3" />
                                  Деактивиран
                                </span>
                              )}
                              {client.hasCompany && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  <Building2 className="w-3 h-3" />
                                  Фирма
                                </span>
                              )}
                              {client.isArchitect && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                  <Briefcase className="w-3 h-3" />
                                  Архитект
                                </span>
                              )}
                            </div>

                            {/* Company Info */}
                            {client.hasCompany && client.companyName && (
                              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">{client.companyName}</p>
                                {client.eikBulstat && (
                                  <p className="text-sm text-gray-600">ЕИК: {client.eikBulstat}</p>
                                )}
                                {client.companyMol && (
                                  <p className="text-sm text-gray-600">МОЛ: {client.companyMol}</p>
                                )}
                              </div>
                            )}

                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              {client.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{client.phone}</span>
                                </div>
                              )}
                              {client.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  <span>{client.email}</span>
                                </div>
                              )}
                              {client.address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{client.address}</span>
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            {client.notes && (
                              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                                <strong>Бележки:</strong> {client.notes}
                              </div>
                            )}

                            {/* Creation Info */}
                            <div className="mt-3 text-xs text-gray-500">
                              Създаден на {new Date(client.createdAt).toLocaleDateString('bg-BG')}
                              {client.createdByUser && ` от ${client.createdByUser.name}`}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 relative ml-4">
                        <button 
                          onClick={() => setDropdownOpen(dropdownOpen === client.id ? null : client.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {dropdownOpen === client.id && (
                          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                            <div className="py-1">
                              <button
                                onClick={() => openEditModal(client)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                                Редактирай
                              </button>
                              <button
                                onClick={() => handleToggleActive(client.id, client.isActive)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                              >
                                <Power className="w-4 h-4" />
                                {client.isActive ? 'Деактивирай' : 'Активирай'}
                              </button>
                              <button
                                onClick={() => handleDeleteClient(client.id)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Изтрий
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        initialData={editingClient}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
      />

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </ErrorBoundary>
  );
} 