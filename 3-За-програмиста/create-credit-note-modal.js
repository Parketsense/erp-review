import React, { useState, useEffect, useMemo } from 'react';
import { X, AlertTriangle, Calculator, Package, DollarSign, Check, Loader2 } from 'lucide-react';

// ==============================================
// TYPESCRIPT INTERFACES
// ==============================================

interface OriginalInvoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  client_name: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  total_amount: number;
}

interface CreditItem {
  product_id: string;
  product_name: string;
  quantity: number;
  max_quantity: number;
  unit_price: number;
  total_amount: number;
}

interface CreditNoteData {
  original_invoice_id: string;
  mode: 'amount' | 'items';
  amount?: number;
  items?: CreditItem[];
  reason: string;
  notes?: string;
}

interface CreateCreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalInvoice: OriginalInvoice;
  variantId: string;
  onSuccess: (creditNote: any) => void;
}

// ==============================================
// MAIN COMPONENT
// ==============================================

const CreateCreditNoteModal: React.FC<CreateCreditNoteModalProps> = ({
  isOpen,
  onClose,
  originalInvoice,
  variantId,
  onSuccess
}) => {
  // State management
  const [mode, setMode] = useState<'amount' | 'items'>('amount');
  const [amount, setAmount] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Map<string, CreditItem>>(new Map());
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode('amount');
      setAmount('');
      setSelectedItems(new Map());
      setReason('');
      setNotes('');
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  // Calculate totals for items mode
  const itemsTotals = useMemo(() => {
    let subtotal = 0;
    selectedItems.forEach(item => {
      subtotal += item.total_amount;
    });
    
    const vatAmount = subtotal * (originalInvoice.vat_rate / 100);
    const totalAmount = subtotal + vatAmount;
    
    return {
      subtotal,
      vatAmount,
      totalAmount,
      itemCount: selectedItems.size
    };
  }, [selectedItems, originalInvoice.vat_rate]);

  // Calculate remaining amount
  const remainingAmount = useMemo(() => {
    // This should come from API in real implementation
    return originalInvoice.total_amount; // Simplified for demo
  }, [originalInvoice]);

  // Validation logic
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'amount':
        if (mode === 'amount') {
          const numValue = parseFloat(value);
          if (!value || isNaN(numValue)) {
            newErrors.amount = 'Сумата е задължителна';
          } else if (numValue <= 0) {
            newErrors.amount = 'Сумата трябва да е положителна';
          } else if (numValue > remainingAmount) {
            newErrors.amount = `Сумата не може да надвишава ${remainingAmount.toFixed(2)} лв.`;
          } else {
            delete newErrors.amount;
          }
        }
        break;
        
      case 'items':
        if (mode === 'items') {
          if (selectedItems.size === 0) {
            newErrors.items = 'Трябва да изберете поне един артикул';
          } else if (itemsTotals.totalAmount > remainingAmount) {
            newErrors.items = `Общата сума не може да надвишава ${remainingAmount.toFixed(2)} лв.`;
          } else {
            delete newErrors.items;
          }
        }
        break;
        
      case 'reason':
        if (!value || value.trim().length < 10) {
          newErrors.reason = 'Причината трябва да е поне 10 символа';
        } else if (value.length > 500) {
          newErrors.reason = 'Причината не може да надвишава 500 символа';
        } else {
          delete newErrors.reason;
        }
        break;
        
      case 'notes':
        if (value && value.length > 1000) {
          newErrors.notes = 'Бележките не могат да надвишават 1000 символа';
        } else {
          delete newErrors.notes;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  // Handle field changes
  const handleFieldChange = (field: string, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    switch (field) {
      case 'mode':
        setMode(value);
        setErrors({});
        break;
      case 'amount':
        setAmount(value);
        validateField('amount', value);
        break;
      case 'reason':
        setReason(value);
        validateField('reason', value);
        break;
      case 'notes':
        setNotes(value);
        validateField('notes', value);
        break;
    }
  };

  // Handle item quantity change
  const handleItemQuantityChange = (productId: string, quantity: string) => {
    const numQuantity = parseFloat(quantity);
    const originalItem = originalInvoice.items.find(item => item.product_id === productId);
    
    if (!originalItem) return;
    
    const newSelectedItems = new Map(selectedItems);
    
    if (!quantity || numQuantity <= 0) {
      newSelectedItems.delete(productId);
    } else {
      const maxQuantity = originalItem.quantity;
      const finalQuantity = Math.min(numQuantity, maxQuantity);
      const totalAmount = finalQuantity * originalItem.unit_price;
      
      newSelectedItems.set(productId, {
        product_id: productId,
        product_name: originalItem.product_name,
        quantity: finalQuantity,
        max_quantity: maxQuantity,
        unit_price: originalItem.unit_price,
        total_amount: totalAmount
      });
    }
    
    setSelectedItems(newSelectedItems);
    setTouched(prev => ({ ...prev, items: true }));
    validateField('items', newSelectedItems);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      mode: true,
      amount: true,
      items: true,
      reason: true,
      notes: true
    });
    
    // Validate all fields
    validateField('reason', reason);
    validateField('notes', notes);
    
    if (mode === 'amount') {
      validateField('amount', amount);
    } else {
      validateField('items', selectedItems);
    }
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const creditNoteData: CreditNoteData = {
        original_invoice_id: originalInvoice.id,
        mode,
        reason: reason.trim(),
        notes: notes.trim() || undefined
      };
      
      if (mode === 'amount') {
        creditNoteData.amount = parseFloat(amount);
      } else {
        creditNoteData.items = Array.from(selectedItems.values());
      }
      
      // API call
      const response = await fetch(`/api/invoices/variant/${variantId}/credit-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(creditNoteData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Грешка при създаване на кредитното известие');
      }
      
      onSuccess(data.data.creditNote);
      onClose();
      
    } catch (error) {
      console.error('Error creating credit note:', error);
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Непредвидена грешка'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Кредитно известие
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Към фактура {originalInvoice.invoice_number} • {originalInvoice.client_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Тип корекция
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleFieldChange('mode', 'amount')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    mode === 'amount'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">По сума</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Корекция на обща сума
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleFieldChange('mode', 'items')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    mode === 'items'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Package className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">По артикули</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Корекция на количества
                  </div>
                </button>
              </div>
            </div>

            {/* Amount Mode */}
            {mode === 'amount' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сума за кредитиране *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remainingAmount}
                      value={amount}
                      onChange={(e) => handleFieldChange('amount', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        touched.amount && errors.amount
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 text-sm">лв.</span>
                    </div>
                  </div>
                  {touched.amount && errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Максимална сума: {remainingAmount.toFixed(2)} лв.
                  </p>
                </div>
              </div>
            )}

            {/* Items Mode */}
            {mode === 'items' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Избор на артикули *
                  </label>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-200">
                      Артикули от оригиналната фактура
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {originalInvoice.items.map((item) => {
                        const selectedItem = selectedItems.get(item.product_id);
                        return (
                          <div key={item.product_id} className="p-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {item.product_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Код: {item.product_code} • Цена: {item.unit_price.toFixed(2)} лв.
                                </div>
                                <div className="text-sm text-gray-500">
                                  Оригинално количество: {item.quantity}
                                </div>
                              </div>
                              <div className="ml-4 flex items-center space-x-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={item.quantity}
                                  value={selectedItem?.quantity || ''}
                                  onChange={(e) => handleItemQuantityChange(item.product_id, e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0"
                                />
                                {selectedItem && (
                                  <div className="text-sm text-gray-600">
                                    = {selectedItem.total_amount.toFixed(2)} лв.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {touched.items && errors.items && (
                    <p className="mt-1 text-sm text-red-600">{errors.items}</p>
                  )}
                </div>

                {/* Items Summary */}
                {selectedItems.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calculator className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">Обобщение</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Артикули:</span>
                        <span>{itemsTotals.itemCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Сума без ДДС:</span>
                        <span>{itemsTotals.subtotal.toFixed(2)} лв.</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ДДС ({originalInvoice.vat_rate}%):</span>
                        <span>{itemsTotals.vatAmount.toFixed(2)} лв.</span>
                      </div>
                      <div className="flex justify-between font-medium text-blue-900 border-t border-blue-300 pt-1">
                        <span>Общо:</span>
                        <span>{itemsTotals.totalAmount.toFixed(2)} лв.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Причина *
              </label>
              <textarea
                value={reason}
                onChange={(e) => handleFieldChange('reason', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  touched.reason && errors.reason
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Опишете причината за кредитното известие..."
              />
              {touched.reason && errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {reason.length}/500 символа
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Допълнителни бележки
              </label>
              <textarea
                value={notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={2}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  touched.notes && errors.notes
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Допълнителна информация (незадължително)..."
              />
              {touched.notes && errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {notes.length}/1000 символа
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-red-800">{errors.submit}</span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Отказ
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Създаване...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Създай кредитно известие
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCreditNoteModal;