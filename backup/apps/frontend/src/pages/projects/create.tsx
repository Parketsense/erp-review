import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, MapPin, Users, Building, Phone, Mail, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  hasCompany: boolean;
  companyName?: string;
  isArchitect: boolean;
  commissionPercent?: number;
}

interface ProjectContact {
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

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [projectData, setProjectData] = useState({
    clientId: '',
    name: '',
    projectType: 'apartment' as 'apartment' | 'house' | 'office' | 'commercial' | 'other',
    address: '',
    description: '',
    city: 'София',
    totalArea: '',
    roomsCount: '',
    floorsCount: '',
    estimatedBudget: '',
    startDate: '',
    expectedCompletionDate: '',
    // Architect fields
    architectType: 'none' as 'none' | 'client' | 'external',
    architectId: '',
    architectName: '',
    architectCommission: 0,
    architectPhone: '',
    architectEmail: ''
  });

  const [contacts, setContacts] = useState<ProjectContact[]>([
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

  // Mock data - в реалната система ще се зарежда от API
  const mockClients: Client[] = [
    {
      id: '1',
      firstName: 'Иван',
      lastName: 'Петров',
      phone: '+359888123456',
      email: 'ivan.petrov@email.com',
      hasCompany: false,
      isArchitect: false
    },
    {
      id: '2', 
      firstName: 'Мария',
      lastName: 'Иванова',
      phone: '+359887654321',
      email: 'maria@designstudio.bg',
      hasCompany: true,
      companyName: 'Дизайн Студио ЕООД',
      isArchitect: true,
      commissionPercent: 12
    },
    {
      id: '3',
      firstName: 'Георги',
      lastName: 'Стоянов', 
      phone: '+359888999888',
      email: 'g.stoyanov@gmail.com',
      hasCompany: false,
      isArchitect: false
    }
  ];

  // Симулация на API заявка за клиенти
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const filtered = mockClients.filter(client =>
        `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        (client.companyName && client.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setClients(filtered);
      setLoading(false);
    }, 300);
  }, [searchTerm]);

  const projectTypes = [
    { value: 'apartment', label: 'Апартамент', icon: '🏠' },
    { value: 'house', label: 'Къща', icon: '🏡' },
    { value: 'office', label: 'Офис', icon: '🏢' },
    { value: 'commercial', label: 'Търговски обект', icon: '🏪' },
    { value: 'other', label: 'Друго', icon: '📋' }
  ];

  const contactRoles = [
    'Собственик',
    'Съпруг/Съпруга', 
    'Архитект',
    'Счетоводител',
    'Строител',
    'Дизайнер',
    'Друго'
  ];

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setProjectData(prev => ({ 
      ...prev, 
      clientId: client.id,
      // Автоматично настройване на архитект ако клиентът е архитект
      ...(client.isArchitect ? {
        architectType: 'client',
        architectId: client.id,
        architectName: `${client.firstName} ${client.lastName}`,
        architectCommission: client.commissionPercent || 10
      } : {})
    }));
    
    // Автоматично попълване на първия контакт с данните на клиента
    setContacts(prev => [{
      ...prev[0],
      name: `${client.firstName} ${client.lastName}`,
      phone: client.phone || '',
      email: client.email || ''
    }]);
  };

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

  const updateContact = (id: number, field: keyof ProjectContact, value: any) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!selectedClient) newErrors.client = 'Моля, изберете клиент';
      if (!projectData.name.trim()) newErrors.name = 'Името на проекта е задължително';
      if (!projectData.projectType) newErrors.projectType = 'Моля, изберете тип проект';
      
      // Валидация на архитект
      if (projectData.architectType === 'external') {
        if (!projectData.architectName.trim()) newErrors.architectName = 'Името на архитекта е задължително';
        if (projectData.architectCommission < 0 || projectData.architectCommission > 50) {
          newErrors.architectCommission = 'Комисионната трябва да е между 0% и 50%';
        }
      }
    }

    if (stepNumber === 2) {
      // Валидация на контакти
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

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (validateStep(step)) {
      try {
        // Тук ще се прави API call за създаване на проекта
        console.log('Creating project:', { projectData, contacts });
        
        // Симулация на успешно създаване
        setTimeout(() => {
          navigate('/projects');
        }, 1000);
      } catch (error) {
        console.error('Error creating project:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/projects')}
                  className="mr-4 p-2 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Нов проект
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Създаване на нов проект за клиент
                  </p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Основна информация</span>
                </div>
                <div className="w-8 h-1 bg-gray-200"></div>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Контакти</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <div className="space-y-8">
            {/* Client Selection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Избор на клиент
              </h2>
              
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Търсене на клиент по име, телефон или компания..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {loading ? (
                <div className="mt-4 text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedClient?.id === client.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.phone} • {client.email}
                            </div>
                            {client.hasCompany && (
                              <div className="text-sm text-gray-500">
                                {client.companyName}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedClient?.id === client.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {errors.client && (
                <p className="mt-2 text-sm text-red-600">{errors.client}</p>
              )}
            </div>

            {/* Project Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Информация за проекта
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Име на проекта *
                  </label>
                  <input
                    type="text"
                    value={projectData.name}
                    onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Напр. Къща Иванови"
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
                    value={projectData.projectType}
                    onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {projectTypes.map((type) => (
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
                    Адрес *
                  </label>
                  <input
                    type="text"
                    value={projectData.address}
                    onChange={(e) => setProjectData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Пълен адрес на проекта"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Град
                  </label>
                  <input
                    type="text"
                    value={projectData.city}
                    onChange={(e) => setProjectData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Обща площ (м²)
                  </label>
                  <input
                    type="number"
                    value={projectData.totalArea}
                    onChange={(e) => setProjectData(prev => ({ ...prev, totalArea: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Брой стаи
                  </label>
                  <input
                    type="number"
                    value={projectData.roomsCount}
                    onChange={(e) => setProjectData(prev => ({ ...prev, roomsCount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Брой етажи
                  </label>
                  <input
                    type="number"
                    value={projectData.floorsCount}
                    onChange={(e) => setProjectData(prev => ({ ...prev, floorsCount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Очакван бюджет (лв.)
                  </label>
                  <input
                    type="number"
                    value={projectData.estimatedBudget}
                    onChange={(e) => setProjectData(prev => ({ ...prev, estimatedBudget: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата на старт
                  </label>
                  <input
                    type="date"
                    value={projectData.startDate}
                    onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Очаквана дата на завършване
                  </label>
                  <input
                    type="date"
                    value={projectData.expectedCompletionDate}
                    onChange={(e) => setProjectData(prev => ({ ...prev, expectedCompletionDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={projectData.description}
                    onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Допълнителна информация за проекта..."
                  />
                </div>
              </div>
            </div>

            {/* Architect Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Архитект
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип архитект
                  </label>
                  <select
                    value={projectData.architectType}
                    onChange={(e) => setProjectData(prev => ({ ...prev, architectType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">Без архитект</option>
                    <option value="client">Клиентът е архитект</option>
                    <option value="external">Външен архитект</option>
                  </select>
                </div>

                {projectData.architectType === 'external' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Име на архитект *
                      </label>
                      <input
                        type="text"
                        value={projectData.architectName}
                        onChange={(e) => setProjectData(prev => ({ ...prev, architectName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Име на архитект"
                      />
                      {errors.architectName && (
                        <p className="mt-1 text-sm text-red-600">{errors.architectName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Комисионна (%)
                      </label>
                      <input
                        type="number"
                        value={projectData.architectCommission}
                        onChange={(e) => setProjectData(prev => ({ ...prev, architectCommission: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10"
                        min="0"
                        max="50"
                      />
                      {errors.architectCommission && (
                        <p className="mt-1 text-sm text-red-600">{errors.architectCommission}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        value={projectData.architectPhone}
                        onChange={(e) => setProjectData(prev => ({ ...prev, architectPhone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+359"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={projectData.architectEmail}
                        onChange={(e) => setProjectData(prev => ({ ...prev, architectEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="architect@email.com"
                      />
                    </div>
                  </div>
                )}

                {projectData.architectType === 'client' && selectedClient && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Клиентът {selectedClient.firstName} {selectedClient.lastName} е архитект
                        {selectedClient.commissionPercent && ` (${selectedClient.commissionPercent}% комисионна)`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            {/* Contacts */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Контакти за проекта
                </h2>
                <button
                  onClick={addContact}
                  disabled={contacts.length >= 3}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Добави контакт
                </button>
              </div>

              {errors.contacts && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.contacts}</p>
                </div>
              )}

              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        Контакт {index + 1}
                      </h3>
                      {contacts.length > 1 && (
                        <button
                          onClick={() => removeContact(contact.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Име *
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Пълно име"
                        />
                        {errors[`contact_${index}_name`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`contact_${index}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Роля
                        </label>
                        <select
                          value={contact.role}
                          onChange={(e) => updateContact(contact.id, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          {contactRoles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          value={contact.phone}
                          onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+359"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={contact.receivesOffers}
                            onChange={(e) => updateContact(contact.id, 'receivesOffers', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Получава оферти</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={contact.receivesInvoices}
                            onChange={(e) => updateContact(contact.id, 'receivesInvoices', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Получава фактури</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={contact.receivesUpdates}
                            onChange={(e) => updateContact(contact.id, 'receivesUpdates', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Получава обновления</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-6">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </button>

          <div className="flex space-x-3">
            {step < 2 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Напред
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Създай проект
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage; 