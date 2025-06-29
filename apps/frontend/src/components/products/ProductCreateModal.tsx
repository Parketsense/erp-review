'use client';

import React, { useState, useEffect, useRef } from 'react';
import MediaUploader from './MediaUploader';

// SearchableDropdown Component
interface SearchableDropdownProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Избери...",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get display text for selected value
  const selectedOption = options.find(opt => opt.id === value);
  const displayText = selectedOption ? selectedOption.label : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setSearchTerm('');
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].id);
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleOptionClick = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  // Add state for dropdown positioning
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Update positioning when dropdown opens
  const updateDropdownPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm('');
    setHighlightedIndex(-1);
    updateDropdownPosition();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={displayText || placeholder}
          className={`w-full px-3 py-2 pr-8 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          disabled={disabled}
        />
        
        {/* Arrow Icon */}
        <svg 
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div style={{
               backgroundColor: 'white',
               border: '2px solid #3b82f6',
               borderRadius: '6px',
               minHeight: '50px',
               maxHeight: '200px',
               overflowY: 'auto',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 25px 50px -12px rgba(59, 130, 246, 0.15)',
               position: 'fixed',
               zIndex: 50000,
               top: `${dropdownPosition.top}px`,
               left: `${dropdownPosition.left}px`,
               width: `${dropdownPosition.width}px`,
               minWidth: '200px'
             }}>
          
          {/* Clear option */}
          <div
            className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 border-b border-gray-100
              ${value === '' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
            onClick={() => handleOptionClick('')}
          >
            {placeholder}
          </div>

          {/* Filtered options */}
          {(() => {
            if (filteredOptions.length > 0) {
              return filteredOptions.map((option, index) => (
                <div
                  key={option.id}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 
                    ${value === option.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                    ${index === highlightedIndex ? 'bg-blue-100' : ''}`}
                  onClick={() => handleOptionClick(option.id)}
                >
                  {option.label}
                </div>
              ));
            } else {
              return (
                <div className="px-3 py-2 text-xs text-gray-500 italic">
                  Няма намерени резултати за "{searchTerm}"
                </div>
              );
            }
          })()}

          {/* Custom option at the bottom */}
          <div className="border-t border-gray-200">
            <div
              className="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100 text-green-600 font-medium"
              onClick={() => handleOptionClick('custom')}
            >
              ✏️ Друго (въведи)...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
}

const ProductCreateModal: React.FC<ProductCreateModalProps> = ({ isOpen, onClose, onSave }) => {
  // State management
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [attributeValues, setAttributeValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<any>(null);
  const [isReloadingValues, setIsReloadingValues] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [formData, setFormData] = useState({
    productTypeId: '',
    manufacturerId: '',
    supplier: '',
    supplierLinked: false,
    nameBg: '',
    nameEn: '',
    code: '',
    unit: 'm2',
    packageSize: '',
    costEur: '',
    costBgn: '',
    saleBgn: '',
    saleEur: '',
    autoPricing: true,
    manualProductName: false,
    attributes: {} as Record<string, string>,
    isActive: true,
    isRecommended: false,
    isNew: false,
    // Media files
    images: [] as any[],
    documents: [] as any[],
    models3d: [] as any[],
    textures: [] as any[],
    videoUrl: ''
  });

  // State for add value modal
  const [showAddValueModal, setShowAddValueModal] = useState(false);
  const [selectedAttributeForValue, setSelectedAttributeForValue] = useState<any>(null);
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

  // Load initial data and reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset form data when modal opens
      setFormData({
        productTypeId: '',
        manufacturerId: '',
        supplier: '',
        supplierLinked: false,
        nameBg: '',
        nameEn: '',
        code: '',
        unit: 'm2',
        packageSize: '',
        costEur: '',
        costBgn: '',
        saleBgn: '',
        saleEur: '',
        autoPricing: true,
        manualProductName: false,
        attributes: {} as Record<string, string>,
        isActive: true,
        isRecommended: false,
        isNew: false,
        // Media files
        images: [] as any[],
        documents: [] as any[],
        models3d: [] as any[],
        textures: [] as any[],
        videoUrl: ''
      });
      
      // Clear other states
      setAttributes([]);
      setAttributeValues([]);
      setRefreshKey(0);
      
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productTypesData, manufacturersData, suppliersData] = await Promise.all([
        fetch('/api/product-types').then(r => r.json()),
        fetch('/api/manufacturers').then(r => r.json()),
        fetch('/api/suppliers').then(r => r.json())
      ]);
      
      console.log('📦 Loaded initial data:', {
        productTypes: productTypesData?.data?.length || 0,
        manufacturers: manufacturersData?.data?.length || 0,
        suppliers: suppliersData?.data?.length || 0
      });
      
      setProductTypes(productTypesData?.data || []);
      setManufacturers(manufacturersData?.data || []);
      setSuppliers(suppliersData?.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotification('Грешка при зареждане на данните', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAttributesForType = async (productTypeId: string) => {
    if (!productTypeId) {
      setAttributes([]);
      return;
    }

    try {
      console.log('🏷️ Loading attributes for product type:', productTypeId);
      
      const response = await fetch(`/api/product-types/${productTypeId}/attributes`);
      const data = await response.json();
      
      console.log('📦 Raw API response:', data);
      console.log('📦 Response status:', response.status);
      console.log('📦 Response OK:', response.ok);
      
      if (data.success && data.data.attributes) {
        console.log('✅ Attributes loaded:', data.data.attributes.length);
        setAttributes(data.data.attributes);
        
        // Clear previous attribute values
        setFormData(prev => ({
          ...prev,
          attributes: {}
        }));
        
        showNotification(`Заредени ${data.data.attributes.length} атрибута`, 'success');
      } else {
        console.log('⚠️ No attributes found or API error');
        setAttributes([]);
      }
    } catch (error) {
      console.error('❌ Error loading attributes:', error);
      showNotification('Грешка при зареждане на атрибутите', 'error');
      setAttributes([]);
    }
  };

  const loadAttributeValuesByProductTypeAndManufacturer = async (productTypeId: string, manufacturerId: string) => {
    if (!productTypeId || !manufacturerId) {
      console.log('🏭 Missing productTypeId or manufacturerId, clearing attribute values');
      setAttributeValues([]);
      return;
    }

    try {
      console.log('🏭 Loading attribute values for product type and manufacturer:', { productTypeId, manufacturerId });
      console.log('🏭 Current attributeValues before load:', attributeValues.length);
      
      const response = await fetch(`/api/attribute-values/by-product-type-manufacturer?productTypeId=${productTypeId}&manufacturerId=${manufacturerId}`);
      const data = await response.json();
      
      console.log('📦 Attribute values response:', data);
      console.log('📦 Response success:', data.success);
      console.log('📦 Response data:', data.data ? `Array with ${data.data.length} items` : 'No data');
      console.log('📦 Attributes count:', data.attributesCount);
      
      if (data.success && data.data) {
        console.log('✅ Setting attribute values...', data.data.length);
        
        setAttributeValues(data.data);
        
        // Check state update after a short delay
        setTimeout(() => {
          console.log('🔄 State check after setAttributeValues - current length should be', data.data.length);
        }, 50);
        
        showNotification(`Заредени ${data.data.length} стойности за ${data.attributesCount} атрибута`, 'success');
      } else {
        console.log('⚠️ No attribute values found');
        setAttributeValues([]);
      }
    } catch (error) {
      console.error('❌ Error loading attribute values:', error);
      setAttributeValues([]);
    }
  };

  const updateProductNames = () => {
    // Не обновяваме имената ако е включено ръчното генериране
    if (formData.manualProductName) {
      return;
    }
    
    const selectedProductType = productTypes.find(pt => pt.id === formData.productTypeId);
    const selectedManufacturer = manufacturers.find(m => m.id === formData.manufacturerId);
    
    if (!selectedProductType || !selectedManufacturer) {
      setFormData(prev => ({ ...prev, nameBg: '', nameEn: '', code: '' }));
      return;
    }

    // Generate name based on attributes
    const attributeParts = [];
    for (const [attrId, value] of Object.entries(formData.attributes)) {
      if (value) {
        const attr = attributes.find(a => a.id === attrId);
        if (attr) {
          // Get the actual value name from attributeValues if it's a selected value
          const attrValue = attributeValues.find(av => av.id === value);
          if (attrValue) {
            attributeParts.push(attrValue.nameBg);
          } else {
            attributeParts.push(value); // Custom text value
          }
        }
      }
    }

    const nameBg = `${selectedManufacturer.displayName} ${selectedProductType.nameBg} ${attributeParts.join(' ')}`.trim();
    const nameEn = `${selectedManufacturer.displayName} ${selectedProductType.nameEn || selectedProductType.nameBg} ${attributeParts.join(' ')}`.trim();
    
    // Generate code if not already set
    const currentCode = formData.code;
    let newCode = currentCode;
    
    if (!currentCode) {
      // Generate code from manufacturer code + product type + attributes
      const manufacturerCode = selectedManufacturer.code || selectedManufacturer.displayName.substring(0, 3).toUpperCase();
      const typeCode = selectedProductType.code || selectedProductType.nameBg.substring(0, 3).toUpperCase();
      const attrCode = attributeParts.length > 0 ? attributeParts.join('').substring(0, 5).toUpperCase() : '';
      const timestamp = Date.now().toString().slice(-4); // Last 4 digits for uniqueness
      
      newCode = `${manufacturerCode}-${typeCode}${attrCode ? '-' + attrCode : ''}-${timestamp}`;
    }

    setFormData(prev => ({
      ...prev,
      nameBg,
      nameEn,
      code: newCode
    }));
  };

  const calculatePricesFromBgn = (type: 'cost' | 'sale', bgnValue: string) => {
    if (!formData.autoPricing || !bgnValue || !formData.supplier) return;

    const bgnPrice = parseFloat(bgnValue) || 0;
    const exchangeRate = 1.956; // EUR to BGN
    const selectedSupplier = suppliers.find(s => s.id === formData.supplier);
    const supplierDiscount = selectedSupplier?.discount || 0;

    if (bgnPrice > 0) {
      if (type === 'cost') {
        // Изчисляваме от доставна цена в лева
        const costEur = bgnPrice / exchangeRate;
        const saleBgn = bgnPrice / (1 - supplierDiscount / 100);
        const saleEur = saleBgn / exchangeRate;

        setFormData(prev => ({
          ...prev,
          costEur: costEur.toFixed(2),
          saleBgn: saleBgn.toFixed(2),
          saleEur: saleEur.toFixed(2)
        }));
      } else {
        // Изчисляваме от продажна цена в лева
        const costBgn = bgnPrice * (1 - supplierDiscount / 100);
        const costEur = costBgn / exchangeRate;
        const saleEur = bgnPrice / exchangeRate;

        setFormData(prev => ({
          ...prev,
          costBgn: costBgn.toFixed(2),
          costEur: costEur.toFixed(2),
          saleEur: saleEur.toFixed(2)
        }));
      }
    }
  };

  const calculatePricesFromEur = (type: 'cost' | 'sale', eurValue: string) => {
    if (!formData.autoPricing || !eurValue || !formData.supplier) return;

    const eurPrice = parseFloat(eurValue) || 0;
    const exchangeRate = 1.956; // EUR to BGN
    const selectedSupplier = suppliers.find(s => s.id === formData.supplier);
    const supplierDiscount = selectedSupplier?.discount || 0;

    if (eurPrice > 0) {
      if (type === 'cost') {
        // Изчисляваме от доставна цена в евро
        const costBgn = eurPrice * exchangeRate;
        const saleBgn = costBgn / (1 - supplierDiscount / 100);
        const saleEur = saleBgn / exchangeRate;

        setFormData(prev => ({
          ...prev,
          costBgn: costBgn.toFixed(2),
          saleBgn: saleBgn.toFixed(2),
          saleEur: saleEur.toFixed(2)
        }));
      } else {
        // Изчисляваме от продажна цена в евро
        const saleBgn = eurPrice * exchangeRate;
        const costBgn = saleBgn * (1 - supplierDiscount / 100);
        const costEur = costBgn / exchangeRate;

        setFormData(prev => ({
          ...prev,
          costBgn: costBgn.toFixed(2),
          costEur: costEur.toFixed(2),
          saleBgn: saleBgn.toFixed(2)
        }));
      }
    }
  };

  const calculatePrices = (costEurValue?: string, supplierValue?: string) => {
    // Use provided values or current form data
    const costEurToUse = costEurValue || formData.costEur;
    const supplierToUse = supplierValue || formData.supplier;
    
    if (!formData.autoPricing || !costEurToUse || !supplierToUse) return;

    const costEur = parseFloat(costEurToUse) || 0;
    const exchangeRate = 1.956; // EUR to BGN
    
    console.log('💰 Price calculation:', {
      costEur,
      exchangeRate,
      supplier: supplierToUse
    });
    
    // Намираме избрания доставчик за да вземем неговата отстъпка
    const selectedSupplier = suppliers.find(s => s.id === supplierToUse);
    const supplierDiscount = selectedSupplier?.discount || 0; // отстъпка в процент

    if (costEur > 0) {
      // 1. Доставна цена в лева
      const costBgn = costEur * exchangeRate;

      // 2. Продажна цена в лева = Доставна в лева ÷ (1 - марж%)
      const saleBgn = costBgn / (1 - supplierDiscount / 100);

      // 3. Продажна цена в евро  
      const saleEur = saleBgn / exchangeRate;

      console.log('💰 Calculated prices:', {
        costEur,
        costBgn: costBgn.toFixed(2),
        saleBgn: saleBgn.toFixed(2),
        saleEur: saleEur.toFixed(2),
        supplierDiscount
      });

      setFormData(prev => ({
        ...prev,
        costBgn: costBgn.toFixed(2),
        saleBgn: saleBgn.toFixed(2),
        saleEur: saleEur.toFixed(2)
      }));
    }
  };

  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-calculate prices when cost or supplier changes
      if ((field === 'costEur' || field === 'supplier') && newData.autoPricing) {
        setTimeout(() => calculatePrices(
          field === 'costEur' ? value : newData.costEur,
          field === 'supplier' ? value : newData.supplier
        ), 0);
      }
      
      return newData;
    });

    // Update names when key fields change
    if (['productTypeId', 'manufacturerId'].includes(field)) {
      setTimeout(() => updateProductNames(), 0);
    }
  };

  const handleAttributeChange = (attrId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attrId]: value
      }
    }));
    
    setTimeout(() => updateProductNames(), 0);
  };

  const handleProductTypeChange = (productTypeId: string) => {
    handleInputChange('productTypeId', productTypeId);
    if (productTypeId) {
      loadAttributesForType(productTypeId);
      loadManufacturersForType(productTypeId);
      
      // If manufacturer is already selected, load attribute values
      if (formData.manufacturerId) {
        loadAttributeValuesByProductTypeAndManufacturer(productTypeId, formData.manufacturerId);
      }
    } else {
      setAttributes([]);
      setAttributeValues([]);
      // Reset to all manufacturers when no type selected
      loadInitialData();
    }
  };

  const loadManufacturersForType = async (productTypeId: string) => {
    try {
      console.log('🏭 Loading manufacturers for product type:', productTypeId);
      
      const response = await fetch(`/api/manufacturers/by-product-type/${productTypeId}`);
      const data = await response.json();
      
      console.log('🏭 Manufacturers response:', data);
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('✅ Manufacturers loaded:', data.data.length);
        setManufacturers(data.data);
        showNotification(`Заредени ${data.data.length} производители за този тип продукт`, 'success');
      } else {
        console.log('⚠️ No manufacturers found for this product type, loading all manufacturers');
        // Fallback to loading all manufacturers if none are specifically linked
        const allManufacturersResponse = await fetch('/api/manufacturers');
        const allManufacturersData = await allManufacturersResponse.json();
        const allManufacturers = allManufacturersData?.data || [];
        setManufacturers(allManufacturers);
        showNotification('Няма специфични производители за този тип продукт. Показани са всички производители.', 'warning');
      }
    } catch (error) {
      console.error('❌ Error loading manufacturers for product type:', error);
      showNotification('Грешка при зареждане на производителите', 'error');
      // Fallback to all manufacturers on error
      try {
        const allManufacturersResponse = await fetch('/api/manufacturers');
        const allManufacturersData = await allManufacturersResponse.json();
        const allManufacturers = allManufacturersData?.data || [];
        setManufacturers(allManufacturers);
      } catch (fallbackError) {
        console.error('❌ Error loading fallback manufacturers:', fallbackError);
        setManufacturers([]);
      }
    }
  };

  const handleManufacturerChange = (manufacturerId: string) => {
    handleInputChange('manufacturerId', manufacturerId);
    
    // Автоматично зареждане на доставчик със същото име
    if (manufacturerId) {
      const selectedManufacturer = manufacturers.find(m => m.id === manufacturerId);
      if (selectedManufacturer) {
        // Търсим доставчик със същото име
        const matchingSupplier = suppliers.find(s => 
          s.name.toLowerCase() === selectedManufacturer.name.toLowerCase() ||
          s.displayName?.toLowerCase() === selectedManufacturer.displayName.toLowerCase()
        );
        
        if (matchingSupplier) {
          console.log('🔗 Auto-linking supplier:', matchingSupplier.displayName || matchingSupplier.name);
          handleInputChange('supplier', matchingSupplier.id);
          handleInputChange('supplierLinked', true); // Флаг за автоматично свързан доставчик
        }
      }
    }
    
    if (formData.productTypeId && manufacturerId) {
      loadAttributeValuesByProductTypeAndManufacturer(formData.productTypeId, manufacturerId);
    }
  };

  const handleSupplierChange = (supplier: string) => {
    handleInputChange('supplier', supplier);
    // Преизчисляваме цените с новата отстъпка на доставчика
    setTimeout(() => calculatePrices(formData.costEur, supplier), 100);
  };

  const getAttributeValuesForAttribute = (attrId: string) => {
    // Filter by attributeTypeId (this is the correct field!)
    const filtered = attributeValues.filter(av => av.attributeTypeId === attrId);
    return filtered;
  };

  const handleSave = () => {
    // Validation - only check for user-input required fields
    const requiredFields = ['productTypeId', 'manufacturerId'];
    const missing = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      showNotification('Моля попълнете всички задължителни полета', 'error');
      console.log('❌ Missing required fields:', missing);
      return;
    }

    // Ensure names and code are generated before saving
    if (!formData.nameBg || !formData.code) {
      console.log('🔄 Generating missing names/code before save...');
      updateProductNames();
      setTimeout(() => {
        // Try again after names are generated
        if (!formData.nameBg || !formData.code) {
          showNotification('Грешка при генериране на име и код на продукта', 'error');
          return;
        }
        handleSave(); // Recursive call after generation
      }, 100);
      return;
    }

    // Prepare data for save - according to CreateProductDto
    const productData = {
      code: formData.code,
      nameBg: formData.nameBg,
      nameEn: formData.nameEn || formData.nameBg,
      productTypeId: formData.productTypeId,
      manufacturerId: formData.manufacturerId,
      supplier: formData.supplier || undefined,
      unit: formData.unit,
      packageSize: formData.packageSize || undefined,
      costEur: formData.costEur ? parseFloat(formData.costEur) : undefined,
      costBgn: formData.costBgn ? parseFloat(formData.costBgn) : undefined,
      saleBgn: formData.saleBgn ? parseFloat(formData.saleBgn) : undefined,
      saleEur: formData.saleEur ? parseFloat(formData.saleEur) : undefined,
      isActive: formData.isActive,
      isRecommended: formData.isRecommended,
      isNew: formData.isNew,
      // Media files - convert to URLs array format expected by backend
      images: formData.images.map(file => file.url),
      documents: formData.documents.map(file => file.url),
      models3d: formData.models3d.map(file => file.url),
      textures: formData.textures.map(file => file.url),
      videoUrl: formData.videoUrl || undefined,
      // Convert attributes object to array format expected by backend
      attributes: Object.entries(formData.attributes).map(([attributeTypeId, value]) => ({
        attributeTypeId,
        customValue: value,
        attributeValueId: value // This might need adjustment based on whether it's a predefined value or custom
      })).filter(attr => attr.customValue)
    };

    console.log('💾 Saving product data:', productData);
    onSave(productData);
  };

  // Function to open add value modal
  const openAddValueModal = (attribute: any) => {
    setSelectedAttributeForValue(attribute);
    setNewAttributeValue({
      nameBg: '',
      nameEn: '',
      description: '',
      icon: '',
      colorCode: '',
      manufacturerId: formData.manufacturerId || '', // Use selected manufacturer from form
      sortOrder: 1,
      isDefault: false
    });
    
    console.log('🔥 OPENING ADD VALUE MODAL FOR:', {
      attributeId: attribute.id,
      attributeName: attribute.nameBg,
      attributeType: attribute.type,
      selectedManufacturerId: formData.manufacturerId,
      currentAttributeValuesCount: attributeValues.length
    });
    
    setShowAddValueModal(true);
  };

  // Function to save new attribute value
  const saveNewAttributeValue = async () => {
    if (!selectedAttributeForValue) return;
    
    try {
      console.log('💾 Saving new attribute value...');
      
      const valueData = {
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
        console.log('✅ Attribute value created successfully');
        
        // Get the created attribute value from response
        const apiResponse = await response.json();
        console.log('🔥 NEW VALUE FROM API:', apiResponse);
        
        // Extract the actual data from the API response structure
        const newValue = apiResponse.data || apiResponse;
        console.log('🔥 EXTRACTED NEW VALUE DATA:', newValue);
        
        // Save attribute reference for auto-select BEFORE clearing modal state
        const attributeForAutoSelect = selectedAttributeForValue;
        console.log('💾 SAVED ATTRIBUTE FOR AUTO-SELECT:', attributeForAutoSelect);
        
        // Close modal immediately for better UX
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
        
        // Show success notification
        showNotification(`Нова стойност "${newValue.nameBg}" е създадена успешно!`, 'success');
        
        // Show loading indicator
        setIsReloadingValues(true);
        
        // Force complete reload of attribute values from API
        console.log('🔄 FORCE RELOADING ATTRIBUTE VALUES FROM API...');
        if (formData.manufacturerId && formData.productTypeId) {
          try {
            await loadAttributeValuesByProductTypeAndManufacturer(formData.productTypeId, formData.manufacturerId);
            console.log('✅ ATTRIBUTE VALUES RELOADED SUCCESSFULLY');
            
            // Force re-render of the entire attributes section
            setRefreshKey(prev => prev + 1);
            
            // Additional safety - set the new value in the form if it's for the currently opened attribute
            if (attributeForAutoSelect && newValue.attributeTypeId === attributeForAutoSelect.id) {
              console.log('🎯 ATTEMPTING AUTO-SELECT:', {
                selectedAttributeId: attributeForAutoSelect.id,
                newValueId: newValue.id,
                newValueAttributeTypeId: newValue.attributeTypeId,
                newValueName: newValue.nameBg,
                match: newValue.attributeTypeId === attributeForAutoSelect.id
              });
              
              setTimeout(() => {
                try {
                  handleAttributeChange(attributeForAutoSelect.id, newValue.id);
                  console.log('✅ AUTO-SELECTED NEW VALUE IN DROPDOWN');
                  
                  // Verify the selection took effect
                  setTimeout(() => {
                    const currentValue = formData.attributes[attributeForAutoSelect.id];
                    console.log('🔍 VERIFICATION - Current selected value:', currentValue);
                    console.log('🔍 Expected value:', newValue.id);
                    console.log('✅ AUTO-SELECT VERIFICATION:', currentValue === newValue.id ? 'SUCCESS' : 'FAILED');
                  }, 100);
                } catch (error) {
                  console.error('❌ AUTO-SELECT ERROR:', error);
                }
              }, 200); // Small delay to ensure re-render completed
            }
            
          } catch (error) {
            console.error('❌ ERROR RELOADING ATTRIBUTE VALUES:', error);
          } finally {
            setIsReloadingValues(false);
          }
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ Failed to create attribute value: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating attribute value:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white px-5 py-4 flex items-center justify-between">
          <h1 className="text-base font-medium !text-white">Създаване на продукт</h1>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-10 p-1 rounded text-lg leading-none w-7 h-7 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {/* Names Section */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Основни имена на продукта</h3>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="manualProductName"
                  checked={formData.manualProductName}
                  onChange={(e) => handleInputChange('manualProductName', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="manualProductName" className="text-xs font-medium text-gray-700">
                  Ръчно генериране
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Име на български <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.nameBg}
                  onChange={(e) => handleInputChange('nameBg', e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-xs ${
                    formData.manualProductName 
                      ? 'border-blue-300 bg-white text-gray-900' 
                      : 'border-gray-300 bg-gray-100 text-gray-600'
                  }`}
                  readOnly={!formData.manualProductName}
                  placeholder={formData.manualProductName ? "Въведете име на български" : "Автогенерирано име на български"}
                />
              </div>
              <div className="form-group">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Име на английски <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.nameEn}
                  onChange={(e) => handleInputChange('nameEn', e.target.value)}
                  className={`w-full px-3 py-2 border rounded text-xs ${
                    formData.manualProductName 
                      ? 'border-blue-300 bg-white text-gray-900' 
                      : 'border-gray-300 bg-gray-100 text-gray-600'
                  }`}
                  readOnly={!formData.manualProductName}
                  placeholder={formData.manualProductName ? "Enter English name" : "Auto-generated English name"}
                />
              </div>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {formData.manualProductName 
                ? "Можете да въведете име ръчно" 
                : "Имената се обновяват автоматично при промяна на атрибутите"
              }
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3 text-sm font-medium">
                Основна информация
              </div>
              <div className="p-4 space-y-4">
                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Тип продукт <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.productTypeId}
                    onChange={(e) => handleProductTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                  >
                    <option value="">Избери тип продукт...</option>
                    {productTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nameBg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Код</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="Автогенериран или ръчен"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Доставчик
                    {formData.supplierLinked && (
                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        🔗 Автоматично свързан
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.supplier}
                      onChange={(e) => handleSupplierChange(e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded text-xs ${
                        formData.supplierLinked ? 'border-green-300 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Избери доставчик...</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.displayName || supplier.name}
                        </option>
                      ))}
                    </select>
                    {formData.supplierLinked && (
                      <button
                        type="button"
                        onClick={() => {
                          handleInputChange('supplier', '');
                          handleInputChange('supplierLinked', false);
                        }}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200"
                        title="Премахни автоматичната връзка"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Производител <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.manufacturerId}
                    onChange={(e) => handleManufacturerChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                  >
                    <option value="">Избери производител...</option>
                    {manufacturers.map((manufacturer) => (
                      <option key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-3 text-sm font-medium">
                Допълнителна информация
              </div>
              <div className="p-4 space-y-4">
                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Мерна единица</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                  >
                    <option value="m2">кв.м</option>
                    <option value="m">л.м</option>
                    <option value="piece">броя</option>
                    <option value="package">пакет</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Големина на пакет</label>
                  <input
                    type="text"
                    value={formData.packageSize}
                    onChange={(e) => handleInputChange('packageSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="напр. 2.4 кв.м"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="active" className="text-xs font-medium">Активен продукт</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recommended"
                      checked={formData.isRecommended}
                      onChange={(e) => handleInputChange('isRecommended', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="recommended" className="text-xs font-medium">Препоръчителен</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newProduct"
                      checked={formData.isNew}
                      onChange={(e) => handleInputChange('isNew', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="newProduct" className="text-xs font-medium">Нов продукт</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Loading indicator for reloading values */}
          {isReloadingValues && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-5 text-xs">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">Зареждам новата стойност...</span>
              </div>
            </div>
          )}

          {/* Dynamic Attributes Section */}
          {attributes.length > 0 && (
            <div key={refreshKey} className="bg-white border border-gray-200 rounded-md overflow-hidden mb-5">
              <div className="bg-gray-800 text-white px-4 py-3 text-sm font-medium">
                Атрибути на продукта ({attributes.length})
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {attributes.map((attr) => {
                    const availableValues = getAttributeValuesForAttribute(attr.id);
                    
                    return (
                    <div key={attr.id} className="bg-gray-50 border border-gray-200 rounded p-3 flex items-center gap-3">
                      <span className="min-w-[120px] text-xs font-medium text-gray-700">
                        {attr.nameBg}:
                      </span>
                      {/* Show dropdown for SELECT or COLOR types when values are available */}
                      {(attr.type === 'SELECT' || attr.type === 'COLOR') && availableValues.length > 0 ? (
                        (() => {
                          const options = availableValues.map(value => ({ 
                            id: value.id, 
                            label: attr.type === 'COLOR' && value.colorCode ? 
                              `🎨 ${value.nameBg} (${value.colorCode})` : 
                              value.nameBg + (value.colorCode ? ` (${value.colorCode})` : '') 
                          }));
                          
                          return (
                            <SearchableDropdown
                              options={options}
                              value={formData.attributes[attr.id] || ''}
                              onChange={(value) => handleAttributeChange(attr.id, value)}
                              className="flex-1"
                              placeholder="Търси или избери..."
                            />
                          );
                        })()
                      ) : (
                        /* Input field for other types or when no values available */
                        <input
                          type={attr.type === 'NUMBER' ? 'number' : 'text'}
                          value={formData.attributes[attr.id] || ''}
                          onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs bg-white text-gray-900"
                          placeholder={`Въведи ${attr.nameBg.toLowerCase()}`}
                        />
                      )}
                      <button
                        type="button"
                        className="bg-green-600 text-white w-7 h-7 rounded flex items-center justify-center text-sm hover:bg-green-700 flex-shrink-0"
                        title="Добави нова стойност"
                        onClick={() => openAddValueModal(attr)}
                      >
                        +
                      </button>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Pricing Section */}
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-5">
            <div className="bg-gray-800 text-white px-4 py-3 text-sm font-medium">
              Ценообразуване
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="autoPricing"
                  checked={formData.autoPricing}
                  onChange={(e) => {
                    handleInputChange('autoPricing', e.target.checked);
                    if (e.target.checked) {
                      setTimeout(() => calculatePrices(), 0);
                    }
                  }}
                  className="w-4 h-4"
                />
                <label htmlFor="autoPricing" className="text-xs font-medium">Автоматично пресмятане на цените</label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Доставна цена без ДДС (EUR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costEur}
                    onChange={(e) => {
                      handleInputChange('costEur', e.target.value);
                      if (formData.autoPricing) {
                        setTimeout(() => calculatePrices(), 0);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Доставна цена без ДДС (BGN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costBgn}
                    onChange={(e) => {
                      handleInputChange('costBgn', e.target.value);
                      if (formData.autoPricing) {
                        setTimeout(() => calculatePricesFromBgn('cost', e.target.value), 0);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Продажна цена без ДДС (BGN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saleBgn}
                    onChange={(e) => {
                      handleInputChange('saleBgn', e.target.value);
                      if (formData.autoPricing) {
                        setTimeout(() => calculatePricesFromBgn('sale', e.target.value), 0);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Продажна цена без ДДС (EUR)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.saleEur}
                    onChange={(e) => {
                      handleInputChange('saleEur', e.target.value);
                      if (formData.autoPricing) {
                        setTimeout(() => calculatePricesFromEur('sale', e.target.value), 0);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Отстъпка от доставчик %</label>
                  <input
                    type="number"
                    value={(() => {
                      const selectedSupplier = suppliers.find(s => s.id === formData.supplier);
                      return selectedSupplier?.discount || 0;
                    })()}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-gray-100 text-gray-600"
                    placeholder="Автоматично от доставчик"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media Files Section */}
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-5">
            <div className="bg-gray-800 text-white px-4 py-3 text-sm font-medium">
              Медиа файлове и документи
            </div>
            <div className="p-4 space-y-6">
              {/* Images */}
              <MediaUploader
                mediaType="images"
                files={formData.images}
                onFilesUpdate={(files) => handleInputChange('images', files)}
                maxFiles={20}
                maxFileSize={10}
                disabled={false}
              />

              {/* Documents */}
              <MediaUploader
                mediaType="documents"
                files={formData.documents}
                onFilesUpdate={(files) => handleInputChange('documents', files)}
                maxFiles={10}
                maxFileSize={50}
                disabled={false}
              />

              {/* 3D Models */}
              <MediaUploader
                mediaType="models3d"
                files={formData.models3d}
                onFilesUpdate={(files) => handleInputChange('models3d', files)}
                maxFiles={5}
                maxFileSize={100}
                disabled={false}
              />

              {/* Textures */}
              <MediaUploader
                mediaType="textures"
                files={formData.textures}
                onFilesUpdate={(files) => handleInputChange('textures', files)}
                maxFiles={15}
                maxFileSize={25}
                disabled={false}
              />

              {/* Video URL */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                  <span>🎥</span>
                  <span>Видео линк</span>
                </h4>
                <div className="flex space-x-3">
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-xs"
                    placeholder="https://youtube.com/watch?v=... или https://vimeo.com/..."
                  />
                  {formData.videoUrl && (
                    <button
                      type="button"
                      onClick={() => handleInputChange('videoUrl', '')}
                      className="px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Изчисти
                    </button>
                  )}
                </div>
                {formData.videoUrl && (
                  <div className="text-xs text-gray-500">
                    ✅ Видео линкът ще бъде запазен към продукта
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-5 py-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Всички полета с * са задължителни
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
            >
              Отказ
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              ПОТВЪРДИ
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-5 right-5 px-4 py-3 rounded text-xs shadow-lg z-50 transition-transform ${
          notification.type === 'error' ? 'bg-red-600 text-white' : 
          notification.type === 'warning' ? 'bg-yellow-400 text-gray-800' :
          'bg-green-600 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Add Value Modal */}
      {showAddValueModal && selectedAttributeForValue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-800 text-white px-5 py-4 flex items-center justify-between">
              <h1 className="text-base font-medium !text-white">
                Добави нова стойност за "{selectedAttributeForValue.nameBg}"
              </h1>
              <button 
                onClick={() => setShowAddValueModal(false)}
                className="text-white hover:text-gray-300 p-1"
              >
                ✕
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Име (БГ) *
                  </label>
                  <input
                    type="text"
                    value={newAttributeValue.nameBg}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, nameBg: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8мм, Червен, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Име (EN)
                  </label>
                  <input
                    type="text"
                    value={newAttributeValue.nameEn}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, nameEn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8mm, Red, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Производител
                  </label>
                  <select
                    value={newAttributeValue.manufacturerId}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, manufacturerId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Без производител</option>
                    {manufacturers.map(manufacturer => (
                      <option key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ред за сортиране
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newAttributeValue.sortOrder}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, sortOrder: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {selectedAttributeForValue.type === 'COLOR' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цвят
                  </label>
                  <input
                    type="color"
                    value={newAttributeValue.colorCode || '#000000'}
                    onChange={(e) => setNewAttributeValue({...newAttributeValue, colorCode: e.target.value})}
                    className="w-full h-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Икона (emoji)
                </label>
                <input
                  type="text"
                  value={newAttributeValue.icon}
                  onChange={(e) => setNewAttributeValue({...newAttributeValue, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="🌳, 📏, etc."
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={newAttributeValue.description}
                  onChange={(e) => setNewAttributeValue({...newAttributeValue, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Допълнително описание..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAttributeValue.isDefault}
                  onChange={(e) => setNewAttributeValue({...newAttributeValue, isDefault: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Стойност по подразбиране
                </label>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Стойността ще бъде веднага достъпна за избор
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddValueModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  onClick={saveNewAttributeValue}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={!newAttributeValue.nameBg}
                >
                  ПОТВЪРДИ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCreateModal; 