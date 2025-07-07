'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader, Search, Plus } from 'lucide-react';
import { projectsApi, Project } from '@/services/projectsApi';
import { CreateProjectDto } from '@/types/project';
import { clientsApi } from '@/services/clientsApi';
import { Client, CreateClientDto } from '@/types/client';
import ClientModal from '@/components/clients/ClientModal';

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const [loadingClients, setLoadingClients] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Architect-related state
  const [architects, setArchitects] = useState<Client[]>([]);
  const [loadingArchitects, setLoadingArchitects] = useState(false);
  const [architectSearchTerm, setArchitectSearchTerm] = useState('');
  const [filteredArchitects, setFilteredArchitects] = useState<Client[]>([]);
  const [showArchitectDropdown, setShowArchitectDropdown] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [newArchitectData, setNewArchitectData] = useState<CreateClientDto | null>(null);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true);
        const projectData = await projectsApi.getProjectById(projectId);
        setProject(projectData);
        
        // Populate form with project data
        setFormData({
          clientId: projectData.clientId || '',
          name: projectData.name || '',
          projectType: projectData.projectType || 'apartment',
          address: projectData.address || '',
          description: projectData.description || '',
          city: projectData.city || '',
          architectType: projectData.architectType || 'none',
          architectId: projectData.architectId || '',
          architectName: projectData.architectName || '',
          architectCommission: projectData.architectCommission?.toString() || '',
          architectPhone: projectData.architectPhone || '',
          architectEmail: projectData.architectEmail || '',
        });
      } catch (error) {
        console.error('Error loading project:', error);
        setError('Грешка при зареждане на проекта');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  // Load clients
  useEffect(() => {
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

    loadClients();
  }, []);

  // Load architects
  useEffect(() => {
    const loadArchitects = async () => {
      try {
        setLoadingArchitects(true);
        const architectsResponse = await clientsApi.getClients();
        const architectClients = architectsResponse.data?.filter(client => client.isArchitect) || [];
        setArchitects(architectClients);
        setFilteredArchitects(architectClients);
      } catch (error) {
        console.error('Error loading architects:', error);
      } finally {
        setLoadingArchitects(false);
      }
    };

    loadArchitects();
  }, []);

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

  const handleCreateArchitect = () => {
    setShowClientModal(true);
  };

  const handleClientModalSave = async (clientData: CreateClientDto) => {
    try {
      console.log('Creating new architect with data:', clientData);
      
      // Save the new architect client
      const savedClient = await clientsApi.createClient(clientData);
      console.log('Architect created successfully:', savedClient);
      
      // Add the new architect to the local list immediately
      const newArchitect = { ...savedClient, isArchitect: true };
      setArchitects(prev => [...prev, newArchitect]);
      setFilteredArchitects(prev => [...prev, newArchitect]);
      
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
      setShowArchitectDropdown(false);
      
      // Reload architects list from server after a short delay
      setTimeout(async () => {
        try {
          const architectsResponse = await clientsApi.getClients();
          const architectClients = architectsResponse.data?.filter(client => client.isArchitect) || [];
          setArchitects(architectClients);
          setFilteredArchitects(architectClients);
        } catch (error) {
          console.error('Error reloading architects:', error);
        }
      }, 1000);
      
      setShowClientModal(false);
    } catch (error) {
      console.error('Error creating architect:', error);
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
      architectType: 'external',
    }));
    setArchitectSearchTerm(`${architect.firstName} ${architect.lastName}`);
    setShowArchitectDropdown(false);
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

      await projectsApi.updateProject(projectId, projectData);
      
      // Redirect to project details
      router.push(`/projects/${projectId}`);
      
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Грешка при запазване на проекта');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Зареждане на проекта...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Назад към проектите
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Назад
            </button>
          </div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Редактиране на проект
          </h1>
          <p className="text-gray-600">
            Променете данните на проекта "{project?.name}"
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Клиент <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clientId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loadingClients}
              >
                <option value="">Изберете клиент</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
              )}
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Име на проекта <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Въведете име на проекта"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Project Type and Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип проект
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apartment">Апартамент</option>
                  <option value="house">Къща</option>
                  <option value="office">Офис</option>
                  <option value="commercial">Търговски обект</option>
                  <option value="other">Друго</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Въведете адрес"
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
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Въведете описание на проекта"
              />
            </div>

            {/* Architect Section */}
            <div className="border-t pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Архитект</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип архитект
                  </label>
                  <select
                    value={formData.architectType}
                    onChange={(e) => handleInputChange('architectType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">Без архитект</option>
                    <option value="client">Клиентът е архитект</option>
                    <option value="external">Външен архитект</option>
                  </select>
                </div>

                {formData.architectType === 'external' && (
                  <>
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
                            onFocus={() => setShowArchitectDropdown(true)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Търси архитект..."
                          />
                          
                          {/* Architect Dropdown */}
                          {showArchitectDropdown && filteredArchitects.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredArchitects.map((architect) => (
                                <div
                                  key={architect.id}
                                  onClick={() => handleArchitectSelect(architect)}
                                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium">
                                    {architect.firstName} {architect.lastName}
                                  </div>
                                  {architect.companyName && (
                                    <div className="text-sm text-gray-600">
                                      {architect.companyName}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleCreateArchitect}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          style={{ outline: '2px solid red' }}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Име на архитект <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.architectName}
                        onChange={(e) => handleInputChange('architectName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.architectName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Въведете име на архитект"
                      />
                      {errors.architectName && (
                        <p className="mt-1 text-sm text-red-600">{errors.architectName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          value={formData.architectPhone}
                          onChange={(e) => handleInputChange('architectPhone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+359 888 123 456"
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
                          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.architectEmail ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="architect@example.com"
                        />
                        {errors.architectEmail && (
                          <p className="mt-1 text-sm text-red-600">{errors.architectEmail}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {formData.architectType !== 'none' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Комисионна (%)
                    </label>
                    <input
                      type="number"
                      value={formData.architectCommission}
                      onChange={(e) => handleInputChange('architectCommission', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.architectCommission ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="10"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    {errors.architectCommission && (
                      <p className="mt-1 text-sm text-red-600">{errors.architectCommission}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-8 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Отказ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Запазване...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Запази промените
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Client Modal for creating new architect */}
      {showClientModal && (
        <ClientModal
          isOpen={showClientModal}
          onClose={() => setShowClientModal(false)}
          onSave={handleClientModalSave}
          initialData={null}
        />
      )}
    </div>
  );
} 