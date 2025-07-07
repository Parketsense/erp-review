import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Package, Target, CheckCircle, Eye, Download, Mail, Share2, 
  ChevronLeft, ChevronRight, Send, Edit, User, Home, Euro, Calendar, Building,
  Settings, Clock, AlertCircle, Zap, Star, Percent, Calculator, Globe, Phone,
  MapPin, Camera, Upload, Save, Trash2, Copy, Search, Filter, SortAsc, X
} from 'lucide-react';
import { htmlTemplateService, AVAILABLE_TEMPLATES } from '../../lib/offers/htmlTemplateService';

// Mock data structure (replace with real data from props)
const mockVariants = [
  { 
    id: "1", 
    name: "SALIS", 
    status: "ready", 
    rooms: [
      { id: "r1", name: "Хол", products: [
        { id: "p1", name: "Паркет дъб", quantity: 25, unitPrice: 45.50, discount: 10 },
        { id: "p2", name: "Лак полиуретан", quantity: 1, unitPrice: 85.00, discount: 0 }
      ]},
      { id: "r2", name: "Спалня", products: [
        { id: "p3", name: "Паркет орех", quantity: 18, unitPrice: 52.30, discount: 15 }
      ]}
    ]
  },
  { 
    id: "2", 
    name: "FOGLIE D'ORO", 
    status: "ready", 
    rooms: [
      { id: "r3", name: "Всекидневна", products: [
        { id: "p4", name: "Паркет бук", quantity: 35, unitPrice: 48.75, discount: 5 },
        { id: "p5", name: "Подложка", quantity: 35, unitPrice: 12.20, discount: 0 }
      ]},
      { id: "r4", name: "Кухня", products: [
        { id: "p6", name: "Ламинат", quantity: 12, unitPrice: 28.90, discount: 20 }
      ]},
      { id: "r5", name: "Коридор", products: [
        { id: "p7", name: "Паркет дъб", quantity: 8, unitPrice: 45.50, discount: 10 }
      ]}
    ]
  },
  { 
    id: "3", 
    name: "PREMIUM", 
    status: "ready", 
    rooms: [
      { id: "r6", name: "Мастър спалня", products: [
        { id: "p8", name: "Паркет екзотичен", quantity: 22, unitPrice: 125.75, discount: 5 }
      ]},
      { id: "r7", name: "Детска стая", products: [
        { id: "p9", name: "Корков паркет", quantity: 15, unitPrice: 89.40, discount: 10 }
      ]}
    ]
  }
];

const mockProject = {
  id: "proj1",
  name: "Хотел Бургас", 
  address: "ул. Александровска 1, Бургас",
  client: {
    id: "client1",
    name: "Хотели ЕООД",
    email: "manager@hotels-bg.com",
    phone: "+359 888 123 456",
    contact: "Георги Петров"
  }
};

const mockPhase = {
  id: "phase1",
  name: "Първа фаза - Основна конструкция",
  description: "Стаи и общи помещения"
};

const EnhancedOfferModal = ({ 
  isOpen, 
  onClose, 
  variants = mockVariants,
  project = mockProject,
  phase = mockPhase 
}) => {
  // Safe variants array - must be defined before useState
  const safeVariants = variants || mockVariants;
  
  // State Management
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedVariants, setSelectedVariants] = useState(() => {
    // Auto-select variants that are ready for offer
    return safeVariants
      .filter(variant => variant.status === 'ready')
      .map(variant => variant.id);
  });
  
  // Step 2 - Offer Configuration
  const [offerConfig, setOfferConfig] = useState({
    title: `Оферта за ${project?.name || 'Проект'} - ${phase?.name || 'Фаза'}`,
    validityDays: 30,
    includeInstallation: true,
    installationPrice: 15.50, // per m²
    globalDiscount: 0,
    includeTransport: true,
    transportPrice: 150,
    includeArchitectCommission: false,
    architectCommission: 5, // percentage
    paymentTerms: 'advance_50',
    deliveryTerms: '7_days',
    notes: '',
    showDetailedBreakdown: true,
    includeImages: true
  });
  
  // Step 3 - Email Configuration  
  const [emailConfig, setEmailConfig] = useState({
    recipientEmail: project?.client?.email || 'client@email.bg',
    ccEmails: '',
    subject: `Оферта за ${project?.name || 'Проект'} - ${phase?.name || 'Фаза'}`,
    message: `Уважаеми ${project?.client?.contact || project?.client?.name || 'Клиент'},\n\nПриложено изпращаме оферта за проект "${project?.name || 'Проект'}".\n\nОчакваме Вашия отговор.\n\nС уважение,\nЕкипът на PARKETSENSE`,
    sendCopy: true,
    scheduleDelivery: false,
    deliveryDate: new Date().toISOString().split('T')[0],
    includeAttachments: true,
    offerFormat: 'pdf'
  });

  // HTML Template Configuration
  const [htmlTemplateConfig, setHtmlTemplateConfig] = useState({
    selectedTemplate: 'advanced', // Changed from 'luxury' to 'advanced' for "Интерактивна оферта"
    showPreview: false,
    isGenerating: false,
    previewUrl: null
  });

  // Calculations
  const calculateVariantTotal = (variantId) => {
    const variant = safeVariants.find(v => v.id === variantId);
    if (!variant) return 0;
    
    return variant.rooms?.reduce((sum, room) => {
      return sum + (room.products?.reduce((productSum, product) => {
        const basePrice = product.quantity * product.unitPrice;
        const discountedPrice = basePrice * (1 - (product.discount || 0) / 100);
        return productSum + discountedPrice;
      }, 0) || 0);
    }, 0) || 0;
  };

  const calculateTotalSquareMeters = () => {
    return selectedVariants.reduce((total, variantId) => {
      const variant = safeVariants.find(v => v.id === variantId);
      if (!variant) return total;
      return total + variant.rooms?.reduce((sum, room) => {
        return sum + (room.products?.reduce((productSum, product) => {
          return productSum + product.quantity;
        }, 0) || 0);
      }, 0);
    }, 0);
  };

  const calculateOfferTotal = () => {
    const variantsTotal = selectedVariants.reduce((total, variantId) => {
      return total + calculateVariantTotal(variantId);
    }, 0);
    
    const globalDiscountAmount = variantsTotal * (offerConfig.globalDiscount / 100);
    const discountedTotal = variantsTotal - globalDiscountAmount;
    
    let finalTotal = discountedTotal;
    
    // Add installation
    if (offerConfig.includeInstallation) {
      finalTotal += calculateTotalSquareMeters() * offerConfig.installationPrice;
    }
    
    // Add transport
    if (offerConfig.includeTransport) {
      finalTotal += offerConfig.transportPrice;
    }
    
    // Add architect commission
    if (offerConfig.includeArchitectCommission) {
      finalTotal += discountedTotal * (offerConfig.architectCommission / 100);
    }
    
    return finalTotal;
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} лв.`;
  };

  // HTML Template Functions
  const generateOfferTemplateData = () => {
    const offerVariants = selectedVariants.map(variantId => {
      const variant = safeVariants.find(v => v.id === variantId);
      if (!variant) return null;

      return {
        id: variant.id,
        name: variant.name,
        description: `Вариант ${variant.name}`,
        totalPrice: calculateVariantTotal(variant.id),
        rooms: variant.rooms?.map(room => ({
          id: room.id,
          name: room.name,
          totalPrice: room.products?.reduce((sum, product) => {
            const basePrice = product.quantity * product.unitPrice;
            const discountedPrice = basePrice * (1 - (product.discount || 0) / 100);
            return sum + discountedPrice;
          }, 0) || 0,
          products: room.products?.map(product => ({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            discount: product.discount || 0,
            totalPrice: product.quantity * product.unitPrice * (1 - (product.discount || 0) / 100)
          })) || []
        })) || []
      };
    }).filter((v): v is NonNullable<typeof v> => v !== null);

    // Generate offer number with project prefix
    const projectPrefix = project?.name?.substring(0, 3).toUpperCase() || 'OF';
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const offerNumber = `${projectPrefix}-${year}${month}${day}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    return {
      clientName: project?.client?.name || project?.client?.contact || 'Неизвестен клиент',
      projectName: project?.name || 'Неизвестен проект',
      projectAddress: project?.address || '',
      offerNumber,
      offerDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + offerConfig.validityDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalValue: calculateOfferTotal(),
      variants: offerVariants,
      installationPhase: offerConfig.includeInstallation ? {
        id: 'installation',
        name: 'Монтажни услуги',
        description: `Професионален монтаж на ${calculateTotalSquareMeters()} м²`,
        price: calculateTotalSquareMeters() * offerConfig.installationPrice
      } : undefined,
      terms: [
        'Условия за доставка: В рамките на София доставката е безплатна при поръчки над 1000 лв.',
        'Условия за плащане: 70% аванс при подписване на договор, 30% при доставка.',
        'Гаранция: 24 месеца гаранция върху всички предлагани продукти.',
        `Валидност на офертата: ${offerConfig.validityDays} дни от датата на изпращане.`,
        offerConfig.includeTransport ? `Транспорт: ${formatCurrency(offerConfig.transportPrice)}` : '',
        offerConfig.globalDiscount > 0 ? `Обща отстъпка: ${offerConfig.globalDiscount}%` : ''
      ].filter(term => term !== '')
    };
  };

  const handleHtmlPreview = async () => {
    try {
      setHtmlTemplateConfig(prev => ({ ...prev, isGenerating: true }));
      
      const templateData = generateOfferTemplateData();
      await htmlTemplateService.openHtmlPreview(htmlTemplateConfig.selectedTemplate, templateData);
      
      setHtmlTemplateConfig(prev => ({ 
        ...prev, 
        isGenerating: false, 
        showPreview: true 
      }));
    } catch (error) {
      console.error('Error generating HTML preview:', error);
      setHtmlTemplateConfig(prev => ({ ...prev, isGenerating: false }));
      alert('Грешка при генериране на HTML преглед');
    }
  };

  const handleHtmlDownload = async () => {
    try {
      setHtmlTemplateConfig(prev => ({ ...prev, isGenerating: true }));
      
      const templateData = generateOfferTemplateData();
      const filename = `offer_${project?.name || 'project'}_${Date.now()}.html`;
      await htmlTemplateService.downloadHtmlOffer(htmlTemplateConfig.selectedTemplate, templateData, filename);
      
      setHtmlTemplateConfig(prev => ({ ...prev, isGenerating: false }));
    } catch (error) {
      console.error('Error downloading HTML offer:', error);
      setHtmlTemplateConfig(prev => ({ ...prev, isGenerating: false }));
      alert('Грешка при изтегляне на HTML оферта');
    }
  };

  const getStepConfig = (step) => {
    const configs = {
      1: { 
        title: 'Избор на варианти', 
        description: 'Изберете варианти за включване в офертата',
        icon: Package,
        color: 'orange'
      },
      2: { 
        title: 'Конфигурация', 
        description: 'Настройте условия и допълнителни услуги',
        icon: Settings,
        color: 'blue'
      },
      3: { 
        title: 'Email настройки', 
        description: 'Конфигурирайте изпращането на офертата',
        icon: Mail,
        color: 'green'
      },
      4: { 
        title: 'Преглед и изпращане', 
        description: 'Финализирайте и изпратете офертата',
        icon: Send,
        color: 'purple'
      }
    };
    return configs[step] || configs[1];
  };

  // Navigation functions
  const goToStep = (step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return selectedVariants.length > 0;
      case 2: return offerConfig.title && offerConfig.validityDays;
      case 3: return emailConfig.recipientEmail && emailConfig.subject;
      case 4: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden m-4 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Управление на оферти</h2>
              <p className="text-gray-600 text-lg">
                Генериране, редакция и изпращане на оферти за "{phase?.name}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 text-xl font-bold"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: 'generate', icon: Plus, label: 'Генериране', active: true },
            { id: 'existing', icon: FileText, label: 'Налични оферти' },
            { id: 'versions', icon: Package, label: 'Версии' },
            { id: 'tracking', icon: Target, label: 'Проследяване' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex h-[70vh]">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'generate' && (
              <div className="p-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-center space-x-4 mb-8">
                  {[1, 2, 3, 4].map((step) => {
                    const config = getStepConfig(step);
                    const isActive = currentStep === step;
                    const isCompleted = currentStep > step;
                    const Icon = config.icon;
                    
                    return (
                      <React.Fragment key={step}>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => goToStep(step)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 transform hover:scale-105 ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : isActive
                                ? `bg-${config.color}-500 text-white`
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
                          </button>
                          <div className="text-center">
                            <div className={`font-medium ${isActive ? `text-${config.color}-600` : 'text-gray-600'}`}>
                              {config.title}
                            </div>
                            <div className="text-xs text-gray-500">{config.description}</div>
                          </div>
                        </div>
                        {step < 4 && (
                          <div className={`w-12 h-1 rounded ${
                            currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                          }`}></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Step Content */}
                <div className="max-h-[50vh] overflow-y-auto">
                  {/* Step 1: Variant Selection */}
                  {currentStep === 1 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                        <Package size={28} className="text-orange-500" />
                        <span>Избор на варианти за офертата</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {variants.map((variant) => (
                          <div
                            key={variant.id}
                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                              selectedVariants.includes(variant.id)
                                ? 'border-orange-500 bg-orange-50 shadow-md'
                                : variant.status === 'ready'
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-300 bg-gray-50'
                            }`}
                            onClick={() => {
                              if (variant.status === 'ready') {
                                setSelectedVariants(prev => 
                                  prev.includes(variant.id)
                                    ? prev.filter(id => id !== variant.id)
                                    : [...prev, variant.id]
                                );
                              }
                            }}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-gray-900 text-lg">{variant.name}</h4>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedVariants.includes(variant.id)
                                  ? 'border-orange-500 bg-orange-500'
                                  : variant.status === 'ready'
                                  ? 'border-green-500 bg-white'
                                  : 'border-gray-300 bg-gray-200'
                              }`}>
                                {selectedVariants.includes(variant.id) && (
                                  <CheckCircle size={16} className="text-white" />
                                )}
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex justify-between">
                                <span>Статус:</span>
                                <span className={`font-medium ${
                                  variant.status === 'ready' ? 'text-green-700' : 'text-gray-700'
                                }`}>
                                  {variant.status === 'ready' ? 'Готов' : 'В процес'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Стаи:</span>
                                <span className="font-medium">{variant.rooms?.length || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Продукти:</span>
                                <span className="font-medium">
                                  {variant.rooms?.reduce((sum, room) => sum + (room.products?.length || 0), 0) || 0}
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-2">
                                <span>Стойност:</span>
                                <span className="font-bold text-gray-900">
                                  {formatCurrency(calculateVariantTotal(variant.id))}
                                </span>
                              </div>
                            </div>
                            {variant.status !== 'ready' && (
                              <div className="mt-2 text-xs text-red-600 italic">
                                Само готови варианти могат да бъдат включени в оферта
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Selected Summary */}
                      {selectedVariants.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                            <CheckCircle size={20} className="text-blue-600" />
                            <span>Избрани варианти за офертата:</span>
                          </h4>
                          <div className="space-y-3">
                            {selectedVariants.map((variantId) => {
                              const variant = variants.find(v => v.id === variantId);
                              if (!variant) return null;
                              return (
                                <div key={variant.id} className="flex items-center justify-between text-blue-800 bg-white p-3 rounded-lg shadow-sm">
                                  <div className="flex items-center space-x-3">
                                    <Package size={16} className="text-blue-600" />
                                    <span className="font-medium">{variant.name}</span>
                                  </div>
                                  <span className="font-bold">{formatCurrency(calculateVariantTotal(variant.id))}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div className="border-t border-blue-200 mt-4 pt-4 bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between font-bold text-blue-900">
                              <span className="text-lg">Обща стойност:</span>
                              <span className="text-2xl text-green-700">
                                {formatCurrency(calculateOfferTotal())}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Offer Configuration */}
                  {currentStep === 2 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                        <Settings size={28} className="text-blue-500" />
                        <span>Конфигурация на офертата</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Basic Settings */}
                        <div className="space-y-6">
                          <div className="bg-gray-50 p-6 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <Edit size={20} className="text-gray-600" />
                              <span>Основни настройки</span>
                            </h4>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Заглавие на офертата
                                </label>
                                <input
                                  type="text"
                                  value={offerConfig.title}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, title: e.target.value }))}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Валидност (дни)
                                </label>
                                <select 
                                  value={offerConfig.validityDays}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, validityDays: parseInt(e.target.value) }))}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  <option value={7}>7 дни</option>
                                  <option value={15}>15 дни</option>
                                  <option value={30}>30 дни</option>
                                  <option value={60}>60 дни</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Общо намаление (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={offerConfig.globalDiscount}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, globalDiscount: parseFloat(e.target.value) || 0 }))}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Additional Services */}
                          <div className="bg-green-50 p-6 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <Zap size={20} className="text-green-600" />
                              <span>Допълнителни услуги</span>
                            </h4>
                            
                            <div className="space-y-4">
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={offerConfig.includeInstallation}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, includeInstallation: e.target.checked }))}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-gray-700">Включи монтаж</span>
                              </label>
                              
                              {offerConfig.includeInstallation && (
                                <div className="ml-6">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Цена монтаж (лв/м²)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={offerConfig.installationPrice}
                                    onChange={(e) => setOfferConfig(prev => ({ ...prev, installationPrice: parseFloat(e.target.value) || 0 }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                </div>
                              )}

                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={offerConfig.includeTransport}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, includeTransport: e.target.checked }))}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-gray-700">Включи транспорт</span>
                              </label>
                              
                              {offerConfig.includeTransport && (
                                <div className="ml-6">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Цена транспорт (лв)
                                  </label>
                                  <input
                                    type="number"
                                    value={offerConfig.transportPrice}
                                    onChange={(e) => setOfferConfig(prev => ({ ...prev, transportPrice: parseFloat(e.target.value) || 0 }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                </div>
                              )}

                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={offerConfig.includeArchitectCommission}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, includeArchitectCommission: e.target.checked }))}
                                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-gray-700">Включи комисиона на архитект</span>
                              </label>
                              
                              {offerConfig.includeArchitectCommission && (
                                <div className="ml-6">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Комисиона (%)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    value={offerConfig.architectCommission}
                                    onChange={(e) => setOfferConfig(prev => ({ ...prev, architectCommission: parseFloat(e.target.value) || 0 }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Terms & Preview */}
                        <div className="space-y-6">
                          <div className="bg-purple-50 p-6 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <FileText size={20} className="text-purple-600" />
                              <span>Условия</span>
                            </h4>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Условия за плащане
                                </label>
                                <select 
                                  value={offerConfig.paymentTerms}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, paymentTerms: e.target.value }))}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                  <option value="advance_100">100% предплата</option>
                                  <option value="advance_50">50% предплата, 50% при доставка</option>
                                  <option value="delivery">Плащане при доставка</option>
                                  <option value="net_30">Нет 30 дни</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Срок за доставка
                                </label>
                                <select 
                                  value={offerConfig.deliveryTerms}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, deliveryTerms: e.target.value }))}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                  <option value="immediately">Веднага от склад</option>
                                  <option value="3_days">3 работни дни</option>
                                  <option value="7_days">7 работни дни</option>
                                  <option value="14_days">14 работни дни</option>
                                  <option value="30_days">30 работни дни</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Допълнителни бележки
                                </label>
                                <textarea
                                  value={offerConfig.notes}
                                  onChange={(e) => setOfferConfig(prev => ({ ...prev, notes: e.target.value }))}
                                  rows={4}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  placeholder="Добавете специални условия, забележки или инструкции..."
                                />
                              </div>
                            </div>
                          </div>

                          {/* Real-time Preview */}
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <Calculator size={20} className="text-blue-600" />
                              <span>Калкулация в реално време</span>
                            </h4>
                            
                            <div className="space-y-3 bg-white p-4 rounded-lg">
                              <div className="flex justify-between text-sm">
                                <span>Стойност варианти:</span>
                                <span className="font-medium">
                                  {formatCurrency(selectedVariants.reduce((total, variantId) => total + calculateVariantTotal(variantId), 0))}
                                </span>
                              </div>
                              
                              {offerConfig.globalDiscount > 0 && (
                                <div className="flex justify-between text-sm text-red-600">
                                  <span>Общо намаление ({offerConfig.globalDiscount}%):</span>
                                  <span className="font-medium">
                                    -{formatCurrency(selectedVariants.reduce((total, variantId) => total + calculateVariantTotal(variantId), 0) * offerConfig.globalDiscount / 100)}
                                  </span>
                                </div>
                              )}
                              
                              {offerConfig.includeInstallation && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Монтаж ({calculateTotalSquareMeters()} м² × {offerConfig.installationPrice} лв):</span>
                                  <span className="font-medium">
                                    +{formatCurrency(calculateTotalSquareMeters() * offerConfig.installationPrice)}
                                  </span>
                                </div>
                              )}
                              
                              {offerConfig.includeTransport && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Транспорт:</span>
                                  <span className="font-medium">+{formatCurrency(offerConfig.transportPrice)}</span>
                                </div>
                              )}
                              
                              {offerConfig.includeArchitectCommission && (
                                <div className="flex justify-between text-sm text-green-600">
                                  <span>Комисиона архитект ({offerConfig.architectCommission}%):</span>
                                  <span className="font-medium">
                                    +{formatCurrency((selectedVariants.reduce((total, variantId) => total + calculateVariantTotal(variantId), 0) * (1 - offerConfig.globalDiscount / 100)) * offerConfig.architectCommission / 100)}
                                  </span>
                                </div>
                              )}
                              
                              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                <span>Общо за плащане:</span>
                                <span className="text-green-700">{formatCurrency(calculateOfferTotal())}</span>
                              </div>
                            </div>
                          </div>

                          {/* HTML Template Preview */}
                          <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl border border-orange-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <Globe size={20} className="text-orange-600" />
                              <span>HTML версия на офертата</span>
                            </h4>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Избери HTML шаблон
                                </label>
                                <select
                                  value={htmlTemplateConfig.selectedTemplate}
                                  onChange={(e) => setHtmlTemplateConfig(prev => ({ 
                                    ...prev, 
                                    selectedTemplate: e.target.value 
                                  }))}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                  {AVAILABLE_TEMPLATES.map(template => (
                                    <option key={template.id} value={template.id}>
                                      {template.name} - {template.description}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="flex space-x-3">
                                <button
                                  onClick={handleHtmlPreview}
                                  disabled={htmlTemplateConfig.isGenerating}
                                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                                >
                                  {htmlTemplateConfig.isGenerating ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Генериране...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={16} />
                                      <span>Преглед HTML версия</span>
                                    </>
                                  )}
                                </button>
                                
                                <button
                                  onClick={handleHtmlDownload}
                                  disabled={htmlTemplateConfig.isGenerating}
                                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                                >
                                  {htmlTemplateConfig.isGenerating ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      <span>Генериране...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download size={16} />
                                      <span>Изтегли HTML</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="text-xs text-gray-600 bg-white p-3 rounded-lg">
                                <strong>Информация:</strong> HTML версията включва всички избрани варианти, 
                                цени и условия. Можете да я прегледате в браузъра или да я изтеглите като файл.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Email Configuration */}
                  {currentStep === 3 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                        <Mail size={28} className="text-green-500" />
                        <span>Email настройки</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Email Recipients */}
                        <div className="space-y-6">
                          <div className="bg-gray-50 p-6 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <User size={20} className="text-gray-600" />
                              <span>Получатели</span>
                            </h4>
                            
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Email на клиента
                                </label>
                                <input
                                  type="email"
                                  value={emailConfig.recipientEmail}
                                  onChange={(e) => setEmailConfig(prev => ({ ...prev, recipientEmail: e.target.value }))}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CC (копие до)
                                </label>
                                <input
                                  type="text"
                                  value={emailConfig.ccEmails}
                                  onChange={(e) => setEmailConfig(prev => ({ ...prev, ccEmails: e.target.value }))}
                                  placeholder="email1@example.com, email2@example.com"
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Тема на съобщението
                                </label>
                                <input
                                  type="text"
                                  value={emailConfig.subject}
                                  onChange={(e) => setEmailConfig(prev => ({ ...prev, subject: e.target.value }))}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Email Options */}
                          <div className="bg-blue-50 p-6 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <Settings size={20} className="text-blue-600" />
                              <span>Опции</span>
                            </h4>
                            
                            <div className="space-y-4">
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={emailConfig.sendCopy}
                                  onChange={(e) => setEmailConfig(prev => ({ ...prev, sendCopy: e.target.checked }))}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">Изпрати копие до мен</span>
                              </label>

                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={emailConfig.scheduleDelivery}
                                  onChange={(e) => setEmailConfig(prev => ({ ...prev, scheduleDelivery: e.target.checked }))}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">Насрочи изпращането</span>
                              </label>

                              {emailConfig.scheduleDelivery && (
                                <div className="ml-6">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата на изпращане
                                  </label>
                                  <input
                                    type="date"
                                    value={emailConfig.deliveryDate}
                                    onChange={(e) => setEmailConfig(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              )}

                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={emailConfig.includeAttachments}
                                  onChange={(e) => setEmailConfig(prev => ({ ...prev, includeAttachments: e.target.checked }))}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">Прикачи PDF файл</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Email Message */}
                        <div className="space-y-6">
                          <div className="bg-green-50 p-6 rounded-xl">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <Edit size={20} className="text-green-600" />
                              <span>Съобщение</span>
                            </h4>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Текст на съобщението
                              </label>
                              <textarea
                                value={emailConfig.message}
                                onChange={(e) => setEmailConfig(prev => ({ ...prev, message: e.target.value }))}
                                rows={12}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Въведете съобщението..."
                              />
                            </div>
                          </div>

                          {/* Email Preview */}
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <Eye size={20} className="text-gray-600" />
                              <span>Преглед на email</span>
                            </h4>
                            
                            <div className="bg-white p-4 rounded-lg border text-sm">
                              <div className="border-b pb-3 mb-3">
                                <div><strong>До:</strong> {emailConfig.recipientEmail}</div>
                                {emailConfig.ccEmails && <div><strong>CC:</strong> {emailConfig.ccEmails}</div>}
                                <div><strong>Тема:</strong> {emailConfig.subject}</div>
                              </div>
                              <div className="whitespace-pre-wrap">{emailConfig.message}</div>
                              {emailConfig.includeAttachments && (
                                <div className="mt-3 pt-3 border-t text-gray-600">
                                  📎 Прикачен файл: {offerConfig.title}.pdf
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Review & Send */}
                  {currentStep === 4 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                        <Send size={28} className="text-purple-500" />
                        <span>Преглед и изпращане</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Final Summary */}
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-xl border border-purple-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                              <FileText size={20} className="text-purple-600" />
                              <span>Резюме на офертата</span>
                            </h4>
                            
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-lg">
                                <div className="font-medium text-gray-900 mb-2">{offerConfig.title}</div>
                                <div className="text-sm text-gray-600">
                                  Валидност: {offerConfig.validityDays} дни | Варианти: {selectedVariants.length}
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg">
                                <div className="font-medium text-gray-900 mb-2">Финансово резюме</div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Варианти:</span>
                                    <span>{formatCurrency(selectedVariants.reduce((total, variantId) => total + calculateVariantTotal(variantId), 0))}</span>
                                  </div>
                                  {offerConfig.includeInstallation && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Монтаж:</span>
                                      <span>+{formatCurrency(calculateTotalSquareMeters() * offerConfig.installationPrice)}</span>
                                    </div>
                                  )}
                                  {offerConfig.includeTransport && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Транспорт:</span>
                                      <span>+{formatCurrency(offerConfig.transportPrice)}</span>
                                    </div>
                                  )}
                                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Общо:</span>
                                    <span className="text-green-700">{formatCurrency(calculateOfferTotal())}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white p-4 rounded-lg">
                                <div className="font-medium text-gray-900 mb-2">Email настройки</div>
                                <div className="text-sm text-gray-600">
                                  <div>До: {emailConfig.recipientEmail}</div>
                                  <div>Тема: {emailConfig.subject}</div>
                                  {emailConfig.scheduleDelivery && (
                                    <div>Насрочено за: {emailConfig.deliveryDate}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center space-y-2 p-6 bg-white rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <Eye size={24} className="text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-900">Преглед PDF</span>
                              <span className="text-xs text-gray-600">Прегледай преди изпращане</span>
                            </button>
                            
                            <button className="flex flex-col items-center space-y-2 p-6 bg-white rounded-xl hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200">
                              <div className="p-3 bg-green-100 rounded-lg">
                                <Download size={24} className="text-green-600" />
                              </div>
                              <span className="font-medium text-gray-900">Свали PDF</span>
                              <span className="text-xs text-gray-600">Свали локално</span>
                            </button>
                            
                            <button className="flex flex-col items-center space-y-2 p-6 bg-white rounded-xl hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200">
                              <div className="p-3 bg-orange-100 rounded-lg">
                                <Save size={24} className="text-orange-600" />
                              </div>
                              <span className="font-medium text-gray-900">Запази черновa</span>
                              <span className="text-xs text-gray-600">Запази за по-късно</span>
                            </button>
                            
                            <button className="flex flex-col items-center space-y-2 p-6 bg-white rounded-xl hover:bg-purple-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200">
                              <div className="p-3 bg-purple-100 rounded-lg">
                                <Copy size={24} className="text-purple-600" />
                              </div>
                              <span className="font-medium text-gray-900">Дуплицирай</span>
                              <span className="text-xs text-gray-600">Създай копие</span>
                            </button>
                          </div>
                        </div>

                        {/* PDF Preview Mockup */}
                        <div className="bg-gray-100 p-6 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <FileText size={20} className="text-gray-600" />
                            <span>Преглед на офертата</span>
                          </h4>
                          
                          <div className="bg-white shadow-lg rounded-lg p-6 text-sm">
                            <div className="text-center mb-6">
                              <h2 className="text-xl font-bold text-gray-900">PARKETSENSE</h2>
                              <div className="text-gray-600">{offerConfig.title}</div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
                              <div>
                                <h3 className="font-semibold mb-2">КЛИЕНТ:</h3>
                                <div>{project?.client?.name || 'Неизвестен клиент'}</div>
                                <div>{project?.client?.email || 'Няма email'}</div>
                                <div>{project?.client?.phone || 'Няма телефон'}</div>
                              </div>
                              <div>
                                <h3 className="font-semibold mb-2">ПРОЕКТ:</h3>
                                <div>{project?.name || 'Неизвестен проект'}</div>
                                <div>{project?.address || 'Няма адрес'}</div>
                                <div>Фаза: {phase?.name || 'Неизвестна фаза'}</div>
                              </div>
                            </div>

                            <div className="mb-6">
                              <h3 className="font-semibold mb-3">ИЗБРАНИ ВАРИАНТИ:</h3>
                              <div className="space-y-2 text-xs">
                                {selectedVariants.map((variantId) => {
                                  const variant = variants.find(v => v.id === variantId);
                                  if (!variant) return null;
                                  return (
                                    <div key={variant.id} className="flex justify-between border-b pb-1">
                                      <span>{variant.name}</span>
                                      <span className="font-medium">{formatCurrency(calculateVariantTotal(variant.id))}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex justify-between font-bold text-base">
                                <span>ОБЩО ЗА ПЛАЩАНЕ:</span>
                                <span className="text-green-700">{formatCurrency(calculateOfferTotal())}</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Валидност: {offerConfig.validityDays} дни от датата на издаване
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Footer */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                      currentStep === 1
                        ? 'border border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft size={20} />
                    <span>Назад</span>
                  </button>
                  
                  <div className="flex items-center space-x-4">
                    {currentStep < 4 ? (
                      <button
                        onClick={nextStep}
                        disabled={!canProceedToNextStep()}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-xl transition-all duration-200 font-medium ${
                          canProceedToNextStep()
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <span>Напред</span>
                        <ChevronRight size={20} />
                      </button>
                    ) : (
                      <button
                        className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <Send size={20} />
                        <span>Изпрати офертата</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Other Tab Contents */}
            {activeTab === 'existing' && (
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Налични оферти</h3>
                <div className="text-center text-gray-500 py-12">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Няма налични оферти за тази фаза</p>
                </div>
              </div>
            )}

            {activeTab === 'versions' && (
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Версии на офертите</h3>
                <div className="text-center text-gray-500 py-12">
                  <Package size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Няма налични версии</p>
                </div>
              </div>
            )}

            {activeTab === 'tracking' && (
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Проследяване на оферти</h3>
                <div className="text-center text-gray-500 py-12">
                  <Target size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Няма данни за проследяване</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Live Stats */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Статистики в реално време</h4>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Package size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Избрани варианти</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{selectedVariants.length}</div>
                <div className="text-xs text-gray-500">от {variants.length} общо</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Euro size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Обща стойност</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateOfferTotal()).replace(' лв.', '')}
                </div>
                <div className="text-xs text-gray-500">лв. вкл. услуги</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Home size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Общо стаи</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedVariants.reduce((total, variantId) => {
                    const variant = variants.find(v => v.id === variantId);
                    return total + (variant?.rooms?.length || 0);
                  }, 0)}
                </div>
                <div className="text-xs text-gray-500">във варианти</div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Package size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Общо продукти</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {selectedVariants.reduce((total, variantId) => {
                    const variant = variants.find(v => v.id === variantId);
                    return total + (variant?.rooms?.reduce((sum, room) => sum + (room.products?.length || 0), 0) || 0);
                  }, 0)}
                </div>
                <div className="text-xs text-gray-500">в офертата</div>
              </div>

              {currentStep >= 2 && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Настройки</div>
                  <div className="space-y-1 text-xs text-gray-600">
                    {offerConfig.includeInstallation && <div>✓ Монтаж включен</div>}
                    {offerConfig.includeTransport && <div>✓ Транспорт включен</div>}
                    {offerConfig.includeArchitectCommission && <div>✓ Комисиона включена</div>}
                    {offerConfig.globalDiscount > 0 && <div>✓ Общо намаление {offerConfig.globalDiscount}%</div>}
                    <div>✓ Валидност {offerConfig.validityDays} дни</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedOfferModal;