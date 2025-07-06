'use client';

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Clock, 
  User, 
  FileText, 
  Eye,
  ArrowRight,
  Calendar,
  Tag
} from 'lucide-react';

interface OfferVersion {
  id: string;
  versionNumber: number;
  offerNumber: string;
  createdAt: string;
  createdBy: string;
  status: string;
  changes: string[];
  totalValue: number;
}

interface OfferVersionsListProps {
  parentOfferId: string;
  onVersionSelect?: (versionId: string) => void;
}

export default function OfferVersionsList({
  parentOfferId,
  onVersionSelect
}: OfferVersionsListProps) {
  const [versions, setVersions] = useState<OfferVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  useEffect(() => {
    if (parentOfferId) {
      loadVersions();
    }
  }, [parentOfferId]);

  const loadVersions = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to get versions
      // const response = await offersApi.getOfferVersions(parentOfferId);
      // setVersions(response);
      
      // Mock data for now
      setVersions([
        {
          id: '1',
          versionNumber: 1.0,
          offerNumber: 'OFF-2024-001',
          createdAt: '2024-01-15T10:00:00Z',
          createdBy: 'Иван Петров',
          status: 'sent',
          changes: ['Първоначална версия'],
          totalValue: 15000
        },
        {
          id: '2',
          versionNumber: 1.1,
          offerNumber: 'OFF-2024-001',
          createdAt: '2024-01-16T14:30:00Z',
          createdBy: 'Мария Георгиева',
          status: 'draft',
          changes: ['Добавен нов вариант', 'Коригирана цена'],
          totalValue: 16500
        }
      ]);
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('bg-BG')} лв.`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Чернова',
      sent: 'Изпратена',
      viewed: 'Видяна',
      accepted: 'Приета',
      expired: 'Изтекла'
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <GitBranch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Няма версии</h3>
          <p className="mt-1 text-sm text-gray-500">
            Тази оферта няма предишни версии
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">История на версиите</h3>
          </div>
          <span className="text-sm text-gray-500">
            {versions.length} версии
          </span>
        </div>
      </div>

      {/* Versions Timeline */}
      <div className="p-6">
        <div className="space-y-6">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`relative ${
                index < versions.length - 1 ? 'pb-6' : ''
              }`}
            >
              {/* Timeline line */}
              {index < versions.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
              )}

              {/* Version card */}
              <div
                className={`relative bg-gray-50 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-100 ${
                  selectedVersion === version.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => {
                  setSelectedVersion(version.id);
                  onVersionSelect?.(version.id);
                }}
              >
                <div className="flex items-start space-x-4">
                  {/* Version indicator */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Version content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          Версия {version.versionNumber}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(version.status)}`}>
                          {getStatusText(version.status)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(version.totalValue)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(version.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {version.createdBy}
                      </div>
                    </div>

                    {/* Changes */}
                    {version.changes.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Промени:</h5>
                        <ul className="space-y-1">
                          {version.changes.map((change, changeIndex) => (
                            <li key={changeIndex} className="text-xs text-gray-600 flex items-start">
                              <ArrowRight className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersionSelect?.(version.id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Преглед на версията"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Последна версия: {versions[0]?.versionNumber}
          </span>
          <span className="text-gray-900 font-medium">
            Обща стойност: {formatCurrency(versions[0]?.totalValue || 0)}
          </span>
        </div>
      </div>
    </div>
  );
} 