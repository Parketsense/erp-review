'use client';

import { useState, useEffect, useCallback } from 'react';
import { Offer, OfferStats, CreateOfferDto } from '../../types/offer';
import { apiClient } from '../../lib/api';
import OfferModal from './OfferModal';
import { FileText, Search, Filter, Plus, Calendar, User, Building2, TrendingUp, Send, CheckCircle, Clock } from 'lucide-react';
import '../../styles/offers-design-system.css';

export default function OffersList() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<OfferStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    projectId: undefined as string | undefined,
    clientId: undefined as string | undefined,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load offers and stats in parallel
      const searchParams = new URLSearchParams();
      if (searchTerm) searchParams.append('search', searchTerm);
      if (filters.status) searchParams.append('status', filters.status);
      if (filters.projectId) searchParams.append('projectId', filters.projectId);
      if (filters.clientId) searchParams.append('clientId', filters.clientId);
      
      const [offersResponse, statsResponse] = await Promise.all([
        apiClient.get(`/offers${searchParams.toString() ? '?' + searchParams.toString() : ''}`),
        apiClient.get('/offers/stats')
      ]);
      
      setOffers(offersResponse.data || []);
      setStats(statsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters.status, filters.projectId, filters.clientId]);

  const handleCreateOffer = async (offerData: CreateOfferDto) => {
    if (editingOffer) {
      // Update existing offer
      await apiClient.patch(`/offers/${editingOffer.id}`, offerData);
    } else {
      // Create new offer
      await apiClient.post('/offers', offerData);
    }
    await loadData(); // Refresh the list
    setEditingOffer(null); // Clear editing state
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (offer: Offer) => {
    try {
      await apiClient.patch(`/offers/${offer.id}/toggle-active`);
      await loadData(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка при промяната на статуса');
    }
  };

  const handleDeleteOffer = async (offer: Offer) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази оферта?')) {
      try {
        await apiClient.delete(`/offers/${offer.id}`);
        await loadData(); // Refresh the list
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Възникна грешка при изтриването');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'draft': return 'Чернова';
      case 'sent': return 'Изпратена';
      case 'viewed': return 'Прегледана';
      case 'accepted': return 'Приета';
      case 'rejected': return 'Отхвърлена';
      default: return 'Чернова';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'draft': return <Clock size={16} />;
      case 'sent': return <Send size={16} />;
      case 'viewed': return <TrendingUp size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'rejected': return <Clock size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
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
      {/* Hero Section */}
      <div className="hero-section">
        <div className="company-logo">
          <div className="logo-icon">P</div>
          <div className="company-name">PARKETSENSE</div>
        </div>
        <h1 className="page-title">Оферти</h1>
        <p className="page-subtitle">Управление на оферти и предложения</p>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 var(--space-6)' }}>
        {/* Stats Dashboard */}
        {stats && (
          <div className="stats-dashboard">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Общо оферти</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Активни</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{stats.sent}</div>
              <div className="stat-label">Изпратени</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">{stats.accepted}</div>
              <div className="stat-label">Приети</div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="search-filters">
          <div style={{
            display: 'flex',
            gap: 'var(--space-4)',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{
                  position: 'absolute',
                  left: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-neutral-500)'
                }} />
                <input
                  type="text"
                  placeholder="Търсене по номер, проект, клиент..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  style={{ paddingLeft: 'var(--space-6)' }}
                />
              </div>
            </div>
            
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                status: e.target.value === 'all' ? undefined : e.target.value
              }))}
              className="filter-select"
              style={{ minWidth: '150px' }}
            >
              <option value="all">Статус: Всички</option>
              <option value="draft">Чернова</option>
              <option value="sent">Изпратена</option>
              <option value="viewed">Прегледана</option>
              <option value="accepted">Приета</option>
              <option value="rejected">Отхвърлена</option>
            </select>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ marginBottom: 0 }}
            >
              <Plus size={16} />
              Нова оферта
            </button>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="offers-grid">
          {offers.map((offer) => (
            <div 
              key={offer.id}
              className={`offer-card ${selectedOffer === offer.id ? 'selected' : ''}`}
              onClick={() => setSelectedOffer(selectedOffer === offer.id ? null : offer.id)}
            >
              <div className="offer-header">
                <div>
                  <div className="offer-number">{offer.offerNumber}</div>
                  <div className={`offer-status ${offer.status || 'draft'}`}>
                    {getStatusIcon(offer.status)}
                    <span style={{ marginLeft: 'var(--space-1)' }}>
                      {getStatusText(offer.status)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditOffer(offer);
                    }}
                    className="btn btn-sm btn-outline"
                    style={{ marginBottom: 0 }}
                    title="Редактирай оферта"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(offer);
                    }}
                    className={`btn btn-sm ${offer.isActive ? 'btn-danger' : 'btn-success'}`}
                    style={{ marginBottom: 0 }}
                    title={offer.isActive ? 'Деактивирай' : 'Активирай'}
                  >
                    {offer.isActive ? '🔴' : '🟢'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteOffer(offer);
                    }}
                    className="btn btn-sm btn-danger"
                    style={{ marginBottom: 0 }}
                    title="Изтрий оферта"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="offer-project">
                <Building2 size={14} style={{ marginRight: 'var(--space-1)' }} />
                {offer.projectName || offer.project?.name || 'Без проект'}
              </div>
              
              <div className="offer-client">
                <User size={14} style={{ marginRight: 'var(--space-1)' }} />
                {offer.client?.name || 'Без клиент'}
              </div>
              
              <div className="offer-meta">
                <div>
                  <Calendar size={14} style={{ marginRight: 'var(--space-1)' }} />
                  Създадена: {formatDate(offer.createdAt)}
                </div>
                {offer.validUntil && (
                  <div>
                    Валидна до: {formatDate(offer.validUntil)}
                  </div>
                )}
              </div>
              
              <div className="offer-total">
                {/* Placeholder for total calculation */}
                <div>0.00 лв.</div>
                <div className="offer-total-label">Обща стойност</div>
              </div>
            </div>
          ))}
        </div>
        
        {offers.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">Няма намерени оферти</div>
            <div className="empty-state-description">
              Създайте първата оферта или променете филтрите за търсене
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              Създай оферта
            </button>
          </div>
        )}
      </div>
      
      <OfferModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOffer(null);
        }}
        onSave={handleCreateOffer}
        initialData={editingOffer}
      />
    </div>
  );
} 