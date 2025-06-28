'use client';

import { useState, useEffect } from 'react';
import { CreateClientDto, Client } from '../../types/client';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: CreateClientDto) => Promise<void>;
  initialData?: Client | null;
}

export default function ClientModal({ isOpen, onClose, onSave, initialData }: ClientModalProps) {
  const [formData, setFormData] = useState<CreateClientDto>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    hasCompany: false,
    companyName: '',
    eikBulstat: '',
    vatNumber: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyMol: '',
    isArchitect: false,
    commissionPercent: 10,
  });

  const [loading, setLoading] = useState(false);

  const isEditMode = !!initialData;

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        hasCompany: initialData.hasCompany,
        companyName: initialData.companyName || '',
        eikBulstat: initialData.eikBulstat || '',
        vatNumber: initialData.vatNumber || '',
        companyAddress: initialData.companyAddress || '',
        companyPhone: initialData.companyPhone || '',
        companyEmail: initialData.companyEmail || '',
        companyMol: initialData.companyMol || '',
        isArchitect: initialData.isArchitect,
        commissionPercent: initialData.commissionPercent || 10,
      });
    } else {
      // Reset form for new client
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        hasCompany: false,
        companyName: '',
        eikBulstat: '',
        vatNumber: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        companyMol: '',
        isArchitect: false,
        commissionPercent: 10,
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Моля въведете име и фамилия');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
      onClose();
      
      // Reset form only for new client mode
      if (!isEditMode) {
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          address: '',
          hasCompany: false,
          companyName: '',
          eikBulstat: '',
          vatNumber: '',
          companyAddress: '',
          companyPhone: '',
          companyEmail: '',
          companyMol: '',
          isArchitect: false,
          commissionPercent: 10,
        });
      }
    } catch (error) {
      alert('Грешка при запазването: ' + (error instanceof Error ? error.message : 'Неизвестна грешка'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Редактирай клиент' : 'Нов клиент'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-container">
              {/* Основни данни */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Име *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Име"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Фамилия"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+359"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Адрес
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Адрес"
                />
              </div>

              {/* Фирма */}
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="hasCompany"
                  id="hasCompany"
                  checked={formData.hasCompany}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <label htmlFor="hasCompany" className="checkbox-label">
                  Клиентът представлява фирма
                </label>
              </div>

              {formData.hasCompany && (
                <div className="card">
                  <div className="card-header">
                    Фирмени данни
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Име на фирма *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="ООД, ЕООД, АД..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        ЕИК/Булстат *
                      </label>
                      <input
                        type="text"
                        name="eikBulstat"
                        value={formData.eikBulstat}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="123456789"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        ДДС номер
                      </label>
                      <input
                        type="text"
                        name="vatNumber"
                        value={formData.vatNumber}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="BG123456789"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Адрес на фирма
                    </label>
                    <input
                      type="text"
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Адрес на фирмата"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      МОЛ (Материално отговорно лице)
                    </label>
                    <input
                      type="text"
                      name="companyMol"
                      value={formData.companyMol}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Име на МОЛ"
                    />
                  </div>
                </div>
              )}

              {/* Архитект */}
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  name="isArchitect"
                  id="isArchitect"
                  checked={formData.isArchitect}
                  onChange={handleInputChange}
                  className="checkbox-input"
                />
                <label htmlFor="isArchitect" className="checkbox-label">
                  Клиентът е архитект/дизайнер
                </label>
              </div>

              {formData.isArchitect && (
                <div className="form-group">
                  <label className="form-label">
                    Комисионна %
                  </label>
                  <input
                    type="number"
                    name="commissionPercent"
                    value={formData.commissionPercent}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="form-input"
                    style={{ width: '100px' }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Запазва...' : (isEditMode ? 'Запази промените' : 'ЗАПАЗИ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 