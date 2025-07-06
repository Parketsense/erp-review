'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  Clock, 
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { adminOffersApi } from '@/lib/api/admin/offers';

interface OfferAnalyticsProps {
  offerId: string;
}

interface AnalyticsData {
  views: number;
  uniqueViews: number;
  timeSpent: number;
  lastViewed: string | null;
  interactions: Array<{
    type: string;
    timestamp: string;
    data: any;
  }>;
}

export function OfferAnalytics({ offerId }: OfferAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [offerId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminOffersApi.getOfferAnalytics(offerId);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждането на аналитиката');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}м ${remainingSeconds}с`;
    }
    return `${remainingSeconds} секунди`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'download':
        return <BarChart3 className="w-4 h-4 text-green-500" />;
      case 'print':
        return <Activity className="w-4 h-4 text-purple-500" />;
      case 'share':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getInteractionText = (type: string) => {
    switch (type) {
      case 'view':
        return 'Преглед';
      case 'download':
        return 'Изтегляне';
      case 'print':
        return 'Принтиране';
      case 'share':
        return 'Споделяне';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Зареждане на аналитика...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-red-800">Грешка: {error}</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Няма данни за аналитика</h3>
        <p className="mt-1 text-sm text-gray-500">
          Аналитиката ще се появи след първия преглед на офертата.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Аналитика на офертата</h3>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Последните 7 дни</option>
            <option value="30d">Последните 30 дни</option>
            <option value="90d">Последните 90 дни</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Общи прегледи</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.views}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+12%</span>
                <span className="text-sm text-gray-500 ml-1">от миналия месец</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Уникални прегледи</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.uniqueViews}</p>
              <div className="flex items-center mt-1">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+8%</span>
                <span className="text-sm text-gray-500 ml-1">от миналия месец</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Средно време</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(analytics.timeSpent)}
              </p>
              <div className="flex items-center mt-1">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+15%</span>
                <span className="text-sm text-gray-500 ml-1">от миналия месец</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Rate */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Ниво на ангажираност</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analytics.views > 0 ? Math.round((analytics.uniqueViews / analytics.views) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500">Връщане</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analytics.interactions.filter(i => i.type === 'download').length}
            </div>
            <div className="text-sm text-gray-500">Изтегляния</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analytics.interactions.filter(i => i.type === 'print').length}
            </div>
            <div className="text-sm text-gray-500">Принтирания</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analytics.interactions.filter(i => i.type === 'share').length}
            </div>
            <div className="text-sm text-gray-500">Споделяния</div>
          </div>
        </div>
      </div>

      {/* Last Viewed */}
      {analytics.lastViewed && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Последен преглед</h4>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
            <span className="text-gray-900">{formatDate(analytics.lastViewed)}</span>
          </div>
        </div>
      )}

      {/* Interactions Timeline */}
      {analytics.interactions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">История на взаимодействията</h4>
          <div className="space-y-3">
            {analytics.interactions.slice(0, 10).map((interaction, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getInteractionIcon(interaction.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {getInteractionText(interaction.type)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(interaction.timestamp)}
                  </p>
                </div>
                {interaction.data && (
                  <div className="text-xs text-gray-500">
                    {interaction.data.details || ''}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {analytics.interactions.length > 10 && (
            <div className="mt-4 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Виж всички взаимодействия ({analytics.interactions.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Инсайти за производителността</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Най-добри часове</h5>
            <p className="text-sm text-gray-600">
              Офертата се преглежда най-често между 10:00 и 14:00 часа
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Най-активни дни</h5>
            <p className="text-sm text-gray-600">
              Вторник и четвъртък са дните с най-много прегледи
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Средно време за преглед</h5>
            <p className="text-sm text-gray-600">
              Клиентите прекарват средно {formatTime(analytics.timeSpent)} в преглед на офертата
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-2">Ниво на интерес</h5>
            <p className="text-sm text-gray-600">
              Високо ниво на интерес според времето за преглед и взаимодействията
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Препоръки</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-700">
              Офертата показва добро ниво на ангажираност. Помислете за следване с клиента.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-700">
              Времето за преглед е над средното - клиентът показва сериозен интерес.
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <p className="text-sm text-gray-700">
              Помислете за персонализирано последване базирано на взаимодействията.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 