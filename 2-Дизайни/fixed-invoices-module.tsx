import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  RefreshCw,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown,
  ExternalLink,
  Mail,
  DollarSign,
  Receipt,
  CreditCard,
  Printer,
  Send,
  ArrowRight
} from 'lucide-react';

const InvoicesModule = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    client: 'all',
    dateRange: 'all',
    search: ''
  });

  // Симулирани данни за фактури
  useEffect(() => {
    const mockInvoices = [
      {
        id: 1,
        invoiceNumber: 'PF2025-001512',
        type: 'proforma',
        status: 'paid',
        project: 'Апартамент София',
        client: 'Иван Петров',
        phase: 'Всекидневна',
        variant: 'Вариант 1',
        issueDate: '2025-06-24',
        dueDate: '2025-07-24',
        validUntil: '2025-07-27',
        amount: 2850.00,
        currency: 'EUR',
        paidAmount: 2850.00,
        paidDate: '2025-06-25',
        description: 'Авансово плащане 70%',
        clientEmail: 'ivan.petrov@email.bg',
        emailSent: true,
        emailSentDate: '2025-06-24',
        emailOpened: true,
        emailOpenedDate: '2025-06-24',
        // Директни URLs
        directUrl: '/invoices/view/PF2025-001512',
        pdfUrl: '/invoices/pdf/PF2025-001512.pdf',
        editUrl: '/invoices/edit/PF2025-001512'
      },
      {
        id: 2,
        invoiceNumber: 'INV2025-001498',
        type: 'original',
        status: 'paid',
        project: 'Апартамент София', 
        client: 'Иван Петров',
        phase: 'Всекидневна',
        variant: 'Вариант 1',
        issueDate: '2025-06-25',
        amount: 2850.00,
        currency: 'EUR',
        paidAmount: 2850.00,
        paidDate: '2025-06-25',
        description: 'Оригинална фактура за авансово плащане',
        clientEmail: 'ivan.petrov@email.bg',
        emailSent: true,
        emailSentDate: '2025-06-25',
        emailOpened: true,
        emailOpenedDate: '2025-06-25',
        directUrl: '/invoices/view/INV2025-001498',
        pdfUrl: '/invoices/pdf/INV2025-001498.pdf',
        editUrl: '/invoices/edit/INV2025-001498',
        relatedProforma: 'PF2025-001512'
      },
      {
        id: 3,
        invoiceNumber: 'PF2025-001678',
        type: 'proforma_interim',
        status: 'paid',
        project: 'Апартамент София',
        client: 'Иван Петров', 
        phase: 'Всекидневна',
        variant: 'Вариант 1',
        issueDate: '2025-06-28',
        dueDate: '2025-07-28',
        validUntil: '2025-07-31',
        amount: 855.00,
        currency: 'EUR',
        paidAmount: 855.00,
        paidDate: '2025-06-28',
        description: 'Междинно плащане за доставени материали',
        clientEmail: 'ivan.petrov@email.bg',
        emailSent: true,
        emailSentDate: '2025-06-28',
        emailOpened: false,
        directUrl: '/invoices/view/PF2025-001678',
        pdfUrl: '/invoices/pdf/PF2025-001678.pdf',
        editUrl: '/invoices/edit/PF2025-001678'
      },
      {
        id: 4,
        invoiceNumber: 'CR2025-000023',
        type: 'credit',
        status: 'issued',
        project: 'Апартамент София',
        client: 'Иван Петров',
        phase: 'Всекидневна', 
        variant: 'Вариант 1',
        issueDate: '2025-06-30',
        amount: -200.00,
        currency: 'EUR',
        description: 'Кредитно известие - корекция количества',
        clientEmail: 'ivan.petrov@email.bg',
        emailSent: true,
        emailSentDate: '2025-06-30',
        emailOpened: true,
        emailOpenedDate: '2025-06-30',
        directUrl: '/invoices/view/CR2025-000023',
        pdfUrl: '/invoices/pdf/CR2025-000023.pdf',
        editUrl: '/invoices/edit/CR2025-000023',
        relatedInvoice: 'INV2025-001498'
      },
      {
        id: 5,
        invoiceNumber: 'PF2025-001789',
        type: 'proforma_final',
        status: 'draft',
        project: 'Офис Пловдив',
        client: 'Мария Димитрова',
        phase: 'Приемна',
        variant: 'Вариант 2',
        issueDate: '2025-06-25',
        dueDate: '2025-07-25',
        validUntil: '2025-07-28',
        amount: 495.00,
        currency: 'EUR',
        description: 'Окончателно плащане',
        clientEmail: 'maria.dimitrova@company.bg',
        emailSent: false,
        directUrl: '/invoices/view/PF2025-001789',
        pdfUrl: '/invoices/pdf/PF2025-001789.pdf',
        editUrl: '/invoices/edit/PF2025-001789'
      }
    ];
    setInvoices(mockInvoices);
  }, []);

  // Типове фактури
  const invoiceTypes = {
    'proforma': { label: 'Проформа', color: 'bg-blue-100 text-blue-800', icon: '📄' },
    'original': { label: 'Оригинал', color: 'bg-green-100 text-green-800', icon: '📋' },
    'proforma_interim': { label: 'Междинна', color: 'bg-orange-100 text-orange-800', icon: '📊' },
    'proforma_final': { label: 'Окончателна', color: 'bg-purple-100 text-purple-800', icon: '🏁' },
    'credit': { label: 'Кредитно', color: 'bg-red-100 text-red-800', icon: '↩️' }
  };

  // Статуси
  const invoiceStatuses = {
    'draft': { label: 'Чернова', color: 'bg-gray-100 text-gray-800', icon: '📝' },
    'sent': { label: 'Изпратена', color: 'bg-blue-100 text-blue-800', icon: '📤' },
    'opened': { label: 'Отворена', color: 'bg-yellow-100 text-yellow-800', icon: '👁️' },
    'paid': { label: 'Платена', color: 'bg-green-100 text-green-800', icon: '✅' },
    'overdue': { label: 'Просрочена', color: 'bg-red-100 text-red-800', icon: '⚠️' },
    'issued': { label: 'Издадена', color: 'bg-indigo-100 text-indigo-800', icon: '📜' }
  };

  // Филтриране на фактури
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(filters.search.toLowerCase()) ||
                         invoice.client.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType = filters.type === 'all' || invoice.type === filters.type;
    const matchesStatus = filters.status === 'all' || invoice.status === filters.status;
    const matchesClient = filters.client === 'all' || invoice.client === filters.client;

    return matchesSearch && matchesType && matchesStatus && matchesClient;
  });

  // Уникални клиенти за филтъра
  const clients = [...new Set(invoices.map(invoice => invoice.client))];

  const TypeBadge = ({ type }) => {
    const typeInfo = invoiceTypes[type] || invoiceTypes['proforma'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
        <span className="mr-1">{typeInfo.icon}</span>
        {typeInfo.label}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusInfo = invoiceStatuses[status] || invoiceStatuses['draft'];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        <span className="mr-1">{statusInfo.icon}</span>
        {statusInfo.label}
      </span>
    );
  };

  const EmailIndicator = ({ invoice }) => {
    if (!invoice.emailSent) {
      return <XCircle className="w-4 h-4 text-gray-400" title="Не е изпратена" />;
    } else if (invoice.emailOpened) {
      return <CheckCircle className="w-4 h-4 text-green-600" title="Отворена от клиента" />;
    } else {
      return <Mail className="w-4 h-4 text-blue-600" title="Изпратена, но не е отворена" />;
    }
  };

  // КЛЮЧОВА ФУНКЦИЯ: Директна навигация към фактура
  const navigateToInvoice = (invoice, action = 'view') => {
    let url;
    switch(action) {
      case 'view':
        url = invoice.directUrl;
        break;
      case 'edit':
        url = invoice.editUrl;
        break;
      case 'pdf':
        url = invoice.pdfUrl;
        break;
      default:
        url = invoice.directUrl;
    }
    
    // В реалната апликация ще е router.push(url) или window.location.href = url
    console.log(`Навигация към: ${url}`);
    alert(`Отивам директно към фактура: ${invoice.invoiceNumber}\nURL: ${url}`);
  };

  const InvoiceDetailsModal = ({ invoice, onClose }) => {
    if (!invoice) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Receipt className="w-6 h-6 text-blue-600 mr-2" />
                  Фактура {invoice.invoiceNumber}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Проект: {invoice.project} - {invoice.client}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Основна информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Информация за фактурата</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Тип:</span>
                    <TypeBadge type={invoice.type} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Статус:</span>
                    <StatusBadge status={invoice.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дата на издаване:</span>
                    <span className="font-medium">{invoice.issueDate}</span>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Дата на падеж:</span>
                      <span className="font-medium">{invoice.dueDate}</span>
                    </div>
                  )}
                  {invoice.validUntil && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Валидна до:</span>
                      <span className="font-medium">{invoice.validUntil}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Финансова информация</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Сума:</span>
                    <span className="font-bold text-lg">{invoice.currency} {Math.abs(invoice.amount)}</span>
                  </div>
                  {invoice.paidAmount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Платена сума:</span>
                      <span className="font-medium text-green-600">{invoice.currency} {invoice.paidAmount}</span>
                    </div>
                  )}
                  {invoice.paidDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Дата на плащане:</span>
                      <span className="font-medium">{invoice.paidDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Описание:</span>
                    <span className="font-medium text-right max-w-xs">{invoice.description}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email статус */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email статус
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <EmailIndicator invoice={invoice} />
                  <span className="ml-2 text-sm text-gray-600">
                    {invoice.emailSent ? 'Изпратена' : 'Не е изпратена'}
                  </span>
                </div>
                {invoice.emailSentDate && (
                  <div className="text-sm text-gray-600">
                    Изпратена на: {invoice.emailSentDate}
                  </div>
                )}
                {invoice.emailOpenedDate && (
                  <div className="text-sm text-gray-600">
                    Отворена на: {invoice.emailOpenedDate}
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Email адрес: {invoice.clientEmail}
              </div>
            </div>

            {/* Връзки */}
            {(invoice.relatedProforma || invoice.relatedInvoice) && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Свързани документи</h3>
                {invoice.relatedProforma && (
                  <p className="text-sm text-blue-700 mb-2">
                    Към проформа: <span className="font-medium">{invoice.relatedProforma}</span>
                  </p>
                )}
                {invoice.relatedInvoice && (
                  <p className="text-sm text-blue-700">
                    Към фактура: <span className="font-medium">{invoice.relatedInvoice}</span>
                  </p>
                )}
              </div>
            )}

            {/* Действия в модала */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Бързи действия</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => navigateToInvoice(invoice, 'view')}
                  className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">Преглед</span>
                </button>
                <button
                  onClick={() => navigateToInvoice(invoice, 'edit')}
                  className="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium">Редактирай</span>
                </button>
                <button
                  onClick={() => navigateToInvoice(invoice, 'pdf')}
                  className="flex items-center justify-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm font-medium">PDF</span>
                </button>
                <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <Send className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Изпрати</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Затвори
              </button>
              <button 
                onClick={() => navigateToInvoice(invoice, 'view')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Отиди към фактурата
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-6 h-6 text-blue-600" />
                  Управление на фактури
                </h1>
                <p className="text-gray-600 mt-1">Преглед на всички фактури с директни линкове</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Експорт
                </button>
                <button 
                  onClick={() => setLoading(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Обнови
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Нова фактура
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Търсене по номер, проект или клиент..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всички типове</option>
              <option value="proforma">Проформи</option>
              <option value="original">Оригинали</option>
              <option value="proforma_interim">Междинни</option>
              <option value="proforma_final">Окончателни</option>
              <option value="credit">Кредитни</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всички статуси</option>
              <option value="draft">Чернови</option>
              <option value="sent">Изпратени</option>
              <option value="opened">Отворени</option>
              <option value="paid">Платени</option>
              <option value="overdue">Просрочени</option>
            </select>

            <select
              value={filters.client}
              onChange={(e) => setFilters(prev => ({...prev, client: e.target.value}))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Всички клиенти</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Фактура
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Проект / Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сума
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {/* ДИРЕКТЕН ЛИНК КЪМ ФАКТУРАТА */}
                        <button
                          onClick={() => navigateToInvoice(invoice, 'view')}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </button>
                        <div className="text-sm text-gray-500">{invoice.issueDate}</div>
                        {invoice.validUntil && (
                          <div className="text-xs text-gray-400">до {invoice.validUntil}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TypeBadge type={invoice.type} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.project}</div>
                        <div className="text-sm text-gray-500">{invoice.client}</div>
                        <div className="text-xs text-gray-400">{invoice.phase} - {invoice.variant}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EmailIndicator invoice={invoice} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${invoice.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {invoice.amount < 0 ? '-' : ''}{invoice.currency} {Math.abs(invoice.amount)}
                      </div>
                      {invoice.paidAmount !== undefined && invoice.status === 'paid' && (
                        <div className="text-xs text-green-600">✅ Платена</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Детайли"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigateToInvoice(invoice, 'view')}
                          className="text-green-600 hover:text-green-900"
                          title="Директен линк"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigateToInvoice(invoice, 'pdf')}
                          className="text-red-600 hover:text-red-900"
                          title="PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="text-purple-600 hover:text-purple-900" title="Принтирай">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Обобщение</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</div>
              <div className="text-sm text-gray-600">Общо фактури</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredInvoices.filter(i => i.status === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">Платени</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredInvoices.filter(i => i.status === 'sent' || i.status === 'opened').length}
              </div>
              <div className="text-sm text-gray-600">Изпратени</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {filteredInvoices.filter(i => i.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Чернови</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                €{filteredInvoices.reduce((sum, inv) => sum + Math.abs(inv.amount), 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Обща стойност</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedInvoice && (
        <InvoiceDetailsModal 
          invoice={selectedInvoice} 
          onClose={() => setSelectedInvoice(null)} 
        />
      )}
    </div>
  );
};

export default InvoicesModule;