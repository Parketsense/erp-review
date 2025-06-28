import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Home,
  Package,
  DollarSign,
  Percent,
  Square,
  ChevronDown,
  ChevronUp,
  Calculator,
  Tag,
  Image,
  Upload,
  X,
  ZoomIn,
  Copy,
  CheckSquare,
  ArrowLeft,
  ArrowRight,
  Settings
} from 'lucide-react';

const VariantRoomsScreen = () => {
  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: 'Дневна',
      area: 35.5,
      discount: 10,
      waste: 15,
      images: [
        { id: 1, url: '/api/placeholder/400/300', name: 'Дневна - общ изглед' },
        { id: 2, url: '/api/placeholder/400/300', name: 'Дневна - детайл паркет' }
      ],
      products: [
        {
          id: 1,
          name: 'Coswick-Chevron Collection-Американски орех-Natural',
          category: 'под',
          quantity: 35.5,
          unitPrice: 89.50,
          discount: 5,
          waste: 15,
          finalPrice: 85.03,
          total: 3018.56
        },
        {
          id: 2,
          name: 'Первази дъбови-15мм х 60мм',
          category: 'под',
          quantity: 24,
          unitPrice: 15.20,
          discount: 0,
          waste: 0,
          finalPrice: 15.20,
          total: 364.80
        }
      ]
    },
    {
      id: 2,
      name: 'Спалня',
      area: 18.2,
      discount: 5,
      waste: 10,
      images: [
        { id: 3, url: '/api/placeholder/400/300', name: 'Спалня - изглед към прозореца' }
      ],
      products: [
        {
          id: 3,
          name: 'Coswick-Chevron Collection-Американски орех-Natural',
          category: 'под',
          quantity: 18.2,
          unitPrice: 89.50,
          discount: 5,
          waste: 10,
          finalPrice: 85.03,
          total: 1547.55
        }
      ]
    }
  ]);

  const [expandedRooms, setExpandedRooms] = useState(new Set([1]));
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCloneRoomModal, setShowCloneRoomModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedRoomToClone, setSelectedRoomToClone] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [cloneOptions, setCloneOptions] = useState({
    includeProducts: true,
    selectedProducts: new Set()
  });
  const [newRoom, setNewRoom] = useState({
    name: '',
    area: '',
    discount: 0,
    discountEnabled: true,
    waste: 10
  });

  // Demo data
  const variant = {
    id: 1,
    name: 'Рибена кост - Дъб натурал',
    phase: 'Етаж 1 - Продажба',
    project: 'Къща Иванови',
    designer: 'Мария Петрова',
    architect: 'Арх. Николай Иванов',
    architectPercent: 10,
    discountEnabled: true,
    variantDiscount: 15
  };

  // Demo data for cloning destinations
  const availableDestinations = [
    {
      phaseId: 1,
      phaseName: 'Етаж 1 - Продажба',
      variants: [
        { id: 1, name: 'Рибена кост - Дъб натурал', current: true },
        { id: 2, name: 'Право редене - Орех американски', current: false }
      ]
    },
    {
      phaseId: 2,
      phaseName: 'Етаж 1 - Монтаж',
      variants: [
        { id: 3, name: 'Монтажни услуги', current: false }
      ]
    },
    {
      phaseId: 3,
      phaseName: 'Етаж 2',
      variants: [
        { id: 4, name: 'Етаж 2 - Основен вариант', current: false }
      ]
    }
  ];

  const availableProducts = [
    { id: 1, name: 'Coswick-Chevron Collection-Американски орех-Natural', category: 'под', price: 89.50 },
    { id: 2, name: 'Първази дъбови-15мм х 60мм', category: 'под', price: 15.20 },
    { id: 3, name: 'Лепило Bona R850', category: 'под', price: 12.80 },
    { id: 4, name: 'Кухненски шкаф горен', category: 'мебели', price: 245.00 },
    { id: 5, name: 'Гранитна плоча', category: 'стена', price: 180.50 }
  ];

  const categoryColors = {
    под: 'bg-blue-100 text-blue-800',
    стена: 'bg-green-100 text-green-800',
    мебели: 'bg-purple-100 text-purple-800'
  };

  const toggleRoom = (roomId) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const calculateRoomTotal = (room) => {
    return room.products.reduce((sum, product) => sum + product.total, 0);
  };

  const calculateVariantTotal = () => {
    return rooms.reduce((sum, room) => sum + calculateRoomTotal(room), 0);
  };

  const handleCreateRoom = () => {
    if (newRoom.name.trim()) {
      const newId = Math.max(...rooms.map(r => r.id)) + 1;
      setRooms([...rooms, {
        id: newId,
        name: newRoom.name,
        area: parseFloat(newRoom.area) || 0,
        discount: newRoom.discount,
        discountEnabled: newRoom.discountEnabled,
        waste: newRoom.waste,
        images: [],
        products: []
      }]);
      setNewRoom({ name: '', area: '', discount: 0, discountEnabled: true, waste: 10 });
      setShowRoomModal(false);
    }
  };

  const handleDeleteRoom = (roomId) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази стая?')) {
      setRooms(rooms.filter(r => r.id !== roomId));
    }
  };

  const handleAddProduct = (productId, roomId) => {
    const selectedProduct = availableProducts.find(p => p.id === productId);
    const room = rooms.find(r => r.id === roomId);
    
    if (selectedProduct && room) {
      const newProductId = Date.now();
      const baseQuantity = room.area || 1;
      const quantityWithWaste = baseQuantity * (1 + room.waste / 100);
      const effectiveDiscount = room.discountEnabled ? room.discount : 0;
      const discountedPrice = selectedProduct.price * (1 - effectiveDiscount / 100);
      
      const newProduct = {
        id: newProductId,
        name: selectedProduct.name,
        category: selectedProduct.category,
        quantity: quantityWithWaste,
        unitPrice: selectedProduct.price,
        discount: room.discount,
        discountEnabled: room.discountEnabled,
        waste: room.waste,
        finalPrice: discountedPrice,
        total: quantityWithWaste * discountedPrice
      };

      setRooms(rooms.map(r => 
        r.id === roomId 
          ? { ...r, products: [...r.products, newProduct] }
          : r
      ));
    }
    setShowProductModal(false);
    setSelectedRoomId(null);
    setSearchProduct('');
  };

  const handleUpdateProduct = (roomId, productId, field, value) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          products: room.products.map(product => {
            if (product.id === productId) {
              const updatedProduct = { ...product, [field]: value };
              
              // Recalculate final price and total based on discount enabled status
              const effectiveDiscount = updatedProduct.discountEnabled ? updatedProduct.discount : 0;
              const finalPrice = updatedProduct.unitPrice * (1 - effectiveDiscount / 100);
              const total = updatedProduct.quantity * finalPrice;
              
              return {
                ...updatedProduct,
                finalPrice,
                total
              };
            }
            return product;
          })
        };
      }
      return room;
    }));
  };

  const toggleProductDiscount = (roomId, productId) => {
    handleUpdateProduct(roomId, productId, 'discountEnabled', 
      !rooms.find(r => r.id === roomId)?.products.find(p => p.id === productId)?.discountEnabled
    );
  };

  const toggleRoomDiscount = (roomId) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newDiscountEnabled = !room.discountEnabled;
        return {
          ...room,
          discountEnabled: newDiscountEnabled,
          // Update all products in the room
          products: room.products.map(product => {
            const effectiveDiscount = newDiscountEnabled ? product.discount : 0;
            const finalPrice = product.unitPrice * (1 - effectiveDiscount / 100);
            const total = product.quantity * finalPrice;
            
            return {
              ...product,
              discountEnabled: newDiscountEnabled,
              finalPrice,
              total
            };
          })
        };
      }
      return room;
    }));
  };

  const handleDeleteProduct = (roomId, productId) => {
    if (window.confirm('Сигурни ли сте, че искате да премахнете този продукт?')) {
      setRooms(rooms.map(r => 
        r.id === roomId 
          ? { ...r, products: r.products.filter(p => p.id !== productId) }
          : r
      ));
    }
  };

  const handleUploadImage = (roomId, event) => {
    const file = event.target.files[0];
    if (file) {
      // In real app, upload to server and get URL
      const imageUrl = URL.createObjectURL(file);
      const newImage = {
        id: Date.now(),
        url: imageUrl,
        name: file.name
      };
      
      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { ...room, images: [...room.images, newImage] }
          : room
      ));
    }
  };

  const handleDeleteImage = (roomId, imageId) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази снимка?')) {
      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { ...room, images: room.images.filter(img => img.id !== imageId) }
          : room
      ));
    }
  };

  const handleCloneRoom = (targetVariantId, targetPhaseId) => {
    const roomToClone = rooms.find(r => r.id === selectedRoomToClone.id);
    if (!roomToClone) return;

    let productsToClone = [];
    if (cloneOptions.includeProducts) {
      if (cloneOptions.selectedProducts.size > 0) {
        // Clone only selected products
        productsToClone = roomToClone.products.filter(p => 
          cloneOptions.selectedProducts.has(p.id)
        );
      } else {
        // Clone all products
        productsToClone = [...roomToClone.products];
      }
    }

    const clonedRoom = {
      ...roomToClone,
      id: Date.now(), // New ID for cloned room
      products: productsToClone.map(product => ({
        ...product,
        id: Date.now() + Math.random() // New ID for cloned products
      })),
      images: [...roomToClone.images] // Clone images as well
    };

    // In real app, this would be an API call
    console.log('Клониране на стая:', {
      room: clonedRoom,
      targetVariant: targetVariantId,
      targetPhase: targetPhaseId,
      includeProducts: cloneOptions.includeProducts,
      selectedProducts: Array.from(cloneOptions.selectedProducts)
    });

    // Reset state
    setShowCloneRoomModal(false);
    setSelectedRoomToClone(null);
    setCloneOptions({
      includeProducts: true,
      selectedProducts: new Set()
    });

    // Show success message
    alert(`Стаята "${roomToClone.name}" беше успешно клонирана!`);
  };

  const toggleProductSelection = (productId) => {
    const newSelected = new Set(cloneOptions.selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setCloneOptions({
      ...cloneOptions,
      selectedProducts: newSelected
    });
  };

  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const totalValue = calculateVariantTotal();
  const architectCommission = variant.architectPercent > 0 ? totalValue * variant.architectPercent / 100 : 0;
  const profit = totalValue * 0.35;
  const finalProfit = profit - architectCommission;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  <span>{variant.project}</span>
                  <span>/</span>
                  <span>{variant.phase}</span>
                </nav>
                <h1 className="text-xl font-bold text-gray-900">
                  {variant.name}
                </h1>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                  <span>👤 {variant.designer}</span>
                  {variant.architect && (
                    <span>🏛️ {variant.architect} ({variant.architectPercent}%)</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {totalValue.toLocaleString('bg-BG', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} лв
                </div>
                <div className="text-sm space-y-1">
                  {architectCommission > 0 && (
                    <div className="text-red-600">
                      Комисионна: {architectCommission.toLocaleString('bg-BG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} лв
                    </div>
                  )}
                  <div className="text-green-600">
                    Печалба: {finalProfit.toLocaleString('bg-BG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} лв
                  </div>
                  <div className="flex items-center justify-end mt-2">
                    <label className="flex items-center text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={variant.discountEnabled}
                        onChange={() => {
                          // In real app, this would update variant discount status
                          console.log('Toggle variant discount');
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                      />
                      Вариантна отстъпка {variant.variantDiscount}%
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation and action buttons */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Варианти
            </button>
            <button
              onClick={() => setShowRoomModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добави стая
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Settings className="w-4 h-4 mr-2" />
              Галерия
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
              Условия
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Rooms list */}
        <div className="space-y-4">
          {rooms.map((room) => {
            const roomTotal = calculateRoomTotal(room);
            const isExpanded = expandedRooms.has(room.id);
            
            return (
              <div key={room.id} className="bg-white shadow rounded-lg overflow-hidden">
                {/* Room header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleRoom(room.id)}
                        className="flex items-center space-x-2 text-lg font-medium text-gray-900 hover:text-blue-600"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                        <Home className="w-5 h-5" />
                        <span>{room.name}</span>
                      </button>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Square className="w-4 h-4 mr-1" />
                          <span>{room.area} м²</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={room.discountEnabled}
                            onChange={() => toggleRoomDiscount(room.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-1"
                          />
                          <Percent className="w-4 h-4 mr-1" />
                          <span className={room.discountEnabled ? 'text-blue-600' : 'text-gray-400 line-through'}>
                            {room.discount}% отстъпка
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calculator className="w-4 h-4 mr-1" />
                          <span>{room.waste}% фира</span>
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          <span>{room.products.length} продукта</span>
                        </div>
                        <div className="flex items-center">
                          <Image className="w-4 h-4 mr-1" />
                          <span>{room.images.length} снимки</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {roomTotal.toLocaleString('bg-BG', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} лв
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setShowProductModal(true);
                          }}
                          className="inline-flex items-center p-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                          title="Добави продукт"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        
                        <label className="inline-flex items-center p-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 cursor-pointer" title="Качи снимка">
                          <Upload className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImage(room.id, e)}
                            className="hidden"
                          />
                        </label>
                        
                        <button
                          onClick={() => {
                            setSelectedRoomToClone(room);
                            setShowCloneRoomModal(true);
                          }}
                          className="inline-flex items-center p-2 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-white hover:bg-purple-50"
                          title="Клониране в друг вариант"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        <button
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          title="Редактиране"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                          title="Изтриване"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products and gallery */}
                {isExpanded && (
                  <div className="px-6 py-4 space-y-6">
                    {/* Gallery section */}
                    {room.images.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Галерия ({room.images.length} снимки)</h4>
                        <div className="grid grid-cols-4 gap-3">
                          {room.images.map((image) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75"
                                onClick={() => {
                                  setSelectedImage(image);
                                  setShowImageModal(true);
                                }}
                              />
                              <button
                                onClick={() => handleDeleteImage(room.id, image.id)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-1 left-1 right-1">
                                <button
                                  onClick={() => {
                                    setSelectedImage(image);
                                    setShowImageModal(true);
                                  }}
                                  className="w-full bg-black bg-opacity-50 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <ZoomIn className="w-3 h-3 mr-1" />
                                  Преглед
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products section */}
                    {room.products.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="mx-auto h-8 w-8 mb-2" />
                        <p>Няма добавени продукти в тази стая</p>
                        <button
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            setShowProductModal(true);
                          }}
                          className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Добави продукт
                        </button>
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Продукти ({room.products.length})</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Продукт
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Категория
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Количество
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ед. цена
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Отстъпка
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Фира
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Крайна цена
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Общо
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Действия
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {room.products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                      {product.name}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[product.category]}`}>
                                      {product.category}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {editingProduct === product.id ? (
                                      <input
                                        type="number"
                                        step="0.1"
                                        value={product.quantity}
                                        onChange={(e) => handleUpdateProduct(room.id, product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                        onBlur={() => setEditingProduct(null)}
                                        onKeyPress={(e) => e.key === 'Enter' && setEditingProduct(null)}
                                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                      />
                                    ) : (
                                      <button
                                        onClick={() => setEditingProduct(product.id)}
                                        className="text-sm text-gray-900 hover:text-blue-600 hover:underline"
                                      >
                                        {product.quantity.toLocaleString('bg-BG', {
                                          minimumFractionDigits: 1,
                                          maximumFractionDigits: 1
                                        })}
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {product.unitPrice.toLocaleString('bg-BG', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })} лв
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={product.discountEnabled}
                                        onChange={() => toggleProductDiscount(room.id, product.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                      />
                                      {editingProduct === `${product.id}-discount` ? (
                                        <input
                                          type="number"
                                          min="0"
                                          max="50"
                                          value={product.discount}
                                          onChange={(e) => handleUpdateProduct(room.id, product.id, 'discount', parseFloat(e.target.value) || 0)}
                                          onBlur={() => setEditingProduct(null)}
                                          onKeyPress={(e) => e.key === 'Enter' && setEditingProduct(null)}
                                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          autoFocus
                                        />
                                      ) : (
                                        <button
                                          onClick={() => setEditingProduct(`${product.id}-discount`)}
                                          className={`text-sm hover:underline ${
                                            product.discountEnabled 
                                              ? 'text-blue-600 hover:text-blue-800' 
                                              : 'text-gray-400 line-through'
                                          }`}
                                          disabled={!product.discountEnabled}
                                        >
                                          {product.discount}%
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {editingProduct === `${product.id}-waste` ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max="30"
                                        value={product.waste}
                                        onChange={(e) => handleUpdateProduct(room.id, product.id, 'waste', parseFloat(e.target.value) || 0)}
                                        onBlur={() => setEditingProduct(null)}
                                        onKeyPress={(e) => e.key === 'Enter' && setEditingProduct(null)}
                                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        autoFocus
                                      />
                                    ) : (
                                      <button
                                        onClick={() => setEditingProduct(`${product.id}-waste`)}
                                        className="text-sm text-gray-900 hover:text-blue-600 hover:underline"
                                      >
                                        {product.waste}%
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {product.finalPrice.toLocaleString('bg-BG', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })} лв
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    {product.total.toLocaleString('bg-BG', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })} лв
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                      <button
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Редактиране"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteProduct(room.id, product.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Премахване"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <Home className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени стаи</h3>
            <p className="mt-1 text-sm text-gray-500">
              Започнете чрез създаване на първата стая във варианта.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowRoomModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Създай стая
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for creating new room */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Създаване на нова стая
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Име на стая *
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({...newRoom, name: e.target.value})}
                    placeholder="напр. Дневна, Спалня, Кухня..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Квадратура (м²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRoom.area}
                    onChange={(e) => setNewRoom({...newRoom, area: e.target.value})}
                    placeholder="35.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Отстъпка (%)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={newRoom.discountEnabled}
                      onChange={(e) => setNewRoom({...newRoom, discountEnabled: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={newRoom.discount}
                      onChange={(e) => setNewRoom({...newRoom, discount: Number(e.target.value)})}
                      disabled={!newRoom.discountEnabled}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Фира (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newRoom.waste}
                    onChange={(e) => setNewRoom({...newRoom, waste: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoom.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Създай
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding product */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Добавяне на продукт
              </h3>
              
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Търсене на продукт..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Products list */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product.id, selectedRoomId)}
                    className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[product.category]}`}>
                            {product.category}
                          </span>
                          <span className="text-sm text-gray-500">
                            {product.price.toLocaleString('bg-BG', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })} лв
                          </span>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="mx-auto h-8 w-8 mb-2" />
                  <p>Няма намерени продукти</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <button
                  className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Създай нов продукт
                </button>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setSelectedRoomId(null);
                    setSearchProduct('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Затвори
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clone room modal */}
      {showCloneRoomModal && selectedRoomToClone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-[600px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Клониране на стая "{selectedRoomToClone.name}"
              </h3>
              
              {/* Clone options */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Настройки за клониране</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={cloneOptions.includeProducts}
                      onChange={(e) => setCloneOptions({
                        ...cloneOptions,
                        includeProducts: e.target.checked,
                        selectedProducts: new Set()
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Включи продукти в клонирането</span>
                  </label>
                  
                  {cloneOptions.includeProducts && selectedRoomToClone.products.length > 0 && (
                    <div className="ml-6 pl-4 border-l-2 border-gray-200">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Избери продукти за клониране:</h5>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={cloneOptions.selectedProducts.size === 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCloneOptions({
                                  ...cloneOptions,
                                  selectedProducts: new Set()
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm font-medium text-blue-700">Всички продукти</span>
                        </label>
                        
                        {selectedRoomToClone.products.map((product) => (
                          <label key={product.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={cloneOptions.selectedProducts.has(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 flex-1">
                              {product.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {product.total.toLocaleString('bg-BG', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })} лв
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Destination selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Избери дестинация</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {availableDestinations.map((phase) => (
                    <div key={phase.phaseId}>
                      <h5 className="text-sm font-semibold text-gray-800 mb-2 bg-gray-100 px-3 py-1 rounded">
                        {phase.phaseName}
                      </h5>
                      <div className="ml-4 space-y-2">
                        {phase.variants.map((variantOption) => (
                          <button
                            key={variantOption.id}
                            onClick={() => handleCloneRoom(variantOption.id, phase.phaseId)}
                            disabled={variantOption.current}
                            className={`w-full text-left p-3 border rounded-md transition-colors ${
                              variantOption.current
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{variantOption.name}</span>
                              {variantOption.current && (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                  Текущ вариант
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCloneRoomModal(false);
                    setSelectedRoomToClone(null);
                    setCloneOptions({
                      includeProducts: true,
                      selectedProducts: new Set()
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Отказ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => {
                setShowImageModal(false);
                setSelectedImage(null);
              }}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded">
              <h3 className="font-medium">{selectedImage.name}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantRoomsScreen;