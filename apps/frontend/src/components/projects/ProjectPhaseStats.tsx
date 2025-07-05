import React from 'react';
import { 
  Calendar, 
  CheckCircle, 
  FileText, 
  Users 
} from 'lucide-react';
import { ProjectPhase } from '@/services/phasesApi';

interface ProjectPhaseStatsProps {
  phases: ProjectPhase[];
}

export default function ProjectPhaseStats({ phases }: ProjectPhaseStatsProps) {
  const stats = {
    total: phases.length,
    won: phases.filter(p => p.status === 'won').length,
    quoted: phases.filter(p => p.status === 'quoted').length,
    withArchitect: phases.filter(p => p.includeArchitectCommission).length
  };

  const statCards = [
    {
      title: 'Фази',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Спечелени',
      value: stats.won,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Оферирани',
      value: stats.quoted,
      icon: FileText,
      color: 'bg-orange-100 text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'С архитект',
      value: stats.withArchitect,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 group"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-105 transition-transform duration-200`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-black">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {stat.title}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 