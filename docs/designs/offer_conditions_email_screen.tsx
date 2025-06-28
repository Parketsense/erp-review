import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Send, 
  FileText, 
  Mail, 
  Settings,
  Clock,
  CheckCircle,
  Edit3,
  AlertCircle,
  Copy
} from 'lucide-react';

const OfferConditionsEmailScreen = () => {
  const [activeTab, setActiveTab] = useState('conditions');
  const [conditions, setConditions] = useState([
    { id: 1, text: 'Условия за доставка: В рамките на София доставката е безплатна при поръчки над 1000 лв.' },
    { id: 2, text: 'Условия за плащане: 70% аванс при подписване на договор, 30% при доставка.' },
    { id: 3, text: 'Условия за съхранение: Продуктите се съхраняват в сух склад при температура 15-25°C.' },
    { id: 4, text: 'Гаранция: 24 месеца гаранция върху всички предлагани продукти.' },
    { id: 5, text: 'Валидност на офертата: 30 дни от датата на изпращане.' }
  ]);

  const [emailText, setEmailText] = useState(`Здравейте {{client.name}},

Радваме се да Ви изпратим нашата оферта за проект "{{project.name}}".

Офертата включва всички обсъдени продукти и услуги, с детайлни спецификации и цени.

Моля, за да разгледате офертата, последвайте този линк: {{offer.link}}

Офертата е валидна до {{offer.expires_date}}.

За въпроси или допълнителна информация не се колебайте да се свържете с нас.

С уважение,
{{user.name}}
PARKETSENSE
Телефон: +359 2 123 4567
Email: office@parketsense.bg`);

  const [sentHistory, setSentHistory] = useState([
    { id: 1, sentAt: '2024-06-20 14:30', version: 1, recipient: 'ivan.petrov@email.bg' },
    { id: 2, sentAt: '2024-06-21 09:15', version: 2, recipient: 'ivan.petrov@email.bg' }
  ]);

  // Demo data
  const offer = {
    id: 1,
    project: 'Къща Иванови',
    client: 'Иван Петров',
    phase: 'Етаж 1 - Продажба',
    variant: 'Рибена кост - Дъб натурал',
    totalValue: 12850.50,
    status: 'draft',
    sentCount: sentHistory.length
  };

  const mergeFields = [
    { key: '{{client.name}}', description: 'Име на клиента' },
    { key: '{{client.company}}', description: 'Фирма на клиента' },
    { key: '{{project.name}}', description: 'Име на проекта' },
    { key: '{{project.address}}', description: 'Адрес на проекта' },
    { key: '{{offer.link}}', description: 'Линк към офертата' },
    { key: '{{offer.expires_date}}', description: 'Дата на валидност' },
    { key: '{{offer.total}}', description: 'Обща стойност' },
    { key: '{{user.name}}', description: 'Име на потребителя' },
    { key: '{{user.phone}}', description: 'Телефон на потребителя' },
    { key: '{{company.name}}', description: 'Име на фирмата' },
    { key: '{{company.phone}}', description: 'Телефон на фирмата' },
    { key: '{{company.email}}', description: 'Email на фирмата' }
  ];

  const handleAddCondition = () => {
    const newId = Math.max(...conditions.map(c => c.id)) + 1;
    setConditions([...conditions, { id: newId, text: '' }]);
  };

  const handleDeleteCondition = (conditionId) => {
    if (window.confirm('Сигурни ли сте, че искате да премахнете това условие?')) {
      setConditions(conditions.filter(c => c.id !== conditionId));
    }
  };

  const handleUpdateCondition = (conditionId, newText) => {
    setConditions(conditions.map(c => 
      c.id === conditionId ? { ...c, text: newText } : c
    ));
  };

  const insertMergeField = (field) => {
    const textarea = document.getElementById('emailTextarea');
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const newText = emailText.substring(0, startPos) + field + emailText.substring(endPos);
    setEmailText(newText);
    
    // Reset focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(startPos + field.length, startPos + field.length);
    }, 0);
  };

  const handlePreview = () => {
    // In real app, this would open preview modal/page
    console.log('Opening preview...');
    alert('Отваря се преглед на офертата...');
  };

  const handleSendOffer = () => {
    if (window.confirm('Сигурни ли сте, че искате да изпратите офертата?')) {
      const newVersion = sentHistory.length + 1;
      const newSent = {
        id: Date.now(),
        sentAt: new Date().toISOString().substring(0, 16).replace('T', ' '),
        version: newVersion,
        recipient: 'ivan.petrov@email.bg'
      };
      
      setSentHistory([...sentHistory, newSent]);
      alert(`Офертата беше изпратена успешно! (Версия ${newVersion})`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <nav className="flex items-center space-x-2 text-sm mb-1">
                  <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    {offer.project}
                  </button>
                  <span className="text-gray-500">/</span>
                  <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    {offer.client}
                  </button>
                  <span className="text-gray-500">/</span>
                  <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    {offer.phase}
                  </button>
                  <span className="text-gray-500">/</span>
                  <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                    {offer.variant}
                  </button>
                </nav>
                <h1 className="text-xl font-bold text-gray-900">
                  Подготовка на оферта
                </h1>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                  <span>💰 {offer.totalValue.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} лв</span>
                  <span>📧 Изпратена {offer.sentCount} пъти</span>
                </div>
              </div>
              
              {/* Send status */}
              <div className="text-right">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    offer.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    offer.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {offer.status === 'draft' && <Clock className="w-4 h-4 mr-1" />}
                    {offer.status === 'sent' && <Mail className="w-4 h-4 mr-1" />}
                    {offer.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {offer.status === 'draft' ? 'Чернова' : 
                     offer.status === 'sent' ? 'Изпратена' : 'Одобрена'}
                  </span>
                </div>
                {sentHistory.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Последно изпратена: {sentHistory[sentHistory.length - 1].sentAt}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and action buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Стаи
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePreview}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              Преглед
            </button>
            <button
              onClick={handleSendOffer}
              className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                offer.sentCount > 0 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Send className="w-4 h-4 mr-2" />
              {offer.sentCount > 0 ? `Изпрати отново (${offer.sentCount + 1})` : 'Изпрати'}
              {offer.sentCount > 0 && (
                <span className="ml-2 bg-white text-yellow-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {offer.sentCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('conditions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conditions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Условия на офертата
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Текст на имейла
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              История ({sentHistory.length})
            </button>
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'conditions' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Условия на офертата
                </h3>
                <button
                  onClick={handleAddCondition}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добави условие
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Тези условия ще се покажат в края на офертата
              </p>
            </div>
            
            <div className="p-6">
              {conditions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Няма добавени условия</h3>
                  <p className="mb-4">Добавете условия за доставка, плащане, гаранция и др.</p>
                  <button
                    onClick={handleAddCondition}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добави първо условие
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={condition.text}
                          onChange={(e) => handleUpdateCondition(condition.id, e.target.value)}
                          placeholder="Въведете условие..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteCondition(condition.id)}
                        className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        title="Премахни условие"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email editor */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Текст на имейла
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Този текст ще бъде изпратен автоматично към клиента
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тема на имейла
                    </label>
                    <input
                      type="text"
                      defaultValue="Оферта за {{project.name}} - PARKETSENSE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Съдържание на имейла
                    </label>
                    <textarea
                      id="emailTextarea"
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      rows={16}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    />
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Линкът към офертата ще бъде генериран автоматично
                    </div>
                    <div className="text-sm text-gray-500">
                      {emailText.length} символа
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Merge fields */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Merge Fields
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Кликнете за вмъкване в текста
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {mergeFields.map((field) => (
                      <button
                        key={field.key}
                        onClick={() => insertMergeField(field.key)}
                        className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-mono text-sm text-blue-600 font-medium">
                              {field.key}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {field.description}
                            </div>
                          </div>
                          <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                История на изпращанията
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Всички изпратени версии на офертата
              </p>
            </div>
            
            <div className="p-6">
              {sentHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Mail className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Няма изпратени оферти</h3>
                  <p>Офертата все още не е била изпращана към клиента</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentHistory.map((sent) => (
                    <div key={sent.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">v{sent.version}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Версия {sent.version}
                          </div>
                          <div className="text-sm text-gray-500">
                            Изпратена на {sent.sentAt} до {sent.recipient}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Eye className="w-4 h-4 mr-2" />
                          Snapshot
                        </button>
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Send className="w-4 h-4 mr-2" />
                          Изпрати отново
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferConditionsEmailScreen;