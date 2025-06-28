'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, ArrowLeft, Edit, Trash2, MoreVertical } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useLoading } from '../../components/LoadingProvider';
import { apiClient } from '../../lib/api';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  eik?: string;
  mol?: string;
  address?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientModalProps {
  isOpen: boolean;
  client?: Client | null;
  onClose: () => void;
  onSave: (client: Partial<Client>) => void;
}

function ClientModal({ isOpen, client, onClose, onSave }: ClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eik: '',
    mol: '',
    address: '',
    contactPerson: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        eik: client.eik || '',
        mol: client.mol || '',
        address: client.address || '',
        contactPerson: client.contactPerson || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        eik: '',
        mol: '',
        address: '',
        contactPerson: ''
      });
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {client ? 'Редактирай клиент' : 'Нов клиент'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Име *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ЕИК
              </label>
              <input
                type="text"
                value={formData.eik}
                onChange={(e) => setFormData(prev => ({ ...prev, eik: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                МОЛ
              </label>
              <input
                type="text"
                value={formData.mol}
                onChange={(e) => setFormData(prev => ({ ...prev, mol: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Контактно лице
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              Отказ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {client ? 'Запази' : 'Създай'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading('clients');

  const loadClients = async () => {
    try {
      showLoading('Зареждане на клиенти...');
      const response = await apiClient.get('/clients');
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      hideLoading();
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
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
      alert('Грешка при запазването на клиента');
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
  }, []);

  const filteredClients = clients.filter(client => {
    const name = client.name || '';
    const email = client.email || '';
    const phone = client.phone || '';
    const searchLower = searchTerm.toLowerCase();
    return name.toLowerCase().includes(searchLower) ||
           email.toLowerCase().includes(searchLower) ||
           phone.toLowerCase().includes(searchLower);
  });

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/">
                <button className="p-2 bg-white border rounded-lg hover:bg-gray-50">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Клиенти</h1>
                <p className="text-gray-600">Управление на клиенти</p>
              </div>
            </div>

            {/* Search and Add */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Търси клиенти..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={openCreateModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Нов клиент
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Общо клиенти</p>
                  <p className="text-2xl font-bold">{clients.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Фирми</p>
                  <p className="text-2xl font-bold">{clients.filter(c => c.eik).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Физически лица</p>
                  <p className="text-2xl font-bold">{clients.filter(c => !c.eik).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clients List */}
          <div className="bg-white rounded-lg border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">
                Списък клиенти ({filteredClients.length})
              </h3>
            </div>

            {filteredClients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Няма клиенти
                </h3>
                <p className="text-gray-600">
                  Добавете първия си клиент за да започнете
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredClients.map((client) => (
                  <div key={client.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{client.name}</h4>
                        <p className="text-gray-600">{client.email}</p>
                        {client.phone && (
                          <p className="text-gray-600 text-sm">{client.phone}</p>
                        )}
                        {client.eik && (
                          <p className="text-blue-600 text-sm">ЕИК: {client.eik}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 relative">
                        <button 
                          onClick={() => setDropdownOpen(dropdownOpen === client.id ? null : client.id)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {dropdownOpen === client.id && (
                          <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg z-10 min-w-32">
                            <button
                              onClick={() => openEditModal(client)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Редактирай
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Изтрий
                            </button>
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

      <ClientModal
        isOpen={isModalOpen}
        client={editingClient}
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