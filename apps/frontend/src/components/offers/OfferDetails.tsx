'use client';

import React, { useState, useEffect } from 'react';
import { Offer } from '../../types/offer';
import { offersApi } from '../../services/offersApi';
import { FileText, Calendar, User, Building2, AlertCircle, Info, CheckCircle, Edit, Trash2, Eye, X, Send, TrendingUp, Clock } from 'lucide-react';
import '../../styles/offers-design-system.css';

interface OfferDetailsProps {
  offerId: string;
  onEdit?: (offer: Offer) => void;
  onDelete?: (offer: Offer) => void;
  onClose?: () => void;
}

export default function OfferDetails({ offerId, onEdit, onDelete, onClose }: OfferDetailsProps) {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOffer();
  }, [offerId]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      setError(null);
      const offerData = await offersApi.getOfferById(offerId);
      setOffer(offerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка при зареждането');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG');
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'draft': return 'Чернова';
      case 'sent': return 'Изпратена';
      case 'viewed': return 'Прегледана';
      case 'accepted': return 'Приета';
      case 'rejected': return 'Отхвърлена';
      default: return 'Чернова';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'draft': return <Clock size={16} />;
      case 'sent': return <Send size={16} />;
      case 'viewed': return <TrendingUp size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'rejected': return <AlertCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleEdit = () => {
    if (offer && onEdit) {
      onEdit(offer);
    }
  };

  const handleDelete = () => {
    if (offer && onDelete) {
      if (window.confirm('Сигурни ли сте, че искате да изтриете тази оферта?')) {
        onDelete(offer);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Зареждане...</div>
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

  if (!offer) {
    return (
      <div className="loading">
        <div className="status-error">Офертата не е намерена</div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px', width: '95%' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <FileText size={20} style={{ marginRight: 'var(--space-2)' }} />
            Детайли на оферта
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {onEdit && (
              <button onClick={handleEdit} className="btn btn-sm btn-outline" title="Редактирай" style={{ marginBottom: 0 }}>
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button onClick={handleDelete} className="btn btn-sm btn-danger" title="Изтрий" style={{ marginBottom: 0 }}>
                <Trash2 size={16} />
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="modal-close">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="modal-body">
          {/* Hero Section */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #333333 100%)',
            color: 'white',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-btn)',
            marginBottom: 'var(--space-5)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: 'var(--space-2)',
              letterSpacing: '1px'
            }}>
              {offer.offerNumber}
            </div>
            <div style={{
              fontSize: '1.1rem',
              opacity: 0.9,
              marginBottom: 'var(--space-3)'
            }}>
              {offer.projectName || offer.project?.name || 'Без проект'}
            </div>
            <div className={`offer-status ${offer.status || 'draft'}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {getStatusIcon(offer.status)}
              <span style={{ marginLeft: 'var(--space-1)' }}>
                {getStatusText(offer.status)}
              </span>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-5)'
          }}>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <User size={20} color="var(--color-success)" />
                <div className="stat-label">Клиент</div>
              </div>
              <div className="stat-number" style={{ fontSize: '1.1rem', textAlign: 'left' }}>
                {offer.client?.name || 'Без клиент'}
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <Calendar size={20} color="var(--color-success)" />
                <div className="stat-label">Създадена</div>
              </div>
              <div className="stat-number" style={{ fontSize: '1.1rem', textAlign: 'left' }}>
                {formatDate(offer.createdAt)}
              </div>
            </div>

            {offer.validUntil && (
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <Calendar size={20} color="var(--color-success)" />
                  <div className="stat-label">Валидна до</div>
                </div>
                <div className="stat-number" style={{ fontSize: '1.1rem', textAlign: 'left' }}>
                  {formatDate(offer.validUntil)}
                </div>
              </div>
            )}

            {offer.expiresAt && (
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <Calendar size={20} color="var(--color-success)" />
                  <div className="stat-label">Изтича на</div>
                </div>
                <div className="stat-number" style={{ fontSize: '1.1rem', textAlign: 'left' }}>
                  {formatDate(offer.expiresAt)}
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-4)',
              paddingBottom: 'var(--space-2)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <Info size={16} />
              Основна информация
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Тема</label>
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-primary)',
                  minHeight: 'var(--size-btn)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {offer.subject || 'Не е посочена'}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email тема</label>
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-btn)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-primary)',
                  minHeight: 'var(--size-btn)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {offer.emailSubject || 'Не е посочена'}
                </div>
              </div>
            </div>
          </div>

          {/* Email Content */}
          {offer.emailBody && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-2)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <Send size={16} />
                Email съдържание
              </h3>
              
              <div style={{
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-primary)',
                minHeight: '120px',
                whiteSpace: 'pre-wrap'
              }}>
                {offer.emailBody}
              </div>
            </div>
          )}

          {/* Conditions */}
          {offer.conditions && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--color-primary)',
                marginBottom: 'var(--space-4)',
                paddingBottom: 'var(--space-2)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}>
                <FileText size={16} />
                Условия
              </h3>
              
              <div style={{
                padding: 'var(--space-4)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-btn)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-primary)',
                minHeight: '120px',
                whiteSpace: 'pre-wrap'
              }}>
                {offer.conditions}
              </div>
            </div>
          )}

          {/* Activity History */}
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-4)',
              paddingBottom: 'var(--space-2)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)'
            }}>
              <TrendingUp size={16} />
              Активност
            </h3>
            
            <div style={{
              padding: 'var(--space-4)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'var(--color-bg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <div>
                  <strong>Изпращания:</strong> {offer.sentCount || 0}
                </div>
                {offer.lastSentAt && (
                  <div>
                    <strong>Последно изпратена:</strong> {formatDate(offer.lastSentAt)}
                  </div>
                )}
              </div>
              {offer.lastSentTo && (
                <div>
                  <strong>Последно изпратена до:</strong> {offer.lastSentTo}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border)'
          }}>
            <button
              onClick={onClose}
              className="btn btn-outline"
              style={{ marginBottom: 0 }}
            >
              Затвори
            </button>
            {onEdit && (
              <button
                onClick={handleEdit}
                className="btn btn-primary"
                style={{ marginBottom: 0 }}
              >
                <Edit size={16} />
                Редактирай
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 