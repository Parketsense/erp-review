'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  ArchitectPayment, 
  ArchitectPaymentStats, 
  architectPaymentsApi 
} from '@/services/architectPaymentsApi';
import ArchitectPaymentModal from './ArchitectPaymentModal';

interface ArchitectPaymentsListProps {
  phaseId: string;
  phaseName: string;
  expectedCommission?: number;
}

export default function ArchitectPaymentsList({ 
  phaseId, 
  phaseName, 
  expectedCommission = 0 
}: ArchitectPaymentsListProps) {
  const [payments, setPayments] = useState<ArchitectPayment[]>([]);
  const [stats, setStats] = useState<ArchitectPaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<ArchitectPayment | null>(null);

  // Load payments and stats
  useEffect(() => {
    loadPayments();
  }, [phaseId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [paymentsData, statsData] = await Promise.all([
        architectPaymentsApi.getPaymentsByPhase(phaseId),
        architectPaymentsApi.getPhaseStats(phaseId)
      ]);
      
      setPayments(paymentsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError(err instanceof Error ? err.message : 'Грешка при зареждане на плащанията');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (data: any) => {
    try {
      const newPayment = await architectPaymentsApi.createPayment({
        ...data,
        phaseId
      });
      setPayments(prev => [...prev, newPayment]);
      await loadPayments(); // Reload stats
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating payment:', err);
      alert('Грешка при създаване на плащане');
    }
  };

  const handleEditPayment = (payment: ArchitectPayment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handleUpdatePayment = async (data: any) => {
    if (!editingPayment) return;
    
    try {
      const updatedPayment = await architectPaymentsApi.updatePayment(editingPayment.id, data);
      setPayments(prev => prev.map(p => 
        p.id === editingPayment.id ? updatedPayment : p
      ));
      await loadPayments(); // Reload stats
      setShowEditModal(false);
      setEditingPayment(null);
    } catch (err) {
      console.error('Error updating payment:', err);
      alert('Грешка при обновяване на плащане');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете това плащане?')) return;
    
    try {
      await architectPaymentsApi.deletePayment(paymentId);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
      await loadPayments(); // Reload stats
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert('Грешка при изтриване на плащане');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'canceled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <DollarSign className="w-4 h-4" />;
      case 'bank_transfer':
        return <TrendingUp className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'check':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Плащания към архитект
            </h3>
            <p className="text-sm text-gray-500">
              Фаза: {phaseName}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добави плащане
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {architectPaymentsApi.formatCurrency(stats.totalAmount)}
              </div>
              <div className="text-sm text-gray-500">Общо платено</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {architectPaymentsApi.formatCurrency(stats.completedAmount)}
              </div>
              <div className="text-sm text-gray-500">Завършени</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {architectPaymentsApi.formatCurrency(stats.pendingAmount)}
              </div>
              <div className="text-sm text-gray-500">Чакащи</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {architectPaymentsApi.formatCurrency(expectedCommission - stats.totalAmount)}
              </div>
              <div className="text-sm text-gray-500">Оставащо</div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Сума
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Метод
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Описание
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Няма плащания към този архитект
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {architectPaymentsApi.formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {architectPaymentsApi.formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="ml-2">
                        {architectPaymentsApi.formatPaymentMethod(payment.paymentMethod)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">
                        {architectPaymentsApi.formatStatus(payment.status)}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {payment.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <ArchitectPaymentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreatePayment}
        title="Добави плащане"
        submitLabel="Създай"
      />

      <ArchitectPaymentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPayment(null);
        }}
        onSave={handleUpdatePayment}
        initialData={editingPayment}
        title="Редактирай плащане"
        submitLabel="Запази"
      />
    </div>
  );
} 