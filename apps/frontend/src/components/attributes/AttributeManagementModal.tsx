'use client';

import { useState, useEffect } from 'react';
import { attributesApi } from '../../services/attributesApi';
import { AttributeType, AttributeValue } from '../../types/attribute';

interface AttributeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductTypeData {
  id: string;
  nameBg: string;
  nameEn: string;
  icon: string;
  attributes: AttributeType[];
  totalValues: number;
}

export default function AttributeManagementModal({ isOpen, onClose }: AttributeManagementModalProps) {
  const [productTypes, setProductTypes] = useState<ProductTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pt_parquet']));
  const [filters, setFilters] = useState({
    productType: '',
    manufacturer: '',
    search: ''
  });
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeType | null>(null);
  const [editingValue, setEditingValue] = useState<AttributeValue | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAttributesData();
    }
  }, [isOpen]);

  const loadAttributesData = async () => {
    try {
      setLoading(true);
      const attributes = await attributesApi.getAttributes();
      
      // Group attributes by product type
      const groupedData = new Map<string, ProductTypeData>();
      
      attributes.forEach(attr => {
        const productType = attr.productType;
        if (productType && !groupedData.has(productType.id)) {
          groupedData.set(productType.id, {
            id: productType.id,
            nameBg: productType.nameBg,
            nameEn: productType.nameEn || '',
            icon: productType.icon || '📦',
            attributes: [],
            totalValues: 0
          });
        }
        
        if (productType) {
          const ptData = groupedData.get(productType.id)!;
          ptData.attributes.push(attr);
          ptData.totalValues += attr.attributeValues?.length || 0;
        }
      });
      
      setProductTypes(Array.from(groupedData.values()));
    } catch (error) {
      console.error('Failed to load attributes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (productTypeId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(productTypeId)) {
      newExpanded.delete(productTypeId);
    } else {
      newExpanded.add(productTypeId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAddAttributeValue = (attribute: AttributeType) => {
    // TODO: Open add value modal
    console.log('Adding value for attribute:', attribute.nameBg);
  };

  const handleEditAttribute = (attribute: AttributeType) => {
    setEditingAttribute(attribute);
  };

  const handleEditValue = (value: AttributeValue) => {
    setEditingValue(value);
  };

  const handleDeleteValue = async (valueId: string) => {
    if (confirm('Сигурни ли сте, че искате да изтриете тази стойност?')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting value:', valueId);
        await loadAttributesData(); // Refresh data
      } catch (error) {
        console.error('Failed to delete value:', error);
      }
    }
  };

  const getFilteredProductTypes = () => {
    return productTypes.filter(pt => {
      if (filters.productType && pt.id !== filters.productType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesType = pt.nameBg.toLowerCase().includes(searchLower) || 
                           pt.nameEn.toLowerCase().includes(searchLower);
        const matchesAttributes = pt.attributes.some(attr => 
          attr.nameBg.toLowerCase().includes(searchLower) ||
          (attr.nameEn || '').toLowerCase().includes(searchLower) ||
          attr.attributeValues?.some(val => 
            val.nameBg.toLowerCase().includes(searchLower) ||
            (val.nameEn || '').toLowerCase().includes(searchLower)
          )
        );
        if (!matchesType && !matchesAttributes) return false;
      }
      return true;
    });
  };

  const getAttributeTypeIcon = (type: string) => {
    switch (type) {
      case 'SELECT': return '📋';
      case 'TEXT': return '📝';
      case 'NUMBER': return '🔢';
      case 'COLOR': return '🎨';
      case 'DATE': return '📅';
      case 'BOOLEAN': return '☑️';
      default: return '📋';
    }
  };

  const getValueIcon = (value: AttributeValue) => {
    if (value.icon) return value.icon;
    if (value.colorCode) return '🎨';
    return '📌';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: '95%', maxWidth: '1200px', maxHeight: '95vh' }}>
        {/* Header */}
        <div className="modal-header" style={{ background: '#333', color: 'white', padding: '15px 20px' }}>
          <div className="modal-title" style={{ fontSize: '16px', fontWeight: '500' }}>
            Управление на продуктови атрибути
          </div>
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              fontSize: '18px', 
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '3px',
              width: '28px',
              height: '28px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section" style={{
          background: '#f8f9fa',
          padding: '15px 20px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Тип продукт:</label>
            <select 
              value={filters.productType}
              onChange={(e) => setFilters(prev => ({ ...prev, productType: e.target.value }))}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                background: 'white',
                minWidth: '150px'
              }}
            >
              <option value="">Всички типове</option>
              {productTypes.map(pt => (
                <option key={pt.id} value={pt.id}>
                  {pt.icon} {pt.nameBg}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Производител:</label>
            <select 
              value={filters.manufacturer}
              onChange={(e) => setFilters(prev => ({ ...prev, manufacturer: e.target.value }))}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                background: 'white',
                minWidth: '150px'
              }}
            >
              <option value="">Всички производители</option>
              <option value="all">🌍 Универсални стойности</option>
              <option value="foglie_doro">🏭 Foglie d'Oro</option>
              <option value="salis">🏭 Salis</option>
              <option value="weitzer">🏭 Weitzer</option>
              <option value="bluinterni">🏭 Bluinterni</option>
            </select>
          </div>

          <div className="search-box" style={{ flex: 1, minWidth: '200px' }}>
            <input 
              type="text"
              placeholder="Търси атрибут или стойност..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
          </div>

          <div className="filter-actions" style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button 
              className="btn btn-info"
              onClick={() => setShowBulkImport(true)}
              style={{
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              📁 Bulk импорт
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content" style={{ 
          padding: '20px', 
          maxHeight: 'calc(95vh - 180px)', 
          overflowY: 'auto' 
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
              <div>Зареждане на атрибути...</div>
            </div>
          ) : (
            getFilteredProductTypes().map(productType => (
              <div 
                key={productType.id}
                className="product-type-section"
                style={{
                  background: 'white',
                  border: '1px solid #e9ecef',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  overflow: 'hidden'
                }}
              >
                {/* Section Header */}
                <div 
                  className="product-type-header"
                  onClick={() => toggleSection(productType.id)}
                  style={{
                    background: '#333',
                    color: 'white',
                    padding: '12px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {productType.icon} {productType.nameBg}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>
                    {productType.attributes.length} атрибута • {productType.totalValues} стойности
                  </div>
                </div>

                {/* Section Content */}
                {expandedSections.has(productType.id) && (
                  <div className="product-type-content" style={{ padding: '15px', background: 'white' }}>
                    <div className="attributes-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                      gap: '15px'
                    }}>
                      {productType.attributes.map(attribute => (
                        <div 
                          key={attribute.id}
                          className="attribute-card"
                          style={{
                            background: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Attribute Header */}
                          <div className="attribute-header" style={{
                            background: 'white',
                            padding: '12px 15px',
                            borderBottom: '1px solid #e9ecef',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                                {attribute.icon} {attribute.nameBg}
                              </span>
                              <span style={{
                                fontSize: '11px',
                                color: '#6c757d',
                                background: '#e9ecef',
                                padding: '2px 6px',
                                borderRadius: '2px'
                              }}>
                                {getAttributeTypeIcon(attribute.type)} {attribute.type.toLowerCase()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button 
                                onClick={() => handleAddAttributeValue(attribute)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: '4px 6px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  color: '#28a745'
                                }}
                                title="Добави стойност"
                              >
                                +
                              </button>
                              <button 
                                onClick={() => handleEditAttribute(attribute)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: '4px 6px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  color: '#007bff'
                                }}
                                title="Редактирай"
                              >
                                ✏️
                              </button>
                            </div>
                          </div>

                          {/* Attribute Values */}
                          <div className="attribute-values" style={{
                            padding: '10px',
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {attribute.attributeValues && attribute.attributeValues.length > 0 ? (
                              attribute.attributeValues
                                .filter(value => {
                                  if (!filters.manufacturer) return true;
                                  if (filters.manufacturer === 'all') return !value.manufacturer;
                                  return value.manufacturer?.name === filters.manufacturer;
                                })
                                .map(value => (
                                <div 
                                  key={value.id}
                                  className="value-item"
                                  style={{
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '8px 10px',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '12px'
                                  }}
                                >
                                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px' }}>{getValueIcon(value)}</span>
                                    <span style={{ color: '#333' }}>
                                      {value.nameBg} / {value.nameEn}
                                    </span>
                                    {value.colorCode && (
                                      <div 
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          backgroundColor: value.colorCode,
                                          borderRadius: '2px',
                                          border: '1px solid #ddd'
                                        }}
                                      />
                                    )}
                                  </div>
                                  {value.manufacturer && (
                                    <span style={{
                                      background: '#e9ecef',
                                      color: '#495057',
                                      padding: '2px 6px',
                                      borderRadius: '2px',
                                      fontSize: '10px',
                                      marginRight: '8px'
                                    }}>
                                      {value.manufacturer.displayName}
                                    </span>
                                  )}
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                      onClick={() => handleEditValue(value)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '2px 4px',
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        color: '#6c757d'
                                      }}
                                      title="Редактирай"
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteValue(value.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '2px 4px',
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        color: '#dc3545'
                                      }}
                                      title="Изтрий"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="empty-state" style={{
                                textAlign: 'center',
                                padding: '20px',
                                color: '#6c757d',
                                fontSize: '12px'
                              }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.5 }}>📋</div>
                                <div>Няма добавени стойности</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add New Attribute Card */}
                      <div 
                        className="add-attribute-card"
                        style={{
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                          border: '2px dashed #3b82f6',
                          borderRadius: '6px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => console.log('Add new attribute for', productType.nameBg)}
                      >
                        <div style={{ fontSize: '24px', color: '#3b82f6', marginBottom: '8px' }}>➕</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1565c0' }}>
                          Добави нов атрибут за {productType.nameBg.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{
          background: '#f8f9fa',
          padding: '15px 20px',
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '12px', color: '#6c757d' }}>
            Общо: {productTypes.reduce((sum, pt) => sum + pt.attributes.length, 0)} атрибута • {productTypes.reduce((sum, pt) => sum + pt.totalValues, 0)} стойности
          </div>
          <div>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Затвори
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => console.log('Save changes')}
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              ПОТВЪРДИ
            </button>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          animation: modalSlideIn 0.3s ease-out;
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .attribute-btn:hover,
        .value-btn:hover {
          background: #e9ecef !important;
        }
        
        .add-attribute-card:hover {
          background: linear-gradient(135deg, #bbdefb 0%, #e1bee7 100%) !important;
          transform: translateY(-1px);
        }
        
        .btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        @media (max-width: 768px) {
          .modal {
            width: 98% !important;
            max-height: 98vh !important;
          }
          
          .attributes-grid {
            grid-template-columns: 1fr !important;
          }
          
          .filters-section {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 10px !important;
          }
          
          .filter-actions {
            margin-left: 0 !important;
            width: 100%;
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </div>
  );
} 