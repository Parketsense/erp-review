import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  Wand2,
  Package,
  Tag,
  Palette,
  Ruler,
  Settings,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  ChevronDown,
  Home,
  DoorOpen,
  Armchair,
  PaintBucket,
  Wrench,
  Box
} from 'lucide-react';

const CompleteProductForm = () => {
  // Основни полета за продукта
  const [product, setProduct] = useState({
    // Основна информация
    productType: '',
    nameTemplate: 'auto', // 'auto', 'manual'
    nameBg: '',
    nameEn: '',
    code: '',
    active: true,
    
    // Производител и доставчик
    supplier: '',
    manufacturer: '',
    
    // Динамични атрибути (ще се попълват според типа продукт)
    attributes: {},
    
    // Ценообразуване
    autoCalculatePrices: true,
    supplierPriceEur: '',
    supplierPriceBgn: '',
    retailPriceEur: '',
    retailPriceBgn: '',
    
    // Опаковка и единица
    unit: 'кв.м.',
    packageSize: '',
    facturedTo: 'parketsense',
    
    // Визуални
    thumbnail: null
  });

  // Типове продукти с икони
  const productTypes = [
    { id: 'parquet', name: 'Паркет', icon: Home, color: 'text-green-600' },
    { id: 'doors', name: 'Врати', icon: DoorOpen, color: 'text-blue-600' },
    { id: 'furniture', name: 'Мебели', icon: Armchair, color: 'text-purple-600' },
    { id: 'wall-coverings', name: 'Стенни облицовки', icon: PaintBucket, color: 'text-orange-600' },
    { id: 'wall-decorations', name: 'Декорации за стена', icon: Palette, color: 'text-pink-600' },
    { id: 'installation', name: 'Услуги за монтаж', icon: Wrench, color: 'text-yellow-600' },
    { id: 'materials', name: 'Материали за монтаж', icon: Box, color: 'text-gray-600' }
  ];

  // Производители
  const suppliers = ['Хикс', 'Bauwerk', 'Foglie d\'Oro', 'Quick-Step', 'IKEA', 'REHAU', 'Паркетсенс'];

  // Производители по доставчици
  const manufacturersBySupplier = {
    'Хикс': ['Хикс Premium', 'Хикс Classic', 'Хикс Professional'],
    'Bauwerk': ['Bauwerk Parkett', 'Bauwerk Editions'],
    'Quick-Step': ['Quick-Step Livyn', 'Quick-Step Majestic', 'Quick-Step Perspective'],
    'Паркетсенс': ['Паркетсенс'],
    'IKEA': ['IKEA Home', 'IKEA Professional'],
    'REHAU': ['REHAU Windows', 'REHAU Doors']
  };

  // КЛЮЧОВА СТРУКТУРА: Атрибути по типове продукти
  const attributesByProductType = {
    parquet: [
      {
        id: 'constructionType',
        nameBg: 'Тип конструкция',
        nameEn: 'Construction Type',
        type: 'select',
        values: {
          all: ['Масив', 'Инженерен', 'Ламинат', 'Винилов', 'SPC'],
          'Хикс': ['Масив', 'Инженерен', 'Ламинат'],
          'Bauwerk': ['Масив', 'Инженерен'],
          'Quick-Step': ['Ламинат', 'Винилов', 'SPC']
        }
      },
      {
        id: 'woodMaterial',
        nameBg: 'Дървесина/Материал',
        nameEn: 'Wood/Material',
        type: 'select',
        values: {
          all: ['Дъб', 'Ясен', 'Бук', 'Орех', 'Череша', 'Клен', 'Бамбук'],
          'Хикс': ['Дъб', 'Ясен', 'Орех', 'Череша'],
          'Bauwerk': ['Дъб', 'Ясен', 'Клен'],
          'Quick-Step': ['Дъб', 'Бук', 'Бамбук']
        }
      },
      {
        id: 'selection',
        nameBg: 'Селекция',
        nameEn: 'Selection',
        type: 'select',
        values: {
          all: ['Натур', 'Рустик', 'Маркант', 'ABC', 'Прайм', 'Елегант'],
          'Хикс': ['Натур', 'Рустик', 'Маркант'],
          'Bauwerk': ['Прайм', 'Елегант', 'Натур']
        }
      },
      {
        id: 'finish',
        nameBg: 'Финиш',
        nameEn: 'Finish',
        type: 'select',
        values: {
          all: ['Лак', 'Масло', 'UV лак', 'Сатиниран', 'Необработен'],
          'Хикс': ['Лак', 'Масло', 'UV лак'],
          'Bauwerk': ['Масло', 'Сатиниран', 'Необработен']
        }
      },
      {
        id: 'thickness',
        nameBg: 'Дебелина',
        nameEn: 'Thickness',
        type: 'select',
        unit: 'мм',
        values: {
          all: ['8mm', '10mm', '12mm', '14mm', '15mm', '20mm', '22mm'],
          'Хикс': ['14mm', '15mm', '20mm', '22mm'],
          'Quick-Step': ['8mm', '10mm', '12mm']
        }
      },
      {
        id: 'width',
        nameBg: 'Ширина',
        nameEn: 'Width',
        type: 'select',
        unit: 'мм',
        values: {
          all: ['60mm', '80mm', '120mm', '140mm', '180mm', '200mm', '220mm'],
          'Хикс': ['140mm', '180mm', '200mm', '220mm'],
          'Quick-Step': ['60mm', '80mm', '120mm']
        }
      },
      {
        id: 'length',
        nameBg: 'Дължина',
        nameEn: 'Length',
        type: 'select',
        unit: 'мм',
        values: {
          all: ['400mm', '600mm', '1200mm', '1400mm', '1800mm', '2200mm'],
          'Хикс': ['1200mm', '1400mm', '1800mm', '2200mm'],
          'Quick-Step': ['400mm', '600mm', '1200mm']
        }
      },
      {
        id: 'wearClass',
        nameBg: 'Клас износване',
        nameEn: 'Wear Class',
        type: 'select',
        values: {
          all: ['AC3', 'AC4', 'AC5', 'AC6'],
          'Quick-Step': ['AC3', 'AC4', 'AC5'],
          'Хикс': ['AC4', 'AC5', 'AC6']
        }
      }
    ],
    doors: [
      {
        id: 'doorType',
        nameBg: 'Тип врата',
        nameEn: 'Door Type',
        type: 'select',
        values: {
          all: ['Интериорна', 'Входна', 'Плъзгаща', 'Хармоника', 'Въртяща'],
          'REHAU': ['Входна', 'Плъзгаща'],
          'IKEA': ['Интериорна', 'Хармоника']
        }
      },
      {
        id: 'frameMaterial',
        nameBg: 'Материал каса',
        nameEn: 'Frame Material',
        type: 'select',
        values: {
          all: ['Дърво', 'MDF', 'Алуминий', 'Стомана'],
          'REHAU': ['Алуминий', 'Стомана'],
          'IKEA': ['Дърво', 'MDF']
        }
      },
      {
        id: 'lockType',
        nameBg: 'Вид брава',
        nameEn: 'Lock Type',
        type: 'select',
        values: {
          all: ['Обикновена', 'Секретна', 'Електронна', 'Автоматична']
        }
      },
      {
        id: 'finishPush',
        nameBg: 'Финиш от пуш страна',
        nameEn: 'Push Side Finish',
        type: 'select',
        values: {
          all: ['Естествен', 'Лакиран', 'Боядисан', 'Фолиран']
        }
      },
      {
        id: 'finishPull',
        nameBg: 'Финиш от пул страна',
        nameEn: 'Pull Side Finish',
        type: 'select',
        values: {
          all: ['Естествен', 'Лакиран', 'Боядисан', 'Фолиран']
        }
      }
    ],
    furniture: [
      {
        id: 'furnitureType',
        nameBg: 'Тип мебел',
        nameEn: 'Furniture Type',
        type: 'select',
        values: {
          all: ['Гардероб', 'Скрин', 'Маса', 'Стол', 'Легло', 'Етажерка', 'Комода'],
          'IKEA': ['Гардероб', 'Скрин', 'Маса', 'Стол', 'Легло', 'Етажерка', 'Комода']
        }
      },
      {
        id: 'style',
        nameBg: 'Стил',
        nameEn: 'Style',
        type: 'select',
        values: {
          all: ['Скандинавски', 'Модерен', 'Класически', 'Индустриален', 'Минималистичен'],
          'IKEA': ['Скандинавски', 'Модерен', 'Минималистичен']
        }
      },
      {
        id: 'material',
        nameBg: 'Материал',
        nameEn: 'Material',
        type: 'select',
        values: {
          all: ['Масивно дърво', 'ПДЧ', 'MDF', 'Метал', 'Стъкло'],
          'IKEA': ['ПДЧ', 'MDF', 'Метал']
        }
      },
      {
        id: 'handleType',
        nameBg: 'Тип дръжки',
        nameEn: 'Handle Type',
        type: 'select',
        values: {
          all: ['Без дръжки', 'Класически', 'Модерни', 'Релсови', 'Кожени'],
          'IKEA': ['Без дръжки', 'Модерни', 'Релсови']
        }
      }
    ]
  };

  // Units по типове продукти
  const unitsByProductType = {
    parquet: ['кв.м.', 'м.п.', 'опаковка'],
    doors: ['бр.', 'комплект'],
    furniture: ['бр.', 'комплект'],
    'wall-coverings': ['кв.м.', 'м.п.'],
    'wall-decorations': ['кв.м.', 'бр.'],
    installation: ['час', 'кв.м.', 'м.п.'],
    materials: ['кг', 'л', 'опаковка', 'бр.']
  };

  // Получаване на атрибути за текущия тип продукт
  const currentAttributes = useMemo(() => {
    return attributesByProductType[product.productType] || [];
  }, [product.productType]);

  // Получаване на възможни стойности за атрибут с филтриране по производител
  const getAttributeValues = (attribute) => {
    const allValues = attribute.values.all || [];
    const manufacturerValues = attribute.values[product.manufacturer] || [];
    
    // Ако има специфични стойности за производителя, използваме тях + универсални
    if (manufacturerValues.length > 0) {
      return [...new Set([...manufacturerValues, ...allValues])];
    }
    
    return allValues;
  };

  // КЛЮЧОВА ФУНКЦИЯ: Динамично генериране на име
  const generateProductName = (productData, language = 'bg') => {
    const parts = [];
    
    // Начало с производител
    if (productData.manufacturer) {
      parts.push(productData.manufacturer);
    }
    
    // За паркет
    if (productData.productType === 'parquet') {
      if (productData.attributes.woodMaterial) {
        parts.push(productData.attributes.woodMaterial);
      }
      if (productData.attributes.selection) {
        parts.push(productData.attributes.selection);
      }
      if (productData.attributes.finish) {
        parts.push(productData.attributes.finish);
      }
      
      // Размери за паркет
      const dimensions = [];
      if (productData.attributes.thickness) dimensions.push(productData.attributes.thickness);
      if (productData.attributes.width) dimensions.push(productData.attributes.width);
      if (productData.attributes.length) dimensions.push(productData.attributes.length);
      
      if (dimensions.length > 0) {
        parts.push(dimensions.join('x'));
      }
    }
    
    // За врати
    if (productData.productType === 'doors') {
      if (productData.attributes.doorType) {
        parts.push(productData.attributes.doorType);
      }
      if (productData.attributes.frameMaterial) {
        parts.push(productData.attributes.frameMaterial);
      }
      if (productData.attributes.lockType) {
        parts.push(productData.attributes.lockType);
      }
    }
    
    // За мебели
    if (productData.productType === 'furniture') {
      if (productData.attributes.furnitureType) {
        parts.push(productData.attributes.furnitureType);
      }
      if (productData.attributes.style) {
        parts.push(productData.attributes.style);
      }
      if (productData.attributes.material) {
        parts.push(productData.attributes.material);
      }
    }
    
    return parts.join(' ');
  };

  // Автоматично обновяване на имената при промяна на параметри
  useEffect(() => {
    if (product.nameTemplate === 'auto') {
      const newNameBg = generateProductName(product, 'bg');
      const newNameEn = generateProductName(product, 'en'); // За опростяване използваме същата логика
      
      setProduct(prev => ({
        ...prev,
        nameBg: newNameBg,
        nameEn: newNameEn
      }));
    }
  }, [
    product.manufacturer,
    product.productType,
    product.attributes,
    product.nameTemplate
  ]);

  // Обновяване на units при смяна на тип продукт
  useEffect(() => {
    if (product.productType) {
      const availableUnits = unitsByProductType[product.productType] || ['бр.'];
      setProduct(prev => ({
        ...prev,
        unit: availableUnits[0],
        attributes: {} // Изчистваме атрибутите при смяна на типа
      }));
    }
  }, [product.productType]);

  // Функция за промяна на атрибут
  const handleAttributeChange = (attributeId, value) => {
    setProduct(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: value
      }
    }));
  };

  // Функция за добавяне на нова стойност към атрибут
  const addNewAttributeValue = (attributeId, attributeName) => {
    const newValue = prompt(`Добави нова стойност за "${attributeName}":`);
    if (newValue && newValue.trim()) {
      // В реалната система това ще направи API заявка
      alert(`Ще се добави нова стойност "${newValue}" за атрибут "${attributeName}"`);
      // Автоматично се избира новата стойност
      handleAttributeChange(attributeId, newValue.trim());
    }
  };

  // Клониране на продукт
  const cloneProduct = () => {
    const cloned = {
      ...product,
      code: product.code + '_copy',
      nameBg: product.nameBg + ' (копие)',
      nameEn: product.nameEn + ' (copy)'
    };
    setProduct(cloned);
    alert('Продуктът е клониран! Името остава динамично.');
  };

  // Запазване на продукт
  const saveProduct = () => {
    console.log('Запазване на продукт:', product);
    alert(`Продукт запазен!\nТип: ${productTypes.find(t => t.id === product.productType)?.name}\nИме БГ: ${product.nameBg}\nИме EN: ${product.nameEn}`);
  };

  const selectedProductType = productTypes.find(t => t.id === product.productType);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              Създаване на продукт
            </h1>
            <p className="text-gray-600 mt-2">Пълна система с типове продукти, атрибути и зависимости</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={cloneProduct}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
            >
              <Copy className="w-5 h-5" />
              Клонирай
            </button>
            <button 
              onClick={saveProduct}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm"
            >
              <Save className="w-5 h-5" />
              Запази
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Лява колона - Основна информация */}
        <div className="xl:col-span-2 space-y-6">
          {/* Тип продукт */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              Тип продукт
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {productTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setProduct(prev => ({...prev, productType: type.id}))}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      product.productType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${type.color}`} />
                    <div className="text-sm font-medium text-gray-900">{type.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Динамично име */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Динамично име на продукт
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProduct(prev => ({...prev, nameTemplate: 'auto'}))}
                  className={`px-3 py-1 text-xs rounded-full ${
                    product.nameTemplate === 'auto' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw className="w-3 h-3 mr-1 inline" />
                  Авто
                </button>
                <button
                  onClick={() => setProduct(prev => ({...prev, nameTemplate: 'manual'}))}
                  className={`px-3 py-1 text-xs rounded-full ${
                    product.nameTemplate === 'manual' 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Lock className="w-3 h-3 mr-1 inline" />
                  Ръчно
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име на български
                  {product.nameTemplate === 'auto' && (
                    <span className="ml-2 text-xs text-green-600">
                      <RefreshCw className="w-3 h-3 inline mr-1" />
                      автоматично
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={product.nameBg}
                  onChange={(e) => setProduct(prev => ({...prev, nameBg: e.target.value}))}
                  disabled={product.nameTemplate === 'auto'}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    product.nameTemplate === 'auto' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Автоматично генерирано име..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Име на английски
                  {product.nameTemplate === 'auto' && (
                    <span className="ml-2 text-xs text-green-600">
                      <RefreshCw className="w-3 h-3 inline mr-1" />
                      автоматично
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={product.nameEn}
                  onChange={(e) => setProduct(prev => ({...prev, nameEn: e.target.value}))}
                  disabled={product.nameTemplate === 'auto'}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    product.nameTemplate === 'auto' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'border-gray-300'
                  }`}
                  placeholder="Автоматично генерирано име..."
                />
              </div>
            </div>
          </div>

          {/* Производител и доставчик */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Производител и доставчик</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Код на продукт</label>
                <input
                  type="text"
                  value={product.code}
                  onChange={(e) => setProduct(prev => ({...prev, code: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AUTO-генериран"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Доставчик</label>
                <select
                  value={product.supplier}
                  onChange={(e) => setProduct(prev => ({...prev, supplier: e.target.value, manufacturer: ''}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Избери доставчик</option>
                  {suppliers.map(supplier => (
                    <option key={supplier} value={supplier}>{supplier}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Производител*</label>
                <select
                  value={product.manufacturer}
                  onChange={(e) => setProduct(prev => ({...prev, manufacturer: e.target.value}))}
                  disabled={!product.supplier}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Избери производител</option>
                  {product.supplier && manufacturersBySupplier[product.supplier]?.map(manufacturer => (
                    <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Динамични атрибути според типа продукт */}
          {product.productType && currentAttributes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {selectedProductType && <selectedProductType.icon className={`w-5 h-5 ${selectedProductType.color}`} />}
                Атрибути за {selectedProductType?.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAttributes.map((attribute) => {
                  const availableValues = getAttributeValues(attribute);
                  
                  return (
                    <div key={attribute.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {attribute.nameBg}
                        {attribute.unit && <span className="text-gray-500"> ({attribute.unit})</span>}
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={product.attributes[attribute.id] || ''}
                          onChange={(e) => handleAttributeChange(attribute.id, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Избери {attribute.nameBg.toLowerCase()}</option>
                          {availableValues.map(value => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </select>
                        
                        {/* КЛЮЧОВ БУТОН: Добавяне на нова стойност */}
                        <button
                          onClick={() => addNewAttributeValue(attribute.id, attribute.nameBg)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title={`Добави нова стойност за ${attribute.nameBg}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Показваме колко стойности са налични за текущия производител */}
                      <div className="text-xs text-gray-500 mt-1">
                        {availableValues.length} стойности
                        {product.manufacturer && attribute.values[product.manufacturer] && (
                          <span className="text-blue-600"> • {product.manufacturer} специфични</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ценообразуване */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                Ценообразуване
              </h3>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={product.autoCalculatePrices}
                  onChange={(e) => setProduct(prev => ({...prev, autoCalculatePrices: e.target.checked}))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Автоматично пресмятане</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Доставна цена без ДДС в Евро*
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={product.supplierPriceEur}
                  onChange={(e) => setProduct(prev => ({...prev, supplierPriceEur: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Доставна цена без ДДС в Лева</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.supplierPriceBgn}
                  onChange={(e) => setProduct(prev => ({...prev, supplierPriceBgn: e.target.value}))}
                  disabled={product.autoCalculatePrices}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    product.autoCalculatePrices ? 'bg-blue-50 border-blue-200' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Продажна цена без ДДС в Евро</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.retailPriceEur}
                  onChange={(e) => setProduct(prev => ({...prev, retailPriceEur: e.target.value}))}
                  disabled={product.autoCalculatePrices}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    product.autoCalculatePrices ? 'bg-blue-50 border-blue-200' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Продажна цена без ДДС в Лева</label>
                <input
                  type="number"
                  step="0.01"
                  value={product.retailPriceBgn}
                  onChange={(e) => setProduct(prev => ({...prev, retailPriceBgn: e.target.value}))}
                  disabled={product.autoCalculatePrices}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    product.autoCalculatePrices ? 'bg-blue-50 border-blue-200' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Дясна колона - Допълнителни настройки */}
        <div className="space-y-6">
          {/* Единици и опаковка */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Единици и опаковка</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Мерна единица</label>
                <select
                  value={product.unit}
                  onChange={(e) => setProduct(prev => ({...prev, unit: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(unitsByProductType[product.productType] || ['бр.']).map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Големина на пакет</label>
                <input
                  type="text"
                  value={product.packageSize}
                  onChange={(e) => setProduct(prev => ({...prev, packageSize: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="напр. 2.16 кв.м./опаковка"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фактурирана към</label>
                <select
                  value={product.facturedTo}
                  onChange={(e) => setProduct(prev => ({...prev, facturedTo: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="parketsense">Паркетсенс</option>
                  <option value="client">Директно към клиента</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={product.active}
                  onChange={(e) => setProduct(prev => ({...prev, active: e.target.checked}))}
                  className="mr-2"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Продуктът е активен
                </label>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Изображение</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">Качи изображение на продукта</p>
              <p className="text-xs text-gray-500">PNG, JPG до 10MB</p>
            </div>
          </div>

          {/* Демо секция */}
          {product.productType && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Демонстрация
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Променете атрибутите и вижте как името се обновява автоматично!
              </p>
              <div className="space-y-3">
                <div>
                  <strong className="text-sm">Текущо име БГ:</strong>
                  <div className="mt-1 p-3 bg-white border rounded font-mono text-blue-600 text-sm">
                    {product.nameBg || 'Изберете тип продукт и атрибути...'}
                  </div>
                </div>
                <div>
                  <strong className="text-sm">Текущо име EN:</strong>
                  <div className="mt-1 p-3 bg-white border rounded font-mono text-blue-600 text-sm">
                    {product.nameEn || 'Select product type and attributes...'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteProductForm;