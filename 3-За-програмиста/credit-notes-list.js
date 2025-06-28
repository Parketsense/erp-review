import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Mail, Eye, X, Calendar, 
  RefreshCw, ChevronLeft, ChevronRight, FileText, 
  AlertCircle, CheckCircle, Clock, Ban, ExternalLink,
  MoreHorizontal, Trash2, Plus, TrendingUp
} from 'lucide-react';

// ==============================================
// TYPESCRIPT INTERFACES
// ==============================================

interface CreditNote {
  id: string;
  invoice_number: string;
  invoice_date: string;
  status: 'draft' | 'sent' | 'cancelled';
  total_amount: number;
  reason: string;
  client_name: string;
  original_invoice_number: string;
  original_invoice_date: string;
  sent_at?: string;
  sent_to?: string;
  created_at: string;
  created_by: string;
}

interface CreditNotesStats {
  total_count: number;
  draft_count: number;
  sent_count: number;
  cancelled_count: number;
  total_amount: number;
  active_amount: number;
}

interface CreditNotesListProps {
  variantId: string;
  onCreateNew: () => void;
  onViewDetails: (creditNote: CreditNote) => void;
}

interface Filters {
  page: number;
  limit: number;
  status: string;
  date_from: string;
  date_to: string;
  search: string;
}

// ==============================================
// MAIN COMPONENT
// ==============================================

const CreditNotesList: React.FC<CreditNotesListProps> = ({
  variantId,
  onCreateNew,
  onViewDetails
}) => {
  // State management
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [stats, setStats] = useState<CreditNotesStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Filters and pagination
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
    status: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // ==============================================
  // API FUNCTIONS
  // ==============================================

  const fetchCreditNotes = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(
        `/api/invoices/variant/${variantId}/credit-notes?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при зареждане на кредитните известия');
      }
      
      const data = await response.json();
      
      setCreditNotes(data.data.creditNotes);
      setPagination(data.data.pagination);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Непредвидена грешка');
      setCreditNotes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [variantId, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/invoices/variant/${variantId}/credit-notes/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при зареждане на статистиките');
      }
      
      const data = await response.json();
      setStats(data.data.stats);
      
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [variantId]);

  // ==============================================
  // ACTION HANDLERS
  // ==============================================

  const handleSendCreditNote = async (creditNote: CreditNote) => {
    if (!creditNote.sent_to) {
      // Show email modal or prompt for email
      const email = prompt('Въведете email адрес за изпращане:');
      if (!email) return;
    }
    
    setActionLoading(prev => ({ ...prev, [`send-${creditNote.id}`]: true }));
    
    try {
      const response = await fetch(
        `/api/invoices/credit-note/${creditNote.id}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            email_to: creditNote.sent_to || 'client@example.com', // Use stored email or prompt result
            email_subject: `Кредитно известие ${creditNote.invoice_number}`,
            email_body: `Уважаеми ${creditNote.client_name},\n\nМоля, намерете приложеното кредитно известие.`
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при изпращане на кредитното известие');
      }
      
      // Refresh the list
      await fetchCreditNotes(true);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Грешка при изпращане');
    } finally {
      setActionLoading(prev => ({ ...prev, [`send-${creditNote.id}`]: false }));
    }
  };

  const handleDownloadPDF = async (creditNote: CreditNote) => {
    setActionLoading(prev => ({ ...prev, [`pdf-${creditNote.id}`]: true }));
    
    try {
      const response = await fetch(
        `/api/invoices/credit-note/${creditNote.id}/pdf`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при генериране на PDF');
      }
      
      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `credit-note-${creditNote.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Грешка при изтегляне');
    } finally {
      setActionLoading(prev => ({ ...prev, [`pdf-${creditNote.id}`]: false }));
    }
  };

  const handleCancelCreditNote = async (creditNote: CreditNote) => {
    if (!confirm(`Сигурни ли сте, че искате да отмените кредитно известие ${creditNote.invoice_number}?`)) {
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [`cancel-${creditNote.id}`]: true }));
    
    try {
      const response = await fetch(
        `/api/invoices/credit-note/${creditNote.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при отмяна на кредитното известие');
      }
      
      // Refresh the list
      await fetchCreditNotes(true);
      await fetchStats();
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Грешка при отмяна');
    } finally {
      setActionLoading(prev => ({ ...prev, [`cancel-${creditNote.id}`]: false }));
    }
  };

  // ==============================================
  // FILTER HANDLERS
  // ==============================================

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      date_from: '',
      date_to: '',
      search: ''
    });
  };

  // ==============================================
  // EFFECTS
  // ==============================================

  useEffect(() => {
    fetchCreditNotes();
  }, [fetchCreditNotes]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ==============================================
  // UTILITY FUNCTIONS
  // ==============================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <Ban className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Чернова';
      case 'sent':
        return 'Изпратено';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(amount);
  };

  // ==============================================
  // RENDER
  // ==============================================

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span>Зареждане на кредитни известия...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Кредитни известия</h2>
            <p className="text-sm text-gray-600 mt-1">
              Управление на кредитни известия за корекции
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchCreditNotes(true)}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title="Обнови"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onCreateNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ново кредитно известие
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Общо</p>
                  <p className="text-2xl font-semibold text-blue-900">{stats.total_count}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Чернови</p>
                  <p className="text-2xl font-semibold text-yellow-900">{stats.draft_count}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Изпратени</p>
                  <p className="text-2xl font-semibold text-green-900">{stats.sent_count}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Обща сума</p>
                  <p className="text-2xl font-semibold text-purple-900">
                    {formatAmount(stats.active_amount)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Филтри</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Скрий филтри' : 'Покажи филтри'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Търсене
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Номер, клиент..."
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Всички</option>
                <option value="draft">Чернова</option>
                <option value="sent">Изпратено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                От дата
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                До дата
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {(filters.search || filters.status || filters.date_from || filters.date_to) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Изчисти всички филтри
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchCreditNotes()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Опитай отново
            </button>
          </div>
        ) : creditNotes.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Няма намерени кредитни известия</p>
            <button
              onClick={onCreateNew}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Създай първото кредитно известие
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Кредитно известие
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Оригинална фактура
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клиент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сума
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditNotes.map((creditNote) => (
                    <tr key={creditNote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {creditNote.invoice_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(creditNote.invoice_date)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {creditNote.original_invoice_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(creditNote.original_invoice_date)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{creditNote.client_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(creditNote.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(creditNote.status)}`}>
                          {getStatusIcon(creditNote.status)}
                          <span className="ml-1">{getStatusText(creditNote.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onViewDetails(creditNote)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Преглед"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDownloadPDF(creditNote)}
                            disabled={actionLoading[`pdf-${creditNote.id}`]}
                            className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                            title="Изтегли PDF"
                          >
                            {actionLoading[`pdf-${creditNote.id}`] ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                          
                          {creditNote.status === 'draft' && (
                            <button
                              onClick={() => handleSendCreditNote(creditNote)}
                              disabled={actionLoading[`send-${creditNote.id}`]}
                              className="text-purple-600 hover:text-purple-900 transition-colors disabled:opacity-50"
                              title="Изпрати по email"
                            >
                              {actionLoading[`send-${creditNote.id}`] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          
                          {creditNote.status === 'draft' && (
                            <button
                              onClick={() => handleCancelCreditNote(creditNote)}
                              disabled={actionLoading[`cancel-${creditNote.id}`]}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              title="Отмени"
                            >
                              {actionLoading[`cancel-${creditNote.id}`] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {creditNotes.map((creditNote) => (
                <div key={creditNote.id} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      {creditNote.invoice_number}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(creditNote.status)}`}>
                      {getStatusIcon(creditNote.status)}
                      <span className="ml-1">{getStatusText(creditNote.status)}</span>
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Клиент: {creditNote.client_name}</div>
                    <div>Оригинална фактура: {creditNote.original_invoice_number}</div>
                    <div>Сума: {formatAmount(creditNote.total_amount)}</div>
                    <div>Дата: {formatDate(creditNote.invoice_date)}</div>
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-2">
                    <button
                      onClick={() => onViewDetails(creditNote)}
                      className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      Преглед
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(creditNote)}
                      disabled={actionLoading[`pdf-${creditNote.id}`]}
                      className="bg-gray-50 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      PDF
                    </button>
                    {creditNote.status === 'draft' && (
                      <button
                        onClick={() => handleSendCreditNote(creditNote)}
                        disabled={actionLoading[`send-${creditNote.id}`]}
                        className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        Изпрати
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Предишна
                  </button>
                  <button
                    onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, pagination.page + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Следваща
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Показване на{' '}
                      <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
                      {' '}-{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>
                      {' '}от{' '}
                      <span className="font-medium">{pagination.total}</span>
                      {' '}резултата
                    </p>
                  </div>
                  
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handleFilterChange('page', Math.max(1, pagination.page - 1))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handleFilterChange('page', page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, pagination.page + 1))}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreditNotesList;