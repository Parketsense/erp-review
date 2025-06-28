import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  address?: string;
  notes?: string;
  isArchitect: boolean;
  commission: number;
  createdAt: string;
  updatedAt: string;
  projects: number;
}

interface ClientsListProps {
  clients: Client[];
}

export const ClientsList: React.FC<ClientsListProps> = ({ clients }) => {
  const navigate = useNavigate();

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-gray-500 text-lg mb-2">Няма намерени клиенти</div>
        <p className="text-gray-400">Опитайте да промените филтрите или да добавите нов клиент</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-4 text-left font-medium text-gray-600 border-b-2 border-gray-200">Име</th>
            <th className="px-6 py-4 text-left font-medium text-gray-600 border-b-2 border-gray-200">Фирма</th>
            <th className="px-6 py-4 text-left font-medium text-gray-600 border-b-2 border-gray-200">Телефон</th>
            <th className="px-6 py-4 text-left font-medium text-gray-600 border-b-2 border-gray-200">Email</th>
            <th className="px-6 py-4 text-left font-medium text-gray-600 border-b-2 border-gray-200">Проекти</th>
            <th className="px-6 py-4 text-left font-medium text-gray-600 border-b-2 border-gray-200">Последна активност</th>
            <th className="px-6 py-4 text-left font-medium text-gray-600 border-b-2 border-gray-200">Действия</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50 cursor-pointer border-b border-gray-100">
              <td className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    {client.firstName} {client.lastName}
                    {client.isArchitect && (
                      <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        Архитект {client.commission}%
                      </span>
                    )}
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-600 text-sm"
                    title="История на промените"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('История за клиент:', client.id);
                    }}
                  >
                    📋
                  </button>
                </div>
              </td>
              <td className="px-6 py-4">
                {client.companyName || '-'}
              </td>
              <td className="px-6 py-4">
                {client.phone || '-'}
              </td>
              <td className="px-6 py-4">
                {client.email || '-'}
              </td>
              <td className="px-6 py-4">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {client.projects}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">
                {new Date(client.updatedAt).toLocaleDateString('bg-BG')}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clients/${client.id}`);
                    }}
                  >
                    Детайли
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/clients/${client.id}/edit`);
                    }}
                  >
                    Редакция
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <span className="text-gray-600">Показани: {clients.length} клиенти</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white">←</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-white">→</button>
        </div>
      </div>
    </div>
  );
}; 