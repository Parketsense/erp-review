'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phase, PhaseStats, CreatePhaseDto } from '../../types/phase';
import { phasesApi } from '../../services/phasesApi';
import PhaseCreateModal from './PhaseCreateModal';
import PhaseEditModal from './PhaseEditModal';
import { Calendar, Settings, Edit, Trash2, ArrowUp, ArrowDown, CheckCircle, XCircle, Pause, Play, FileText } from 'lucide-react';

interface PhasesListProps {
  projectId: string;
  projectName?: string;
}

export default function PhasesList({ projectId, projectName }: PhasesListProps) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [stats, setStats] = useState<PhaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [phasesResponse, statsResponse] = await Promise.all([
        phasesApi.getPhasesByProject(projectId),
        phasesApi.getPhaseStats()
      ]);
      
      let filteredPhases = phasesResponse;
      
      if (searchTerm) {
        filteredPhases = filteredPhases.filter(phase => 
          phase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (phase.description && phase.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      if (filters.status) {
        filteredPhases = filteredPhases.filter(phase => phase.status === filters.status);
      }
      
      setPhases(filteredPhases);
      setStats(statsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка');
    } finally {
      setLoading(false);
    }
  }, [projectId, searchTerm, filters.status]);

  const handleCreatePhase = async (phaseData: CreatePhaseDto) => {
    await phasesApi.createPhase(projectId, phaseData);
    await loadData();
  };

  const handleEditPhase = (phase: Phase) => {
    setEditingPhase(phase);
    setIsEditModalOpen(true);
  };

  const handleUpdatePhase = async (phaseData: CreatePhaseDto) => {
    if (editingPhase) {
      await phasesApi.updatePhase(editingPhase.id, phaseData);
      await loadData();
      setEditingPhase(null);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете тази фаза?')) {
      try {
        await phasesApi.deletePhase(phaseId);
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Грешка при изтриване');
      }
    }
  };

  const handleReorderPhase = async (phaseId: string, direction: 'up' | 'down') => {
    const currentPhase = phases.find(p => p.id === phaseId);
    if (!currentPhase) return;

    const newOrder = direction === 'up' ? currentPhase.phaseOrder - 1 : currentPhase.phaseOrder + 1;
    const phaseAtNewOrder = phases.find(p => p.phaseOrder === newOrder);
    
    if (!phaseAtNewOrder) return;

    try {
      await phasesApi.reorderPhases(projectId, [
        { id: currentPhase.id, phaseOrder: newOrder },
        { id: phaseAtNewOrder.id, phaseOrder: currentPhase.phaseOrder }
      ]);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при пренареждане');
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <Pause className="w-4 h-4 text-gray-500" />;
      case 'quoted': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'won': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'lost': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'archived': return <Settings className="w-4 h-4 text-gray-400" />;
      default: return <Pause className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'created': return 'Създадена';
      case 'quoted': return 'Офертирана';
      case 'won': return 'Спечелена';
      case 'lost': return 'Загубена';
      case 'archived': return 'Архивирана';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-gray-100 text-gray-700';
      case 'quoted': return 'bg-blue-100 text-blue-700';
      case 'won': return 'bg-green-100 text-green-700';
      case 'lost': return 'bg-red-100 text-red-700';
      case 'archived': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <div>Зареждане на фази...</div>
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-light text-gray-900">
            Фази на проект
          </h1>
          {projectName && (
            <p className="text-gray-600 mt-1">{projectName}</p>
          )}
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-add"
          style={{ width: 'auto', padding: '12px 24px', borderRadius: '4px' }}
        >
          + Нова фаза
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Общо фази
            </div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-gray-600">
              {stats.byStatus.created || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Създадени
            </div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-blue-600">
              {stats.byStatus.quoted || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Офертирани
            </div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-green-600">
              {stats.byStatus.won || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Спечелени
            </div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-red-600">
              {stats.byStatus.lost || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Загубени
            </div>
          </div>

          <div className="card">
            <div className="text-2xl font-bold text-gray-500">
              {stats.byStatus.archived || 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Архивирани
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Търсене по име или описание..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input flex-1"
          />
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              status: e.target.value === 'all' ? undefined : e.target.value
            }))}
            className="form-select"
          >
            <option value="all">Статус: Всички</option>
            <option value="created">Създадени</option>
            <option value="quoted">Офертирани</option>
            <option value="won">Спечелени</option>
            <option value="lost">Загубени</option>
            <option value="archived">Архивирани</option>
          </select>
        </div>
      </div>

      {/* Phases Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Ред</th>
              <th>Фаза</th>
              <th>Статус</th>
              <th>Дати</th>
              <th style={{ textAlign: 'center', width: '120px' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((phase) => (
              <tr key={phase.id}>
                <td className="text-center text-gray-600 font-mono">
                  {phase.phaseOrder}
                </td>
                <td>
                  <div>
                    <div className="font-medium">{phase.name}</div>
                    {phase.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {phase.description}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                    {getStatusIcon(phase.status)}
                    {getStatusText(phase.status)}
                  </span>
                </td>
                <td>
                  <div className="text-sm">
                    <div>Създадена: {formatDate(phase.createdAt)}</div>
                    <div>Обновена: {formatDate(phase.updatedAt)}</div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div className="flex justify-center gap-1">
                    <button
                      onClick={() => handleReorderPhase(phase.id, 'up')}
                      disabled={phase.phaseOrder === 1}
                      className="btn-secondary p-1"
                      style={{ fontSize: '0.75rem' }}
                      title="Преместване нагоре"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleReorderPhase(phase.id, 'down')}
                      disabled={phase.phaseOrder === phases.length}
                      className="btn-secondary p-1"
                      style={{ fontSize: '0.75rem' }}
                      title="Преместване надолу"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditPhase(phase)}
                      className="btn-secondary p-1"
                      style={{ fontSize: '0.75rem' }}
                      title="Редактирай фаза"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeletePhase(phase.id)}
                      className="btn-danger p-1"
                      style={{ fontSize: '0.75rem' }}
                      title="Изтрий фаза"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {phases.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">
              Няма добавени фази
            </div>
            <div className="text-gray-600 mb-4">
              Започнете с добавяне на първата фаза от проекта
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-add"
            >
              + Нова фаза
            </button>
          </div>
        )}
      </div>
      
      <PhaseCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePhase}
        projectId={projectId}
      />

      <PhaseEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPhase(null);
        }}
        onSave={handleUpdatePhase}
        initialData={editingPhase}
      />
    </div>
  );
} 