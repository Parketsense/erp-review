import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientsList } from '@/components/clients/ClientsList';
import { SearchFilters } from '@/components/clients/SearchFilters';
import { ImportExport } from '@/components/clients/ImportExport';
import { CommunicationHistory } from '@/components/clients/CommunicationHistory';
import { Analytics } from '@/components/clients/Analytics';
import { Button } from '@/components/ui/Button';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    architect: 'all',
    sortBy: 'name',
    sortOrder: 'asc' as 'asc' | 'desc'
  });
  const [activeTab, setActiveTab] = useState<'list' | 'analytics' | 'communication' | 'import'>('list');

  // Mock data - в реалност ще идва от API
  const allClients = [
    {
      id: 1,
      firstName: 'Иван',
      lastName: 'Сивков',
      email: 'ivan.sivkov@email.com',
      phone: '+359 888 123 456',
      companyName: 'Архитектурно студио Сивков ЕООД',
      address: 'ул. "Граф Игнатиев" 15, София',
      notes: 'Интерес от паркет за хол',
      isArchitect: true,
      commission: 10,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-12-24T14:20:00Z',
      projects: 3
    },
    {
      id: 2,
      firstName: 'Мария',
      lastName: 'Георгиева',
      email: 'maria.georgieva@company.bg',
      phone: '+359 888 654 321',
      companyName: 'Интериор Дизайн ООД',
      address: 'ул. "Васил Левски" 45, София',
      notes: 'Голям проект за офис',
      isArchitect: false,
      commission: 0,
      createdAt: '2024-02-20T14:15:00Z',
      updatedAt: '2024-12-20T09:30:00Z',
      projects: 1
    },
    {
      id: 3,
      firstName: 'Стефан',
      lastName: 'Димитров',
      email: 'stefan.dimitrov@email.com',
      phone: '+359 888 789 012',
      companyName: undefined,
      address: 'ул. "Шипка" 8, Пловдив',
      notes: 'Паркет за спалня',
      isArchitect: false,
      commission: 0,
      createdAt: '2024-03-10T11:45:00Z',
      updatedAt: '2024-12-22T16:20:00Z',
      projects: 2
    },
    {
      id: 4,
      firstName: 'Елена',
      lastName: 'Петрова',
      email: 'elena.petrova@studio.bg',
      phone: '+359 888 345 678',
      companyName: 'Дизайн Студио Петрова',
      address: 'ул. "Раковски" 120, София',
      notes: 'Специализира се в модерен дизайн',
      isArchitect: true,
      commission: 15,
      createdAt: '2024-04-05T08:20:00Z',
      updatedAt: '2024-12-23T12:10:00Z',
      projects: 5
    }
  ];

  // Mock communications data
  const communications = [
    {
      id: 1,
      type: 'call' as const,
      direction: 'outbound' as const,
      subject: 'Последване на оферта',
      content: 'Обадих се за да проверя дали са получили офертата за паркет',
      date: '2024-12-24T10:30:00Z',
      duration: 5,
      status: 'completed' as const,
      clientId: 1,
      clientName: 'Иван Сивков'
    },
    {
      id: 2,
      type: 'email' as const,
      direction: 'inbound' as const,
      subject: 'Запитване за цени',
      content: 'Клиентът иска информация за цените на различните видове паркет',
      date: '2024-12-23T14:20:00Z',
      status: 'completed' as const,
      clientId: 2,
      clientName: 'Мария Георгиева'
    }
  ];

  // Mock analytics data
  const analyticsData = {
    totalClients: allClients.length,
    newClientsThisMonth: 2,
    architectsCount: allClients.filter(c => c.isArchitect).length,
    companiesCount: allClients.filter(c => c.companyName).length,
    topClients: [
      { id: 4, name: 'Елена Петрова', projects: 5, revenue: 25000 },
      { id: 1, name: 'Иван Сивков', projects: 3, revenue: 18000 },
      { id: 3, name: 'Стефан Димитров', projects: 2, revenue: 12000 }
    ],
    monthlyGrowth: [
      { month: 'Яну', clients: 12, projects: 8 },
      { month: 'Фев', clients: 18, projects: 15 },
      { month: 'Мар', clients: 25, projects: 22 },
      { month: 'Апр', clients: 30, projects: 28 }
    ],
    clientTypes: {
      individual: allClients.filter(c => !c.companyName).length,
      company: allClients.filter(c => c.companyName).length
    },
    topCities: [
      { city: 'София', clients: 3 },
      { city: 'Пловдив', clients: 1 }
    ]
  };

  // Filter and sort clients
  const filteredClients = useMemo(() => {
    let filtered = allClients.filter(client => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          client.firstName.toLowerCase().includes(searchLower) ||
          client.lastName.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.phone?.includes(searchTerm) ||
          client.companyName?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type !== 'all') {
        const hasCompany = !!client.companyName;
        if (filters.type === 'individual' && hasCompany) return false;
        if (filters.type === 'company' && !hasCompany) return false;
      }

      // Architect filter
      if (filters.architect !== 'all') {
        if (filters.architect === 'architect' && !client.isArchitect) return false;
        if (filters.architect === 'not-architect' && client.isArchitect) return false;
      }

      return true;
    });

    // Sort clients
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'projects':
          aValue = a.projects;
          bValue = b.projects;
          break;
        default:
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [allClients, searchTerm, filters]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleImport = (data: any[]) => {
    console.log('Импортирани клиенти:', data);
    alert(`Успешно импортирани ${data.length} клиента!`);
  };

  const handleExport = () => {
    const exportData = allClients.map(client => ({
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      companyName: client.companyName,
      address: client.address,
      isArchitect: client.isArchitect,
      commission: client.commission,
      projects: client.projects,
      createdAt: client.createdAt
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddCommunication = (communication: any) => {
    console.log('Нова комуникация:', communication);
    // В реалност ще се запази в базата данни
  };

  const handleExportReport = (type: string) => {
    console.log('Експорт на отчет:', type);
    alert(`Отчет "${type}" експортиран успешно!`);
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-light">Клиенти</h1>
        <div className="flex gap-4">
          <Button variant="primary" onClick={() => navigate('/clients/create')}>
            + Нов клиент
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{allClients.length}</div>
          <div className="text-gray-600 text-sm mt-2">Общо клиенти</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-blue-600">
            {allClients.filter(c => c.companyName).length}
          </div>
          <div className="text-gray-600 text-sm mt-2">С фирми</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-blue-600">
            {allClients.filter(c => c.isArchitect).length}
          </div>
          <div className="text-gray-600 text-sm mt-2">Архитекти</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-3xl font-bold text-blue-600">
            {filteredClients.length}
          </div>
          <div className="text-gray-600 text-sm mt-2">
            {searchTerm || filters.type !== 'all' || filters.architect !== 'all' 
              ? 'Филтрирани' 
              : 'Активни последния месец'
            }
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Списък клиенти
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Аналитика
            </button>
            <button
              onClick={() => setActiveTab('communication')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'communication'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💬 Комуникация
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Импорт/Експорт
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && (
        <>
          {/* Search and Filters */}
          <SearchFilters 
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
          
          {/* Clients Table */}
          <ClientsList clients={filteredClients} />
        </>
      )}

      {activeTab === 'analytics' && (
        <Analytics 
          data={analyticsData}
          onExportReport={handleExportReport}
        />
      )}

      {activeTab === 'communication' && (
        <CommunicationHistory
          communications={communications}
          onAddCommunication={handleAddCommunication}
        />
      )}

      {activeTab === 'import' && (
        <ImportExport
          onImport={handleImport}
          onExport={handleExport}
          totalClients={allClients.length}
        />
      )}
    </div>
  );
};

export default ClientsPage; 