'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Plus, Search, ArrowLeft, Edit, Trash2, MoreVertical, Phone, Mail, MapPin, Globe, Percent, Users, X } from 'lucide-react';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useLoading } from '../../components/LoadingProvider';
import { apiClient } from '../../lib/api';
import { contactsApi, CreateContactRequest } from '../../services/contactsApi';

interface Supplier {
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

interface SupplierModalProps {
  isOpen: boolean;
  supplier?: Supplier | null;
  onClose: () => void;
  onSave: (supplier: Partial<Supplier>) => void;
}

function SupplierModal({ isOpen, supplier, onClose, onSave }: SupplierModalProps) {
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
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        displayName: supplier.displayName || '',
        code: supplier.code || '',
        website: supplier.website || '',
        description: supplier.description || '',
        address: supplier.address || '',
        contactName: supplier.contactName || '',
        contactEmail: supplier.contactEmail || '',
        contactPhone: supplier.contactPhone || '',
        colorCode: supplier.colorCode || '#6c757d',
        discount: supplier.discount || 0,
      });

      // Load existing contacts for this supplier
      loadContacts(supplier.id);
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
  }, [supplier, isOpen]);

  const loadContacts = async (supplierId: string) => {
    try {
      const supplierContacts = await contactsApi.getSupplierContacts(supplierId);
      setContacts(supplierContacts);
    } catch (error) {
      console.error('Грешка при зареждане на контакти:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
        // Create new contact (only if we have a supplier ID)
        if (supplier?.id) {
          const newContactData: CreateContactRequest = {
            ...contactFormData,
            supplierId: supplier.id,
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
      if (supplier?.id) {
        await loadContacts(supplier.id);
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
            {supplier ? 'Редактиране на доставчик' : 'Нов доставчик'}
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  placeholder="Име на доставчик"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Показвано име *</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Адрес на доставчика"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Уебсайт</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Цвят</label>
                <input
                  type="color"
                  value={formData.colorCode}
                  onChange={(e) => setFormData({ ...formData, colorCode: e.target.value })}
                  className="w-full h-10 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Контактно лице</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Име на контактно лице"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Мейл</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                disabled={!supplier}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3" />
                Добави контакт
              </button>
            </div>
            
            {!supplier && (
              <p className="text-sm text-gray-500 mb-3">
                Контактите могат да бъдат добавени след създаване на доставчика.
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
                              className="text-green-600 hover:text-green-800 text-xs"
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
                              className="text-green-600 hover:text-green-800"
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
            ) : supplier && (
              <p className="text-sm text-gray-500">Няма добавени допълнителни контакти.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Описание на доставчика..."
            />
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
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {supplier ? 'Запази промените' : 'Създай доставчик'}
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Длъжност"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Отдел</label>
                    <input
                      type="text"
                      value={contactFormData.department}
                      onChange={(e) => setContactFormData({ ...contactFormData, department: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    type="tel"
                    value={contactFormData.phone}
                    onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+359 88 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Бележки</label>
                  <textarea
                    value={contactFormData.notes}
                    onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Допълнителни бележки..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={contactFormData.isPrimary}
                    onChange={(e) => setContactFormData({ ...contactFormData, isPrimary: e.target.checked })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading();

  const loadSuppliers = async () => {
    try {
      showLoading();
      const data = await apiClient.get('/suppliers');
      setSuppliers(data.data || []);
      setFilteredSuppliers(data.data || []);
    } catch (error) {
      console.error('Грешка при зареждане на доставчици:', error);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    const filtered = suppliers.filter(supplier => 
      supplier.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.code && supplier.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.contactEmail && supplier.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  const handleSave = async (supplierData: Partial<Supplier>) => {
    try {
      showLoading();
      
      if (selectedSupplier) {
        await apiClient.patch(`/suppliers/${selectedSupplier.id}`, supplierData);
      } else {
        await apiClient.post('/suppliers', supplierData);
      }
      
      await loadSuppliers();
      setShowModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Грешка при запазване на доставчик:', error);
    } finally {
      hideLoading();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този доставчик?')) return;
    
    try {
      showLoading();
      await apiClient.delete(`/suppliers/${id}`);
      await loadSuppliers();
    } catch (error) {
      console.error('Грешка при изтриване на доставчик:', error);
    } finally {
      hideLoading();
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
    setDropdownOpen(null);
  };

  const handleNewSupplier = () => {
    setSelectedSupplier(null);
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
                    <Truck className="h-6 w-6 text-green-600" />
                    Доставчици
                  </h1>
                  <p className="text-sm text-gray-600">Управление на доставчици и техните условия</p>
                </div>
              </div>
              <button
                onClick={handleNewSupplier}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Нов доставчик
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
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredSuppliers.length} от {suppliers.length} доставчици
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === supplier.id ? null : supplier.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {dropdownOpen === supplier.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        Редактиране
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
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
                      style={{ backgroundColor: supplier.colorCode || '#6c757d' }}
                    ></div>
                    <h3 className="font-semibold text-gray-900 truncate">{supplier.displayName}</h3>
                  </div>
                  
                  {supplier.code && (
                    <p className="text-sm text-gray-600 mb-2">Код: {supplier.code}</p>
                  )}
                  
                  {supplier.discount > 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-600 mb-2">
                      <Percent className="h-3 w-3" />
                      Отстъпка: {supplier.discount}%
                    </div>
                  )}
                  
                  {supplier.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{supplier.description}</p>
                  )}

                  <div className="space-y-1">
                    {supplier.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    )}
                    {supplier.contactEmail && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{supplier.contactEmail}</span>
                      </div>
                    )}
                    {supplier.contactPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{supplier.contactPhone}</span>
                      </div>
                    )}
                    {supplier.website && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <a 
                          href={supplier.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="truncate hover:text-green-600"
                        >
                          {supplier.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Няма доставчици</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Не са намерени доставчици с този критерий.' : 'Започнете като добавите първия доставчик.'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <button
                    onClick={handleNewSupplier}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Нов доставчик
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <SupplierModal
        isOpen={showModal}
        supplier={selectedSupplier}
        onClose={() => {
          setShowModal(false);
          setSelectedSupplier(null);
        }}
        onSave={handleSave}
      />
    </ErrorBoundary>
  );
} 