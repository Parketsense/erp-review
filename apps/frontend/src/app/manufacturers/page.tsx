'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Factory, Plus, Search, ArrowLeft, Edit, Trash2, MoreVertical, Phone, Mail, MapPin, Globe, Percent, Users, X } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useLoading } from '../../components/LoadingProvider';
import { apiClient } from '../../lib/api';
import { contactsApi, CreateContactRequest } from '../../services/contactsApi';

interface Manufacturer {
  id: string;
  name: string;
  displayName: string;
  code?: string;
  website?: string;
  description?: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  colorCode?: string;
  discount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    attributeValues: number;
  };
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
  isActive: boolean;
  manufacturerId?: string;
  supplierId?: string;
}

interface ManufacturerModalProps {
  isOpen: boolean;
  manufacturer?: Manufacturer | null;
  onClose: () => void;
  onSave: (manufacturer: Partial<Manufacturer> & { addAsSupplier?: boolean }) => void;
}

function ManufacturerModal({ isOpen, manufacturer, onClose, onSave }: ManufacturerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    code: '',
    website: '',
    description: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    colorCode: '#6c757d',
    discount: 0,
  });
  const [addAsSupplier, setAddAsSupplier] = useState(false);
  
  // Contact management state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    isPrimary: false,
    notes: '',
  });

  useEffect(() => {
    if (manufacturer) {
      setFormData({
        name: manufacturer.name || '',
        displayName: manufacturer.displayName || '',
        code: manufacturer.code || '',
        website: manufacturer.website || '',
        description: manufacturer.description || '',
        address: manufacturer.address || '',
        contactName: manufacturer.contactName || '',
        contactEmail: manufacturer.contactEmail || '',
        contactPhone: manufacturer.contactPhone || '',
        colorCode: manufacturer.colorCode || '#6c757d',
        discount: manufacturer.discount || 0,
      });
      
      // Load existing contacts for this manufacturer
      loadContacts(manufacturer.id);
    } else {
      setFormData({
        name: '',
        displayName: '',
        code: '',
        website: '',
        description: '',
        address: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        colorCode: '#6c757d',
        discount: 0,
      });
      setContacts([]);
    }
  }, [manufacturer, isOpen]);

  const loadContacts = async (manufacturerId: string) => {
    try {
      const manufacturerContacts = await contactsApi.getManufacturerContacts(manufacturerId);
      setContacts(manufacturerContacts);
    } catch (error) {
      console.error('Грешка при зареждане на контакти:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, addAsSupplier });
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setContactFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      isPrimary: false,
      notes: '',
    });
    setShowContactModal(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setContactFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      position: contact.position || '',
      department: contact.department || '',
      isPrimary: contact.isPrimary,
      notes: contact.notes || '',
    });
    setShowContactModal(true);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този контакт?')) return;
    
    try {
      await contactsApi.deleteContact(contactId);
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (error) {
      console.error('Грешка при изтриване на контакт:', error);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingContact) {
        // Update existing contact
        const updatedContact = await contactsApi.updateContact(editingContact.id, contactFormData);
        setContacts(contacts.map(c => c.id === editingContact.id ? updatedContact : c));
      } else {
        // Create new contact (only if we have a manufacturer ID)
        if (manufacturer?.id) {
          const newContactData: CreateContactRequest = {
            ...contactFormData,
            manufacturerId: manufacturer.id,
          };
          const newContact = await contactsApi.createContact(newContactData);
          setContacts([...contacts, newContact]);
        }
      }
      
      setShowContactModal(false);
      setEditingContact(null);
    } catch (error) {
      console.error('Грешка при запазване на контакт:', error);
    }
  };

  const handleSetPrimaryContact = async (contactId: string) => {
    try {
      await contactsApi.setPrimaryContact(contactId);
      // Reload contacts to update primary status
      if (manufacturer?.id) {
        await loadContacts(manufacturer.id);
      }
    } catch (error) {
      console.error('Грешка при задаване на основен контакт:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {manufacturer ? 'Редактиране на производител' : 'Нов производител'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Основна информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Име *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Име на производител"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Показвано име *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="Показвано име"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Код</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Уникален код"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Отстъпка (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Контактна информация</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Адрес на производителя"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Уебсайт</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цвят</label>
                <input
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  className="w-full h-10 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Контактно лице</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Име на контактно лице"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Мейл</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+359 88 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Additional Contacts Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Допълнителни контакти</h3>
              <button
                type="button"
                onClick={handleAddContact}
                disabled={!manufacturer}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
                Добави контакт
              </button>
            </div>
            
            {!manufacturer && (
              <p className="text-sm text-gray-500 mb-3">
                Контактите могат да бъдат добавени след създаване на производителя.
              </p>
            )}

            {contacts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Име</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Длъжност</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Мейл</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contact.name}
                          {contact.isPrimary && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Основен
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{contact.position || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{contact.email || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{contact.phone || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {!contact.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryContact(contact.id)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Направи основен
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditContact(contact)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(contact.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : manufacturer && (
              <p className="text-sm text-gray-500">Няма добавени допълнителни контакти.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Описание на производителя..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="addAsSupplier"
                checked={addAsSupplier}
                onChange={(e) => setAddAsSupplier(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="addAsSupplier" className="ml-2 block text-sm text-gray-900">
                {manufacturer ? 'Синхронизирай и като доставчик' : 'Добави и като доставчик'}
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {manufacturer 
                ? 'Ще бъде обновен/създаден и запис в модула за доставчици със същите данни'
                : 'Ще бъде създаден и запис в модула за доставчици със същите данни'
              }
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {manufacturer ? 'Запази промените' : 'Създай производител'}
            </button>
          </div>
        </form>

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingContact ? 'Редактиране на контакт' : 'Нов контакт'}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Име *</label>
                  <input
                    type="text"
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Име на контакта"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Длъжност</label>
                    <input
                      type="text"
                      value={contactFormData.position}
                      onChange={(e) => setContactFormData({ ...contactFormData, position: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Длъжност"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Отдел</label>
                    <input
                      type="text"
                      value={contactFormData.department}
                      onChange={(e) => setContactFormData({ ...contactFormData, department: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Отдел"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Мейл</label>
                  <input
                    type="email"
                    value={contactFormData.email}
                    onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    type="tel"
                    value={contactFormData.phone}
                    onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+359 88 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Бележки</label>
                  <textarea
                    value={contactFormData.notes}
                    onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Допълнителни бележки..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={contactFormData.isPrimary}
                    onChange={(e) => setContactFormData({ ...contactFormData, isPrimary: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900">
                    Основен контакт
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Отказ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingContact ? 'Запази промените' : 'Добави контакт'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState<Manufacturer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  const loadManufacturers = async () => {
    try {
      showLoading();
      const data = await apiClient.get('/manufacturers');
      setManufacturers(data.data || []);
      setFilteredManufacturers(data.data || []);
    } catch (error) {
      console.error('Грешка при зареждане на производители:', error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadManufacturers();
  }, []);

  useEffect(() => {
    const filtered = manufacturers.filter(manufacturer => 
      manufacturer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (manufacturer.code && manufacturer.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (manufacturer.contactEmail && manufacturer.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredManufacturers(filtered);
  }, [searchTerm, manufacturers]);

  const handleSave = async (manufacturerData: Partial<Manufacturer> & { addAsSupplier?: boolean }) => {
    try {
      showLoading();
      const { addAsSupplier, ...manufacturerInfo } = manufacturerData;
      
      if (selectedManufacturer) {
        // Обновяване на съществуващ производител
        await apiClient.patch(`/manufacturers/${selectedManufacturer.id}`, manufacturerInfo);
        
        // Ако е отметнато "Синхронизирай като доставчик", създай/обнови доставчик
        if (addAsSupplier) {
          try {
            // Опитай да създадеш нов доставчик със същите данни
            await apiClient.post('/suppliers', manufacturerInfo);
          } catch (supplierError: any) {
            // Ако доставчикът вече съществува, опитай да го обновиш
            if (supplierError?.response?.status === 409 || supplierError?.message?.includes('already exists')) {
              try {
                // Намери доставчика по име или код и го обнови
                const suppliers = await apiClient.get('/suppliers');
                const existingSupplier = suppliers.data?.find((s: any) => 
                  s.name === manufacturerInfo.name || 
                  (manufacturerInfo.code && s.code === manufacturerInfo.code)
                );
                
                if (existingSupplier) {
                  await apiClient.patch(`/suppliers/${existingSupplier.id}`, manufacturerInfo);
                }
              } catch (updateError) {
                console.error('Грешка при обновяване на доставчик:', updateError);
              }
            } else {
              console.error('Грешка при създаване на доставчик:', supplierError);
            }
          }
        }
      } else {
        // Създаване на нов производител
        await apiClient.post('/manufacturers', manufacturerInfo);
        
        // Ако е отметнато "Добави като доставчик", създай и доставчик
        if (addAsSupplier) {
          try {
            await apiClient.post('/suppliers', manufacturerInfo);
          } catch (supplierError) {
            console.error('Грешка при създаване на доставчик:', supplierError);
            // Продължаваме въпреки грешката при създаване на доставчик
          }
        }
      }
      
      await loadManufacturers();
      setShowModal(false);
      setSelectedManufacturer(null);
    } catch (error) {
      console.error('Грешка при запазване на производител:', error);
    } finally {
      hideLoading();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този производител?')) return;
    
    try {
      showLoading();
      await apiClient.delete(`/manufacturers/${id}`);
      await loadManufacturers();
    } catch (error) {
      console.error('Грешка при изтриване на производител:', error);
    } finally {
      hideLoading();
    }
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setShowModal(true);
    setDropdownOpen(null);
  };

  const handleNewManufacturer = () => {
    setSelectedManufacturer(null);
    setShowModal(true);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/" className="mr-4">
                  <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Factory className="h-6 w-6 text-blue-600" />
                    Производители
                  </h1>
                  <p className="text-sm text-gray-600">Управление на производители и доставчици</p>
                </div>
              </div>
              <button
                onClick={handleNewManufacturer}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Нов производител
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Търси по име, код, мейл..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredManufacturers.length} от {manufacturers.length} производители
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManufacturers.map((manufacturer) => (
              <div key={manufacturer.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === manufacturer.id ? null : manufacturer.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {dropdownOpen === manufacturer.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      <button
                        onClick={() => handleEdit(manufacturer)}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        Редактиране
                      </button>
                      <button
                        onClick={() => handleDelete(manufacturer.id)}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Изтриване
                      </button>
                    </div>
                  )}
                </div>

                <div className="pr-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: manufacturer.colorCode || '#6c757d' }}
                    ></div>
                    <h3 className="font-semibold text-gray-900 truncate">{manufacturer.displayName}</h3>
                  </div>
                  
                  {manufacturer.code && (
                    <p className="text-sm text-gray-600 mb-2">Код: {manufacturer.code}</p>
                  )}
                  
                  {manufacturer.discount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-600 mb-2">
                      <Percent className="h-3 w-3" />
                      Отстъпка: {manufacturer.discount}%
                    </div>
                  )}
                  
                  {manufacturer.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{manufacturer.description}</p>
                  )}

                  <div className="space-y-1">
                    {manufacturer.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{manufacturer.address}</span>
                      </div>
                    )}
                    {manufacturer.contactEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{manufacturer.contactEmail}</span>
                      </div>
                    )}
                    {manufacturer.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{manufacturer.contactPhone}</span>
                      </div>
                    )}
                    {manufacturer.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <a 
                          href={manufacturer.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="truncate hover:text-blue-600"
                        >
                          {manufacturer.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>

                  {manufacturer._count && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Продукти: {manufacturer._count.products}</span>
                        <span>Атрибути: {manufacturer._count.attributeValues}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredManufacturers.length === 0 && (
            <div className="text-center py-12">
              <Factory className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма производители</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Не са намерени производители с този критерий.' : 'Започнете като добавите първия производител.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    onClick={handleNewManufacturer}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Нов производител
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <ManufacturerModal
          isOpen={showModal}
          manufacturer={selectedManufacturer}
          onClose={() => {
            setShowModal(false);
            setSelectedManufacturer(null);
          }}
          onSave={handleSave}
        />
      </div>
    </ErrorBoundary>
  );
} 