import React, { useState, useEffect } from 'react';

// Примерен компонент за създаване на клиент
const CreateClientForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    clientType: 'individual',
    firstName: '',
    lastName: '',
    companyName: '',
    eik: '',
    vatNumber: '',
    companyAddress: '',
    phone: '',
    email: '',
    address: '',
    isArchitect: false,
    commissionPercent: 10,
    notes: '',
    contacts: [{
      name: '',
      phone: '',
      email: '',
      position: '',
      receivesOffers: true,
      receivesInvoices: true,
      isPrimary: true
    }]
  });

  // Update primary contact when basic info changes
  useEffect(() => {
    const name = formData.clientType === 'individual' 
      ? `${formData.firstName} ${formData.lastName}`.trim()
      : formData.companyName;
      
    setFormData(prev => ({
      ...prev,
      contacts: [
        {
          ...prev.contacts[0],
          name: name,
          phone: prev.phone,
          email: prev.email
        },
        ...prev.contacts.slice(1)
      ]
    }));
  }, [formData.firstName, formData.lastName, formData.companyName, formData.phone, formData.email, formData.clientType]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors for this field
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const checkDuplicate = async (phone) => {
    if (!phone) return;
    
    // Simulate API call
    setTimeout(() => {
      if (phone === '+359888123456' || phone === '0888123456') {
        setDuplicateWarning({
          exists: true,
          client: {
            id: '123',
            name: 'Иван Иванов',
            phone: '+359888123456'
          }
        });
      } else {
        setDuplicateWarning(null);
      }
    }, 300);
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (formData.clientType === 'individual') {
      if (!formData.firstName.trim()) newErrors.firstName = 'Името е задължително';
      if (!formData.lastName.trim()) newErrors.lastName = 'Фамилията е задължителна';
    } else {
      if (!formData.companyName.trim()) newErrors.companyName = 'Името на фирмата е задължително';
      if (!formData.eik.trim()) newErrors.eik = 'ЕИК е задължителен';
      else if (!/^\d{9}$|^\d{13}$/.test(formData.eik)) {
        newErrors.eik = 'ЕИК трябва да е 9 или 13 цифри';
      }
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефонът е задължителен';
    } else if (!/^(\+359|0)[87-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Невалиден телефонен номер';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Невалиден email адрес';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addContact = () => {
    if (formData.contacts.length >= 3) {
      alert('Максимум 3 контактни лица');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, {
        name: '',
        phone: '',
        email: '',
        position: '',
        receivesOffers: false,
        receivesInvoices: false,
        isPrimary: false
      }]
    }));
  };

  const removeContact = (index) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Клиентът е успешно създаден!');
      // Redirect or reset form
    } catch (error) {
      setErrors({ submit: 'Грешка при запазване. Моля опитайте отново.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Steps */}
      <div className="flex mb-8 border-b-2 border-gray-200">
        {['Основни данни', 'Контактни лица', 'Преглед и запис'].map((step, index) => (
          <div
            key={index}
            className={`flex-1 text-center pb-4 cursor-pointer ${
              currentStep === index + 1 ? 'border-b-2 border-blue-500 text-blue-500' : ''
            }`}
            onClick={() => currentStep > index + 1 || (currentStep === index + 1) ? setCurrentStep(index + 1) : null}
          >
            <span className={`inline-block w-8 h-8 rounded-full text-white mr-2 ${
              currentStep === index + 1 ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              {index + 1}
            </span>
            {step}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div>
          <h2 className="text-2xl mb-6">Основни данни</h2>
          
          {/* Client Type */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Тип клиент *</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="clientType"
                  value="individual"
                  checked={formData.clientType === 'individual'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Физическо лице
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="clientType"
                  value="company"
                  checked={formData.clientType === 'company'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Юридическо лице
              </label>
            </div>
          </div>

          {/* Individual Fields */}
          {formData.clientType === 'individual' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Име *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Фамилия *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>
          )}

          {/* Company Fields */}
          {formData.clientType === 'company' && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Име на фирма *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">ЕИК/Булстат *</label>
                  <input
                    type="text"
                    name="eik"
                    value={formData.eik}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded ${errors.eik ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.eik && <p className="text-red-500 text-sm mt-1">{errors.eik}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">ДДС номер</label>
                  <input
                    type="text"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </>
          )}

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Телефон *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={(e) => checkDuplicate(e.target.value)}
                className={`w-full p-2 border rounded ${
                  errors.phone ? 'border-red-500' : duplicateWarning ? 'border-yellow-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              {duplicateWarning && (
                <div className="mt-2 p-3 bg-yellow-100 border border-yellow-400 rounded">
                  <p className="text-yellow-800">⚠️ Клиент с този телефон вече съществува:</p>
                  <div className="flex justify-between items-center mt-2">
                    <span>{duplicateWarning.client.name}</span>
                    <button className="text-blue-500 hover:underline text-sm">
                      Виж клиента
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Architect Option */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isArchitect"
                checked={formData.isArchitect}
                onChange={handleInputChange}
                className="mr-2"
              />
              Клиентът е архитект/дизайнер
            </label>
            {formData.isArchitect && (
              <div className="mt-2 ml-6">
                <label className="block text-gray-700 mb-2">Комисионна %</label>
                <input
                  type="number"
                  name="commissionPercent"
                  value={formData.commissionPercent}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-32 p-2 border border-gray-300 rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Contact Persons */}
      {currentStep === 2 && (
        <div>
          <h2 className="text-2xl mb-6">Контактни лица</h2>
          
          {formData.contacts.map((contact, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded mb-4 relative">
              {index > 0 && (
                <button
                  onClick={() => removeContact(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
              
              <h3 className="font-semibold mb-3">
                {index === 0 ? 'Основно лице за контакт' : `Контактно лице ${index + 1}`}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Име"
                  value={contact.name}
                  className="p-2 border border-gray-300 rounded"
                  readOnly={index === 0}
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  value={contact.phone}
                  className="p-2 border border-gray-300 rounded"
                  readOnly={index === 0}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={contact.email}
                  className="p-2 border border-gray-300 rounded"
                  readOnly={index === 0}
                />
                <input
                  type="text"
                  placeholder="Позиция"
                  value={contact.position}
                  className="p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="flex gap-4 mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contact.receivesOffers}
                    className="mr-2"
                  />
                  Получава оферти
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={contact.receivesInvoices}
                    className="mr-2"
                  />
                  Получава фактури
                </label>
              </div>
            </div>
          ))}
          
          {formData.contacts.length < 3 && (
            <button
              onClick={addContact}
              className="mt-2 px-4 py-2 border-2 border-dashed border-blue-500 text-blue-500 rounded hover:bg-blue-50"
            >
              + Добави контактно лице
            </button>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div>
          <h2 className="text-2xl mb-6">Преглед и запис</h2>
          
          <div className="bg-gray-50 p-6 rounded mb-6">
            <h3 className="font-semibold mb-4">Обобщение на данните</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Тип клиент:</span>
                <span className="font-medium">
                  {formData.clientType === 'individual' ? 'Физическо лице' : 'Юридическо лице'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Име:</span>
                <span className="font-medium">
                  {formData.clientType === 'individual' 
                    ? `${formData.firstName} ${formData.lastName}` 
                    : formData.companyName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Телефон:</span>
                <span className="font-medium">{formData.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{formData.email || '-'}</span>
              </div>
              {formData.isArchitect && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Архитект:</span>
                  <span className="font-medium">Да ({formData.commissionPercent}% комисионна)</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Контактни лица:</span>
                <span className="font-medium">{formData.contacts.length}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              <strong>Важно!</strong> Моля проверете всички данни преди запис. 
              След създаване на клиента, всички промени ще бъдат записвани в историята.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
          className={`px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ${
            currentStep === 1 ? 'invisible' : ''
          }`}
        >
          Назад
        </button>
        
        {currentStep < 3 ? (
          <button
            onClick={() => {
              if (currentStep === 1 && validateStep1()) {
                setCurrentStep(prev => prev + 1);
              } else if (currentStep === 2) {
                setCurrentStep(prev => prev + 1);
              }
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Напред
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Запазване...' : 'Запази клиента'}
          </button>
        )}
      </div>

      {errors.submit && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}
    </div>
  );
};

export default CreateClientForm;