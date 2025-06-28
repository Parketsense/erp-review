import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  isArchitect: boolean;
  commission: string;
  // Company fields
  companyName: string;
  eik: string;
  vatNumber: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
}

const CreateClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    isArchitect: false,
    commission: '10',
    // Company fields
    companyName: '',
    eik: '',
    vatNumber: '',
    companyPhone: '',
    companyEmail: '',
    companyAddress: ''
  });

  const [showCompanyFields, setShowCompanyFields] = useState(false);
  const [phoneWarning, setPhoneWarning] = useState(false);
  const [eikError, setEikError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Нов клиент:', formData);
    navigate('/clients');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Check for phone duplicates
    if (name === 'phone' && value) {
      const phone = value.trim();
      if (phone.includes('888123456') || phone.includes('899234567')) {
        setPhoneWarning(true);
      } else {
        setPhoneWarning(false);
      }
    }

    // Validate EIK
    if (name === 'eik' && value) {
      const eik = value.trim();
      if (!/^\d{9}$|^\d{13}$/.test(eik)) {
        setEikError('ЕИК трябва да е 9 или 13 цифри');
      } else if (eik === '123456789') {
        setEikError('Фирма с този ЕИК вече съществува!');
      } else {
        setEikError('');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-light mb-2">Нов клиент</h1>
        <p className="text-gray-600">Добавете нов клиент в системата</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg">
              👤
            </div>
            <h2 className="text-xl font-medium">Лична информация</h2>
          </div>

          {/* Info message */}
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-6 flex items-start gap-3">
            <span className="text-lg">ℹ️</span>
            <div>
              <strong>Съвет:</strong> Започнете с личните данни на клиента. 
              Фирмени данни можете да добавите сега или по-късно.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Име <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Въведете име"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Въведете фамилия"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+359 888 123 456"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {phoneWarning && (
                <div className="mt-2 text-yellow-700 text-sm bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
                  ⚠️ Внимание: Има клиент с подобен телефон
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Адрес
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Град, улица, номер"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Company Section */}
        <div className={`bg-white rounded-lg shadow-sm p-8 mb-8 ${showCompanyFields ? 'border-2 border-blue-500 bg-blue-50' : 'border-2 border-dashed border-gray-300'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-lg">
              🏢
            </div>
            <h2 className="text-xl font-medium">Фирма</h2>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              id="showCompany"
              checked={showCompanyFields}
              onChange={(e) => setShowCompanyFields(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showCompany" className="text-sm font-medium text-gray-700 cursor-pointer">
              <strong>Клиентът представлява фирма</strong>
            </label>
          </div>

          {showCompanyFields && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име на фирма <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required={showCompanyFields}
                  placeholder="ООД, ЕООД, АД..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ЕИК/Булстат <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="eik"
                    value={formData.eik}
                    onChange={handleChange}
                    required={showCompanyFields}
                    placeholder="123456789"
                    className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      eikError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {eikError && (
                    <div className="mt-2 text-red-600 text-sm">{eikError}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ДДС номер
                  </label>
                  <input
                    type="text"
                    name="vatNumber"
                    value={formData.vatNumber}
                    onChange={handleChange}
                    placeholder="BG123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фирмен телефон
                  </label>
                  <input
                    type="tel"
                    name="companyPhone"
                    value={formData.companyPhone}
                    onChange={handleChange}
                    placeholder="+359 2 123 456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фирмен email
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    placeholder="office@company.bg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес по регистрация
                </label>
                <input
                  type="text"
                  name="companyAddress"
                  value={formData.companyAddress}
                  onChange={handleChange}
                  placeholder="Адрес на фирмата"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Architect Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm">
              🏗️
            </div>
            <h3 className="text-lg font-medium">Архитект</h3>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              name="isArchitect"
              checked={formData.isArchitect}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700">
              <strong>Клиентът е архитект/дизайнер</strong>
            </label>
          </div>

          {formData.isArchitect && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комисионна (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleChange}
                min="0"
                max="100"
                required={formData.isArchitect}
                className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10"
              />
              <small className="text-gray-600 block mt-2">
                Стандартната комисионна е 10%
              </small>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-lg">
              📝
            </div>
            <h2 className="text-xl font-medium">Бележки</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Допълнителна информация
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Допълнителна информация за клиента..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/clients')}
            className="px-8 py-3"
          >
            Отказ
          </Button>
          <div className="flex gap-4">
            <Button 
              type="submit" 
              variant="primary"
              className="px-8 py-3"
            >
              💾 Запази и продължи
            </Button>
            <Button 
              type="submit" 
              variant="secondary"
              className="px-8 py-3"
            >
              ✓ Запази и затвори
            </Button>
          </div>
        </div>
      </form>

      {/* Quick Tips */}
      <div className="fixed bottom-8 right-8 bg-white rounded-lg shadow-lg p-6 max-w-xs">
        <div className="font-semibold text-blue-600 mb-3">💡 Полезни съвети</div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Телефонът не е задължителен</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Можете да добавите фирма по-късно</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>Контактните лица се добавят към проекта</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-600">•</span>
            <span>ЕИК-то трябва да е уникално</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClientPage; 