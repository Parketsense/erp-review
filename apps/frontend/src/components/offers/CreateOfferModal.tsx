'use client';

import React, { useState, useEffect } from 'react';
import { CreateOfferDto } from '../../types/offer';
import { X, FileText, Calendar, User, Building2, AlertCircle, Info, CheckCircle, Save, Plus } from 'lucide-react';
import '../../styles/offers-design-system.css';

interface CreateOfferModalProps {
  projectId: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: CreateOfferDto) => Promise<void>;
}

export default function CreateOfferModal({ 
  projectId, 
  projectName, 
  clientId, 
  clientName, 
  isOpen, 
  onClose, 
  onSave 
}: CreateOfferModalProps) {
  // Local form state interface for better type safety
  interface FormData {
    offerNumber: string;
    subject: string;
    validUntil: string;
    expiresAt: string;
    emailSubject: string;
    emailBody: string;
    status: string;
  }

  const [formData, setFormData] = useState<FormData>({
    offerNumber: '',
    subject: '',
    validUntil: '',
    expiresAt: '',
    emailSubject: '',
    emailBody: '',
    status: 'draft',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [offerNumberExists, setOfferNumberExists] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        offerNumber: '',
        subject: projectName ? `Оферта за ${projectName}` : '',
        validUntil: '',
        expiresAt: '',
        emailSubject: projectName ? `Оферта за ${projectName}` : '',
        emailBody: '',
        status: 'draft',
      });
      setErrors({});
      setShowSuccess(false);
      setOfferNumberExists(false);
    }
  }, [isOpen, projectName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Check offer number uniqueness
    if (name === 'offerNumber' && value.trim()) {
      checkOfferNumber(value.trim());
    }
  };

  const checkOfferNumber = async (offerNumber: string) => {
    if (!offerNumber.trim()) {
      setOfferNumberExists(false);
      return;
    }

    try {
      // This would be implemented in the API
      // const response = await offersApi.checkOfferNumber(offerNumber);
      // setOfferNumberExists(response.exists);
      
      // For now, simulate the check
      if (offerNumber === 'OFF-001' || offerNumber === 'OFF-002') {
        setOfferNumberExists(true);
      } else {
        setOfferNumberExists(false);
      }
    } catch (error) {
      console.error('Error checking offer number:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.offerNumber.trim()) {
      newErrors.offerNumber = 'Номерът на офертата е задължителен';
    } else if (offerNumberExists) {
      newErrors.offerNumber = 'Оферта с този номер вече съществува';
    }

    if (formData.validUntil && formData.expiresAt) {
      const validUntil = new Date(formData.validUntil);
      const expiresAt = new Date(formData.expiresAt);
      if (validUntil <= expiresAt) {
        newErrors.validUntil = 'Валидната дата трябва да е след датата на изтичане';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Convert form data to CreateOfferDto
      const offerData: CreateOfferDto = {
        projectId: projectId,
        clientId: clientId || '',
        offerNumber: formData.offerNumber,
        projectName: projectName,
        subject: formData.subject || undefined,
        validUntil: formData.validUntil || undefined,
        expiresAt: formData.expiresAt || undefined,
        emailSubject: formData.emailSubject || undefined,
        emailBody: formData.emailBody || undefined,
        status: formData.status,
      };

      await onSave(offerData);
      
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating offer:', error);
      setErrors({ submit: 'Възникна грешка при създаването' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            <FileText size={20} style={{ marginRight: 'var(--space-2)' }} />
            Създаване на оферта
          </h2>
          <button onClick={handleCancel} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {showSuccess && (
              <div className="alert alert-success">
                <CheckCircle size={16} />
                <span>Офертата е създадена успешно!</span>
              </div>
            )}

            {errors.submit && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Pre-filled Information */}
            {(projectName || clientName) && (
              <div style={{
                background: 'var(--color-success-light)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-btn)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-5)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--color-primary)',
                  fontWeight: '600'
                }}>
                  <Info size={16} />
                  Предварително попълнена информация
                </div>
                {projectName && (
                  <div style={{ marginBottom: 'var(--space-1)' }}>
                    <Building2 size={14} style={{ marginRight: 'var(--space-1)' }} />
                    <strong>Проект:</strong> {projectName}
                  </div>
                )}
                {clientName && (
                  <div>
                    <User size={14} style={{ marginRight: 'var(--space-1)' }} />
                    <strong>Клиент:</strong> {clientName}
                  </div>
                )}
              </div>
            )}

            {/* Basic Information */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-2)',
                borderBottom: '1px solid var(--color-border)'
              }}>
                Основна информация
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">
                    Номер на оферта *
                  </label>
                  <input
                    type="text"
                    name="offerNumber"
                    value={formData.offerNumber}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="OFF-001"
                    style={{
                      borderColor: errors.offerNumber ? 'var(--color-danger)' : undefined
                    }}
                  />
                  {errors.offerNumber && (
                    <div style={{
                      color: 'var(--color-danger)',
                      fontSize: '0.75rem',
                      marginTop: 'var(--space-1)'
                    }}>
                      {errors.offerNumber}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Статус
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="draft">Чернова</option>
                    <option value="sent">Изпратена</option>
                    <option value="viewed">Прегледана</option>
                    <option value="accepted">Приета</option>
                    <option value="rejected">Отхвърлена</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Тема на офертата
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Въведете тема на офертата"
                />
              </div>
            </div>

            {/* Dates */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-2)',
                borderBottom: '1px solid var(--color-border)'
              }}>
                Дати
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={14} style={{ marginRight: 'var(--space-1)' }} />
                    Валидна до
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{
                      borderColor: errors.validUntil ? 'var(--color-danger)' : undefined
                    }}
                  />
                  {errors.validUntil && (
                    <div style={{
                      color: 'var(--color-danger)',
                      fontSize: '0.75rem',
                      marginTop: 'var(--space-1)'
                    }}>
                      {errors.validUntil}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={14} style={{ marginRight: 'var(--space-1)' }} />
                    Дата на изтичане
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-2)',
                borderBottom: '1px solid var(--color-border)'
              }}>
                Email настройки
              </h3>
              
              <div className="form-group">
                <label className="form-label">
                  Тема на email
                </label>
                <input
                  type="text"
                  name="emailSubject"
                  value={formData.emailSubject}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Тема на email съобщението"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Съдържание на email
                </label>
                <textarea
                  name="emailBody"
                  value={formData.emailBody}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Въведете съдържание на email съобщението..."
                />
              </div>
            </div>

            {/* Form Actions */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'flex-end',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid var(--color-border)'
            }}>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline"
                disabled={loading}
                style={{ marginBottom: 0 }}
              >
                Отказ
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.offerNumber.trim()}
                style={{ marginBottom: 0 }}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                    Създаване...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Създай оферта
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 