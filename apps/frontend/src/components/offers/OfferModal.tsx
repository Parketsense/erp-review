'use client';

import React, { useState, useEffect } from 'react';
import { CreateOfferDto, Offer } from '../../types/offer';
import { X, FileText, Calendar, User, Building2, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (offer: CreateOfferDto) => Promise<void>;
  initialData?: Offer | null;
}

export default function OfferModal({ isOpen, onClose, onSave, initialData }: OfferModalProps) {
  // Local form state interface for better type safety
  interface FormData {
    projectId: string;
    phaseId: string;
    clientId: string;
    offerNumber: string;
    projectName: string;
    subject: string;
    validUntil: string;
    expiresAt: string;
    emailSubject: string;
    emailBody: string;
    status: string;
  }

  const [formData, setFormData] = useState<FormData>({
    projectId: '',
    phaseId: '',
    clientId: '',
    offerNumber: '',
    projectName: '',
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

  const isEditMode = !!initialData;

  // Populate form when editing  
  useEffect(() => {
    if (initialData) {
      setFormData({
        projectId: initialData.projectId,
        phaseId: initialData.phaseId || '',
        clientId: initialData.clientId,
        offerNumber: initialData.offerNumber,
        projectName: initialData.projectName || '',
        subject: initialData.subject || '',
        validUntil: initialData.validUntil || '',
        expiresAt: initialData.expiresAt || '',
        emailSubject: initialData.emailSubject || '',
        emailBody: initialData.emailBody || '',
        status: initialData.status || 'draft',
      });
    } else {
      // Reset form for new offer
      setFormData({
        projectId: '',
        phaseId: '',
        clientId: '',
        offerNumber: '',
        projectName: '',
        subject: '',
        validUntil: '',
        expiresAt: '',
        emailSubject: '',
        emailBody: '',
        status: 'draft',
      });
    }
    setErrors({});
    setShowSuccess(false);
    setOfferNumberExists(false);
  }, [initialData, isOpen]);

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

    if (!formData.projectId.trim()) {
      newErrors.projectId = 'Проектът е задължителен';
    }

    if (!formData.clientId.trim()) {
      newErrors.clientId = 'Клиентът е задължителен';
    }

    if (!formData.offerNumber.trim()) {
      newErrors.offerNumber = 'Номерът на офертата е задължителен';
    } else if (offerNumberExists && !isEditMode) {
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
        projectId: formData.projectId,
        phaseId: formData.phaseId || undefined,
        clientId: formData.clientId,
        offerNumber: formData.offerNumber,
        projectName: formData.projectName || undefined,
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
      console.error('Error saving offer:', error);
      setErrors({ submit: 'Възникна грешка при запазването' });
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
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 300 }}>
            {isEditMode ? 'Редактиране на оферта' : 'Нова оферта'}
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
                <span>Офертата е запазена успешно!</span>
              </div>
            )}

            {errors.submit && (
              <div className="alert alert-error">
                <AlertCircle size={16} />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Basic Information */}
            <div className="form-section">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>
                <FileText size={16} style={{ marginRight: '0.5rem' }} />
                Основна информация
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="offerNumber">Номер на оферта *</label>
                  <input
                    type="text"
                    id="offerNumber"
                    name="offerNumber"
                    value={formData.offerNumber}
                    onChange={handleInputChange}
                    className={errors.offerNumber ? 'form-input error' : 'form-input'}
                    placeholder="OFF-001"
                  />
                  {errors.offerNumber && <span className="error-text">{errors.offerNumber}</span>}
                  {offerNumberExists && !isEditMode && (
                    <div className="warning-text">
                      <AlertCircle size={14} />
                      <span>Оферта с този номер вече съществува</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="status">Статус</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="draft">Чернова</option>
                    <option value="sent">Изпратена</option>
                    <option value="viewed">Прегледана</option>
                    <option value="accepted">Приета</option>
                    <option value="rejected">Отхвърлена</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="projectName">Име на проекта</label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Въведете име на проекта"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Тема</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Въведете тема на офертата"
                  />
                </div>
              </div>
            </div>

            {/* Project and Client */}
            <div className="form-section">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>
                <Building2 size={16} style={{ marginRight: '0.5rem' }} />
                Проект и клиент
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="projectId">Проект *</label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleInputChange}
                    className={errors.projectId ? 'form-select error' : 'form-select'}
                  >
                    <option value="">Изберете проект</option>
                    <option value="project-1">Проект 1</option>
                    <option value="project-2">Проект 2</option>
                    <option value="project-3">Проект 3</option>
                  </select>
                  {errors.projectId && <span className="error-text">{errors.projectId}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phaseId">Фаза</label>
                  <select
                    id="phaseId"
                    name="phaseId"
                    value={formData.phaseId}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Изберете фаза</option>
                    <option value="phase-1">Фаза 1</option>
                    <option value="phase-2">Фаза 2</option>
                    <option value="phase-3">Фаза 3</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="clientId">Клиент *</label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className={errors.clientId ? 'form-select error' : 'form-select'}
                >
                  <option value="">Изберете клиент</option>
                  <option value="client-1">Клиент 1</option>
                  <option value="client-2">Клиент 2</option>
                  <option value="client-3">Клиент 3</option>
                </select>
                {errors.clientId && <span className="error-text">{errors.clientId}</span>}
              </div>
            </div>

            {/* Dates */}
            <div className="form-section">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>
                <Calendar size={16} style={{ marginRight: '0.5rem' }} />
                Дати
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="validUntil">Валидна до</label>
                  <input
                    type="date"
                    id="validUntil"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className={errors.validUntil ? 'form-input error' : 'form-input'}
                  />
                  {errors.validUntil && <span className="error-text">{errors.validUntil}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="expiresAt">Изтича на</label>
                  <input
                    type="date"
                    id="expiresAt"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="form-section">
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 500 }}>
                <Info size={16} style={{ marginRight: '0.5rem' }} />
                Email настройки
              </h3>
              
              <div className="form-group">
                <label htmlFor="emailSubject">Email тема</label>
                <input
                  type="text"
                  id="emailSubject"
                  name="emailSubject"
                  value={formData.emailSubject}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Въведете тема на email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emailBody">Email съдържание</label>
                <textarea
                  id="emailBody"
                  name="emailBody"
                  value={formData.emailBody}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={4}
                  placeholder="Въведете съдържание на email"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Отказ
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Запазване...' : (isEditMode ? 'Обнови' : 'Създай')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 