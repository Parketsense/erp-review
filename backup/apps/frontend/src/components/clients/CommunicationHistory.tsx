import React, { useState } from 'react';

interface Communication {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'message';
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  date: string;
  duration?: number; // for calls
  status: 'completed' | 'scheduled' | 'missed';
  clientId: number;
  clientName: string;
}

interface CommunicationHistoryProps {
  clientId?: number;
  clientName?: string;
  communications: Communication[];
  onAddCommunication: (communication: Omit<Communication, 'id'>) => void;
}

export const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  clientId,
  clientName,
  communications,
  onAddCommunication
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCommunication, setNewCommunication] = useState({
    type: 'call' as const,
    direction: 'outbound' as const,
    subject: '',
    content: '',
    status: 'completed' as const,
    duration: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !clientName) return;

    onAddCommunication({
      ...newCommunication,
      date: new Date().toISOString(),
      clientId,
      clientName
    });

    setNewCommunication({
      type: 'call',
      direction: 'outbound',
      subject: '',
      content: '',
      status: 'completed',
      duration: 0
    });
    setShowAddForm(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞';
      case 'email': return '📧';
      case 'meeting': return '🤝';
      case 'message': return '💬';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'missed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'inbound' ? '⬇️' : '⬆️';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg">
              💬
            </div>
            <h2 className="text-xl font-medium">История на комуникацията</h2>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            + Добави комуникация
          </button>
        </div>
      </div>

      {/* Add Communication Form */}
      {showAddForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип комуникация
                </label>
                <select
                  value={newCommunication.type}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="call">Обаждане</option>
                  <option value="email">Имейл</option>
                  <option value="meeting">Среща</option>
                  <option value="message">Съобщение</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Посока
                </label>
                <select
                  value={newCommunication.direction}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, direction: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="outbound">Изходяща</option>
                  <option value="inbound">Входяща</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тема
              </label>
              <input
                type="text"
                value={newCommunication.subject}
                onChange={(e) => setNewCommunication(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Тема на комуникацията"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Съдържание
              </label>
              <textarea
                value={newCommunication.content}
                onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Детайли за комуникацията..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  value={newCommunication.status}
                  onChange={(e) => setNewCommunication(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="completed">Завършена</option>
                  <option value="scheduled">Планирана</option>
                  <option value="missed">Пропусната</option>
                </select>
              </div>
              {newCommunication.type === 'call' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Продължителност (мин.)
                  </label>
                  <input
                    type="number"
                    value={newCommunication.duration}
                    onChange={(e) => setNewCommunication(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                💾 Запази
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Отказ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Communications List */}
      <div className="p-6">
        {communications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p>Няма комуникации за този клиент</p>
            <p className="text-sm">Добавете първата комуникация</p>
          </div>
        ) : (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div key={comm.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">
                      {getTypeIcon(comm.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comm.subject}</span>
                        <span className="text-sm text-gray-500">
                          {getDirectionIcon(comm.direction)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}>
                          {comm.status === 'completed' ? 'Завършена' : 
                           comm.status === 'scheduled' ? 'Планирана' : 'Пропусната'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{comm.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(comm.date).toLocaleString('bg-BG')}</span>
                        {comm.duration && (
                          <span>Продължителност: {comm.duration} мин.</span>
                        )}
                        <span>Клиент: {comm.clientName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      ✏️
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      {communications.length > 0 && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">Статистика</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{communications.length}</div>
              <div className="text-sm text-gray-600">Общо комуникации</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {communications.filter(c => c.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Завършени</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {communications.filter(c => c.type === 'call').length}
              </div>
              <div className="text-sm text-gray-600">Обаждания</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {communications.filter(c => c.type === 'email').length}
              </div>
              <div className="text-sm text-gray-600">Имейли</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 