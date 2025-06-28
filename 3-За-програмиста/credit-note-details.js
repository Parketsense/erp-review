import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, Mail, Printer, ExternalLink, Calendar,
  User, FileText, DollarSign, Clock, CheckCircle, Ban, 
  AlertTriangle, RefreshCw, Eye, Copy, RotateCcw, 
  Package, Calculator, History, Send, Trash2
} from 'lucide-react';

// ==============================================
// TYPESCRIPT INTERFACES
// ==============================================

interface CreditNote {
  id: string;
  invoice_number: string;
  invoice_date: string;
  status: 'draft' | 'sent' | 'cancelled';
  invoice_type: 'credit_amount' | 'credit_items';
  total_amount: number;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  reason: string;
  notes?: string;
  client_name: string;
  client_address: string;
  client_eik?: string;
  client_vat_number?: string;
  original_invoice_id: string;
  original_invoice_number: string;
  original_invoice_date: string;
  sent_at?: string;
  sent_to?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  created_at: string;
  created_by: string;
  items: CreditNoteItem[];
}

interface CreditNoteItem {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  total_amount: number;
}

interface HistoryEntry {
  id: string;
  action: string;
  actionText: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
  details?: any;
}

interface CreditNoteDetailsProps {
  creditNoteId: string;
  onBack: () => void;
  onEdit?: (creditNote: CreditNote) => void;
}

// ==============================================
// MAIN COMPONENT
// ==============================================

const CreditNoteDetails: React.FC<CreditNoteDetailsProps> = ({
  creditNoteId,
  onBack,
  onEdit
}) => {
  // State management
  const [creditNote, setCreditNote] = useState<CreditNote | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showSendModal, setShowSendModal] = useState<boolean>(false);

  // ==============================================
  // API FUNCTIONS
  // ==============================================

  const fetchCreditNote = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/invoices/credit-note/${creditNoteId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при зареждане на кредитното известие');
      }
      
      const data = await response.json();
      setCreditNote(data.data.creditNote);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Непредвидена грешка');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `/api/invoices/credit-note/${creditNoteId}/history`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при зареждане на историята');
      }
      
      const data = await response.json();
      setHistory(data.data.history);
      
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // ==============================================
  // ACTION HANDLERS
  // ==============================================

  const handleDownloadPDF = async () => {
    setActionLoading(prev => ({ ...prev, pdf: true }));
    
    try {
      const response = await fetch(
        `/api/invoices/credit-note/${creditNoteId}/pdf`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при генериране на PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `credit-note-${creditNote?.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Грешка при изтегляне');
    } finally {
      setActionLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handlePreviewPDF = async () => {
    setActionLoading(prev => ({ ...prev, preview: true }));
    
    try {
      const response = await fetch(
        `/api/invoices/credit-note/${creditNoteId}/preview`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при генериране на PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Грешка при преглед');
    } finally {
      setActionLoading(prev => ({ ...prev, preview: false }));
    }
  };

  const handleSend = async (emailData: any) => {
    setActionLoading(prev => ({ ...prev, send: true }));
    
    try {
      const response = await fetch(
        `/api/invoices/credit-note/${creditNoteId}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(emailData)
        }
      );
      
      if (!response.ok) {
        throw new Error('Грешка при изпращане на кредитното известие');
      }
      
      // Refresh data
      await fetchCreditNote();
      await fetchHistory();
      setShowSendModal(false);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Грешка при изпращане');
    } finally {
      setActionLoading(prev => ({ ...prev, send: false }));
    }
  };

  const handleCancel = async () => {
    if (!confirm(`Сигурни ли сте, че искате да отмените кредитно известие ${creditNote?.invoice_number}?`)) {
      return;
    }
    
    setActionLoading(prev => ({ ...prev, cancel: true }));
    
    try {
      const response = await fetch(
        `/api/invoices/credit-note/${creditNoteId}`,
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
      
      // Refresh data
      await fetchCreditNote();
      await fetchHistory();
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Грешка при отмяна');
    } finally {
      setActionLoading(prev => ({ ...prev, cancel: false }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyNumber = () => {
    if (creditNote?.invoice_number) {
      navigator.clipboard.writeText(creditNote.invoice_number);
      // You might want to show a toast notification here
    }
  };

  // ==============================================
  // EFFECTS
  // ==============================================

  useEffect(() => {
    if (creditNoteId) {
      fetchCreditNote();
    }
  }, [creditNoteId]);

  useEffect(() => {
    if (showHistory && creditNoteId) {
      fetchHistory();
    }
  }, [showHistory, creditNoteId]);

  // ==============================================
  // UTILITY FUNCTIONS
  // ==============================================

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <Ban className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
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
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span>Зареждане на кредитно известие...</span>
      </div>
    );
  }

  if (error || !creditNote) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error || 'Кредитното известие не е намерено'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Назад към списъка
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад към списъка
          </button>
          
          <div className="flex items-center space-x-2">
            {/* Action Buttons */}
            <button
              onClick={handlePreviewPDF}
              disabled={actionLoading.preview}
              className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {actionLoading.preview ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              Преглед
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={actionLoading.pdf}
              className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {actionLoading.pdf ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              PDF
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Печат
            </button>
            
            {creditNote.status === 'draft' && (
              <>
                <button
                  onClick={() => setShowSendModal(true)}
                  disabled={actionLoading.send}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading.send ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Изпрати
                </button>
                
                <button
                  onClick={handleCancel}
                  disabled={actionLoading.cancel}
                  className="flex items-center px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {actionLoading.cancel ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Отмени
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title and Status */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {creditNote.invoice_number}
              </h1>
              <button
                onClick={handleCopyNumber}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Копирай номера"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              Кредитно известие към фактура {creditNote.original_invoice_number}
            </p>
          </div>
          
          <div className={`flex items-center px-4 py-2 rounded-full border ${getStatusColor(creditNote.status)}`}>
            {getStatusIcon(creditNote.status)}
            <span className="ml-2 font-medium">{getStatusText(creditNote.status)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Основна информация</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Номер</label>
                <div className="mt-1 text-sm text-gray-900">{creditNote.invoice_number}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Дата</label>
                <div className="mt-1 text-sm text-gray-900">{formatDate(creditNote.invoice_date)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип корекция</label>
                <div className="mt-1 flex items-center text-sm text-gray-900">
                  {creditNote.invoice_type === 'credit_amount' ? (
                    <>
                      <DollarSign className="w-4 h-4 mr-1" />
                      По сума
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-1" />
                      По артикули
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Обща сума</label>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {formatAmount(creditNote.total_amount)}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Причина</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                {creditNote.reason}
              </div>
            </div>
            
            {creditNote.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Бележки</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                  {creditNote.notes}
                </div>
              </div>
            )}
          </div>

          {/* Client Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Клиент</h2>
            
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Име: </span>
                <span className="text-sm text-gray-900">{creditNote.client_name}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Адрес: </span>
                <span className="text-sm text-gray-900">{creditNote.client_address}</span>
              </div>
              
              {creditNote.client_eik && (
                <div>
                  <span className="text-sm font-medium text-gray-700">ЕИК: </span>
                  <span className="text-sm text-gray-900">{creditNote.client_eik}</span>
                </div>
              )}
              
              {creditNote.client_vat_number && (
                <div>
                  <span className="text-sm font-medium text-gray-700">ДДС номер: </span>
                  <span className="text-sm text-gray-900">{creditNote.client_vat_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Артикули</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Артикул
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Количество
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ед. цена
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сума
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {creditNote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.product_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Код: {item.product_code}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-gray-900">
                        {formatAmount(item.unit_price)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-gray-900">
                        {formatAmount(item.total_amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Сума без ДДС:</span>
                    <span className="font-medium">{formatAmount(creditNote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ДДС ({creditNote.vat_rate}%):</span>
                    <span className="font-medium">{formatAmount(creditNote.vat_amount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                    <span>Общо:</span>
                    <span>{formatAmount(creditNote.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Original Invoice */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Оригинална фактура</h3>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Номер: </span>
                <span className="text-sm text-gray-900">{creditNote.original_invoice_number}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Дата: </span>
                <span className="text-sm text-gray-900">{formatDate(creditNote.original_invoice_date)}</span>
              </div>
              
              <button className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                Преглед на оригинала
              </button>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Статус</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                {getStatusIcon(creditNote.status)}
                <span className="ml-2 text-sm font-medium">{getStatusText(creditNote.status)}</span>
              </div>
              
              {creditNote.sent_at && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Изпратено на: </span>
                  <span className="text-sm text-gray-900">{formatDate(creditNote.sent_at)}</span>
                  {creditNote.sent_to && (
                    <div className="text-sm text-gray-600">до: {creditNote.sent_to}</div>
                  )}
                </div>
              )}
              
              {creditNote.cancelled_at && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Отменено на: </span>
                  <span className="text-sm text-gray-900">{formatDate(creditNote.cancelled_at)}</span>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-700">Създадено на: </span>
                <span className="text-sm text-gray-900">{formatDate(creditNote.created_at)}</span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">История</h3>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
              >
                <History className="w-4 h-4 inline mr-1" />
                {showHistory ? 'Скрий' : 'Покажи'}
              </button>
            </div>
            
            {showHistory && (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500">Няма записи в историята</p>
                ) : (
                  history.map((entry) => (
                    <div key={entry.id} className="flex items-start space-x-2 text-sm">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="text-gray-900">{entry.actionText}</div>
                        <div className="text-gray-500 text-xs">
                          {formatDate(entry.timestamp)} • {entry.user.name}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <SendCreditNoteModal
          creditNote={creditNote}
          onClose={() => setShowSendModal(false)}
          onSend={handleSend}
          loading={actionLoading.send}
        />
      )}
    </div>
  );
};

// ==============================================
// SEND MODAL COMPONENT
// ==============================================

interface SendCreditNoteModalProps {
  creditNote: CreditNote;
  onClose: () => void;
  onSend: (emailData: any) => void;
  loading: boolean;
}

const SendCreditNoteModal: React.FC<SendCreditNoteModalProps> = ({
  creditNote,
  onClose,
  onSend,
  loading
}) => {
  const [emailTo, setEmailTo] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>(`Кредитно известие ${creditNote.invoice_number}`);
  const [emailBody, setEmailBody] = useState<string>(`Уважаеми ${creditNote.client_name},\n\nМоля, намерете приложеното кредитно известие относно корекция по фактура ${creditNote.original_invoice_number}.\n\nС уважение,\nЕкипът на Паркетсенс ООД`);
  const [sendCopy, setSendCopy] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailData = {
      email_to: emailTo,
      email_subject: emailSubject,
      email_body: emailBody,
      send_copy_to: sendCopy ? [sendCopy] : []
    };
    
    onSend(emailData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Изпращане по email</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              До (email) *
            </label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="client@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тема
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Съобщение
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Копие до (незадължително)
            </label>
            <input
              type="email"
              value={sendCopy}
              onChange={(e) => setSendCopy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="accounting@company.com"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading || !emailTo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Изпращане...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Изпрати
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditNoteDetails;