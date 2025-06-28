import React, { useState } from 'react';
import { 
  Search, Plus, Edit, Trash2, Eye, Save, X, Check, 
  AlertCircle, CheckCircle, Info, Upload, Download,
  ChevronDown, ChevronRight, Filter, MoreHorizontal,
  Star, Calendar, Clock, User, Building2, Phone, Mail
} from 'lucide-react';

const DesignSystemDemo = () => {
  const [activeTab, setActiveTab] = useState('colors');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'individual'
  });

  // Design System Constants
  const colors = {
    primary: '#2563eb',
    secondary: '#64748b', 
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  };

  const spacing = {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px'
  };

  // Component Library
  const Button = ({ variant = 'primary', size = 'md', children, icon, disabled, ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
      secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    return (
      <button 
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    );
  };

  const Input = ({ label, error, success, required, icon, ...props }) => (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500' : success ? 'border-green-300 focus:ring-green-500' : 'border-gray-300 focus:ring-blue-500'}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 flex items-center">
          <CheckCircle className="w-4 h-4 mr-1" />
          {success}
        </p>
      )}
    </div>
  );

  const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-2xl',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl'
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>
          
          <div className={`inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  };

  const Card = ({ title, subtitle, children, actions }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {actions && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          {actions}
        </div>
      )}
    </div>
  );

  const Badge = ({ variant = 'gray', children }) => {
    const variants = {
      gray: 'bg-gray-100 text-gray-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
        {children}
      </span>
    );
  };

  const Alert = ({ variant = 'info', title, children }) => {
    const variants = {
      info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Info, iconColor: 'text-blue-400', titleColor: 'text-blue-800', textColor: 'text-blue-700' },
      success: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-400', titleColor: 'text-green-800', textColor: 'text-green-700' },
      warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle, iconColor: 'text-yellow-400', titleColor: 'text-yellow-800', textColor: 'text-yellow-700' },
      error: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, iconColor: 'text-red-400', titleColor: 'text-red-800', textColor: 'text-red-700' }
    };

    const { bg, border, icon: Icon, iconColor, titleColor, textColor } = variants[variant];

    return (
      <div className={`rounded-md p-4 ${bg} ${border} border`}>
        <div className="flex">
          <Icon className={`w-5 h-5 ${iconColor} mt-0.5`} />
          <div className="ml-3">
            {title && <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>}
            <div className={`text-sm ${textColor} ${title ? 'mt-2' : ''}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Sample Client Data
  const mockClients = [
    { id: 1, name: 'Иван Петров', company: null, phone: '+359888123456', email: 'ivan@example.com', projects: 3, isArchitect: false },
    { id: 2, name: 'Мария Георгиева', company: 'Дизайн Студио ЕООД', phone: '+359899987654', email: 'maria@design.bg', projects: 7, isArchitect: true },
    { id: 3, name: 'Петър Стоянов', company: 'Стоянов Интериор', phone: null, email: 'petar@company.com', projects: 1, isArchitect: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PS</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">PARKETSENSE Design System</h1>
            </div>
            <Badge variant="blue">v2.0</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'colors', label: 'Цветове' },
              { id: 'components', label: 'Компоненти' },
              { id: 'forms', label: 'Форми' },
              { id: 'tables', label: 'Таблици' },
              { id: 'modals', label: 'Модали' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'colors' && (
          <div className="space-y-8">
            <Card title="Цветова палитра" subtitle="Основни цветове на PARKETSENSE ERP">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(colors).filter(([key]) => key !== 'gray').map(([name, color]) => (
                  <div key={name} className="text-center">
                    <div 
                      className="w-full h-20 rounded-lg mb-2 shadow-sm"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="text-sm font-medium capitalize">{name}</div>
                    <div className="text-xs text-gray-500">{color}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="text-md font-medium mb-4">Gray Scale</h4>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {Object.entries(colors.gray).map(([shade, color]) => (
                    <div key={shade} className="text-center">
                      <div 
                        className="w-full h-12 rounded mb-1"
                        style={{ backgroundColor: color }}
                      ></div>
                      <div className="text-xs">{shade}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-8">
            {/* Buttons */}
            <Card title="Бутони" subtitle="Различни варианти и състояния">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                    Създай
                  </Button>
                  <Button variant="secondary" icon={<Edit className="w-4 h-4" />}>
                    Редактирай
                  </Button>
                  <Button variant="success" icon={<Check className="w-4 h-4" />}>
                    Запази
                  </Button>
                  <Button variant="danger" icon={<Trash2 className="w-4 h-4" />}>
                    Изтрий
                  </Button>
                  <Button variant="ghost" icon={<Eye className="w-4 h-4" />}>
                    Прегледай
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button size="sm">Малък</Button>
                  <Button size="md">Среден</Button>
                  <Button size="lg">Голям</Button>
                  <Button disabled>Неактивен</Button>
                </div>
              </div>
            </Card>

            {/* Badges and Alerts */}
            <Card title="Badges & Alerts">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Статус badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="gray">Чернова</Badge>
                    <Badge variant="blue">Изпратена</Badge>
                    <Badge variant="green">Платена</Badge>
                    <Badge variant="yellow">Просрочена</Badge>
                    <Badge variant="red">Отказана</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Alert съобщения</h4>
                  <div className="space-y-3">
                    <Alert variant="info" title="Информация">
                      Системата е обновена до версия 2.0
                    </Alert>
                    <Alert variant="success" title="Успех">
                      Офертата е изпратена успешно
                    </Alert>
                    <Alert variant="warning" title="Внимание">
                      Тази поръчка има забавяне
                    </Alert>
                    <Alert variant="error" title="Грешка">
                      Възникна проблем при запазването
                    </Alert>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="space-y-8">
            <Card title="Форми и входни полета" subtitle="Стандартизирани форми с валидации">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input 
                    label="Име" 
                    placeholder="Въведете име"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  
                  <Input 
                    label="Email" 
                    type="email"
                    placeholder="example@company.com"
                    icon={<Mail className="w-4 h-4" />}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    success={formData.email.includes('@') ? "Валиден email" : undefined}
                    error={formData.email && !formData.email.includes('@') ? "Невалиден email формат" : undefined}
                  />

                  <Input 
                    label="Телефон" 
                    placeholder="+359888123456"
                    icon={<Phone className="w-4 h-4" />}
                  />

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Тип клиент <span className="text-red-500">*</span>
                    </label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="individual">Физическо лице</option>
                      <option value="company">Фирма</option>
                      <option value="architect">Архитект</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Бележки</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Допълнителна информация..."
                    ></textarea>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Качване на файл</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Пуснете файл или кликнете за качване</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="primary" icon={<Save className="w-4 h-4" />}>
                      Запази
                    </Button>
                    <Button variant="secondary">
                      Отказ
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'tables' && (
          <div className="space-y-8">
            <Card title="Таблици с данни" subtitle="Standardized data tables с действия">
              <div className="space-y-4">
                {/* Table Controls */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Търсене..."
                      />
                    </div>
                    <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
                      Филтри
                    </Button>
                  </div>
                  <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                    Нов клиент
                  </Button>
                </div>

                {/* Table */}
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Клиент
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Контакти
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Проекти
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Статус
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Действия</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockClients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-800">
                                    {client.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {client.name}
                                  {client.isArchitect && <Star className="w-4 h-4 text-yellow-400 ml-2" />}
                                </div>
                                {client.company && (
                                  <div className="text-sm text-gray-500">{client.company}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {client.phone && <div>{client.phone}</div>}
                              <div className="text-gray-500">{client.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {client.projects}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={client.isArchitect ? "yellow" : "gray"}>
                              {client.isArchitect ? "Архитект" : "Стандартен"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50">
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
            </Card>
          </div>
        )}

        {activeTab === 'modals' && (
          <div className="space-y-8">
            <Card title="Модални прозорци" subtitle="Стандартизирани модали за различни действия">
              <div className="space-y-4">
                <Button onClick={() => setIsModalOpen(true)}>
                  Отвори модал
                </Button>

                <Alert variant="info">
                  Моралите следват стандартни принципи:
                  <ul className="list-disc ml-6 mt-2">
                    <li>Максимална ширина според съдържанието</li>
                    <li>Backdrop blur effect</li>
                    <li>Smooth animations</li>
                    <li>Keyboard navigation (ESC за затваряне)</li>
                    <li>Focus management</li>
                  </ul>
                </Alert>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Sample Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Създаване на нов клиент"
        size="md"
      >
        <div className="space-y-4">
          <Input 
            label="Име и фамилия" 
            placeholder="Иван Петров"
            required
          />
          
          <Input 
            label="Email" 
            type="email"
            placeholder="ivan@example.com"
            icon={<Mail className="w-4 h-4" />}
          />

          <Input 
            label="Телефон" 
            placeholder="+359888123456"
            icon={<Phone className="w-4 h-4" />}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Тип клиент
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Физическо лице</option>
              <option>Фирма</option>
              <option>Архитект</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Отказ
            </Button>
            <Button variant="primary" icon={<Save className="w-4 h-4" />}>
              Запази
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DesignSystemDemo;