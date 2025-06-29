'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, X, MapPin, Users, Building, Phone, Mail, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

// Types and API imports
import { Client, CreateClientDto } from '../../../types/client';
import { Contact, CreateProjectDto, PROJECT_TYPES, CONTACT_ROLES } from '../../../types/project';
import { clientsApi } from '../../../services/clientsApi';
import { projectsApi } from '../../../services/projectsApi';
import ClientModal from '../../../components/clients/ClientModal';
import { architectsApi } from '../../../services/architectsApi';

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showClientModal, setShowClientModal] = useState(false);
  const [architectSearchTerm, setArchitectSearchTerm] = useState('');
  const [architects, setArchitects] = useState<Client[]>([]);
  const [architectLoading, setArchitectLoading] = useState(false);

  // Form data
  const [projectData, setProjectData] = useState<Omit<CreateProjectDto, 'contacts'>>({
    clientId: '',
    name: '',
    projectType: 'apartment',
    address: '',
    description: '',
    city: 'София',
    totalArea: undefined,
    roomsCount: undefined,
    floorsCount: undefined,
    estimatedBudget: undefined,
    startDate: new Date().toISOString().split('T')[0], // Today's date
    expectedCompletionDate: '',
    // Architect fields
    architectType: 'none',
    architectId: '',
    architectName: '',
    architectCommission: 0,
    architectPhone: '',
    architectEmail: ''
  });

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: '',
      phone: '',
      email: '',
      role: 'Собственик',
      receivesOffers: true,
      receivesInvoices: true,
      receivesUpdates: true,
      isPrimary: true
    }
  ]);

  // Load clients from API
  useEffect(() => {
    const loadClients = async () => {
      if (!searchTerm) {
        setClients([]);
        return;
      }

      setLoading(true);
      try {
        // Load all active clients and filter on frontend for better case-insensitive search
        const response = await clientsApi.getClients({
          limit: 200 // Load more clients for better search results
        });
        
        // Client-side case-insensitive filtering
        const filteredClients = response.data.filter(client => {
          const searchLower = searchTerm.toLowerCase();
          return (
            client.firstName.toLowerCase().includes(searchLower) ||
            client.lastName.toLowerCase().includes(searchLower) ||
            (client.email && client.email.toLowerCase().includes(searchLower)) ||
            (client.phone && client.phone.includes(searchTerm)) ||
            (client.companyName && client.companyName.toLowerCase().includes(searchLower)) ||
            (client.eikBulstat && client.eikBulstat.includes(searchTerm))
          );
        });
        
        setClients(filteredClients.slice(0, 10));
      } catch (error) {
        console.error('Error loading clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(loadClients, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load architects when search term changes
  useEffect(() => {
    const loadArchitects = async () => {
      if (!architectSearchTerm || projectData.architectType !== 'external') {
        setArchitects([]);
        return;
      }

      setArchitectLoading(true);
      try {
        // Load more architects for better search results
        const foundArchitects = await architectsApi.searchArchitects('', 200); // Get all architects first
        
        // Client-side case-insensitive filtering for better results
        const filteredArchitects = foundArchitects.filter(architect => {
          const searchLower = architectSearchTerm.toLowerCase();
          return (
            architect.firstName.toLowerCase().includes(searchLower) ||
            architect.lastName.toLowerCase().includes(searchLower) ||
            `${architect.firstName} ${architect.lastName}`.toLowerCase().includes(searchLower) ||
            architect.email?.toLowerCase().includes(searchLower) ||
            architect.phone?.toLowerCase().includes(searchLower) ||
            architect.companyName?.toLowerCase().includes(searchLower)
          );
        });
        
        setArchitects(filteredArchitects.slice(0, 10)); // Limit to 10 results for display
      } catch (error) {
        console.error('Error loading architects:', error);
        setArchitects([]);
      } finally {
        setArchitectLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadArchitects, 300);
    return () => clearTimeout(debounceTimer);
  }, [architectSearchTerm, projectData.architectType]);

  // Initialize with URL params for pre-selected client
  useEffect(() => {
    // Check for URL parameters to pre-populate client data
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    const clientName = urlParams.get('clientName');
    const clientPhone = urlParams.get('clientPhone');
    const clientEmail = urlParams.get('clientEmail');
    const isArchitect = urlParams.get('isArchitect') === 'true';
    const architectCommission = urlParams.get('architectCommission');
    
    if (clientId && clientName) {
      // Create a client object from URL params
      const preSelectedClient = {
        id: clientId,
        firstName: clientName.split(' ')[0] || '',
        lastName: clientName.split(' ').slice(1).join(' ') || '',
        phone: clientPhone || '',
        email: clientEmail || '',
        isArchitect: isArchitect,
        commissionPercent: architectCommission ? parseInt(architectCommission) : 10,
        hasCompany: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Auto-select the client
      setSelectedClient(preSelectedClient as any);
      setProjectData(prev => ({
        ...prev,
        clientId: clientId,
        ...(isArchitect ? {
          architectType: 'client' as const,
          architectId: clientId,
          architectName: clientName,
          architectCommission: architectCommission ? parseInt(architectCommission) : 10
        } : {})
      }));
      
      // Auto-fill first contact
      setContacts(prev => [{
        ...prev[0],
        name: clientName,
        phone: clientPhone || '',
        email: clientEmail || ''
      }]);
      
      // Clear URL params to keep clean URL
      window.history.replaceState({}, '', '/projects/create');
    }
  }, []);

  // Client selection handler
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setProjectData(prev => ({ 
      ...prev, 
      clientId: client.id,
      // Auto-configure architect if client is architect
      ...(client.isArchitect ? {
        architectType: 'client' as const,
        architectId: client.id,
        architectName: `${client.firstName} ${client.lastName}`,
        architectCommission: client.commissionPercent || 10
      } : {})
    }));
    
    // Auto-fill first contact with client data
    setContacts(prev => [{
      ...prev[0],
      name: `${client.firstName} ${client.lastName}`,
      phone: client.phone || '',
      email: client.email || ''
    }]);
  };

  // Contact management
  const addContact = () => {
    if (contacts.length >= 3) return;
    
    setContacts(prev => [...prev, {
      id: Date.now(),
      name: '',
      phone: '',
      email: '',
      role: 'Друго',
      receivesOffers: false,
      receivesInvoices: false,
      receivesUpdates: false,
      isPrimary: false
    }]);
  };

  const removeContact = (id: number) => {
    if (contacts.length <= 1) return;
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const updateContact = (id: number, field: keyof Contact, value: any) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  // Validation
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!selectedClient) newErrors.client = 'Моля, изберете клиент';
      if (!projectData.name.trim()) newErrors.name = 'Името на проекта е задължително';
      if (!projectData.projectType) newErrors.projectType = 'Моля, изберете тип проект';
      
      // Architect validation
      if (projectData.architectType === 'external') {
        if (!projectData.architectName?.trim()) newErrors.architectName = 'Името на архитекта е задължително';
        if ((projectData.architectCommission || 0) < 0 || (projectData.architectCommission || 0) > 50) {
          newErrors.architectCommission = 'Комисионната трябва да е между 0% и 50%';
        }
      }
    }

    if (stepNumber === 2) {
      // Contact validation
      const hasOfferReceiver = contacts.some(c => c.receivesOffers);
      const hasInvoiceReceiver = contacts.some(c => c.receivesInvoices);
      
      if (!hasOfferReceiver) newErrors.contacts = 'Поне един контакт трябва да получава оферти';
      if (!hasInvoiceReceiver) newErrors.contacts = 'Поне един контакт трябва да получава фактури';
      
      contacts.forEach((contact, index) => {
        if (!contact.name.trim()) newErrors[`contact_${index}_name`] = 'Името е задължително';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      const projectPayload: CreateProjectDto = {
        ...projectData,
        contacts: contacts
      };

      const newProject = await projectsApi.createProject(projectPayload);
      
      // Success - redirect to project details or projects list
      router.push(`/projects/${newProject.id}`);
      
    } catch (error) {
      console.error('Error creating project:', error);
      setErrors({ submit: 'Грешка при създаване на проект. Моля опитайте отново.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/projects');
  };

  // Client modal handlers
  const handleClientSave = async (clientData: CreateClientDto) => {
    try {
      const newClient = await clientsApi.createClient(clientData);
      
      setShowClientModal(false);
      setSearchTerm(''); // Clear search term to hide search results
      setSelectedClient(newClient);
      setProjectData(prev => ({ 
        ...prev, 
        clientId: newClient.id,
        // Auto-configure architect if client is architect
        ...(newClient.isArchitect ? {
          architectType: 'client' as const,
          architectId: newClient.id,
          architectName: `${newClient.firstName} ${newClient.lastName}`,
          architectCommission: newClient.commissionPercent || 10
        } : {})
      }));
      
      // Auto-fill first contact with client data
      setContacts(prev => [{
        ...prev[0],
        name: `${newClient.firstName} ${newClient.lastName}`,
        phone: newClient.phone || '',
        email: newClient.email || ''
      }]);

      // Force reload clients list from server to ensure it includes the new client
      // Add the new client immediately to the search results
      setClients(prev => [newClient, ...prev.filter(c => c.id !== newClient.id)]);
      
    } catch (error) {
      console.error('Error creating client:', error);
      throw error; // Re-throw so modal shows error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Създаване на нов проект</h1>
                <p className="text-gray-600 mt-1">Въведете информацията за новия проект</p>
              </div>
            </div>
            <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step >= stepNumber 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step > stepNumber ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Основни данни</span>
              <span className="text-sm text-gray-600">Контакти</span>
              <span className="text-sm text-gray-600">Преглед</span>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Основна информация</h2>
            
            {/* Client Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Клиент *
              </label>
              
              {!selectedClient ? (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Търсене на клиент по име, телефон или фирма..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => setShowClientModal(true)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      title="Създай нов клиент"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {searchTerm && (
                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">Търсене...</div>
                      ) : clients.length > 0 ? (
                        clients.map(client => (
                          <div
                            key={client.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleClientSelect(client)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium text-gray-900">
                                    {client.firstName} {client.lastName}
                                  </h3>
                                  {client.isArchitect && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      Архитект
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {client.phone}
                                  </span>
                                  <span className="flex items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {client.email}
                                  </span>
                                </div>
                                {client.hasCompany && (
                                  <div className="flex items-center mt-1 text-sm text-gray-600">
                                    <Building className="w-3 h-3 mr-1" />
                                    {client.companyName}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          Няма намерени клиенти
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {selectedClient.firstName} {selectedClient.lastName}
                        </h3>
                        {selectedClient.isArchitect && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Архитект ({selectedClient.commissionPercent}%)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{selectedClient.phone}</span>
                        <span>{selectedClient.email}</span>
                      </div>
                      {selectedClient.hasCompany && (
                        <div className="mt-1 text-sm text-gray-600">
                          <Building className="w-3 h-3 inline mr-1" />
                          {selectedClient.companyName}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedClient(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {errors.client && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.client}
                </p>
              )}
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име на проект *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="напр. Апартамент Витоша"
                  value={projectData.name}
                  onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип проект *
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.projectType ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={projectData.projectType}
                  onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value as any }))}
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                {errors.projectType && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectType}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="напр. ул. Витоша 123, София"
                    value={projectData.address}
                    onChange={(e) => setProjectData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата на създаване
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  value={projectData.startDate}
                  onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                  readOnly
                />
                <p className="text-sm text-gray-500 mt-1">Автоматично попълнено с днешната дата</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Допълнителна информация за проекта..."
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            {/* Architect Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Архитект/Дизайнер</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип архитект
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="architectType"
                        value="none"
                        className="text-blue-600 focus:ring-blue-500"
                        checked={projectData.architectType === 'none'}
                        onChange={(e) => setProjectData(prev => ({ 
                          ...prev, 
                          architectType: e.target.value as any,
                          architectId: '',
                          architectName: '',
                          architectCommission: 0
                        }))}
                      />
                      <span className="ml-2">Без архитект</span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="architectType"
                        value="client"
                        className="text-blue-600 focus:ring-blue-500"
                        checked={projectData.architectType === 'client'}
                        onChange={(e) => setProjectData(prev => ({ 
                          ...prev, 
                          architectType: e.target.value as any,
                          architectId: selectedClient?.isArchitect ? selectedClient.id : '',
                          architectName: selectedClient?.isArchitect ? `${selectedClient.firstName} ${selectedClient.lastName}` : '',
                          architectCommission: selectedClient?.commissionPercent || 10
                        }))}
                        disabled={!selectedClient?.isArchitect}
                      />
                      <span className={`ml-2 ${!selectedClient?.isArchitect ? 'text-gray-400' : ''}`}>
                        Клиентът е архитект
                        {selectedClient?.isArchitect && (
                          <span className="block text-xs text-green-600">
                            {selectedClient.firstName} {selectedClient.lastName} ({selectedClient.commissionPercent}%)
                          </span>
                        )}
                      </span>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="architectType"
                        value="external"
                        className="text-blue-600 focus:ring-blue-500"
                        checked={projectData.architectType === 'external'}
                        onChange={(e) => setProjectData(prev => ({ 
                          ...prev, 
                          architectType: e.target.value as any,
                          architectId: '',
                          architectName: '',
                          architectCommission: 10
                        }))}
                      />
                      <span className="ml-2">Външен архитект</span>
                    </label>
                  </div>
                </div>

                {projectData.architectType === 'external' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Търсене на архитект *
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.architectName ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Търсене на архитект по име..."
                          value={architectSearchTerm}
                          onChange={(e) => setArchitectSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      {/* Architect Search Results */}
                      {architectSearchTerm && projectData.architectType === 'external' && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {architectLoading ? (
                            <div className="p-4 text-center">
                              <div className="inline-flex items-center">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Търсене...
                              </div>
                            </div>
                          ) : architects.length > 0 ? (
                            architects.map((architect) => (
                              <div
                                key={architect.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => {
                                  setProjectData(prev => ({
                                    ...prev,
                                    architectId: architect.id,
                                    architectName: `${architect.firstName} ${architect.lastName}`,
                                    architectCommission: architect.commissionPercent || 10,
                                    architectPhone: architect.phone || '',
                                    architectEmail: architect.email || ''
                                  }));
                                  setArchitectSearchTerm('');
                                  setArchitects([]);
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                      <h3 className="font-medium text-gray-900">
                                        {architect.firstName} {architect.lastName}
                                      </h3>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {architect.commissionPercent || 0}%
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                      {architect.phone && (
                                        <span className="flex items-center">
                                          <Phone className="w-3 h-3 mr-1" />
                                          {architect.phone}
                                        </span>
                                      )}
                                      {architect.email && (
                                        <span className="flex items-center">
                                          <Mail className="w-3 h-3 mr-1" />
                                          {architect.email}
                                        </span>
                                      )}
                                    </div>
                                    {architect.hasCompany && (
                                      <div className="flex items-center mt-1 text-sm text-gray-600">
                                        <Building className="w-3 h-3 mr-1" />
                                        {architect.companyName}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              Няма намерени архитекти
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Selected Architect Display */}
                      {projectData.architectName && !architectSearchTerm && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-green-800">{projectData.architectName}</div>
                              <div className="text-sm text-green-600">
                                Комисионна: {projectData.architectCommission}%
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setProjectData(prev => ({
                                  ...prev,
                                  architectId: '',
                                  architectName: '',
                                  architectCommission: 10,
                                  architectPhone: '',
                                  architectEmail: ''
                                }));
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {errors.architectName && (
                        <p className="mt-1 text-sm text-red-600">{errors.architectName}</p>
                      )}
                    </div>
                  </div>
                )}

                {projectData.architectType === 'client' && selectedClient?.isArchitect && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        {selectedClient.firstName} {selectedClient.lastName} ще получава {selectedClient.commissionPercent}% комисионна
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Комисионната ще се изчислява автоматично при създаване на оферти
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contacts */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Контактни лица</h2>
              <span className="text-sm text-gray-500">Максимум 3 контакта</span>
            </div>

            {/* Contact Search */}
            {contacts.length < 3 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-3">Търсене на съществуващ контакт</h3>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Търсене по име или телефон..."
                      className="w-full pl-10 pr-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={addContact}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                    title="Създай нов контакт"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {searchTerm && (
                  <div className="mt-3 border border-blue-200 rounded-lg max-h-48 overflow-y-auto bg-white">
                    <div className="p-3 text-center text-blue-600 text-sm">
                      Търсене на контакти с "{searchTerm}"...
                      <br />
                      <span className="text-xs text-gray-500">
                        (Функционалността ще бъде добавена в следваща версия)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              {contacts.map((contact, index) => (
                <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      Контакт {index + 1}
                      {contact.isPrimary && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Основен
                        </span>
                      )}
                    </h3>
                    {contacts.length > 1 && (
                      <button
                        onClick={() => removeContact(contact.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Име *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`contact_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={contact.name}
                        onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                      />
                      {errors[`contact_${index}_name`] && (
                        <p className="mt-1 text-sm text-red-600">{errors[`contact_${index}_name`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Роля
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={contact.role}
                        onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                      >
                        {CONTACT_ROLES.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={contact.phone}
                        onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={contact.email}
                        onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Какво получава:
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={contact.receivesOffers}
                          onChange={(e) => updateContact(contact.id, 'receivesOffers', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Оферти</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={contact.receivesInvoices}
                          onChange={(e) => updateContact(contact.id, 'receivesInvoices', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Фактури</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={contact.receivesUpdates}
                          onChange={(e) => updateContact(contact.id, 'receivesUpdates', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Актуализации</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              {contacts.length < 3 && (
                <button
                  onClick={addContact}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Добави контакт
                </button>
              )}

              {errors.contacts && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.contacts}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Преглед на проекта</h2>
            
            <div className="space-y-6">
              {/* Client Info */}
              {selectedClient && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Клиент</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{selectedClient.firstName} {selectedClient.lastName}</span>
                      {selectedClient.isArchitect && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Архитект ({selectedClient.commissionPercent}%)
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedClient.phone} • {selectedClient.email}
                    </div>
                    {selectedClient.hasCompany && (
                      <div className="text-sm text-gray-600">{selectedClient.companyName}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Project Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Проект</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Име:</span>
                      <span className="ml-2 font-medium">{projectData.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Тип:</span>
                      <span className="ml-2">{PROJECT_TYPES.find(t => t.value === projectData.projectType)?.label}</span>
                    </div>
                    {projectData.address && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Адрес:</span>
                        <span className="ml-2">{projectData.address}</span>
                      </div>
                    )}

                  </div>
                </div>
              </div>

              {/* Architect Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Архитект/Дизайнер</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {projectData.architectType === 'none' && (
                    <div className="text-gray-600">Без архитект</div>
                  )}
                  
                  {projectData.architectType === 'client' && selectedClient?.isArchitect && (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{selectedClient.firstName} {selectedClient.lastName}</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Комисионна {selectedClient.commissionPercent}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedClient.phone} • {selectedClient.email}
                      </div>
                    </div>
                  )}
                  
                  {projectData.architectType === 'external' && projectData.architectName && (
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{projectData.architectName}</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Комисионна {projectData.architectCommission}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {projectData.architectPhone} {projectData.architectEmail && `• ${projectData.architectEmail}`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacts */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Контакти ({contacts.length})</h3>
                <div className="space-y-3">
                  {contacts.map((contact, index) => (
                    <div key={contact.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{contact.name} ({contact.role})</div>
                          <div className="text-sm text-gray-600">
                            {contact.phone} {contact.email && `• ${contact.email}`}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {[
                            contact.receivesOffers && 'Оферти',
                            contact.receivesInvoices && 'Фактури', 
                            contact.receivesUpdates && 'Актуализации'
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {errors.submit && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.submit}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </button>

          <div className="space-x-3">
            <button onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Отказ
            </button>
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Напред
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Създаване...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Създай проект
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Client Modal */}
      {showClientModal && (
        <ClientModal
          isOpen={showClientModal}
          onClose={() => setShowClientModal(false)}
          onSave={handleClientSave}
        />
      )}
    </div>
  );
} 