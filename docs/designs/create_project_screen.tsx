import React, { useState, useEffect } from 'react';
import { Search, Plus, X, MapPin, Users, Building, Phone, Mail, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const CreateProjectScreen = () => {
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form data
  const [projectData, setProjectData] = useState({
    clientId: '',
    name: '',
    projectType: 'apartment',
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
    architectType: 'none', // 'none', 'client', 'external'
    architectId: '',
    architectName: '',
    architectCommission: 0,
    architectPhone: '',
    architectEmail: ''
  });

  const [contacts, setContacts] = useState([
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
  const mockClients = [
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

  const handleClientSelect = (client) => {
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

  const removeContact = (id) => {
    if (contacts.length <= 1) return;
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const updateContact = (id, field, value) => {
    setContacts(prev => prev.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

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

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setLoading(true);
    try {
      // Симулация на API заявка
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Тук би се направила реалната API заявка:
      /*
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...projectData,
          contacts: contacts
        })
      });
      */
      
      alert('Проектът е създаден успешно!');
      
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Създаване на нов проект</h1>
              <p className="text-gray-600 mt-1">Въведете информацията за новия проект</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
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
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Търсене на клиент по име, телефон или фирма..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                          <button className="block mx-auto mt-2 text-blue-600 hover:text-blue-800">
                            Създай нов клиент
                          </button>
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
                  onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value }))}
                >
                  {projectTypes.map(type => (
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
                  Площ (кв.м)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="120"
                  value={projectData.totalArea}
                  onChange={(e) => setProjectData(prev => ({ ...prev, totalArea: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Брой стаи
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3"
                  value={projectData.roomsCount}
                  onChange={(e) => setProjectData(prev => ({ ...prev, roomsCount: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Очакван бюджет (лв.)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="15000"
                  value={projectData.estimatedBudget}
                  onChange={(e) => setProjectData(prev => ({ ...prev, estimatedBudget: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата на започване
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={projectData.startDate}
                  onChange={(e) => setProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                />
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

            {/* Architect/Designer Section */}
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
                          architectType: e.target.value,
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
                          architectType: e.target.value,
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
                          architectType: e.target.value,
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Име на архитект *
                      </label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.architectName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="напр. Иван Петров"
                        value={projectData.architectName}
                        onChange={(e) => setProjectData(prev => ({ ...prev, architectName: e.target.value }))}
                      />
                      {errors.architectName && (
                        <p className="mt-1 text-sm text-red-600">{errors.architectName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Комисионна (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.architectCommission ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="10"
                        value={projectData.architectCommission}
                        onChange={(e) => setProjectData(prev => ({ ...prev, architectCommission: parseFloat(e.target.value) || 0 }))}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+359 888 123 456"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="architect@email.com"
                        value={projectData.architectEmail}
                        onChange={(e) => setProjectData(prev => ({ ...prev, architectEmail: e.target.value }))}
                      />
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
                        {contactRoles.map(role => (
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
                      <span className="ml-2">{projectTypes.find(t => t.value === projectData.projectType)?.label}</span>
                    </div>
                    {projectData.address && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Адрес:</span>
                        <span className="ml-2">{projectData.address}</span>
                      </div>
                    )}
                    {projectData.totalArea && (
                      <div>
                        <span className="text-gray-600">Площ:</span>
                        <span className="ml-2">{projectData.totalArea} кв.м</span>
                      </div>
                    )}
                    {projectData.estimatedBudget && (
                      <div>
                        <span className="text-gray-600">Бюджет:</span>
                        <span className="ml-2">{projectData.estimatedBudget} лв.</span>
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
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </button>

          <div className="space-x-3">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
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
    </div>
  );
};

export default CreateProjectScreen;