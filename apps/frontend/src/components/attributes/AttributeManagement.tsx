'use client';

import { useState, useEffect } from 'react';
import { attributesApi } from '../../services/attributesApi';
import { ProductType, Manufacturer, AttributeValue, AttributeType } from '../../types/attribute';
// import AttributeCard from './AttributeCard';
// import AddAttributeValueModal from './AddAttributeValueModal';
// import AddProductTypeModal from './AddProductTypeModal';
import AddAttributeModal, { AttributeValue as AddModalAttributeValue } from './AddAttributeModal';
// import CreateAttributeModal from './CreateAttributeModal';
// import EditAttributeModal from './EditAttributeModal';
// import EditAttributeValueModal from './EditAttributeValueModal';
// import DeleteConfirmationModal from './DeleteConfirmationModal';
// import BulkImportModal from './BulkImportModal';

interface AttributeManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AttributeManagement({ isOpen, onClose }: AttributeManagementProps) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<{
    id: string;
    name: string;
    productType: string;
    manufacturer: string;
  } | null>(null);

  // New modal states
  const [showAddProductType, setShowAddProductType] = useState(false);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [showCreateAttribute, setShowCreateAttribute] = useState(false);
  const [currentProductTypeId, setCurrentProductTypeId] = useState<string | null>(null);
  const [currentProductTypeName, setCurrentProductTypeName] = useState<string>('');

  // Edit and delete modal states
  const [showEditAttribute, setShowEditAttribute] = useState(false);
  const [showEditValue, setShowEditValue] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedAttributeForEdit, setSelectedAttributeForEdit] = useState<AttributeType | null>(null);
  const [selectedValueForEdit, setSelectedValueForEdit] = useState<AttributeValue | null>(null);
  const [deleteItem, setDeleteItem] = useState<{
    type: 'attribute' | 'value';
    id: string;
    name: string;
  } | null>(null);

  // Bulk import modal state
  const [showBulkImport, setShowBulkImport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productTypesData, manufacturersData] = await Promise.all([
        attributesApi.getProductTypes(),
        attributesApi.getManufacturers()
      ]);
      setProductTypes(productTypesData);
      setManufacturers(manufacturersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждане на данните');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (productTypeId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(productTypeId)) {
      newCollapsed.delete(productTypeId);
    } else {
      newCollapsed.add(productTypeId);
    }
    setCollapsedSections(newCollapsed);
  };

  const handleAddAttribute = (attributeId: string, attributeName: string, productType: string, manufacturer: string) => {
    setSelectedAttribute({
      id: attributeId,
      name: attributeName,
      productType,
      manufacturer
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAttribute = (value: AddModalAttributeValue) => {
    // API call is now done in AddAttributeModal
    // This function just handles UI updates after successful save
    setIsAddModalOpen(false);
    setSelectedAttribute(null);
    loadData(); // Refresh to show the new value
  };

  // New modal callback functions
  const handleProductTypeAdded = () => {
    setShowAddProductType(false);
    // Refresh data or add to state
    loadData();
  };

  const handleAttributeAdded = (value: any) => {
    console.log('Attribute added:', value);
    setShowAddAttribute(false);
    setCurrentProductTypeId(null);
    // Refresh data or add to state
    loadData();
  };

  const handleAddNewProductType = () => {
    setShowAddProductType(true);
  };

  const handleAddNewAttribute = (productTypeId: string) => {
    const productType = productTypes.find(pt => pt.id === productTypeId);
    if (productType) {
      setCurrentProductTypeId(productTypeId);
      setCurrentProductTypeName(productType.nameBg);
      setShowCreateAttribute(true);
    }
  };

  // Get real attributes for a product type
  const getProductTypeAttributes = (productTypeId: string) => {
    const productType = productTypes.find(pt => pt.id === productTypeId);
    return productType?.attributeTypes || [];
  };

  // Calculate total values for a product type
  const getTotalValues = (productTypeId: string) => {
    const productAttributes = getProductTypeAttributes(productTypeId);
    return productAttributes.reduce((total, attr) => {
      return total + (attr.attributeValues?.length || 0);
    }, 0);
  };

  const handleCreateAttribute = (attributeData: any) => {
    // API call is already done in CreateAttributeModal
    // This function just handles UI updates after successful creation
    setShowCreateAttribute(false);
    setCurrentProductTypeId(null);
    setCurrentProductTypeName('');
    loadData(); // Reload data to show new attribute
  };

  const handleEditAttribute = (attribute: AttributeType) => {
    setSelectedAttributeForEdit(attribute);
    setShowEditAttribute(true);
  };

  const handleEditValue = (value: AttributeValue, attributeId: string) => {
    setSelectedValueForEdit(value);
    setShowEditValue(true);
  };

  const handleDeleteAttribute = (attribute: AttributeType) => {
    setDeleteItem({
      type: 'attribute',
      id: attribute.id,
      name: attribute.nameBg || attribute.name
    });
    setShowDeleteConfirmation(true);
  };

  const handleDeleteValue = (value: AttributeValue, attributeId: string) => {
    setDeleteItem({
      type: 'value',
      id: value.id,
      name: value.nameBg || value.nameEn || ''
    });
    setShowDeleteConfirmation(true);
  };

  const handleSaveEditedAttribute = async (attribute: AttributeType) => {
    try {
      await attributesApi.updateAttribute(attribute.id, attribute);
      setShowEditAttribute(false);
      setSelectedAttributeForEdit(null);
      loadData(); // Reload data
    } catch (err) {
      console.error('Error updating attribute:', err);
      setError(err instanceof Error ? err.message : 'Грешка при обновяване на атрибут');
    }
  };

  const handleSaveEditedValue = async (value: AttributeValue) => {
    try {
      await attributesApi.updateAttributeValue(value.id, {
        nameBg: value.nameBg,
        nameEn: value.nameEn,
        manufacturerId: value.manufacturerId,
        colorCode: value.colorCode,
        description: value.description
      });
      setShowEditValue(false);
      setSelectedValueForEdit(null);
      loadData(); // Reload data
    } catch (err) {
      console.error('Error updating attribute value:', err);
      setError(err instanceof Error ? err.message : 'Грешка при обновяване на стойност');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      if (deleteItem.type === 'attribute') {
        await attributesApi.deleteAttribute(deleteItem.id);
      } else {
        await attributesApi.deleteAttributeValue(deleteItem.id);
      }
      
      setShowDeleteConfirmation(false);
      setDeleteItem(null);
      loadData(); // Reload data
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err instanceof Error ? err.message : 'Грешка при изтриване');
    }
  };

  const handleBulkImport = async (importData: any) => {
    try {
      console.log('🚀 Starting bulk import with:', importData);
      // For now, just show success message and refresh data
      alert(`✅ Успешен импорт! Импортирани ${importData.records || 0} записа от файл: ${importData.file}`);
      setShowBulkImport(false);
      loadData(); // Refresh to show imported data
    } catch (err) {
      console.error('Bulk import error:', err);
      setError(err instanceof Error ? err.message : 'Грешка при bulk импорт');
    }
  };

  const filteredProductTypes = productTypes.filter(type => {
    if (selectedProductType && type.id !== selectedProductType) return false;
    if (searchTerm && !type.nameBg.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal" style={{
        background: 'white',
        borderRadius: '8px',
        width: '95%',
        maxWidth: '1200px',
        maxHeight: '95vh',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div className="modal-header" style={{
          background: '#333',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div className="modal-title" style={{
            fontSize: '16px',
            fontWeight: '500'
          }}>
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
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
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
          <div className="filter-group" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#555',
              whiteSpace: 'nowrap'
            }}>
              Тип продукт:
            </label>
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value)}
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
              {productTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.nameBg}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '500',
              color: '#555',
              whiteSpace: 'nowrap'
            }}>
              Производител:
            </label>
            <select
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
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
              {manufacturers.map(manufacturer => (
                <option key={manufacturer.id} value={manufacturer.id}>
                  🏭 {manufacturer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group search-box" style={{
            flex: 1,
            minWidth: '200px'
          }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Търси атрибут или стойност..."
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
          </div>

          <div className="filter-actions" style={{
            display: 'flex',
            gap: '10px',
            marginLeft: 'auto'
          }}>
            <button className="btn btn-info" style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#17a2b8',
              color: 'white'
            }}>
              📁 Bulk импорт
            </button>
            <button className="btn btn-primary" style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#28a745',
              color: 'white'
            }}
            onClick={handleAddNewProductType}
            >
              + Нов тип продукт
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
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{
                width: '20px',
                height: '20px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
                marginRight: '8px'
              }}></div>
              Зареждане...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>
              {error}
            </div>
          ) : (
            <div>
              {filteredProductTypes.map(productType => {
                const productAttributes = getProductTypeAttributes(productType.id);
                const totalValues = getTotalValues(productType.id);
                
                return (
                  <div key={productType.id} className="product-type-section" style={{
                    background: 'white',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    marginBottom: '20px',
                    overflow: 'hidden'
                  }}>
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
                      <div className="product-type-title" style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {productType.icon} {productType.nameBg}
                        <span className="product-type-stats" style={{
                          fontSize: '12px',
                          color: '#ccc'
                        }}>
                          ({productAttributes.length} атрибута • {totalValues} стойности)
                        </span>
                      </div>
                      <span style={{ fontSize: '12px' }}>
                        {collapsedSections.has(productType.id) ? '▼' : '▲'}
                      </span>
                    </div>

                    <div className={`product-type-content ${collapsedSections.has(productType.id) ? 'collapsed' : ''}`} style={{
                      padding: '15px',
                      background: 'white',
                      display: collapsedSections.has(productType.id) ? 'none' : 'block'
                    }}>
                      <div className="attributes-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '15px'
                      }}>
                        {productAttributes.map((attribute: AttributeType) => (
                          <div key={attribute.id} className="attribute-card" style={{
                            background: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '6px',
                            overflow: 'hidden'
                          }}>
                            {/* Attribute Header */}
                            <div className="attribute-header" style={{
                              background: 'white',
                              padding: '12px 15px',
                              borderBottom: '1px solid #e9ecef',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <div className="attribute-name" style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <span style={{ fontSize: '14px' }}>{attribute.icon}</span>
                                {attribute.nameBg}
                                <span className="attribute-type" style={{
                                  background: '#e9ecef',
                                  color: '#6c757d',
                                  padding: '2px 6px',
                                  borderRadius: '2px',
                                  fontSize: '11px',
                                  fontWeight: 'normal'
                                }}>
                                  {attribute.type}
                                </span>
                              </div>
                              <div className="attribute-actions" style={{
                                display: 'flex',
                                gap: '5px'
                              }}>
                                <button 
                                  className="attribute-btn add" 
                                  onClick={() => handleAddAttribute(
                                    attribute.id,
                                    attribute.nameBg,
                                    productType.nameBg,
                                    selectedManufacturer
                                  )}
                                  title="Добави стойност"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px 6px',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#28a745',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e9ecef';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                  }}
                                >
                                  +
                                </button>
                                <button 
                                  className="attribute-btn edit" 
                                  onClick={() => handleEditAttribute(attribute)}
                                  title="Редактирай"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px 6px',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#007bff',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e9ecef';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                  }}
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="attribute-btn delete" 
                                  onClick={() => handleDeleteAttribute(attribute)}
                                  title="Изтрий"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px 6px',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#dc3545',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e9ecef';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                  }}
                                >
                                  🗑️
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
                                attribute.attributeValues.map((value: AttributeValue) => (
                                  <div key={value.id} className="value-item" style={{
                                    background: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '8px 10px',
                                    marginBottom: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '12px'
                                  }}>
                                    <div className="value-content" style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px'
                                    }}>
                                      <span style={{ fontSize: '14px' }}>{value.icon || '📋'}</span>
                                      <span style={{ fontWeight: '500', color: '#333' }}>{value.nameBg}</span>
                                      {value.nameEn && (
                                        <span style={{ color: '#6c757d', fontSize: '11px', fontStyle: 'italic' }}>
                                          / {value.nameEn}
                                        </span>
                                      )}
                                      {value.colorCode && (
                                        <div style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '50%',
                                          backgroundColor: value.colorCode,
                                          border: '1px solid #ddd',
                                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                        }}></div>
                                      )}
                                      {value.manufacturer && (
                                        <span style={{
                                          background: (value.manufacturer?.colorCode || '#e9ecef'),
                                          color: 'white',
                                          padding: '2px 6px',
                                          borderRadius: '2px',
                                          fontSize: '10px',
                                          fontWeight: '500'
                                        }}>
                                          {value.manufacturer?.displayName || value.manufacturer?.name || 'Unknown'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="value-actions" style={{
                                      display: 'flex',
                                      gap: '4px'
                                    }}>
                                      <button 
                                        className="value-btn edit" 
                                        onClick={() => handleEditValue(value, attribute.id)}
                                        title="Редактирай"
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          padding: '2px 4px',
                                          borderRadius: '2px',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          color: '#007bff'
                                        }}
                                      >
                                        ✏️
                                      </button>
                                      <button 
                                        className="value-btn delete" 
                                        onClick={() => handleDeleteValue(value, attribute.id)}
                                        title="Изтрий"
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          padding: '2px 4px',
                                          borderRadius: '2px',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          color: '#dc3545'
                                        }}
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div style={{
                                  textAlign: 'center',
                                  padding: '20px',
                                  color: '#6c757d',
                                  fontSize: '12px'
                                }}>
                                  Няма добавени стойности
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Add new attribute card */}
                        <div className="add-attribute-card" style={{
                          background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                          border: '2px dashed #3b82f6',
                          borderRadius: '6px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleAddNewAttribute(productType.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #bbdefb 0%, #e1bee7 100%)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        >
                          <div className="add-attribute-icon" style={{
                            fontSize: '24px',
                            color: '#3b82f6',
                            marginBottom: '8px'
                          }}>
                            +
                          </div>
                          <div className="add-attribute-text" style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#1565c0'
                          }}>
                            Добави нов атрибут за {productType.nameBg}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
          <div className="footer-info" style={{
            fontSize: '12px',
            color: '#6c757d'
          }}>
            Общо {productTypes.length} типа продукта • {productTypes.reduce((acc, type) => acc + getProductTypeAttributes(type.id).length, 0)} атрибута • {productTypes.reduce((acc, type) => acc + getTotalValues(type.id), 0)} стойности
          </div>
          <div>
            <button className="btn btn-secondary" style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#6c757d',
              color: 'white',
              marginRight: '10px'
            }}>
              Затвори
            </button>
            <button className="btn btn-primary" style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              background: '#28a745',
              color: 'white'
            }}>
              Запази промените
            </button>
          </div>
        </div>
      </div>

      {/* Add Attribute Value Modal */}
      {isAddModalOpen && selectedAttribute && (
        <AddAttributeModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedAttribute(null);
          }}
          onSave={handleSaveAttribute}
          attributeName={selectedAttribute.name}
          manufacturers={manufacturers.map(m => ({
            id: m.id,
            name: m.name,
            code: m.code || ''
          }))}
        />
      )}

      {/* Other modals temporarily disabled until components are created */}
      {/* 
      {showAddProductType && (
        <AddProductTypeModal
          isOpen={showAddProductType}
          onClose={() => setShowAddProductType(false)}
          onSuccess={handleProductTypeAdded}
        />
      )}

      {showEditAttribute && selectedAttributeForEdit && (
        <EditAttributeModal
          isOpen={showEditAttribute}
          onClose={() => setShowEditAttribute(false)}
          onSave={handleSaveEditedAttribute}
          attribute={selectedAttributeForEdit}
        />
      )}

      {showEditValue && selectedValueForEdit && (
        <EditAttributeValueModal
          isOpen={showEditValue}
          onClose={() => setShowEditValue(false)}
          onSave={handleSaveEditedValue}
          value={selectedValueForEdit}
          manufacturers={manufacturers.map(m => ({
            id: m.id,
            name: m.name,
            code: m.code || ''
          }))}
        />
      )}

      {showDeleteConfirmation && deleteItem && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleConfirmDelete}
          title={`Изтрий ${deleteItem.type === 'attribute' ? 'атрибут' : 'стойност'}`}
          message={`Сигурни ли сте, че искате да изтриете ${deleteItem.type === 'attribute' ? 'атрибута' : 'стойността'}?`}
          itemName={deleteItem.name}
        />
      )}

      {showCreateAttribute && currentProductTypeId && (
        <CreateAttributeModal
          isOpen={showCreateAttribute}
          onClose={() => {
            setShowCreateAttribute(false);
            setCurrentProductTypeId(null);
            setCurrentProductTypeName('');
          }}
          onSuccess={handleCreateAttribute}
          productTypeId={currentProductTypeId}
          productTypeName={currentProductTypeName}
          productTypes={productTypes.map(pt => ({
            id: pt.id,
            nameBg: pt.nameBg,
            nameEn: pt.nameEn || '',
            icon: pt.icon
          }))}
        />
      )}

      {showBulkImport && (
        <BulkImportModal
          isOpen={showBulkImport}
          onClose={() => setShowBulkImport(false)}
          onImport={handleBulkImport}
        />
      )} 
      */}
    </div>
  );
} 