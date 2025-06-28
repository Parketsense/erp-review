import React, { useState } from 'react';

interface AnalyticsData {
  totalClients: number;
  newClientsThisMonth: number;
  architectsCount: number;
  companiesCount: number;
  topClients: Array<{
    id: number;
    name: string;
    projects: number;
    revenue: number;
  }>;
  monthlyGrowth: Array<{
    month: string;
    clients: number;
    projects: number;
  }>;
  clientTypes: {
    individual: number;
    company: number;
  };
  topCities: Array<{
    city: string;
    clients: number;
  }>;
}

interface AnalyticsProps {
  data: AnalyticsData;
  onExportReport: (type: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ data, onExportReport }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('clients');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('bg-BG').format(num);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg">
              📊
            </div>
            <h2 className="text-xl font-medium">Аналитика и отчети</h2>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">Последната седмица</option>
              <option value="month">Последния месец</option>
              <option value="quarter">Последното тримесечие</option>
              <option value="year">Последната година</option>
            </select>
            <button
              onClick={() => onExportReport('analytics')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              📤 Експорт отчет
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-indigo-600">{formatNumber(data.totalClients)}</div>
              <div className="text-gray-600 text-sm mt-2">Общо клиенти</div>
            </div>
            <div className="text-2xl">👥</div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            +{data.newClientsThisMonth} този месец
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-600">{data.architectsCount}</div>
              <div className="text-gray-600 text-sm mt-2">Архитекти</div>
            </div>
            <div className="text-2xl">🏗️</div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {((data.architectsCount / data.totalClients) * 100).toFixed(1)}% от общо
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">{data.companiesCount}</div>
              <div className="text-gray-600 text-sm mt-2">Фирми</div>
            </div>
            <div className="text-2xl">🏢</div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {((data.companiesCount / data.totalClients) * 100).toFixed(1)}% от общо
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {formatNumber(data.topClients.reduce((sum, client) => sum + client.revenue, 0))}
              </div>
              <div className="text-gray-600 text-sm mt-2">Общ оборот</div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            +12.5% спрямо миналия период
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Растеж на клиентите</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="clients">Клиенти</option>
              <option value="projects">Проекти</option>
            </select>
          </div>
          
          <div className="space-y-3">
            {data.monthlyGrowth.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(selectedMetric === 'clients' ? item.clients : item.projects) / 
                                Math.max(...data.monthlyGrowth.map(d => selectedMetric === 'clients' ? d.clients : d.projects)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-sm font-medium text-right">
                  {selectedMetric === 'clients' ? item.clients : item.projects}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Types Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-6">Разпределение по тип</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Частни лица</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{data.clientTypes.individual}</span>
                <span className="text-sm text-gray-500">
                  ({((data.clientTypes.individual / data.totalClients) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Фирми</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{data.clientTypes.company}</span>
                <span className="text-sm text-gray-500">
                  ({((data.clientTypes.company / data.totalClients) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              <strong>💡 Инсайт:</strong> {data.clientTypes.company > data.clientTypes.individual 
                ? 'Фирмите генерират по-висок среден оборот на клиент'
                : 'Частните лица са по-активни в търсенето на услуги'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Топ клиенти по оборот</h3>
          <button
            onClick={() => onExportReport('top-clients')}
            className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            📊 Детайлен отчет
          </button>
        </div>
        
        <div className="space-y-4">
          {data.topClients.map((client, index) => (
            <div key={client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.projects} проекта</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">{formatCurrency(client.revenue)}</div>
                <div className="text-sm text-gray-600">Оборот</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-6">Географско разпределение</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.topCities.map((city, index) => (
            <div key={city.city} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{city.city}</span>
                <span className="text-sm text-gray-500">#{index + 1}</span>
              </div>
              <div className="text-2xl font-bold text-indigo-600">{city.clients}</div>
              <div className="text-sm text-gray-600">клиенти</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-6">Бързи действия</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onExportReport('clients-list')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">Списък на клиентите</div>
            <div className="text-sm text-gray-600">Excel формат</div>
          </button>
          
          <button
            onClick={() => onExportReport('architects')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="text-2xl mb-2">🏗️</div>
            <div className="font-medium">Отчет за архитекти</div>
            <div className="text-sm text-gray-600">PDF формат</div>
          </button>
          
          <button
            onClick={() => onExportReport('revenue')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium">Финансов отчет</div>
            <div className="text-sm text-gray-600">Детайлен анализ</div>
          </button>
        </div>
      </div>
    </div>
  );
}; 