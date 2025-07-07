'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, X, MapPin, Users, Building, Phone, Mail, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Trash2, UserPlus } from 'lucide-react';
import { clientsApi } from '../../services/clientsApi';
import { architectsApi } from '../../services/architectsApi';
import ClientModal from '../clients/ClientModal';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  hasCompany: boolean;
  companyName?: string;
  email?: string;
  phone?: string;
}

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  receivesOffers: boolean;
  receivesInvoices: boolean;
  receivesUpdates: boolean;
  isPrimary: boolean;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any) => Promise<void>;
}

export default function CreateProjectModal({ isOpen, onClose, onSave }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  
  // New states for contact client selection
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [showContactClientDropdown, setShowContactClientDropdown] = useState(false);
  const [isSelectingContactClient, setIsSelectingContactClient] = useState(false);
  
  // Architect search states
  const [architects, setArchitects] = useState<Client[]>([]);
  const [architectSearchTerm, setArchitectSearchTerm] = useState('');
  const [showArchitectDropdown, setShowArchitectDropdown] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState<Client | null>(null);
  
  // ClientModal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [newArchitectData, setNewArchitectData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Form data
  const [projectData, setProjectData] = useState({
    clientId: '',
    name: '',
    projectType: 'apartment',
    address: '',
    description: '',
    city: 'София',
    architectType: 'none',
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
      role: 'owner',
      receivesOffers: true,
      receivesInvoices: true,
      receivesUpdates: true,
      isPrimary: true
    }
  ]);

  const projectTypes = [
    { value: 'apartment', label: 'Апартамент', icon: '🏠' },
    { value: 'house', label: 'Къща', icon: '🏡' },
    { value: 'office', label: 'Офис', icon: '🏢' },
    { value: 'commercial', label: 'Търговски обект', icon: '🏪' },
    { value: 'other', label: 'Друго', icon: '📋' }
  ];

  const contactRoles = [
    { value: 'owner', label: 'Собственик' },
    { value: 'spouse', label: 'Съпруг/Съпруга' },
    { value: 'architect', label: 'Архитект' },
    { value: 'accountant', label: 'Счетоводител' },
    { value: 'builder', label: 'Строител' },
    { value: 'designer', label: 'Дизайнер' },
    { value: 'other', label: 'Друго' }
  ];

  // Load clients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadClients();
      // Reset form when modal opens
      setStep(1);
      setSelectedClient(null);
      setSearchTerm('');
      setContactSearchTerm('');
      setShowContactClientDropdown(false);
      setIsSelectingContactClient(false);
      setProjectData({
        clientId: '',
        name: '',
        projectType: 'apartment',
        address: '',
        description: '',
        city: 'София',
        architectType: 'none',
        architectName: '',
        architectCommission: 0,
        architectPhone: '',
        architectEmail: ''
      });
      setContacts([
        {
          id: 1,
          name: '',
          phone: '',
          email: '',
          role: 'owner',
          receivesOffers: true,
          receivesInvoices: true,
          receivesUpdates: true,
          isPrimary: true
        }
      ]);
      setErrors({});
    }
  }, [isOpen]);

  // Load architects when needed
  const loadArchitects = async (searchTerm = '') => {
    try {
      const response = await architectsApi.searchArchitects(searchTerm, 50);
      setArchitects(response);
    } catch (error) {
      console.error('Error loading architects:', error);
      setArchitects([]);
    }
  };

  const loadClients = async () => {
    try {
      const response = await clientsApi.getClients({ limit: 100 });
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const companyName = client.companyName?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || companyName.includes(search);
  });

  const filteredContactClients = clients.filter(client => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const companyName = client.companyName?.toLowerCase() || '';
    const search = contactSearchTerm.toLowerCase();
    
    return fullName.includes(search) || companyName.includes(search);
  });

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setProjectData(prev => ({ ...prev, clientId: client.id }));
    setSearchTerm(`${client.firstName} ${client.lastName}${client.hasCompany ? ` (${client.companyName})` : ''}`);
    setShowClientDropdown(false);
    
    // Auto-fill first contact if client has contact info
    if (client.firstName && client.lastName) {
      setContacts(prev => prev.map((contact, index) => 
        index === 0 ? {
          ...contact,
          name: `${client.firstName} ${client.lastName}`,
          phone: client.phone || '',
          email: client.email || ''
        } : contact
      ));
    }
  };

  // New function to handle selecting existing client as contact
  const handleContactClientSelect = (client: Client) => {
    const newContact: Contact = {
      id: Date.now(),
      name: `${client.firstName} ${client.lastName}`,
      phone: client.phone || '',
      email: client.email || '',
      role: 'other',
      receivesOffers: false,
      receivesInvoices: false,
      receivesUpdates: true,
      isPrimary: false
    };
    
    setContacts(prev => [...prev, newContact]);
    setContactSearchTerm('');
    setShowContactClientDropdown(false);
    setIsSelectingContactClient(false);
  };

  const handleArchitectSelect = (architect: Client) => {
    setSelectedArchitect(architect);
    setProjectData(prev => ({
      ...prev,
      architectId: architect.id,
      architectName: `${architect.firstName} ${architect.lastName}`,
      architectPhone: architect.phone || '',
      architectEmail: architect.email || '',
      architectCommission: (architect as any).commissionPercent || 10
    }));
    setArchitectSearchTerm(`${architect.firstName} ${architect.lastName}`);
    setShowArchitectDropdown(false);
  };

  const handleCreateNewArchitect = () => {
    setShowClientModal(true);
    setNewArchitectData({
      isArchitect: true,
      commissionPercent: 10
    });
  };

  const handleClientModalSave = async (clientData: any) => {
    try {
      console.log('ClientModal onSave called with:', clientData);
      
      // Save the new architect client
      const savedClient = await clientsApi.createClient(clientData);
      console.log('Saved architect client:', savedClient);
      
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
      } as any;
      
      setArchitects(prev => [newArchitect, ...prev]);
      
      // Auto-fill the architect data in the project form
      setProjectData(prev => ({
        ...prev,
        architectId: savedClient.id,
        architectName: `${savedClient.firstName} ${savedClient.lastName}`,
        architectPhone: savedClient.phone || '',
        architectEmail: savedClient.email || '',
        architectCommission: (savedClient as any).commissionPercent || 10,
        architectType: 'external',
      }));
      
      // Set the selected architect
      setSelectedArchitect(newArchitect);
      setArchitectSearchTerm(`${savedClient.firstName} ${savedClient.lastName}`);
      setShowArchitectDropdown(false);
      
      setShowClientModal(false);
      setNewArchitectData(null);
      
      // Also reload the full list from server to ensure consistency
      setTimeout(() => {
        loadArchitects();
      }, 100);
      
    } catch (error) {
      console.error('Error creating architect:', error);
    }
  };

  const validateStep = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!projectData.clientId) newErrors.clientId = 'Изберете клиент';
      if (!projectData.name.trim()) newErrors.name = 'Въведете име на проект';
      
      // Validate architect fields
      if (projectData.architectType === 'external' && !projectData.architectName.trim()) {
        newErrors.architectName = 'Името на архитекта е задължително за външен архитект';
      }
      
      if (projectData.architectType !== 'none' && projectData.architectCommission) {
        const commission = projectData.architectCommission;
        if (isNaN(commission) || commission < 0 || commission > 100) {
          newErrors.architectCommission = 'Комисионната трябва да бъде между 0 и 100%';
        }
      }
      
      if (projectData.architectEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(projectData.architectEmail)) {
        newErrors.architectEmail = 'Невалиден email адрес';
      }
    }
    
    if (step === 2) {
      // Validate at least one contact
      const hasValidContact = contacts.some(contact => 
        contact.name.trim() && (contact.phone.trim() || contact.email.trim())
      );
      if (!hasValidContact) {
        newErrors.contacts = 'Добавете поне един контакт с име и телефон/email';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleContactChange = (index: number, field: string, value: any) => {
    setContacts(prev => prev.map((contact, i) => 
      i === index ? { ...contact, [field]: value } : contact
    ));
  };

  const addContact = () => {
    const newContact: Contact = {
      id: Date.now(),
      name: '',
      phone: '',
      email: '',
      role: 'other',
      receivesOffers: false,
      receivesInvoices: false,
      receivesUpdates: true,
      isPrimary: false
    };
    setContacts(prev => [...prev, newContact]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      // Prepare contacts data
      const validContacts = contacts
        .filter(contact => contact.name.trim() && (contact.phone.trim() || contact.email.trim()))
        .map(contact => ({
          name: contact.name.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim(),
          role: contact.role,
          receivesOffers: contact.receivesOffers,
          receivesInvoices: contact.receivesInvoices,
          receivesUpdates: contact.receivesUpdates,
          isPrimary: contact.isPrimary
        }));

      const finalProjectData = {
        ...projectData,
        contacts: validContacts
      };

      await onSave(finalProjectData);
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-white rounded-t-lg shadow-sm p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Създаване на нов проект</h1>
              <p className="text-gray-600 mt-1">Въведете информацията за новия проект</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
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

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Основна информация</h2>
              
              {/* Client Search */}
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Клиент *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.clientId ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Търсете клиент по име или фирма..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowClientDropdown(true);
                      if (!e.target.value) {
                        setSelectedClient(null);
                        setProjectData(prev => ({ ...prev, clientId: '' }));
                      }
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                  />
                  <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
                
                {/* Client Dropdown */}
                {showClientDropdown && filteredClients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                        </div>
                        {client.hasCompany && client.companyName && (
                          <div className="text-sm text-gray-600">{client.companyName}</div>
                        )}
                        {client.email && (
                          <div className="text-sm text-gray-500">{client.email}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {errors.clientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
                )}
              </div>

              {/* Project name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име на проект *
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="напр. Апартамент Витоша"
                  value={projectData.name}
                  onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Project type and other fields in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип проект *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={projectData.projectType}
                    onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value }))}
                  >
                    {projectTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Град
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={projectData.city}
                    onChange={(e) => setProjectData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="напр. ул. Витоша 15"
                  value={projectData.address}
                  onChange={(e) => setProjectData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Кратко описание на проекта..."
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Architect Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Архитект
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={projectData.architectType}
                  onChange={(e) => setProjectData(prev => ({ ...prev, architectType: e.target.value }))}
                >
                  <option value="none">Няма архитект</option>
                  <option value="client">Клиентът е архитект</option>
                  <option value="external">Външен архитект</option>
                </select>
              </div>

              {/* Architect Details */}
              {projectData.architectType !== 'none' && (
                <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Данни за архитект</h3>
                  
                  {projectData.architectType === 'external' && (
                    <div className="space-y-4">
                      {/* Architect Search Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Търсене на архитект
                          </label>
                          <button
                            type="button"
                            onClick={handleCreateNewArchitect}
                            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Нов архитект
                          </button>
                        </div>
                        
                        <div className="relative">
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Търсете архитект по име или фирма..."
                              value={architectSearchTerm}
                              onChange={(e) => {
                                setArchitectSearchTerm(e.target.value);
                                loadArchitects(e.target.value);
                                setShowArchitectDropdown(true);
                              }}
                              onFocus={() => {
                                loadArchitects(architectSearchTerm);
                                setShowArchitectDropdown(true);
                              }}
                            />
                            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                            
                            {/* Architect Dropdown */}
                            {showArchitectDropdown && architects.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {architects.map((architect) => (
                                  <div
                                    key={architect.id}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleArchitectSelect(architect)}
                                  >
                                    <div className="font-medium text-gray-900">
                                      {architect.firstName} {architect.lastName}
                                    </div>
                                    {architect.hasCompany && architect.companyName && (
                                      <div className="text-sm text-gray-600">{architect.companyName}</div>
                                    )}
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                      {architect.email && <span>{architect.email}</span>}
                                      {architect.phone && <span>{architect.phone}</span>}
                                      {(architect as any).commissionPercent && (
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                          Комисионна {(architect as any).commissionPercent}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Selected Architect Display */}
                        {selectedArchitect && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-green-900">
                                  {selectedArchitect.firstName} {selectedArchitect.lastName}
                                </div>
                                {selectedArchitect.hasCompany && selectedArchitect.companyName && (
                                  <div className="text-sm text-green-700">{selectedArchitect.companyName}</div>
                                )}
                                <div className="text-sm text-green-600">
                                  {selectedArchitect.email} • {selectedArchitect.phone}
                                  {(selectedArchitect as any).commissionPercent && (
                                    <span className="ml-2">• Комисионна {(selectedArchitect as any).commissionPercent}%</span>
                                  )}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedArchitect(null);
                                  setArchitectSearchTerm('');
                                  setProjectData(prev => ({
                                    ...prev,
                                    architectId: '',
                                    architectName: '',
                                    architectPhone: '',
                                    architectEmail: '',
                                    architectCommission: 10
                                  }));
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>


                    </div>
                  )}

                  {/* Additional fields only for new architect creation */}
                  {selectedArchitect && (
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Телефон
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+359..."
                            value={projectData.architectPhone}
                            onChange={(e) => setProjectData(prev => ({ ...prev, architectPhone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.architectEmail ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="email@example.com"
                            value={projectData.architectEmail}
                            onChange={(e) => setProjectData(prev => ({ ...prev, architectEmail: e.target.value }))}
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
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.architectCommission ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.1"
                          value={projectData.architectCommission}
                          onChange={(e) => setProjectData(prev => ({ ...prev, architectCommission: parseFloat(e.target.value) || 0 }))}
                        />
                        {errors.architectCommission && <p className="text-red-500 text-sm mt-1">{errors.architectCommission}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Contacts */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Контактни лица</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsSelectingContactClient(true)}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Избери клиент
                  </button>
                  <button
                    onClick={addContact}
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Нов контакт
                  </button>
                </div>
              </div>

              {/* Client Selection Modal */}
              {isSelectingContactClient && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-blue-900">Избери съществуващ клиент като контакт</h3>
                    <button
                      onClick={() => {
                        setIsSelectingContactClient(false);
                        setContactSearchTerm('');
                        setShowContactClientDropdown(false);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Търсете клиент по име или фирма..."
                      value={contactSearchTerm}
                      onChange={(e) => {
                        setContactSearchTerm(e.target.value);
                        setShowContactClientDropdown(true);
                      }}
                      onFocus={() => setShowContactClientDropdown(true)}
                    />
                    <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
                  </div>
                  
                  {/* Contact Client Dropdown */}
                  {showContactClientDropdown && filteredContactClients.length > 0 && (
                    <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredContactClients.map((client) => (
                        <div
                          key={client.id}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleContactClientSelect(client)}
                        >
                          <div className="font-medium text-gray-900">
                            {client.firstName} {client.lastName}
                          </div>
                          {client.hasCompany && client.companyName && (
                            <div className="text-sm text-gray-600">{client.companyName}</div>
                          )}
                          {client.email && (
                            <div className="text-sm text-gray-500">{client.email}</div>
                          )}
                          {client.phone && (
                            <div className="text-sm text-gray-500">{client.phone}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {errors.contacts && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.contacts}</p>
                </div>
              )}

              {/* Contacts List */}
              <div className="space-y-6">
                {contacts.map((contact, index) => (
                  <div key={contact.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">
                        Контакт {index + 1}
                        {contact.isPrimary && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Основен
                          </span>
                        )}
                      </h3>
                      {contacts.length > 1 && (
                        <button
                          onClick={() => removeContact(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
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
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={contact.name}
                          onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                          placeholder="Име и фамилия"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Роля
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={contact.role}
                          onChange={(e) => handleContactChange(index, 'role', e.target.value)}
                        >
                          {contactRoles.map(role => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={contact.phone}
                          onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                          placeholder="+359 888 123 456"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={contact.email}
                          onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    {/* Contact preferences */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Получава:
                      </label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={contact.receivesOffers}
                            onChange={(e) => handleContactChange(index, 'receivesOffers', e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-700">Оферти</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={contact.receivesInvoices}
                            onChange={(e) => handleContactChange(index, 'receivesInvoices', e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-700">Фактури</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={contact.receivesUpdates}
                            onChange={(e) => handleContactChange(index, 'receivesUpdates', e.target.checked)}
                          />
                          <span className="ml-2 text-sm text-gray-700">Актуализации</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={contact.isPrimary}
                            onChange={(e) => {
                              // Make this primary and remove primary from others
                              if (e.target.checked) {
                                setContacts(prev => prev.map((c, i) => ({
                                  ...c,
                                  isPrimary: i === index
                                })));
                              }
                            }}
                          />
                          <span className="ml-2 text-sm text-gray-700">Основен контакт</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Преглед на проекта</h2>
              
              <div className="space-y-6">
                {/* Project Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Основна информация</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Клиент:</span>
                      <span className="ml-2 font-medium">
                        {selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Не е избран'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Име на проект:</span>
                      <span className="ml-2 font-medium">{projectData.name || 'Не е въведено'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Тип:</span>
                      <span className="ml-2">{projectTypes.find(t => t.value === projectData.projectType)?.label}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Град:</span>
                      <span className="ml-2">{projectData.city}</span>
                    </div>
                    {projectData.address && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Адрес:</span>
                        <span className="ml-2">{projectData.address}</span>
                      </div>
                    )}
                    {projectData.description && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Описание:</span>
                        <span className="ml-2">{projectData.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Architect Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Архитект</h3>
                  
                  {projectData.architectType === 'none' ? (
                    <div className="text-center py-6">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Няма архитект</p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Тип:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          projectData.architectType === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {projectData.architectType === 'client' ? 'Клиентът' : 'Външен'}
                        </span>
                      </div>

                      {projectData.architectName && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Име:</span>
                          <span className="font-medium">{projectData.architectName}</span>
                        </div>
                      )}

                      {projectData.architectPhone && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Телефон:</span>
                          <span>{projectData.architectPhone}</span>
                        </div>
                      )}

                      {projectData.architectEmail && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span>{projectData.architectEmail}</span>
                        </div>
                      )}

                      {projectData.architectCommission > 0 && (
                        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-purple-700">Комисионна:</span>
                            <span className="font-medium text-purple-900">{projectData.architectCommission}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Contacts Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Контакти ({contacts.filter(c => c.name.trim()).length})</h3>
                  <div className="space-y-3">
                    {contacts.filter(c => c.name.trim()).map((contact, index) => (
                      <div key={contact.id} className="bg-white rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{contact.name}</span>
                          {contact.isPrimary && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Основен
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Роля: {contactRoles.find(r => r.value === contact.role)?.label}</div>
                          {contact.phone && <div>Телефон: {contact.phone}</div>}
                          {contact.email && <div>Email: {contact.email}</div>}
                          <div>
                            Получава: {[
                              contact.receivesOffers && 'Оферти',
                              contact.receivesInvoices && 'Фактури', 
                              contact.receivesUpdates && 'Актуализации'
                            ].filter(Boolean).join(', ') || 'Нищо'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </button>

          <div className="space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
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

      {/* ClientModal for creating new architect */}
      {showClientModal && (
        <ClientModal
          isOpen={showClientModal}
          onClose={() => {
            setShowClientModal(false);
            setNewArchitectData(null);
          }}
          onSave={handleClientModalSave}
          initialData={newArchitectData}
        />
      )}
    </div>
  );
} 