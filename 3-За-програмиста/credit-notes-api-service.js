// ==============================================
// creditNotesAPI.js - API Service Layer
// ==============================================

/**
 * Централизиран API клиент за кредитни известия
 * Управлява всички HTTP заявки и error handling
 */

class CreditNotesAPI {
  constructor() {
    this.baseURL = '/api/invoices';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Получаване на authorization header
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      ...this.defaultHeaders,
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Generic HTTP клиент с error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses (like PDF downloads)
      if (options.responseType === 'blob') {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.blob();
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new APIError(data.message || 'API грешка', response.status, data);
      }
      
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or parsing errors
      throw new APIError(
        error.message || 'Мрежова грешка', 
        0, 
        { originalError: error }
      );
    }
  }

  // ==============================================
  // CREDIT NOTES ENDPOINTS
  // ==============================================

  /**
   * Създаване на кредитно известие
   */
  async createCreditNote(variantId, creditNoteData) {
    return this.request(`/variant/${variantId}/credit-note`, {
      method: 'POST',
      body: JSON.stringify(creditNoteData),
    });
  }

  /**
   * Получаване на списък с кредитни известия
   */
  async getCreditNotesByVariant(variantId, filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/variant/${variantId}/credit-notes${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  /**
   * Получаване на детайли за кредитно известие
   */
  async getCreditNoteDetails(creditNoteId) {
    return this.request(`/credit-note/${creditNoteId}`);
  }

  /**
   * Изпращане на кредитно известие по email
   */
  async sendCreditNote(creditNoteId, emailData) {
    return this.request(`/credit-note/${creditNoteId}/send`, {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  /**
   * Изтегляне на PDF
   */
  async downloadCreditNotePDF(creditNoteId, regenerate = false) {
    const queryParams = regenerate ? '?regenerate=true' : '';
    return this.request(`/credit-note/${creditNoteId}/pdf${queryParams}`, {
      responseType: 'blob'
    });
  }

  /**
   * Преглед на PDF
   */
  async previewCreditNotePDF(creditNoteId, regenerate = false) {
    const queryParams = regenerate ? '?regenerate=true' : '';
    return this.request(`/credit-note/${creditNoteId}/preview${queryParams}`, {
      responseType: 'blob'
    });
  }

  /**
   * Отмяна на кредитно известие
   */
  async cancelCreditNote(creditNoteId) {
    return this.request(`/credit-note/${creditNoteId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Получаване на статистики
   */
  async getCreditNotesStats(variantId) {
    return this.request(`/variant/${variantId}/credit-notes/stats`);
  }

  /**
   * Получаване на история на кредитно известие
   */
  async getCreditNoteHistory(creditNoteId) {
    return this.request(`/credit-note/${creditNoteId}/history`);
  }

  // ==============================================
  // UTILITY METHODS
  // ==============================================

  /**
   * Download файл от blob response
   */
  downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Open файл за преглед
   */
  previewFile(blob) {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    window.URL.revokeObjectURL(url);
  }

  /**
   * Валидация на email адрес
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Форматиране на сума
   */
  formatAmount(amount, currency = 'BGN') {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Форматиране на дата
   */
  formatDate(dateString, includeTime = false) {
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
    
    return new Date(dateString).toLocaleDateString('bg-BG', options);
  }
}

/**
 * Custom Error класа за API грешки
 */
class APIError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }

  /**
   * Проверка дали грешката е от определен тип
   */
  isStatus(status) {
    return this.status === status;
  }

  /**
   * Проверка дали е authorization грешка
   */
  isUnauthorized() {
    return this.status === 401;
  }

  /**
   * Проверка дали е forbidden грешка
   */
  isForbidden() {
    return this.status === 403;
  }

  /**
   * Проверка дали е not found грешка
   */
  isNotFound() {
    return this.status === 404;
  }

  /**
   * Проверка дали е validation грешка
   */
  isValidationError() {
    return this.status === 400 && this.data.errors;
  }

  /**
   * Получаване на validation грешки
   */
  getValidationErrors() {
    return this.data.errors || [];
  }
}

// Създаване на singleton instance
const creditNotesAPI = new CreditNotesAPI();

// ==============================================
// useCreditNotes.js - Custom React Hook
// ==============================================

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook за управление на кредитни известия
 * Съдържа state management и API операции
 */
export const useCreditNotes = (variantId) => {
  // State management
  const [creditNotes, setCreditNotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  // ==============================================
  // API OPERATIONS
  // ==============================================

  /**
   * Зареждане на списък с кредитни известия
   */
  const fetchCreditNotes = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const response = await creditNotesAPI.getCreditNotesByVariant(variantId, filters);
      
      setCreditNotes(response.data.creditNotes);
      setPagination(response.data.pagination);
      
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Грешка при зареждане';
      setError(errorMessage);
      setCreditNotes([]);
      throw err;
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [variantId, filters]);

  /**
   * Зареждане на статистики
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await creditNotesAPI.getCreditNotesStats(variantId);
      setStats(response.data.stats);
      return response.data.stats;
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [variantId]);

  /**
   * Създаване на кредитно известие
   */
  const createCreditNote = useCallback(async (creditNoteData) => {
    try {
      const response = await creditNotesAPI.createCreditNote(variantId, creditNoteData);
      
      // Refresh списъка и статистиките
      await Promise.all([
        fetchCreditNotes(false),
        fetchStats()
      ]);
      
      return response.data.creditNote;
    } catch (err) {
      throw err;
    }
  }, [variantId, fetchCreditNotes, fetchStats]);

  /**
   * Изпращане на кредитно известие
   */
  const sendCreditNote = useCallback(async (creditNoteId, emailData) => {
    try {
      const response = await creditNotesAPI.sendCreditNote(creditNoteId, emailData);
      
      // Refresh списъка
      await fetchCreditNotes(false);
      
      return response;
    } catch (err) {
      throw err;
    }
  }, [fetchCreditNotes]);

  /**
   * Отмяна на кредитно известие
   */
  const cancelCreditNote = useCallback(async (creditNoteId) => {
    try {
      const response = await creditNotesAPI.cancelCreditNote(creditNoteId);
      
      // Refresh списъка и статистиките
      await Promise.all([
        fetchCreditNotes(false),
        fetchStats()
      ]);
      
      return response;
    } catch (err) {
      throw err;
    }
  }, [fetchCreditNotes, fetchStats]);

  /**
   * Download на PDF
   */
  const downloadPDF = useCallback(async (creditNoteId, filename) => {
    try {
      const blob = await creditNotesAPI.downloadCreditNotePDF(creditNoteId);
      creditNotesAPI.downloadFile(blob, filename);
    } catch (err) {
      throw err;
    }
  }, []);

  /**
   * Preview на PDF
   */
  const previewPDF = useCallback(async (creditNoteId) => {
    try {
      const blob = await creditNotesAPI.previewCreditNotePDF(creditNoteId);
      creditNotesAPI.previewFile(blob);
    } catch (err) {
      throw err;
    }
  }, []);

  // ==============================================
  // FILTER MANAGEMENT
  // ==============================================

  /**
   * Промяна на филтри
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset page when other filters change
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  /**
   * Изчистване на филтри
   */
  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      status: '',
      date_from: '',
      date_to: '',
      search: ''
    });
  }, []);

  /**
   * Промяна на страница
   */
  const changePage = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  // ==============================================
  // EFFECTS
  // ==============================================

  // Auto-fetch когато се променят филтрите
  useEffect(() => {
    if (variantId) {
      fetchCreditNotes();
    }
  }, [variantId, fetchCreditNotes]);

  // Initial stats load
  useEffect(() => {
    if (variantId) {
      fetchStats();
    }
  }, [variantId, fetchStats]);

  // ==============================================
  // UTILITY FUNCTIONS
  // ==============================================

  /**
   * Retry операция при грешка
   */
  const retry = useCallback(() => {
    fetchCreditNotes();
  }, [fetchCreditNotes]);

  /**
   * Refresh данни
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchCreditNotes(false),
      fetchStats()
    ]);
  }, [fetchCreditNotes, fetchStats]);

  /**
   * Проверка дали има данни
   */
  const hasData = creditNotes.length > 0;

  /**
   * Проверка дали има филтри
   */
  const hasActiveFilters = filters.search || filters.status || filters.date_from || filters.date_to;

  // ==============================================
  // RETURN HOOK API
  // ==============================================

  return {
    // Data
    creditNotes,
    stats,
    pagination,
    filters,
    
    // Loading states
    loading,
    error,
    
    // Operations
    createCreditNote,
    sendCreditNote,
    cancelCreditNote,
    downloadPDF,
    previewPDF,
    
    // Data management
    fetchCreditNotes,
    fetchStats,
    refresh,
    retry,
    
    // Filter management
    updateFilters,
    clearFilters,
    changePage,
    
    // Utility
    hasData,
    hasActiveFilters,
    
    // API instance (for advanced usage)
    api: creditNotesAPI
  };
};

/**
 * Hook за управление на едно кредитно известие
 */
export const useCreditNote = (creditNoteId) => {
  const [creditNote, setCreditNote] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Зареждане на кредитно известие
   */
  const fetchCreditNote = useCallback(async () => {
    if (!creditNoteId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await creditNotesAPI.getCreditNoteDetails(creditNoteId);
      setCreditNote(response.data.creditNote);
      
      return response.data.creditNote;
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Грешка при зареждане';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [creditNoteId]);

  /**
   * Зареждане на история
   */
  const fetchHistory = useCallback(async () => {
    if (!creditNoteId) return;
    
    try {
      const response = await creditNotesAPI.getCreditNoteHistory(creditNoteId);
      setHistory(response.data.history);
      return response.data.history;
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  }, [creditNoteId]);

  /**
   * Refresh данни
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchCreditNote(),
      fetchHistory()
    ]);
  }, [fetchCreditNote, fetchHistory]);

  // Auto-fetch при промяна на ID
  useEffect(() => {
    fetchCreditNote();
  }, [fetchCreditNote]);

  return {
    creditNote,
    history,
    loading,
    error,
    fetchCreditNote,
    fetchHistory,
    refresh,
    api: creditNotesAPI
  };
};

// ==============================================
// EXPORTS
// ==============================================

export { creditNotesAPI, APIError };
export default creditNotesAPI;

// ==============================================
// USAGE EXAMPLES
// ==============================================

/*
// Example 1: Using useCreditNotes hook in a component
function CreditNotesPage({ variantId }) {
  const {
    creditNotes,
    stats,
    loading,
    error,
    createCreditNote,
    updateFilters,
    downloadPDF
  } = useCreditNotes(variantId);

  const handleCreateCreditNote = async (data) => {
    try {
      await createCreditNote(data);
      // Success handling
    } catch (err) {
      // Error handling
    }
  };

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {creditNotes.map(note => (
        <CreditNoteCard key={note.id} creditNote={note} />
      ))}
    </div>
  );
}

// Example 2: Using direct API calls
async function downloadCreditNotePDF(creditNoteId) {
  try {
    const blob = await creditNotesAPI.downloadCreditNotePDF(creditNoteId);
    creditNotesAPI.downloadFile(blob, `credit-note-${creditNoteId}.pdf`);
  } catch (error) {
    if (error.isUnauthorized()) {
      // Redirect to login
    } else if (error.isValidationError()) {
      // Show validation errors
      const errors = error.getValidationErrors();
      console.log(errors);
    } else {
      // Generic error handling
      alert(error.message);
    }
  }
}

// Example 3: Error handling with hooks
function MyComponent() {
  const { creditNotes, error, retry } = useCreditNotes(variantId);

  if (error) {
    return (
      <ErrorBoundary>
        <p>Грешка: {error}</p>
        <button onClick={retry}>Опитай отново</button>
      </ErrorBoundary>
    );
  }

  return <CreditNotesList creditNotes={creditNotes} />;
}
*/