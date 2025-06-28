'use client';

import { useState, useEffect, useCallback } from 'react';
import { Client, ClientStats, CreateClientDto } from '../../types/client';
import { clientsApi } from '../../services/clientsApi';
import ClientModal from './ClientModal';

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    hasCompany: undefined as boolean | undefined,
    isArchitect: undefined as boolean | undefined,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load clients and stats in parallel
      const [clientsResponse, statsResponse] = await Promise.all([
        clientsApi.getClients({
          search: searchTerm || undefined,
          hasCompany: filters.hasCompany,
          isArchitect: filters.isArchitect,
        }),
        clientsApi.getClientStats()
      ]);
      
      setClients(clientsResponse.data);
      setStats(statsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters.hasCompany, filters.isArchitect]);

  const handleCreateClient = async (clientData: CreateClientDto) => {
    if (editingClient) {
      // Update existing client
      await clientsApi.updateClient(editingClient.id, clientData);
    } else {
      // Create new client
      await clientsApi.createClient(clientData);
    }
    await loadData(); // Refresh the list
    setEditingClient(null); // Clear editing state
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div>Зареждане...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <div className="status-error">Грешка: {error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header style={{
        backgroundColor: 'var(--primary-black)',
        color: 'var(--white)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px var(--shadow-light)'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}>
          PARKETSENSE
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span>Анатоли Миланов</span>
          <button className="btn-secondary" style={{ color: 'var(--white)', borderColor: 'var(--white)' }}>
            Изход
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <aside style={{
          width: '60px',
          backgroundColor: 'var(--primary-dark)',
          padding: '1rem 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'var(--success-green)',
            borderRadius: '5px',
            cursor: 'pointer'
          }} title="Клиенти"></div>
          <div style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'var(--text-secondary)',
            borderRadius: '5px',
            cursor: 'pointer'
          }} title="Продукти"></div>
          <div style={{
            width: '30px',
            height: '30px',
            backgroundColor: 'var(--text-secondary)',
            borderRadius: '5px',
            cursor: 'pointer'
          }} title="Оферти"></div>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto'
        }}>
          {/* Page Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 300,
              margin: 0,
              color: 'var(--text-primary)'
            }}>
              Клиенти
            </h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-add"
              style={{ width: 'auto', padding: '12px 24px', borderRadius: '4px' }}
            >
              + Нов клиент
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div className="card">
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--success-green)'
                }}>
                  {stats.total}
                </div>
                <div className="text-small" style={{ marginTop: '0.5rem' }}>
                  Общо клиенти
                </div>
              </div>
              
              <div className="card">
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--success-green)'
                }}>
                  {stats.companies}
                </div>
                <div className="text-small" style={{ marginTop: '0.5rem' }}>
                  С фирми
                </div>
              </div>
              
              <div className="card">
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--success-green)'
                }}>
                  {stats.architects}
                </div>
                <div className="text-small" style={{ marginTop: '0.5rem' }}>
                  Архитекти
                </div>
              </div>
              
              <div className="card">
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'var(--success-green)'
                }}>
                  {stats.individuals}
                </div>
                <div className="text-small" style={{ marginTop: '0.5rem' }}>
                  Физически лица
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                placeholder="Търсене по име, фирма, телефон или email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
              <select
                value={filters.hasCompany === undefined ? 'all' : filters.hasCompany.toString()}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  hasCompany: e.target.value === 'all' ? undefined : e.target.value === 'true'
                }))}
                className="form-select"
              >
                <option value="all">С фирма: Всички</option>
                <option value="true">Само с фирма</option>
                <option value="false">Без фирма</option>
              </select>
              <select
                value={filters.isArchitect === undefined ? 'all' : filters.isArchitect.toString()}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  isArchitect: e.target.value === 'all' ? undefined : e.target.value === 'true'
                }))}
                className="form-select"
              >
                <option value="all">Архитект: Всички</option>
                <option value="true">Само архитекти</option>
                <option value="false">Не архитекти</option>
              </select>
            </div>
          </div>

          {/* Clients Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Име</th>
                  <th>Фирма</th>
                  <th>Телефон</th>
                  <th>Email</th>
                  <th>Създаден</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div>
                        {client.firstName} {client.lastName}
                        {client.isArchitect && (
                          <span className="status-warning" style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            marginLeft: '0.5rem',
                            backgroundColor: '#fff3e0'
                          }}>
                            Архитект {client.commissionPercent}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{client.companyName || '-'}</td>
                    <td>{client.phone || '-'}</td>
                    <td>{client.email || '-'}</td>
                    <td>{formatDate(client.createdAt)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClient(client);
                        }}
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        title="Редактирай клиент"
                      >
                        ✏️ Редактирай
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {clients.length === 0 && (
              <div className="text-center" style={{ padding: '2rem' }}>
                <div className="text-small">Няма намерени клиенти</div>
              </div>
            )}
          </div>
        </main>
      </div>
      
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleCreateClient}
        initialData={editingClient}
      />
    </div>
  );
} 