'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, Plus, Search, ArrowLeft, Tag, ChevronDown, ChevronRight, 
  Upload, Download, Filter, Edit, Trash2, Eye, EyeOff, Palette,
  Package, Home, Sofa, Wrench, Building, TreePine, Boxes, Database,
  X, Save, FileText, Archive, Check
} from 'lucide-react';

interface ProductType {
  id: string;
  nameBg: string;
  nameEn: string;
  icon: string;
  description: string;
  isActive: boolean;
  attributes: AttributeType[];
  totalValues: number;
}

interface AttributeType {
  id: string;
  nameBg: string;
  nameEn: string;
  type: 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER';
  isRequired: boolean;
  isActive: boolean;
  attributeValues: AttributeValue[];
  productType: ProductType;
}

interface AttributeValue {
  id: string;
  nameBg: string;
  nameEn: string;
  description?: string;
  colorCode?: string;
  icon?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  manufacturerId?: string;
  manufacturer?: Manufacturer;
}

interface Manufacturer {
  id: string;
  name: string;
  displayName: string;
  code?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  colorCode?: string;
  isActive: boolean;
}

interface CreateAttributeValueDto {
  nameBg: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  attributeTypeId: string;
  manufacturerId?: string;
  sortOrder?: number;
  isDefault?: boolean;
}

interface UpdateAttributeValueDto {
  nameBg?: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  manufacturerId?: string;
  sortOrder?: number;
  isDefault?: boolean;
}

const productTypeIcons = {
  'pt_parquet': Home,
  'pt_doors': Package,
  'pt_furniture': Sofa,
  'pt_wall_coverings': Building,
  'pt_installation_services': Wrench,
  'pt_installation_materials': Database,
  'pt_decking_siding': TreePine,
  'pt_accessories': Boxes
};

export default function AttributesPage() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['pt_parquet']));
  const [selectedProductType, setSelectedProductType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  
  // Modal states
  const [showAddAttributeModal, setShowAddAttributeModal] = useState(false);
  const [showAddProductTypeModal, setShowAddProductTypeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditProductTypeModal, setShowEditProductTypeModal] = useState(false);
  const [showAddValueModal, setShowAddValueModal] = useState(false);
  const [showEditValueModal, setShowEditValueModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<AttributeType | null>(null);
  const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);
  const [selectedAttributeForValue, setSelectedAttributeForValue] = useState<AttributeType | null>(null);
  const [editingAttributeValue, setEditingAttributeValue] = useState<AttributeValue | null>(null);
  
  // Data states
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [productTypeManufacturers, setProductTypeManufacturers] = useState<{[key: string]: string[]}>({});
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  
  // Form states
  const [newAttribute, setNewAttribute] = useState({
    nameBg: '',
    nameEn: '',
    type: 'SELECT' as 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER',
    isRequired: false,
    productTypeId: ''
  });
  
  const [newProductType, setNewProductType] = useState({
    nameBg: '',
    nameEn: '',
    icon: 'Package',
    description: ''
  });
  
  const [newAttributeValue, setNewAttributeValue] = useState({
    nameBg: '',
    nameEn: '',
    description: '',
    icon: '',
    colorCode: '',
    manufacturerId: '',
    sortOrder: 1,
    isDefault: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Starting loadData...');
      setDebugInfo('🔄 Loading attributes...');
      const response = await fetch('/api/attributes', { cache: 'no-store' });
      
      if (!response.ok) {
        setDebugInfo(`❌ Attributes API error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw attributes data:', data);
      setDebugInfo(`📊 Received ${Array.isArray(data) ? data.length : 'unknown'} attributes from API`);
      
      let attributes: AttributeType[] = [];
      
      // Handle both array response and object response from backend
      if (Array.isArray(data)) {
        attributes = data;
        setDebugInfo(`✅ Processing ${data.length} attributes directly from array`);
      } else if (data.data && Array.isArray(data.data)) {
        attributes = data.data;
        setDebugInfo(`✅ Processing ${data.data.length} attributes from data.data`);
      } else if (data.success && data.data && Array.isArray(data.data)) {
        attributes = data.data;
        setDebugInfo(`✅ Processing ${data.data.length} attributes from success.data`);
      } else {
        console.warn('Unexpected API response format:', data);
        setDebugInfo(`⚠️ Unexpected API format: ${typeof data} - ${JSON.stringify(data).substring(0, 100)}...`);
        attributes = [];
      }
      
      console.log('Processed attributes:', attributes.length);
      setDebugInfo(`🔄 Grouping ${attributes.length} attributes by product type...`);
      
      // Group attributes by product type
      const grouped: Record<string, ProductType> = {};
      
      attributes.forEach(attr => {
        const productType = attr.productType;
        if (!productType) {
          console.warn('Attribute without productType:', attr);
          return;
        }
        
        if (!grouped[productType.id]) {
          grouped[productType.id] = {
            id: productType.id,
            nameBg: productType.nameBg,
            nameEn: productType.nameEn || '',
            icon: productType.icon || 'Package',
            description: productType.description || '',
            isActive: productType.isActive,
            attributes: [],
            totalValues: 0
          };
        }
        
        grouped[productType.id].attributes.push(attr);
        // Count only active values
        grouped[productType.id].totalValues += attr.attributeValues?.filter(v => v.isActive).length || 0;
      });
      
      setDebugInfo(`📊 Grouped into ${Object.keys(grouped).length} product types. Loading additional product types...`);
      
      // Also load product types that don't have attributes yet
      console.log('🔄 Loading product types...');
      const productTypesResponse = await fetch('/api/product-types', { cache: 'no-store' });
      if (productTypesResponse.ok) {
        const ptData = await productTypesResponse.json();
        console.log('Raw product types data:', ptData);
        let productTypes = [];
        
        if (Array.isArray(ptData)) {
          productTypes = ptData;
        } else if (ptData.data && Array.isArray(ptData.data)) {
          productTypes = ptData.data;
        } else if (ptData.success && ptData.data && Array.isArray(ptData.data)) {
          productTypes = ptData.data;
        }
        
        console.log('Processed product types:', productTypes.length);
        setDebugInfo(`📊 Adding ${productTypes.length} product types without attributes...`);
        
        // Add product types without attributes
        productTypes.forEach((pt: any) => {
          if (!grouped[pt.id]) {
            grouped[pt.id] = {
              id: pt.id,
              nameBg: pt.nameBg,
              nameEn: pt.nameEn || '',
              icon: pt.icon || 'Package',
              description: pt.description || '',
              isActive: pt.isActive,
              attributes: [],
              totalValues: 0
            };
          }
        });
      } else {
        setDebugInfo(`⚠️ Product types API error: ${productTypesResponse.status}`);
      }
      
      const productTypesArray = Object.values(grouped) as ProductType[];
      console.log('Final product types array:', productTypesArray.length);
      setDebugInfo(`🔄 Setting ${productTypesArray.length} product types in state...`);
      
      setProductTypes(productTypesArray);
      
      // Load manufacturers
      console.log('🔄 Loading manufacturers...');
      try {
        const manufacturersResponse = await fetch('/api/manufacturers', { cache: 'no-store' });
        if (manufacturersResponse.ok) {
          const mfData = await manufacturersResponse.json();
          let manufacturersData = [];
          
          if (Array.isArray(mfData)) {
            manufacturersData = mfData;
          } else if (mfData.data && Array.isArray(mfData.data)) {
            manufacturersData = mfData.data;
          } else if (mfData.success && mfData.data && Array.isArray(mfData.data)) {
            manufacturersData = mfData.data;
          }
          
          console.log('Loaded manufacturers:', manufacturersData.length);
          setManufacturers(manufacturersData);
          setDebugInfo(`✅ Loaded ${productTypesArray.length} product types, ${attributes.length} attributes, ${manufacturersData.length} manufacturers`);
      console.log('🔄 LoadData result: productTypes updated, total attributes:', attributes.length);
      
      // Log color attribute specifically
      const colorAttr = attributes.find(a => a.id === 'at_furniture_color');
      if (colorAttr) {
        console.log('🎨 Color attribute values count:', colorAttr.attributeValues?.length || 0);
        console.log('🎨 Color attribute values:', colorAttr.attributeValues?.map(v => v.nameBg) || []);
      }
      
      // Force re-render
      setRenderKey(prev => prev + 1);
        } else {
          setDebugInfo(`⚠️ Manufacturers API error: ${manufacturersResponse.status}`);
          setDebugInfo(`✅ Loaded ${productTypesArray.length} product types with ${attributes.length} attributes (no manufacturers)`);
        }
      } catch (mfError) {
        console.error('Error loading manufacturers:', mfError);
        setDebugInfo(`✅ Loaded ${productTypesArray.length} product types with ${attributes.length} attributes (manufacturers failed)`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setDebugInfo(`❌ Error loading data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const toggleAttributeVisibility = async (attributeId: string) => {
    try {
      setDebugInfo('🔄 Toggling attribute visibility...');
      
      // Find the current attribute to get its current state
      const currentAttribute = productTypes
        .flatMap(pt => pt.attributes)
        .find(attr => attr.id === attributeId);
      
      if (!currentAttribute) {
        setDebugInfo('❌ Attribute not found');
        return;
      }
      
      // Use PATCH endpoint to toggle isActive field
      const response = await fetch(`/api/attributes/${attributeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !currentAttribute.isActive
        })
      });
      
      if (response.ok) {
        setDebugInfo('✅ Visibility toggled successfully');
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to toggle visibility: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo('❌ Error toggling visibility');
      console.error('Toggle visibility error:', error);
    }
  };

  const deleteAttribute = async (attributeId: string) => {
    // Create PARKETSENSE styled confirmation dialog
    const result = await showConfirmationDialog(
      'Изтриване на атрибут',
      'Сигурни ли сте, че искате да изтриете този атрибут?\n\nТази операция не може да бъде отменена и ще премахне всички свързани данни.',
      'Изтрий',
      'Отказ'
    );
    
    if (!result) return;
    
    try {
      setDebugInfo('🔄 Deleting attribute...');
      const response = await fetch(`/api/attributes/${attributeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDebugInfo('✅ Attribute deleted successfully');
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to delete attribute: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo('❌ Error deleting attribute');
      console.error('Delete error:', error);
    }
  };

  const deleteProductType = async (productTypeId: string, productTypeName: string) => {
    // Create PARKETSENSE styled confirmation dialog
    const result = await showConfirmationDialog(
      'Изтриване на тип продукт',
      `Сигурни ли сте, че искате да изтриете продуктовия тип "${productTypeName}"?\n\nТази операция ще премахне всички свързани атрибути и не може да бъде отменена.`,
      'Изтрий',
      'Отказ'
    );
    
    if (!result) return;
    
    try {
      setDebugInfo('🔄 Deleting product type...');
      const response = await fetch(`/api/product-types/${productTypeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setDebugInfo('✅ Product type deleted successfully');
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to delete product type: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo('❌ Error deleting product type');
      console.error('Delete product type error:', error);
    }
  };

  const restoreProductType = async (productTypeId: string, productTypeName: string) => {
    try {
      setDebugInfo('🔄 Restoring product type...');
      const response = await fetch(`/api/product-types/${productTypeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true })
      });
      
      if (response.ok) {
        setDebugInfo(`✅ Product type "${productTypeName}" restored successfully`);
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to restore product type: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo('❌ Error restoring product type');
      console.error('Restore product type error:', error);
    }
  };

  // Confirmation dialog utility
  const showConfirmationDialog = (title: string, message: string, confirmText: string, cancelText: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Create a styled confirmation modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      
      modal.innerHTML = `
        <div style="
          background: white;
          padding: 32px;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          ">
            <div style="
              width: 32px;
              height: 32px;
              background: #FFE0B2;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
            ">⚠️</div>
            <h3 style="
              margin: 0;
              color: var(--text-primary);
              font-size: 18px;
              font-weight: 600;
            ">${title}</h3>
          </div>
          
          <p style="
            margin: 0 0 24px 0;
            color: var(--text-secondary);
            line-height: 1.5;
            white-space: pre-line;
          ">${message}</p>
          
          <div style="
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          ">
            <button id="confirm-cancel" style="
              padding: 12px 16px;
              border: 2px solid var(--border-light);
              background: transparent;
              color: var(--text-secondary);
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">${cancelText}</button>
            <button id="confirm-ok" style="
              padding: 12px 16px;
              border: 2px solid #D32F2F;
              background: #D32F2F;
              color: white;
              border-radius: 8px;
              cursor: pointer;
              font-size: 14px;
              font-weight: 500;
            ">${confirmText}</button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const handleClick = (result: boolean) => {
        document.body.removeChild(modal);
        resolve(result);
      };
      
      modal.querySelector('#confirm-ok')?.addEventListener('click', () => handleClick(true));
      modal.querySelector('#confirm-cancel')?.addEventListener('click', () => handleClick(false));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) handleClick(false);
      });
    });
  };

  const editAttribute = (attribute: AttributeType) => {
    setEditingAttribute({
      ...attribute,
      // Ensure we have the correct structure for editing  
      productType: attribute.productType
    } as AttributeType);
    setShowEditModal(true);
  };

  const openAddValueModal = (attribute: AttributeType) => {
    setSelectedAttributeForValue(attribute);
    setNewAttributeValue({
      nameBg: '',
      nameEn: '',
      description: '',
      icon: '',
      colorCode: '',
      manufacturerId: '',
      sortOrder: attribute.attributeValues.length + 1,
      isDefault: false
    });
    setShowAddValueModal(true);
  };

  const openEditValueModal = (value: AttributeValue, attribute: AttributeType) => {
    setSelectedAttributeForValue(attribute);
    setEditingAttributeValue(value);
    setShowEditValueModal(true);
  };

  const deleteAttributeValue = async (valueId: string, valueName: string) => {
    try {
      setDebugInfo('🗑️ Изтриване на атрибутна стойност...');
      
      const response = await fetch(`/api/attribute-values/${valueId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Грешка при изтриване');
      }
      
      setDebugInfo('✅ Атрибутната стойност е изтрита успешно!');
      console.log('🔄 Calling loadData after delete...');
      await loadData();
      console.log('🔄 LoadData completed after delete');
      // Force re-render by updating render key
      setRenderKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting attribute value:', error);
      setDebugInfo(`❌ Грешка при изтриване: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setDebugInfo(`📤 Uploading file: ${file.name}`);
        // TODO: Implement file upload logic
        setTimeout(() => {
          setDebugInfo('✅ File uploaded successfully (mock)');
        }, 2000);
      }
    };
    input.click();
  };

  const handleDownload = () => {
    setDebugInfo('📥 Generating export file...');
    // TODO: Implement download logic
    const data = JSON.stringify(productTypes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attributes-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setDebugInfo('✅ File downloaded successfully');
  };

  const saveNewAttribute = async () => {
    try {
      setDebugInfo('💾 Saving new attribute...');
      
      // Fix: Match backend expected structure
      const attributeData = {
        name: newAttribute.nameBg.toLowerCase().replace(/\s+/g, '_'), // Generate name from nameBg
        nameBg: newAttribute.nameBg,
        nameEn: newAttribute.nameEn || newAttribute.nameBg,
        type: newAttribute.type,
        productTypeIds: [newAttribute.productTypeId], // Backend expects array
        isRequired: newAttribute.isRequired,
        displayOrder: 0,
        icon: null,
        description: null
      };
      
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attributeData)
      });
      
      if (response.ok) {
        setDebugInfo('✅ Attribute created successfully');
        setShowAddAttributeModal(false);
        setNewAttribute({ nameBg: '', nameEn: '', type: 'SELECT', isRequired: false, productTypeId: '' });
        loadData();
      } else {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to create attribute: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo('❌ Error creating attribute');
      console.error('Create error:', error);
    }
  };

  const saveNewProductType = async () => {
    try {
      setDebugInfo('💾 Saving new product type...');
      
      // Fix: Match backend expected structure
      const productTypeData = {
        name: newProductType.nameBg.toLowerCase().replace(/\s+/g, '_'), // Generate name from nameBg
        nameBg: newProductType.nameBg,
        nameEn: newProductType.nameEn || newProductType.nameBg,
        icon: newProductType.icon,
        description: newProductType.description,
        displayOrder: 0
      };
      
      const response = await fetch('/api/product-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productTypeData)
      });
      
      if (response.ok) {
        setDebugInfo('✅ Product type created successfully');
        setShowAddProductTypeModal(false);
        setNewProductType({ nameBg: '', nameEn: '', icon: 'Package', description: '' });
        loadData();
      } else {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to create product type: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo('❌ Error creating product type');
      console.error('Create error:', error);
    }
  };

  const getIconComponent = (productTypeId: string) => {
    const IconComponent = productTypeIcons[productTypeId as keyof typeof productTypeIcons] || Package;
    return IconComponent;
  };

  const filteredProductTypes = productTypes.filter(pt => {
    if (selectedProductType !== 'all' && pt.id !== selectedProductType) return false;
    if (!showInactive && !pt.isActive) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return pt.nameBg.toLowerCase().includes(searchLower) ||
             pt.attributes.some(attr => attr.nameBg.toLowerCase().includes(searchLower));
    }
    return true;
  });

  const saveEditedAttribute = async () => {
    if (!editingAttribute) return;
    
    try {
      setDebugInfo('💾 Updating attribute...');
      
      const updateData = {
        nameBg: editingAttribute.nameBg,
        nameEn: editingAttribute.nameEn,
        type: editingAttribute.type,
        isRequired: editingAttribute.isRequired,
        isActive: editingAttribute.isActive
      };
      
      const response = await fetch(`/api/attributes/${editingAttribute.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        setDebugInfo('✅ Attribute updated successfully');
        setShowEditModal(false);
        setEditingAttribute(null);
        loadData();
      } else {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to update attribute: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo('❌ Error updating attribute');
      console.error('Update error:', error);
    }
  };

  const editProductType = async (productType: ProductType) => {
    setEditingProductType({
      ...productType
    });
    
    // Load manufacturers for this product type
    await loadProductTypeManufacturers(productType.id);
    
    setShowEditProductTypeModal(true);
  };

  const loadProductTypeManufacturers = async (productTypeId: string) => {
    try {
      const response = await fetch(`/api/product-types/${productTypeId}/manufacturers`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.manufacturers) {
          const manufacturerIds = data.data.manufacturers.map((m: any) => m.id);
          setSelectedManufacturers(manufacturerIds);
          setProductTypeManufacturers(prev => ({
            ...prev,
            [productTypeId]: manufacturerIds
          }));
        }
      }
    } catch (error) {
      console.error('Error loading product type manufacturers:', error);
      setDebugInfo('❌ Грешка при зареждане на производителите');
    }
  };

  const saveEditedProductType = async () => {
    if (!editingProductType) return;
    
    try {
      setDebugInfo('💾 Updating product type...');
      
      // First update basic product type information
      const updateData = {
        nameBg: editingProductType.nameBg,
        nameEn: editingProductType.nameEn,
        icon: editingProductType.icon,
        description: editingProductType.description,
        isActive: editingProductType.isActive
      };
      
      const response = await fetch(`/api/product-types/${editingProductType.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to update product type: ${errorData.message || 'Unknown error'}`);
        return;
      }

      // Then update manufacturers
      const manufacturersResponse = await fetch(`/api/product-types/${editingProductType.id}/manufacturers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manufacturerIds: selectedManufacturers })
      });

      if (!manufacturersResponse.ok) {
        const errorData = await manufacturersResponse.json();
        setDebugInfo(`❌ Failed to update manufacturers: ${errorData.message || 'Unknown error'}`);
        return;
      }

      setDebugInfo('✅ Product type and manufacturers updated successfully');
      setShowEditProductTypeModal(false);
      setEditingProductType(null);
      setSelectedManufacturers([]);
      loadData();
    } catch (error) {
      setDebugInfo('❌ Error updating product type');
      console.error('Update product type error:', error);
    }
  };

  const saveNewAttributeValue = async () => {
    if (!selectedAttributeForValue) return;
    
    try {
      setDebugInfo('💾 Saving new attribute value...');
      
      const valueData: CreateAttributeValueDto = {
        nameBg: newAttributeValue.nameBg,
        nameEn: newAttributeValue.nameEn || newAttributeValue.nameBg,
        description: newAttributeValue.description || undefined,
        icon: newAttributeValue.icon || undefined,
        colorCode: newAttributeValue.colorCode || undefined,
        attributeTypeId: selectedAttributeForValue.id,
        manufacturerId: newAttributeValue.manufacturerId || undefined,
        sortOrder: newAttributeValue.sortOrder,
        isDefault: newAttributeValue.isDefault
      };
      
      const response = await fetch('/api/attribute-values', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valueData)
      });
      
      if (response.ok) {
        setDebugInfo('✅ Attribute value created successfully');
        setShowAddValueModal(false);
        setSelectedAttributeForValue(null);
        setNewAttributeValue({
          nameBg: '',
          nameEn: '',
          description: '',
          icon: '',
          colorCode: '',
          manufacturerId: '',
          sortOrder: 1,
          isDefault: false
        });
        loadData(); // Reload data
      } else {
        const errorData = await response.json();
        setDebugInfo(`❌ Failed to create attribute value: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      setDebugInfo('❌ Error creating attribute value');
      console.error('Create attribute value error:', error);
    }
  };

  const saveEditedAttributeValue = async () => {
    if (!editingAttributeValue || !selectedAttributeForValue) return;
    
    try {
      setDebugInfo('💾 Запазване на промените...');
      
      const valueData: UpdateAttributeValueDto = {
        nameBg: editingAttributeValue.nameBg,
        nameEn: editingAttributeValue.nameEn || editingAttributeValue.nameBg,
        description: editingAttributeValue.description || undefined,
        icon: editingAttributeValue.icon || undefined,
        colorCode: editingAttributeValue.colorCode || undefined,
        manufacturerId: editingAttributeValue.manufacturerId || undefined,
        sortOrder: editingAttributeValue.sortOrder,
        isDefault: editingAttributeValue.isDefault
      };
      
      const response = await fetch(`/api/attribute-values/${editingAttributeValue.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valueData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Грешка при запазване');
      }

      setDebugInfo('✅ Атрибутната стойност е редактирана успешно!');
      setShowEditValueModal(false);
      setEditingAttributeValue(null);
      setSelectedAttributeForValue(null);
      await loadData();
    } catch (error) {
      console.error('Error editing attribute value:', error);
      setDebugInfo(`❌ Грешка при редактиране: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="parketsense-bg-light" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <Link href="/">
              <button className="parketsense-btn-icon parketsense-border" style={{ padding: '12px', borderRadius: '8px' }}>
                <ArrowLeft size={20} />
              </button>
            </Link>
            <div>
              <h1 className="parketsense-text-primary" style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                Управление на Атрибути
              </h1>
              <p className="parketsense-text-secondary" style={{ margin: '0', fontSize: '16px' }}>
                Система за управление на продуктови атрибути и стойности
              </p>
            </div>
          </div>

          {/* Debug Info */}
          <div className="parketsense-card" style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#E3F2FD' }}>
            <p style={{ margin: '0', fontSize: '12px', fontFamily: 'monospace', color: '#1976D2' }}>
              {debugInfo}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', marginBottom: '32px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
              <input
                type="text"
                placeholder="Търси атрибути или продуктови типове..."
                className="parketsense-form-input"
                style={{ paddingLeft: '48px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <select
                value={selectedProductType}
                onChange={(e) => setSelectedProductType(e.target.value)}
                className="parketsense-form-select"
                style={{ minWidth: '180px' }}
              >
                <option value="all">Всички типове</option>
                {productTypes.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.nameBg}</option>
                ))}
              </select>

              <button
                onClick={() => setShowInactive(!showInactive)}
                className={showInactive ? 'parketsense-btn-primary' : 'parketsense-btn-icon parketsense-border'}
                title={showInactive ? 'Скрий неактивни' : 'Покажи неактивни'}
                style={{ padding: '12px' }}
              >
                <EyeOff size={16} />
              </button>

              <button 
                onClick={handleUpload}
                className="parketsense-btn-icon parketsense-border"
                style={{ padding: '12px' }}
                title="Upload файл"
              >
                <Upload size={16} />
              </button>

              <button 
                onClick={handleDownload}
                className="parketsense-btn-icon parketsense-border"
                style={{ padding: '12px' }}
                title="Download експорт"
              >
                <Download size={16} />
              </button>

              <button 
                onClick={() => setShowAddProductTypeModal(true)}
                className="parketsense-btn-primary"
                style={{ padding: '12px 16px' }}
                title="Добави продуктов тип"
              >
                <Building size={16} />
                <span>Нов тип</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Types */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredProductTypes.map(productType => {
            const IconComponent = getIconComponent(productType.id);
            const isExpanded = expandedSections.has(productType.id);

            return (
              <div key={productType.id} className="parketsense-card">
                {/* Product Type Header */}
                <div 
                  onClick={() => toggleSection(productType.id)}
                  style={{ 
                    padding: '24px', 
                    cursor: 'pointer',
                    borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
                    opacity: productType.isActive ? 1 : 0.6,
                    backgroundColor: productType.isActive ? 'transparent' : '#F5F5F5'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = productType.isActive ? '#FAFAFA' : '#EEEEEE'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = productType.isActive ? 'transparent' : '#F5F5F5'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        backgroundColor: 'var(--primary-dark)', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 className="parketsense-text-primary" style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 4px 0' }}>
                          {productType.nameBg}
                          {!productType.isActive && (
                            <span style={{ 
                              marginLeft: '12px',
                              padding: '2px 8px',
                              backgroundColor: '#FFEBEE',
                              color: '#C62828',
                              fontSize: '12px',
                              fontWeight: '500',
                              borderRadius: '8px',
                              border: '1px solid #FFCDD2'
                            }}>
                              Изтрит
                            </span>
                          )}
                        </h3>
                        <p className="parketsense-text-secondary" style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                          {productType.description}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span className="parketsense-text-secondary" style={{ fontSize: '14px' }}>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{productType.attributes.length}</span> атрибута
                          </span>
                          <span className="parketsense-text-secondary" style={{ fontSize: '14px' }}>
                            <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{productType.totalValues}</span> стойности
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        borderRadius: '50%', 
                        backgroundColor: productType.isActive ? 'var(--success-green)' : 'var(--btn-danger)' 
                      }}></div>
                      
                      {/* Product Type Action Buttons */}
                      {productType.isActive ? (
                        <>
                          {/* Edit Product Type Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent section toggle
                              editProductType(productType);
                            }}
                            className="parketsense-btn-icon parketsense-border"
                            style={{ 
                              padding: '6px',
                              opacity: 0.8,
                              transition: 'opacity 0.2s ease'
                            }}
                            title={`Редактирай ${productType.nameBg}`}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                          >
                            <Edit size={12} />
                          </button>
                          
                          {/* Delete Product Type Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent section toggle
                              deleteProductType(productType.id, productType.nameBg);
                            }}
                            className="parketsense-btn-danger"
                            style={{ 
                              padding: '6px 8px',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              opacity: 0.8,
                              transition: 'opacity 0.2s ease'
                            }}
                            title={`Изтрий ${productType.nameBg}`}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                          >
                            <Trash2 size={12} />
                            <span>Изтрий</span>
                          </button>
                        </>
                      ) : (
                        /* Restore Product Type Button */
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent section toggle
                            restoreProductType(productType.id, productType.nameBg);
                          }}
                          className="parketsense-btn-primary"
                          style={{ 
                            padding: '6px 8px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: 0.8,
                            transition: 'opacity 0.2s ease'
                          }}
                          title={`Възстанови ${productType.nameBg}`}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                        >
                          <Archive size={12} />
                          <span>Възстанови</span>
                        </button>
                      )}
                      
                      {isExpanded ? <ChevronDown className="parketsense-text-secondary" size={20} /> : <ChevronRight className="parketsense-text-secondary" size={20} />}
                    </div>
                  </div>
                </div>

                {/* Attributes */}
                {isExpanded && (
                  <div style={{ padding: '0 24px 24px 24px' }}>
                    {/* Add Attribute Button for this Product Type */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: '20px',
                      padding: '16px',
                      backgroundColor: '#F8F9FA',
                      borderRadius: '8px',
                      border: '1px dashed var(--border-light)'
                    }}>
                      <div>
                        <p className="parketsense-text-primary" style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 4px 0' }}>
                          Добави нов атрибут за {productType.nameBg}
                        </p>
                        <p className="parketsense-text-secondary" style={{ fontSize: '14px', margin: '0' }}>
                          Създай специфичен атрибут за този тип продукт
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setNewAttribute(prev => ({ ...prev, productTypeId: productType.id }));
                          setShowAddAttributeModal(true);
                        }}
                        className="parketsense-btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Plus size={16} />
                        <span>Добави атрибут</span>
                      </button>
                    </div>

                    {/* Attributes Grid - Compact Layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '16px' }} key={`pt-${productType.id}-${renderKey}`}>
                      {productType.attributes.map(attribute => (
                        <div key={`${attribute.id}-${renderKey}`} className="parketsense-border" style={{ 
                          backgroundColor: 'white', 
                          borderRadius: '8px', 
                          padding: '16px',
                          boxShadow: '0 1px 3px var(--shadow-light)'
                        }}>
                          {/* Attribute Header - Compact */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                              <div style={{ 
                                width: '32px', 
                                height: '32px', 
                                borderRadius: '6px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                backgroundColor: 
                                  attribute.type === 'COLOR' ? '#E91E63' :
                                  attribute.type === 'SELECT' ? '#2196F3' :
                                  attribute.type === 'TEXT' ? '#4CAF50' :
                                  '#FF9800',
                                color: 'white'
                              }}>
                                {attribute.type === 'COLOR' ? <Palette size={16} /> : <Tag size={16} />}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4 className="parketsense-text-primary" style={{ 
                                  fontSize: '16px', 
                                  fontWeight: '600', 
                                  margin: '0 0 4px 0',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {attribute.nameBg}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span className="parketsense-text-secondary" style={{ fontSize: '12px' }}>
                                    {attribute.type}
                                  </span>
                                  {attribute.isRequired && (
                                    <span style={{ 
                                      padding: '2px 6px', 
                                      backgroundColor: '#FFEBEE', 
                                      color: '#C62828', 
                                      fontSize: '10px', 
                                      fontWeight: '500', 
                                      borderRadius: '8px' 
                                    }}>
                                      Задължителен
                                    </span>
                                  )}
                                  <span style={{ 
                                    padding: '2px 6px', 
                                    backgroundColor: '#E3F2FD', 
                                    color: '#1976D2', 
                                    fontSize: '10px', 
                                    fontWeight: '500', 
                                    borderRadius: '8px' 
                                  }}>
                                    {attribute.attributeValues.length} стойности
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                              <button
                                onClick={() => toggleAttributeVisibility(attribute.id)}
                                className="parketsense-btn-icon"
                                style={{ padding: '6px' }}
                                title={attribute.isActive ? 'Скрий атрибут' : 'Покажи атрибут'}
                              >
                                {attribute.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                              <button 
                                onClick={() => editAttribute(attribute)}
                                className="parketsense-btn-icon"
                                style={{ padding: '6px' }}
                                title="Редактирай атрибут"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => deleteAttribute(attribute.id)}
                                className="parketsense-btn-danger"
                                style={{ padding: '6px' }}
                                title="Изтрий атрибут"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Attribute Values - Compact Display */}
                          {attribute.attributeValues.length > 0 && (
                            <div>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                                gap: '6px',
                                maxHeight: '80px',
                                overflowY: 'auto',
                                marginBottom: '8px'
                              }}>
                                {/* Filter ONLY active values and show first 20 */}
                                {attribute.attributeValues
                                  .filter(value => value.isActive)
                                  .slice(0, 20)
                                  .map(value => (
                                  <button 
                                    key={`${value.id}-${renderKey}`} 
                                    onClick={() => openEditValueModal(value, attribute)}
                                    style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '6px', 
                                      padding: '4px 8px', 
                                      backgroundColor: '#F8F9FA', 
                                      borderRadius: '4px',
                                      minWidth: 0,
                                      border: '1px solid transparent',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#E3F2FD';
                                      e.currentTarget.style.borderColor = '#1976D2';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                                      e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                    title={`Редактирай стойност: ${value.nameBg}`}
                                  >
                                    {value.colorCode && (
                                      <div style={{ 
                                        width: '12px', 
                                        height: '12px', 
                                        borderRadius: '50%', 
                                        border: '1px solid white', 
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        backgroundColor: value.colorCode,
                                        flexShrink: 0
                                      }} />
                                    )}
                                    {value.icon && <span style={{ fontSize: '12px', flexShrink: 0 }}>{value.icon}</span>}
                                    <span className="parketsense-text-primary" style={{ 
                                      fontSize: '12px', 
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      minWidth: 0
                                    }}>
                                      {value.nameBg}
                                    </span>
                                    {value.manufacturer && (
                                      <span style={{ 
                                        fontSize: '10px', 
                                        color: value.manufacturer.colorCode || '#666666', 
                                        fontWeight: '500',
                                        flexShrink: 0,
                                        padding: '1px 4px',
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                        borderRadius: '4px'
                                      }}>
                                        {value.manufacturer.displayName}
                                      </span>
                                    )}
                                    {value.isDefault && (
                                      <span style={{ 
                                        fontSize: '10px', 
                                        color: '#1976D2', 
                                        fontWeight: '500',
                                        flexShrink: 0
                                      }}>
                                        ✓
                                      </span>
                                    )}
                                  </button>
                                ))}
                                {/* Show +X more indicator for active values only */}
                                {(() => {
                                  const activeValues = attribute.attributeValues.filter(value => value.isActive);
                                  return activeValues.length > 20 && (
                                    <div style={{ 
                                      padding: '4px 8px', 
                                      backgroundColor: '#EEEEEE', 
                                      borderRadius: '4px', 
                                      textAlign: 'center',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <span className="parketsense-text-secondary" style={{ fontSize: '11px' }}>
                                        +{activeValues.length - 20} още
                                      </span>
                                    </div>
                                  );
                                })()}
                                
                                {/* Show deleted values if showInactive is enabled */}
                                {showInactive && attribute.attributeValues
                                  .filter(value => !value.isActive)
                                  .slice(0, 10)
                                  .map(value => (
                                    <button 
                                      key={`deleted-${value.id}-${renderKey}`} 
                                      onClick={() => openEditValueModal(value, attribute)}
                                      style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px', 
                                        padding: '4px 8px', 
                                        backgroundColor: '#FFEBEE', 
                                        borderRadius: '4px',
                                        minWidth: 0,
                                        border: '1px solid #FFCDD2',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        opacity: 0.7
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FFCDD2';
                                        e.currentTarget.style.borderColor = '#F44336';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FFEBEE';
                                        e.currentTarget.style.borderColor = '#FFCDD2';
                                      }}
                                      title={`Изтрита стойност: ${value.nameBg} (кликни за възстановяване)`}
                                    >
                                      {value.colorCode && (
                                        <div style={{ 
                                          width: '12px', 
                                          height: '12px', 
                                          borderRadius: '50%', 
                                          border: '1px solid white', 
                                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                          backgroundColor: value.colorCode,
                                          flexShrink: 0,
                                          opacity: 0.5
                                        }} />
                                      )}
                                      {value.icon && <span style={{ fontSize: '12px', flexShrink: 0, opacity: 0.5 }}>{value.icon}</span>}
                                      <span style={{ 
                                        fontSize: '12px', 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        minWidth: 0,
                                        color: '#C62828',
                                        textDecoration: 'line-through'
                                      }}>
                                        {value.nameBg}
                                      </span>
                                      <span style={{ 
                                        fontSize: '10px', 
                                        color: '#C62828', 
                                        fontWeight: '500',
                                        flexShrink: 0,
                                        padding: '1px 4px',
                                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                        borderRadius: '4px'
                                      }}>
                                        Изтрит
                                      </span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Add Value Button */}
                          <div style={{ 
                            marginTop: '8px', 
                            display: 'flex', 
                            justifyContent: 'flex-end' 
                          }}>
                            <button
                              onClick={() => openAddValueModal(attribute)}
                              className="parketsense-btn-primary"
                              style={{ 
                                fontSize: '11px',
                                padding: '6px 12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={`Добави нова стойност за ${attribute.nameBg}`}
                            >
                              <Plus size={12} />
                              <span>Нова стойност</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                      )}

      {/* Add Attribute Value Modal */}
      {showAddValueModal && selectedAttributeForValue && (
        <div className="parketsense-modal-overlay">
          <div className="parketsense-modal-container" style={{ maxWidth: '600px' }}>
            <div className="parketsense-modal-header">
              <h2 className="parketsense-modal-title">
                Добави нова стойност за "{selectedAttributeForValue.nameBg}"
              </h2>
              <button 
                onClick={() => setShowAddValueModal(false)}
                className="parketsense-modal-close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="parketsense-modal-body">
              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (БГ) *</label>
                  <input
                    type="text"
                    value={newAttributeValue.nameBg}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, nameBg: e.target.value})}
                    className="parketsense-form-input"
                    placeholder="8мм, Червен, etc."
                  />
                </div>
                
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (EN)</label>
                  <input
                    type="text"
                    value={newAttributeValue.nameEn}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, nameEn: e.target.value})}
                    className="parketsense-form-input"
                    placeholder="8mm, Red, etc."
                  />
                </div>
              </div>

              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Производител</label>
                  <select
                    value={newAttributeValue.manufacturerId}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, manufacturerId: e.target.value})}
                    className="parketsense-form-select"
                  >
                    <option value="">Без производител</option>
                    {manufacturers.map(manufacturer => (
                      <option key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Ред за сортиране</label>
                  <input
                    type="number"
                    min="1"
                    value={newAttributeValue.sortOrder}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, sortOrder: parseInt(e.target.value) || 1})}
                    className="parketsense-form-input"
                  />
                </div>
              </div>

              {selectedAttributeForValue.type === 'COLOR' && (
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Цвят</label>
                  <input
                    type="color"
                    value={newAttributeValue.colorCode || '#000000'}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, colorCode: e.target.value})}
                    className="parketsense-form-input"
                    style={{ height: '48px' }}
                  />
                </div>
              )}

              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Икона (emoji)</label>
                <input
                  type="text"
                  value={newAttributeValue.icon}
                  onChange={(e) => setNewAttributeValue({...newAttributeValue, icon: e.target.value})}
                  className="parketsense-form-input"
                  placeholder="🌳, 📏, etc."
                  maxLength={2}
                />
              </div>

              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Описание</label>
                <textarea
                  value={newAttributeValue.description}
                  onChange={(e) => setNewAttributeValue({...newAttributeValue, description: e.target.value})}
                  className="parketsense-form-textarea"
                  placeholder="Допълнително описание..."
                  rows={3}
                />
              </div>
              
              <div className="parketsense-checkbox-group">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAttributeValue.isDefault}
                  onChange={(e) => setNewAttributeValue({...newAttributeValue, isDefault: e.target.checked})}
                  className="parketsense-checkbox-input"
                />
                <label htmlFor="isDefault" className="parketsense-checkbox-label">
                  Стойност по подразбиране
                </label>
              </div>
            </div>
            
            <div className="parketsense-modal-footer">
              <button
                onClick={() => setShowAddValueModal(false)}
                className="parketsense-btn-secondary"
              >
                Отказ
              </button>
              <button
                onClick={saveNewAttributeValue}
                className="parketsense-btn-primary"
                disabled={!newAttributeValue.nameBg}
              >
                Запази
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attribute Value Modal */}
      {showEditValueModal && editingAttributeValue && selectedAttributeForValue && (
        <div className="parketsense-modal-overlay">
          <div className="parketsense-modal-container" style={{ maxWidth: '700px' }}>
            <div className="parketsense-modal-header">
              <h2 className="parketsense-modal-title">
                Редактирай стойност "{editingAttributeValue.nameBg}"
              </h2>
              <button 
                onClick={() => setShowEditValueModal(false)}
                className="parketsense-modal-close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="parketsense-modal-body">
              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (БГ) *</label>
                  <input
                    type="text"
                    value={editingAttributeValue.nameBg}
                    onChange={(e) => setEditingAttributeValue({...editingAttributeValue, nameBg: e.target.value})}
                    className="parketsense-form-input"
                    placeholder="8мм, Червен, etc."
                  />
                </div>
                
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (EN)</label>
                  <input
                    type="text"
                    value={editingAttributeValue.nameEn}
                    onChange={(e) => setEditingAttributeValue({...editingAttributeValue, nameEn: e.target.value})}
                    className="parketsense-form-input"
                    placeholder="8mm, Red, etc."
                  />
                </div>
              </div>

              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Производител</label>
                  <select
                    value={editingAttributeValue.manufacturerId || ''}
                    onChange={(e) => setEditingAttributeValue({...editingAttributeValue, manufacturerId: e.target.value})}
                    className="parketsense-form-select"
                  >
                    <option value="">Без производител</option>
                    {manufacturers.map(manufacturer => (
                      <option key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Ред за сортиране</label>
                  <input
                    type="number"
                    min="1"
                    value={editingAttributeValue.sortOrder}
                    onChange={(e) => setEditingAttributeValue({...editingAttributeValue, sortOrder: parseInt(e.target.value) || 1})}
                    className="parketsense-form-input"
                  />
                </div>
              </div>

              {selectedAttributeForValue.type === 'COLOR' && (
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Цвят</label>
                  <input
                    type="color"
                    value={editingAttributeValue.colorCode || '#000000'}
                    onChange={(e) => setEditingAttributeValue({...editingAttributeValue, colorCode: e.target.value})}
                    className="parketsense-form-input"
                    style={{ height: '48px' }}
                  />
                </div>
              )}

              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Икона (emoji)</label>
                <input
                  type="text"
                  value={editingAttributeValue.icon || ''}
                  onChange={(e) => setEditingAttributeValue({...editingAttributeValue, icon: e.target.value})}
                  className="parketsense-form-input"
                  placeholder="🌳, 📏, etc."
                  maxLength={2}
                />
              </div>

              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Описание</label>
                <textarea
                  value={editingAttributeValue.description || ''}
                  onChange={(e) => setEditingAttributeValue({...editingAttributeValue, description: e.target.value})}
                  className="parketsense-form-textarea"
                  placeholder="Допълнително описание..."
                  rows={3}
                />
              </div>
              
              <div className="parketsense-checkbox-group">
                <input
                  type="checkbox"
                  id="editIsDefault"
                  checked={editingAttributeValue.isDefault}
                  onChange={(e) => setEditingAttributeValue({...editingAttributeValue, isDefault: e.target.checked})}
                  className="parketsense-checkbox-input"
                />
                <label htmlFor="editIsDefault" className="parketsense-checkbox-label">
                  Стойност по подразбиране
                </label>
              </div>
            </div>
            
            <div className="parketsense-modal-footer">
              {/* Delete or Restore button based on isActive status */}
              {editingAttributeValue.isActive ? (
                <button
                  onClick={async () => {
                    const confirmed = await showConfirmationDialog(
                      'Изтриване на стойност',
                      `Сигурни ли сте, че искате да изтриете стойността "${editingAttributeValue.nameBg}"?`,
                      'Изтрий',
                      'Отказ'
                    );

                    if (confirmed) {
                      await deleteAttributeValue(editingAttributeValue.id, editingAttributeValue.nameBg);
                      setShowEditValueModal(false);
                      setEditingAttributeValue(null);
                      setSelectedAttributeForValue(null);
                      
                      // Force re-render by updating a dummy state
                      setDebugInfo(`✅ Изтрита стойност: ${editingAttributeValue.nameBg} - ${new Date().getTime()}`);
                    }
                  }}
                  className="parketsense-btn-danger"
                  style={{ marginRight: 'auto' }}
                >
                  <Trash2 size={16} />
                  <span>Изтрий</span>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      setDebugInfo('🔄 Възстановяване на стойност...');
                      
                      const response = await fetch(`/api/attribute-values/${editingAttributeValue.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isActive: true })
                      });
                      
                      if (response.ok) {
                        setDebugInfo(`✅ Стойност "${editingAttributeValue.nameBg}" е възстановена!`);
                        setShowEditValueModal(false);
                        setEditingAttributeValue(null);
                        setSelectedAttributeForValue(null);
                        await loadData();
                        setRenderKey(prev => prev + 1);
                      } else {
                        const errorData = await response.json();
                        setDebugInfo(`❌ Грешка при възстановяване: ${errorData.message || 'Unknown error'}`);
                      }
                    } catch (error) {
                      setDebugInfo('❌ Грешка при възстановяване');
                      console.error('Restore error:', error);
                    }
                  }}
                  className="parketsense-btn-primary"
                  style={{ marginRight: 'auto', backgroundColor: '#4CAF50' }}
                >
                  <Archive size={16} />
                  <span>Възстанови</span>
                </button>
              )}
              <button
                onClick={() => setShowEditValueModal(false)}
                className="parketsense-btn-secondary"
              >
                Отказ
              </button>
              <button
                onClick={saveEditedAttributeValue}
                className="parketsense-btn-primary"
                disabled={!editingAttributeValue.nameBg}
              >
                Запази промените
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
})}
        </div>

        {/* Add New Section */}
        <div className="parketsense-card" style={{ 
          marginTop: '32px', 
          padding: '24px',
          background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.1) 0%, rgba(129, 199, 132, 0.1) 100%)',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 className="parketsense-text-primary" style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0' }}>
                Добави нов атрибут
              </h3>
              <p className="parketsense-text-secondary" style={{ margin: '0', fontSize: '14px' }}>
                Създай нов атрибут за продуктовите типове
              </p>
            </div>
            <button 
              onClick={() => setShowAddAttributeModal(true)}
              className="parketsense-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={20} />
              <span>Добави</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Attribute Modal */}
      {showAddAttributeModal && (
        <div className="parketsense-modal-overlay">
          <div className="parketsense-modal-container">
            <div className="parketsense-modal-header">
              <h2 className="parketsense-modal-title">Добави нов атрибут</h2>
              <button 
                onClick={() => setShowAddAttributeModal(false)}
                className="parketsense-modal-close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="parketsense-modal-body">
              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (БГ) *</label>
                  <input
                    type="text"
                    value={newAttribute.nameBg}
                    onChange={(e) => setNewAttribute({...newAttribute, nameBg: e.target.value})}
                    className="parketsense-form-input"
                    placeholder="Дебелина, Цвят, etc."
                  />
                </div>
                
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (EN) *</label>
                  <input
                    type="text"
                    value={newAttribute.nameEn}
                    onChange={(e) => setNewAttribute({...newAttribute, nameEn: e.target.value})}
                    className="parketsense-form-input"
                    placeholder="thickness, color, etc."
                  />
                </div>
              </div>
              
              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Тип *</label>
                  <select
                    value={newAttribute.type}
                    onChange={(e) => setNewAttribute({...newAttribute, type: e.target.value as any})}
                    className="parketsense-form-select"
                  >
                    <option value="SELECT">Избор от списък</option>
                    <option value="COLOR">Цвят</option>
                    <option value="TEXT">Текст</option>
                    <option value="NUMBER">Число</option>
                  </select>
                </div>
                
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Продуктов тип *</label>
                  <select
                    value={newAttribute.productTypeId}
                    onChange={(e) => setNewAttribute({...newAttribute, productTypeId: e.target.value})}
                    className="parketsense-form-select"
                  >
                    <option value="">Избери тип продукт</option>
                    {productTypes.map(pt => (
                      <option key={pt.id} value={pt.id}>{pt.nameBg}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="parketsense-checkbox-group">
                <input
                  type="checkbox"
                  id="required"
                  checked={newAttribute.isRequired}
                  onChange={(e) => setNewAttribute({...newAttribute, isRequired: e.target.checked})}
                  className="parketsense-checkbox-input"
                />
                <label htmlFor="required" className="parketsense-checkbox-label">Задължителен атрибут</label>
              </div>
            </div>
            
            <div className="parketsense-modal-footer">
              <button
                onClick={() => setShowAddAttributeModal(false)}
                className="parketsense-btn-secondary"
              >
                Отказ
              </button>
              <button
                onClick={saveNewAttribute}
                className="parketsense-btn-primary"
                disabled={!newAttribute.nameBg || !newAttribute.productTypeId}
              >
                Запази
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Type Modal */}
      {showAddProductTypeModal && (
        <div className="parketsense-modal-overlay">
          <div className="parketsense-modal-container">
            <div className="parketsense-modal-header">
              <h2 className="parketsense-modal-title">Добави продуктов тип</h2>
              <button 
                onClick={() => setShowAddProductTypeModal(false)}
                className="parketsense-modal-close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="parketsense-modal-body">
              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (БГ) *</label>
                  <input
                    type="text"
                    value={newProductType.nameBg}
                    onChange={(e) => setNewProductType({...newProductType, nameBg: e.target.value})}
                    className="parketsense-form-input"
                    placeholder="Паркет, Врати, etc."
                  />
                </div>
                
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (EN) *</label>
                  <input
                    type="text"
                    value={newProductType.nameEn}
                    onChange={(e) => setNewProductType({...newProductType, nameEn: e.target.value})}
                    className="parketsense-form-input"
                    placeholder="Parquet, Doors, etc."
                  />
                </div>
              </div>
              
              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Описание</label>
                <textarea
                  value={newProductType.description}
                  onChange={(e) => setNewProductType({...newProductType, description: e.target.value})}
                  className="parketsense-form-textarea"
                  placeholder="Описание на продуктовия тип..."
                  rows={3}
                />
              </div>
              
              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Икона</label>
                <select
                  value={newProductType.icon}
                  onChange={(e) => setNewProductType({...newProductType, icon: e.target.value})}
                  className="parketsense-form-select"
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Package">📦 Package</option>
                  <option value="Sofa">🛋️ Sofa</option>
                  <option value="Building">🏢 Building</option>
                  <option value="Wrench">🔧 Wrench</option>
                  <option value="Database">💾 Database</option>
                  <option value="TreePine">🌲 TreePine</option>
                  <option value="Boxes">📦 Boxes</option>
                </select>
              </div>
            </div>
            
            <div className="parketsense-modal-footer">
              <button
                onClick={() => setShowAddProductTypeModal(false)}
                className="parketsense-btn-secondary"
              >
                Отказ
              </button>
              <button
                onClick={saveNewProductType}
                className="parketsense-btn-primary"
                disabled={!newProductType.nameBg || !newProductType.nameEn}
              >
                Запази
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Attribute Modal */}
      {showEditModal && editingAttribute && (
        <div className="parketsense-modal-overlay">
          <div className="parketsense-modal-container">
            <div className="parketsense-modal-header">
              <h2 className="parketsense-modal-title">Редактирай атрибут</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="parketsense-modal-close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="parketsense-modal-body">
              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (БГ)</label>
                  <input
                    type="text"
                    value={editingAttribute.nameBg}
                    onChange={(e) => setEditingAttribute({...editingAttribute, nameBg: e.target.value})}
                    className="parketsense-form-input"
                  />
                </div>
                
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (EN)</label>
                  <input
                    type="text"
                    value={editingAttribute.nameEn}
                    onChange={(e) => setEditingAttribute({...editingAttribute, nameEn: e.target.value})}
                    className="parketsense-form-input"
                  />
                </div>
              </div>
              
              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Тип</label>
                <select
                  value={editingAttribute.type}
                  onChange={(e) => setEditingAttribute({...editingAttribute, type: e.target.value as any})}
                  className="parketsense-form-select"
                >
                  <option value="SELECT">Избор от списък</option>
                  <option value="COLOR">Цвят</option>
                  <option value="TEXT">Текст</option>
                  <option value="NUMBER">Число</option>
                </select>
              </div>
              
              <div className="parketsense-checkbox-group">
                <input
                  type="checkbox"
                  id="editRequired"
                  checked={editingAttribute.isRequired}
                  onChange={(e) => setEditingAttribute({...editingAttribute, isRequired: e.target.checked})}
                  className="parketsense-checkbox-input"
                />
                <label htmlFor="editRequired" className="parketsense-checkbox-label">Задължителен атрибут</label>
              </div>
            </div>
            
            <div className="parketsense-modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="parketsense-btn-secondary"
              >
                Отказ
              </button>
              <button
                onClick={saveEditedAttribute}
                className="parketsense-btn-primary"
                disabled={!editingAttribute?.nameBg || !editingAttribute?.nameEn}
              >
                Запази
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Type Modal */}
      {showEditProductTypeModal && editingProductType && (
        <div className="parketsense-modal-overlay">
          <div className="parketsense-modal-container">
            <div className="parketsense-modal-header">
              <h2 className="parketsense-modal-title">Редактирай продуктов тип</h2>
              <button 
                onClick={() => setShowEditProductTypeModal(false)}
                className="parketsense-modal-close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="parketsense-modal-body">
              <div className="parketsense-form-row">
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (БГ)</label>
                  <input
                    type="text"
                    value={editingProductType.nameBg}
                    onChange={(e) => setEditingProductType({...editingProductType, nameBg: e.target.value})}
                    className="parketsense-form-input"
                  />
                </div>
                
                <div className="parketsense-form-group">
                  <label className="parketsense-form-label">Име (EN)</label>
                  <input
                    type="text"
                    value={editingProductType.nameEn}
                    onChange={(e) => setEditingProductType({...editingProductType, nameEn: e.target.value})}
                    className="parketsense-form-input"
                  />
                </div>
              </div>
              
              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Описание</label>
                <textarea
                  value={editingProductType.description}
                  onChange={(e) => setEditingProductType({...editingProductType, description: e.target.value})}
                  className="parketsense-form-textarea"
                  placeholder="Описание на продуктовия тип..."
                  rows={3}
                />
              </div>
              
              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Икона</label>
                <select
                  value={editingProductType.icon}
                  onChange={(e) => setEditingProductType({...editingProductType, icon: e.target.value})}
                  className="parketsense-form-select"
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Package">📦 Package</option>
                  <option value="Sofa">🛋️ Sofa</option>
                  <option value="Building">🏢 Building</option>
                  <option value="Wrench">🔧 Wrench</option>
                  <option value="Database">💾 Database</option>
                  <option value="TreePine">🌲 TreePine</option>
                  <option value="Boxes">📦 Boxes</option>
                </select>
              </div>
              
              <div className="parketsense-form-group">
                <label className="parketsense-form-label">Свързани производители</label>
                <div style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  backgroundColor: '#f9fafb'
                }}>
                  {manufacturers.length === 0 ? (
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                      Няма налични производители
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      {manufacturers.map(manufacturer => (
                        <div key={manufacturer.id} className="parketsense-checkbox-group" style={{ margin: 0 }}>
                          <input
                            type="checkbox"
                            id={`manufacturer-${manufacturer.id}`}
                            checked={selectedManufacturers.includes(manufacturer.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedManufacturers(prev => [...prev, manufacturer.id]);
                              } else {
                                setSelectedManufacturers(prev => prev.filter(id => id !== manufacturer.id));
                              }
                            }}
                            className="parketsense-checkbox-input"
                          />
                          <label 
                            htmlFor={`manufacturer-${manufacturer.id}`} 
                            className="parketsense-checkbox-label"
                            style={{ fontSize: '14px' }}
                          >
                            {manufacturer.displayName}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#0277bd' }}>
                      💡 Избраните производители ще се показват при създаване на продукти от този тип
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="parketsense-modal-footer">
              <button
                onClick={() => setShowEditProductTypeModal(false)}
                className="parketsense-btn-secondary"
              >
                Отказ
              </button>
              <button
                onClick={saveEditedProductType}
                className="parketsense-btn-primary"
                disabled={!editingProductType?.nameBg || !editingProductType?.nameEn}
              >
                Запази
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 