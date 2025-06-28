import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

// Mock data for client details
const mockClient = {
  id: 1,
  firstName: 'Иван',
  lastName: 'Сивков',
  email: 'ivan.sivkov@email.com',
  phone: '+359 888 123 456',
  address: 'ул. "Граф Игнатиев" 15, София',
  notes: 'Интерес от паркет за хол. Предпочита естествени материали.',
  isArchitect: true,
  commission: 10,
  companyName: 'Архитектурно студио Сивков ЕООД',
  eik: '123456789',
  vatNumber: 'BG123456789',
  companyPhone: '+359 2 123 456',
  companyEmail: 'office@sivkov-studio.bg',
  companyAddress: 'ул. "Васил Левски" 45, София',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-12-24T14:20:00Z',
  projects: [
    { id: 1, name: 'Вила на ул. "Оборище"', status: 'В процес', value: 45000 },
    { id: 2, name: 'Офис ремонт - Център', status: 'Завършен', value: 28000 },
    { id: 3, name: 'Кухненски мебели', status: 'Планиране', value: 12000 }
  ]
};

const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = mockClient; // В реалност ще зареждаме от API

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-light mb-2">
            {client.firstName} {client.lastName}
          </h1>
          <p className="text-gray-600">Детайли за клиента</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/clients/${id}/edit`)}
          >
            ✏️ Редактирай
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/clients')}
          >
            ← Към списъка
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg">
                👤
              </div>
              <h2 className="text-xl font-medium">Лична информация</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Име</label>
                <p className="text-lg">{client.firstName} {client.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Телефон</label>
                <p className="text-lg">{client.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-lg">{client.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Адрес</label>
                <p className="text-lg">{client.address || '-'}</p>
              </div>
            </div>

            {client.notes && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500 mb-1">Бележки</label>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{client.notes}</p>
              </div>
            )}
          </div>

          {/* Company Information */}
          {client.companyName && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
                <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-lg">
                  🏢
                </div>
                <h2 className="text-xl font-medium">Фирмена информация</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Име на фирма</label>
                  <p className="text-lg font-medium">{client.companyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ЕИК/Булстат</label>
                  <p className="text-lg">{client.eik}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">ДДС номер</label>
                  <p className="text-lg">{client.vatNumber || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Фирмен телефон</label>
                  <p className="text-lg">{client.companyPhone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Фирмен email</label>
                  <p className="text-lg">{client.companyEmail || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Адрес по регистрация</label>
                  <p className="text-lg">{client.companyAddress || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-lg">
                  📋
                </div>
                <h2 className="text-xl font-medium">Проекти</h2>
              </div>
              <Button variant="primary" size="sm">
                + Нов проект
              </Button>
            </div>

            {client.projects.length > 0 ? (
              <div className="space-y-4">
                {client.projects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{project.name}</h3>
                        <p className="text-gray-600">{project.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{project.value.toLocaleString()} лв.</p>
                        <p className="text-sm text-gray-500">Стойност</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Няма проекти за този клиент</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Architect Info */}
          {client.isArchitect && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm">
                  🏗️
                </div>
                <h3 className="text-lg font-medium">Архитект</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Комисионна</label>
                  <p className="text-2xl font-bold text-yellow-700">{client.commission}%</p>
                </div>
                <div className="text-sm text-gray-600">
                  Клиентът е архитект/дизайнер с право на комисионна
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Статистика</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Общо проекти</span>
                <span className="font-medium">{client.projects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Обща стойност</span>
                <span className="font-medium">
                  {client.projects.reduce((sum, p) => sum + p.value, 0).toLocaleString()} лв.
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Активни проекти</span>
                <span className="font-medium">
                  {client.projects.filter(p => p.status === 'В процес').length}
                </span>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Системна информация</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-500 mb-1">Създаден</label>
                <p>{new Date(client.createdAt).toLocaleDateString('bg-BG')}</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Последна промяна</label>
                <p>{new Date(client.updatedAt).toLocaleDateString('bg-BG')}</p>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">ID</label>
                <p className="font-mono text-gray-600">#{client.id}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Бързи действия</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                📞 Обади се
              </Button>
              <Button variant="outline" className="w-full justify-start">
                ✉️ Изпрати email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📋 Създай оферта
              </Button>
              <Button variant="outline" className="w-full justify-start">
                📊 История на промените
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsPage; 