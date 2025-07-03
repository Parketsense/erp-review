import { API_BASE_URL } from '../lib/api';

export interface ArchitectPayment {
  id: string;
  phaseId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'check';
  status: 'pending' | 'completed' | 'canceled';
  description?: string;
  createdAt: string;
  updatedAt: string;
  phase?: {
    id: string;
    name: string;
    project?: {
      id: string;
      name: string;
    };
  };
}

export interface CreateArchitectPaymentDto {
  phaseId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'card' | 'check';
  status: 'pending' | 'completed' | 'canceled';
  description?: string;
}

export interface UpdateArchitectPaymentDto {
  amount?: number;
  paymentDate?: string;
  paymentMethod?: 'cash' | 'bank_transfer' | 'card' | 'check';
  status?: 'pending' | 'completed' | 'canceled';
  description?: string;
}

export interface ArchitectPaymentStats {
  totalPayments: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  canceledAmount: number;
  expectedCommission: number;
  remainingCommission: number;
}

class ArchitectPaymentsApiService {
  // Get all architect payments
  async getAllPayments(): Promise<ArchitectPayment[]> {
    const response = await fetch(`${API_BASE_URL}/architect-payments`);
    if (!response.ok) {
      throw new Error('Failed to fetch architect payments');
    }
    const result = await response.json();
    return result.data || result;
  }

  // Get payments by phase
  async getPaymentsByPhase(phaseId: string): Promise<ArchitectPayment[]> {
    const response = await fetch(`${API_BASE_URL}/architect-payments/phase/${phaseId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch phase payments');
    }
    const result = await response.json();
    return result.data || result;
  }

  // Get payment by ID
  async getPaymentById(id: string): Promise<ArchitectPayment> {
    const response = await fetch(`${API_BASE_URL}/architect-payments/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }
    const result = await response.json();
    return result.data || result;
  }

  // Create new payment
  async createPayment(data: CreateArchitectPaymentDto): Promise<ArchitectPayment> {
    const response = await fetch(`${API_BASE_URL}/architect-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to create payment');
    }
    
    const result = await response.json();
    return result.data || result;
  }

  // Update payment
  async updatePayment(id: string, data: UpdateArchitectPaymentDto): Promise<ArchitectPayment> {
    const response = await fetch(`${API_BASE_URL}/architect-payments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to update payment');
    }
    
    const result = await response.json();
    return result.data || result;
  }

  // Delete payment
  async deletePayment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/architect-payments/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete payment');
    }
  }

  // Get statistics for a phase
  async getPhaseStats(phaseId: string): Promise<ArchitectPaymentStats> {
    const response = await fetch(`${API_BASE_URL}/architect-payments/phase/${phaseId}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment stats');
    }
    const result = await response.json();
    return result.data || result;
  }

  // Get payment method options
  getPaymentMethods() {
    return [
      { value: 'cash', label: 'Налично' },
      { value: 'bank_transfer', label: 'Банков превод' },
      { value: 'card', label: 'Карта' },
      { value: 'check', label: 'Чек' }
    ];
  }

  // Get status options
  getStatusOptions() {
    return [
      { value: 'pending', label: 'Чакащо' },
      { value: 'completed', label: 'Завършено' },
      { value: 'canceled', label: 'Отменено' }
    ];
  }

  // Format payment method label
  formatPaymentMethod(method: string): string {
    const methods = {
      cash: 'Налично',
      bank_transfer: 'Банков превод',
      card: 'Карта',
      check: 'Чек'
    };
    return methods[method as keyof typeof methods] || method;
  }

  // Format status label
  formatStatus(status: string): string {
    const statuses = {
      pending: 'Чакащо',
      completed: 'Завършено',
      canceled: 'Отменено'
    };
    return statuses[status as keyof typeof statuses] || status;
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('bg-BG', {
      style: 'currency',
      currency: 'BGN'
    }).format(amount);
  }

  // Format date
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('bg-BG');
  }
}

export const architectPaymentsApi = new ArchitectPaymentsApiService(); 