import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Settings,
  FileText
} from 'lucide-react';

interface RoomProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  waste: number;
  finalPrice: number;
  total: number;
}

interface Room {
  id: number;
  name: string;
  area: number;
  discount: number;
  waste: number;
  images: Array<{ id: number; url: string; name: string }>;
  products: RoomProduct[];
}

const VariantRoomsPage = () => {
  const { id: projectId, phaseId, variantId } = useParams<{ id: string; phaseId: string; variantId: string }>();
  const [rooms, setRooms] = useState<Room[]>([
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
  const [selectedImage, setSelectedImage] = useState<{ id: number; url: string; name: string } | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomToClone, setSelectedRoomToClone] = useState<Room | null>(null);
  const [editingProduct, setEditingProduct] = useState<RoomProduct | null>(null);
  const [searchProduct, setSearchProduct] = useState('');
  const [cloneOptions, setCloneOptions] = useState({
    includeProducts: true,
    selectedProducts: new Set<number>()
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

  const toggleRoom = (roomId: number) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const calculateRoomTotal = (room: Room) => {
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
        waste: newRoom.waste,
        images: [],
        products: []
      }]);
      setNewRoom({ name: '', area: '', discount: 0, discountEnabled: true, waste: 10 });
      setShowRoomModal(false);
    }
  };

  const handleDeleteRoom = (roomId: number) => {
    if (window.confirm('Сигурни ли сте, че искате да изтриете тази стая?')) {
      setRooms(rooms.filter(r => r.id !== roomId));
    }
  };

  const handleAddProduct = (productId: number, roomId: number) => {
    const product = availableProducts.find(p => p.id === productId);
    const room = rooms.find(r => r.id === roomId);
    
    if (product && room) {
      const newProduct: RoomProduct = {
        id: Date.now(),
        name: product.name,
        category: product.category,
        quantity: room.area,
        unitPrice: product.price,
        discount: 0,
        waste: room.waste,
        finalPrice: product.price,
        total: product.price * room.area
      };

      setRooms(rooms.map(r => 
        r.id === roomId 
          ? { ...r, products: [...r.products, newProduct] }
          : r
      ));
    }
    setShowProductModal(false);
    setSelectedRoomId(null);
  };

  const handleUpdateProduct = (roomId: number, productId: number, field: keyof RoomProduct, value: any) => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? {
            ...room,
            products: room.products.map(product => 
              product.id === productId 
                ? { ...product, [field]: value }
                : product
            )
          }
        : room
    ));
  };

  const toggleProductDiscount = (roomId: number, productId: number) => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? {
            ...room,
            products: room.products.map(product => 
              product.id === productId 
                ? { ...product, discount: product.discount > 0 ? 0 : 5 }
                : product
            )
          }
        : room
    ));
  };

  const toggleRoomDiscount = (roomId: number) => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, discount: room.discount > 0 ? 0 : 10 }
        : room
    ));
  };

  const handleDeleteProduct = (roomId: number, productId: number) => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, products: room.products.filter(p => p.id !== productId) }
        : room
    ));
  };

  const handleUploadImage = (roomId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        name: file.name
      }));

      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { ...room, images: [...room.images, ...newImages] }
          : room
      ));
    }
  };

  const handleDeleteImage = (roomId: number, imageId: number) => {
    setRooms(rooms.map(room => 
      room.id === roomId 
        ? { ...room, images: room.images.filter(img => img.id !== imageId) }
        : room
    ));
  };

  const handleCloneRoom = (targetVariantId: number, targetPhaseId: number) => {
    if (selectedRoomToClone) {
      // В реалната система тук би се направил API call
      console.log('Клониране на стая', selectedRoomToClone.name, 'във вариант', targetVariantId);
      setShowCloneRoomModal(false);
      setSelectedRoomToClone(null);
    }
  };

  const toggleProductSelection = (productId: number) => {
    const newSelected = new Set(cloneOptions.selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setCloneOptions({ ...cloneOptions, selectedProducts: newSelected });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Link to="/projects" className="hover:text-gray-700">
                    Проекти
                  </Link>
                  <span>/</span>
                  <Link to={`/projects/${projectId}`} className="hover:text-gray-700">
                    {variant.project}
                  </Link>
                  <span>/</span>
                  <Link to={`/projects/${projectId}/phases`} className="hover:text-gray-700">
                    Фази
                  </Link>
                  <span>/</span>
                  <Link to={`/projects/${projectId}/phases/${phaseId}/variants`} className="hover:text-gray-700">
                    {variant.phase}
                  </Link>
                  <span>/</span>
                  <span>{variant.name}</span>
                </nav>
                <h1 className="text-2xl font-bold text-gray-900">
                  {variant.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Управление на стаи и продукти
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  to={`/offers/create?projectId=${projectId}&variantId=${variantId}&roomId=1`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Създай оферта
                </Link>
                <button
                  onClick={() => setShowRoomModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Нова стая
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Общо стаи
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {rooms.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <Square className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Обща площ
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {rooms.reduce((sum, r) => sum + r.area, 0).toFixed(1)} м²
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Общо продукти
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {rooms.reduce((sum, r) => sum + r.products.length, 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Обща стойност
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {calculateVariantTotal().toLocaleString()} лв.
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms list */}
        <div className="space-y-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleRoom(room.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedRooms.has(room.id) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <h3 className="text-lg font-medium text-gray-900">
                      {room.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {room.area} м²
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {room.products.length} продукта
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {calculateRoomTotal(room).toLocaleString()} лв.
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setShowProductModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Продукт
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoomToClone(room);
                        setShowCloneRoomModal(true);
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Клонирай
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Изтрий
                    </button>
                  </div>
                </div>
              </div>

              {expandedRooms.has(room.id) && (
                <div className="px-6 py-4">
                  {/* Room details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Площ (м²)
                      </label>
                      <input
                        type="number"
                        value={room.area}
                        onChange={(e) => {
                          const newArea = parseFloat(e.target.value) || 0;
                          setRooms(rooms.map(r => 
                            r.id === room.id ? { ...r, area: newArea } : r
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Отстъпка (%)
                      </label>
                      <input
                        type="number"
                        value={room.discount}
                        onChange={(e) => {
                          const newDiscount = parseFloat(e.target.value) || 0;
                          setRooms(rooms.map(r => 
                            r.id === room.id ? { ...r, discount: newDiscount } : r
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Отпадъци (%)
                      </label>
                      <input
                        type="number"
                        value={room.waste}
                        onChange={(e) => {
                          const newWaste = parseFloat(e.target.value) || 0;
                          setRooms(rooms.map(r => 
                            r.id === room.id ? { ...r, waste: newWaste } : r
                          ));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Products table */}
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
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[product.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}`}>
                                {product.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(e) => handleUpdateProduct(room.id, product.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="number"
                                value={product.unitPrice}
                                onChange={(e) => handleUpdateProduct(room.id, product.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="number"
                                value={product.discount}
                                onChange={(e) => handleUpdateProduct(room.id, product.id, 'discount', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.finalPrice.toFixed(2)} лв.
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.total.toFixed(2)} лв.
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => handleDeleteProduct(room.id, product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Images */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Снимки</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {room.images.map((image) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <button
                              onClick={() => handleDeleteImage(room.id, image.id)}
                              className="opacity-0 group-hover:opacity-100 text-white hover:text-red-400 transition-opacity duration-200"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleUploadImage(room.id, e)}
                          className="hidden"
                        />
                        <Upload className="w-6 h-6 text-gray-400" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <Home className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Няма създадени стаи</h3>
            <p className="mt-1 text-sm text-gray-500">
              Започнете с създаване на първата стая за този вариант
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowRoomModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Нова стая
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal за създаване на стая */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Нова стая
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Име на стаята *
                  </label>
                  <input
                    type="text"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Напр. Дневна"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Площ (м²)
                  </label>
                  <input
                    type="number"
                    value={newRoom.area}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отстъпка (%)
                  </label>
                  <input
                    type="number"
                    value={newRoom.discount}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Отпадъци (%)
                  </label>
                  <input
                    type="number"
                    value={newRoom.waste}
                    onChange={(e) => setNewRoom(prev => ({ ...prev, waste: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={!newRoom.name.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Създай стая
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal за добавяне на продукт */}
      {showProductModal && selectedRoomId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Добави продукт
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Търсене на продукт
                  </label>
                  <input
                    type="text"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Търсете продукти..."
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2">
                  {availableProducts
                    .filter(product => 
                      product.name.toLowerCase().includes(searchProduct.toLowerCase())
                    )
                    .map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleAddProduct(product.id, selectedRoomId)}
                        className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                      >
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[product.category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800'}`}>
                            {product.category}
                          </span>
                          <span className="ml-2">{product.price} лв.</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Отказ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal за клониране на стая */}
      {showCloneRoomModal && selectedRoomToClone && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Клониране на стая
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Клониране на: <strong>{selectedRoomToClone.name}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Изберете целева фаза и вариант
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    {availableDestinations.map((destination) => (
                      <optgroup key={destination.phaseId} label={destination.phaseName}>
                        {destination.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={cloneOptions.includeProducts}
                      onChange={(e) => setCloneOptions(prev => ({ ...prev, includeProducts: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Включи продукти</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCloneRoomModal(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Отказ
                </button>
                <button
                  onClick={() => handleCloneRoom(1, 1)}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Клонирай
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantRoomsPage; 