'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Search, Plus, User } from 'lucide-react';
import { Project, CreateProjectDto } from '@/services/projectsApi';
import { clientsApi } from '@/services/clientsApi';
import { architectsApi } from '@/services/architectsApi';
import { Client, CreateClientDto } from '@/types/client';
import ClientModal from '@/components/clients/ClientModal';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<CreateProjectDto>) => Promise<void>;
  initialData: Project | null;
}

export default function ProjectEditModal({ isOpen, onClose, onSave, initialData }: ProjectEditModalProps) {
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    projectType: 'apartment' as 'apartment' | 'house' | 'office' | 'commercial' | 'other',
    address: '',
    description: '',
    city: '',
    architectType: 'none' as 'none' | 'client' | 'external',
    architectId: '',
    architectName: '',
    architectCommission: '',
    architectPhone: '',
    architectEmail: '',
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [architects, setArchitects] = useState<Client[]>([]);
  const [filteredArchitects, setFilteredArchitects] = useState<Client[]>([]);
  const [architectSearchTerm, setArchitectSearchTerm] = useState('');
  const [showArchitectSearch, setShowArchitectSearch] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingArchitects, setLoadingArchitects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Client modal state
  const [showClientModal, setShowClientModal] = useState(false);
  const [newArchitectData, setNewArchitectData] = useState<Client | null>(null);

  // Load clients and architects when modal opens
  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadArchitects();
    }
  }, [isOpen]);

  // Filter architects based on search term
  useEffect(() => {
    if (architectSearchTerm.trim()) {
      const filtered = architects.filter(architect => 
        architect.firstName.toLowerCase().includes(architectSearchTerm.toLowerCase()) ||
        architect.lastName.toLowerCase().includes(architectSearchTerm.toLowerCase()) ||
        (architect.companyName && architect.companyName.toLowerCase().includes(architectSearchTerm.toLowerCase()))
      );
      setFilteredArchitects(filtered);
    } else {
      setFilteredArchitects(architects);
    }
  }, [architectSearchTerm, architects]);

  // Debug: Log formData.architectType changes
  useEffect(() => {
    console.log('DEBUG: formData.architectType changed to:', formData.architectType);
  }, [formData.architectType]);

  // Close architect search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.architect-search-container')) {
        setShowArchitectSearch(false);
      }
    };

    if (showArchitectSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showArchitectSearch]);

  // Populate form with initial data
  useEffect(() => {
    if (initialData) {
      console.log('DEBUG: initialData.architectType =', initialData.architectType);
      console.log('DEBUG: initialData =', initialData);
      
      setFormData({
        clientId: initialData.clientId || '',
        name: initialData.name || '',
        projectType: initialData.projectType || 'apartment',
        address: initialData.address || '',
        description: initialData.description || '',
        city: initialData.city || '',
        architectType: initialData.architectType || 'none',
        architectId: initialData.architectId || '',
        architectName: initialData.architectName || '',
        architectCommission: initialData.architectCommission?.toString() || '',
        architectPhone: initialData.architectPhone || '',
        architectEmail: initialData.architectEmail || '',
      });
    }
  }, [initialData]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const clientsResponse = await clientsApi.getClients();
      setClients(clientsResponse.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoadingClients(false);
    }
  };

  const loadArchitects = async () => {
    try {
      setLoadingArchitects(true);
      const architectsResponse = await architectsApi.getArchitects();
      setArchitects(architectsResponse.data || []);
      setFilteredArchitects(architectsResponse.data || []);
    } catch (error) {
      console.error('Error loading architects:', error);
    } finally {
      setLoadingArchitects(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleArchitectSelect = (architect: Client) => {
    setFormData(prev => ({
      ...prev,
      architectId: architect.id,
      architectName: `${architect.firstName} ${architect.lastName}`,
      architectPhone: architect.phone || '',
      architectEmail: architect.email || '',
      architectCommission: architect.commissionPercent?.toString() || '10',
    }));
    setShowArchitectSearch(false);
    setArchitectSearchTerm('');
  };

  const handleCreateArchitect = () => {
    setNewArchitectData({
      id: '',
      firstName: '',
      lastName: '',
      hasCompany: false,
      isArchitect: true,
      commissionPercent: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Client);
    setShowClientModal(true);
  };

  const handleClientModalSave = async (clientData: CreateClientDto) => {
    try {
      console.log('Creating new architect with data:', clientData);
      
      // Save the new architect client
      const savedClient = await clientsApi.createClient(clientData);
      console.log('Architect created successfully:', savedClient);
      
      // Add the new architect to the local list immediately
      const newArchitect = {
        id: savedClient.id,
        firstName: savedClient.firstName,
        lastName: savedClient.lastName,
        hasCompany: savedClient.hasCompany,
        companyName: savedClient.companyName,
        email: savedClient.email,
        phone: savedClient.phone,
        isArchitect: true,
        commissionPercent: savedClient.commissionPercent || 10
      } as Client;
      
      setArchitects(prev => [newArchitect, ...prev]);
      setFilteredArchitects(prev => [newArchitect, ...prev]);
      
      // Auto-fill the architect data in the project form
      setFormData(prev => ({
        ...prev,
        architectId: savedClient.id,
        architectName: `${savedClient.firstName} ${savedClient.lastName}`,
        architectPhone: savedClient.phone || '',
        architectEmail: savedClient.email || '',
        architectCommission: savedClient.commissionPercent?.toString() || '10',
        architectType: 'external',
      }));
      
      // Update search term and close dropdown
      setArchitectSearchTerm(`${savedClient.firstName} ${savedClient.lastName}`);
      setShowArchitectSearch(false);
      
      setShowClientModal(false);
      setNewArchitectData(null);
      
      // Also reload the full list from server to ensure consistency
      setTimeout(() => {
        loadArchitects();
      }, 100);
      
    } catch (error) {
      console.error('Error creating architect:', error);
      alert('Грешка при създаване на архитект: ' + (error instanceof Error ? error.message : 'Неизвестна грешка'));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Клиентът е задължителен';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Името е задължително';
    }

    if (formData.architectType === 'external' && !formData.architectName.trim()) {
      newErrors.architectName = 'Името на архитекта е задължително за външен архитект';
    }

    if (formData.architectType !== 'none' && formData.architectCommission) {
      const commission = parseFloat(formData.architectCommission);
      if (isNaN(commission) || commission < 0 || commission > 100) {
        newErrors.architectCommission = 'Комисионната трябва да бъде между 0 и 100%';
      }
    }

    if (formData.architectEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.architectEmail)) {
      newErrors.architectEmail = 'Невалиден email адрес';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const projectData: Partial<CreateProjectDto> = {
        clientId: formData.clientId,
        name: formData.name.trim(),
        projectType: formData.projectType,
        address: formData.address.trim() || undefined,
        description: formData.description.trim() || undefined,
        city: formData.city.trim() || undefined,
        architectType: formData.architectType,
      };

      // Add architect-specific fields
      if (formData.architectType !== 'none') {
        if (formData.architectType === 'external') {
          projectData.architectName = formData.architectName.trim();
          projectData.architectId = formData.architectId || undefined;
        }
        if (formData.architectCommission) {
          projectData.architectCommission = parseFloat(formData.architectCommission);
        }
        if (formData.architectPhone) {
          projectData.architectPhone = formData.architectPhone.trim();
        }
        if (formData.architectEmail) {
          projectData.architectEmail = formData.architectEmail.trim();
        }
      }

      await onSave(projectData);
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Редактиране на проект
            </h2>
            <button
              onClick={handleClose}
              disabled={saving}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Клиент *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.clientId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loadingClients || saving}
              >
                <option value="">Изберете клиент...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                    {client.hasCompany && client.companyName ? ` (${client.companyName})` : ''}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Име на проект *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Въведете име на проекта"
                disabled={saving}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип проект
              </label>
              <select
                value={formData.projectType}
                onChange={(e) => handleInputChange('projectType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              >
                <option value="apartment">Апартамент</option>
                <option value="house">Къща</option>
                <option value="office">Офис</option>
                <option value="commercial">Търговски обект</option>
                <option value="other">Друго</option>
              </select>
            </div>

            {/* Address and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Въведете адрес"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Град
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Въведете град"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Въведете описание на проекта"
                disabled={saving}
              />
            </div>

            {/* Architect Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Архитект
              </label>
              <select
                value={formData.architectType}
                onChange={(e) => handleInputChange('architectType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={saving}
              >
                <option value="none">Няма архитект</option>
                <option value="client">Клиентът е архитект</option>
                <option value="external">Външен архитект</option>
              </select>
            </div>

            {/* Architect Details */}
            {formData.architectType !== 'none' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Данни за архитект</h3>
                
                {formData.architectType === 'external' && (
                  <div className="space-y-4">
                    {/* DEBUG: Покажи текущата стойност на architectType */}
                    <div style={{ color: 'red', fontWeight: 'bold' }}>architectType: {formData.architectType}</div>
                    {/* Architect Search + '+' button */}
                    <div className="relative architect-search-container">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Търси архитект
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={architectSearchTerm}
                            onChange={(e) => setArchitectSearchTerm(e.target.value)}
                            onFocus={() => setShowArchitectSearch(true)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Търси по име или фирма..."
                            disabled={saving}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateArchitect}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          disabled={saving}
                          style={{ outline: '2px solid red' }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {/* Architect Search Results */}
                      {showArchitectSearch && filteredArchitects.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredArchitects.map((architect) => (
                            <button
                              key={architect.id}
                              type="button"
                              onClick={() => handleArchitectSelect(architect)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex items-center space-x-3">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="font-medium">
                                    {architect.firstName} {architect.lastName}
                                  </div>
                                  {architect.companyName && (
                                    <div className="text-sm text-gray-500">
                                      {architect.companyName}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Selected Architect Info */}
                    {formData.architectId && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            Избран архитект: {formData.architectName}
                          </span>
                        </div>
                      </div>
                    )}
                    {/* Manual Architect Name Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Име на архитект *
                      </label>
                      <input
                        type="text"
                        value={formData.architectName}
                        onChange={(e) => handleInputChange('architectName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.architectName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Въведете име на архитекта"
                        disabled={saving}
                      />
                      {errors.architectName && <p className="text-red-500 text-sm mt-1">{errors.architectName}</p>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <input
                      type="text"
                      value={formData.architectPhone}
                      onChange={(e) => handleInputChange('architectPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+359..."
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.architectEmail}
                      onChange={(e) => handleInputChange('architectEmail', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.architectEmail ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="email@example.com"
                      disabled={saving}
                    />
                    {errors.architectEmail && <p className="text-red-500 text-sm mt-1">{errors.architectEmail}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Комисионна (%)
                  </label>
                  <input
                    type="number"
                    value={formData.architectCommission}
                    onChange={(e) => handleInputChange('architectCommission', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.architectCommission ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={saving}
                  />
                  {errors.architectCommission && <p className="text-red-500 text-sm mt-1">{errors.architectCommission}</p>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {saving ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Записване...' : 'Запази промените'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Client Modal for creating new architect */}
      <ClientModal
        isOpen={showClientModal}
        onClose={() => {
          setShowClientModal(false);
          setNewArchitectData(null);
        }}
        onSave={handleClientModalSave}
        initialData={newArchitectData}
      />
    </>
  );
} 