'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Check, 
  Building2, 
  User, 
  FileText, 
  Mail,
  Calendar,
  Plus,
  Trash2
} from 'lucide-react';
import { OfferCreateForm } from '@/components/offers/admin/OfferCreateForm';
import { adminOffersApi } from '@/lib/api/admin/offers';
import { Project } from '@/types/project';
import { Client } from '@/types/client';

const steps = [
  { id: 1, name: 'Избор на проект', icon: Building2 },
  { id: 2, name: 'Клиент', icon: User },
  { id: 3, name: 'Детайли', icon: FileText },
  { id: 4, name: 'Email', icon: Mail },
  { id: 5, name: 'Преглед', icon: Check },
];

export default function CreateOfferPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    projectId: '',
    phaseId: '',
    variantId: '',
    clientId: '',
    offerNumber: '',
    subject: '',
    validUntil: '',
    conditions: '',
    emailSubject: '',
    emailBody: '',
  });

  // Available data
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, clientsResponse] = await Promise.all([
        adminOffersApi.getAvailableProjects(),
        adminOffersApi.getAvailableClients(),
      ]);
      
      setProjects(projectsResponse);
      setClients(clientsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при зареждането');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    setFormData(prev => ({ ...prev, projectId }));
    
    // Auto-generate offer number
    if (project) {
      const offerNumber = `OFF-${project.name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ 
        ...prev, 
        projectId,
        offerNumber,
        subject: `Оферта за проект: ${project.name}`
      }));
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    setFormData(prev => ({ ...prev, clientId }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const offer = await adminOffersApi.createOfferFromProject({
        projectId: formData.projectId,
        phaseId: formData.phaseId || undefined,
        variantId: formData.variantId || undefined,
        clientId: formData.clientId,
        offerNumber: formData.offerNumber,
        subject: formData.subject,
        validUntil: formData.validUntil,
        conditions: formData.conditions || undefined,
        emailSubject: formData.emailSubject || undefined,
        emailBody: formData.emailBody || undefined,
      });

      router.push(`/admin/offers/${offer.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Грешка при създаването');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return !!formData.projectId;
      case 2:
        return !!formData.clientId;
      case 3:
        return !!formData.offerNumber && !!formData.subject && !!formData.validUntil;
      case 4:
        return true; // Email is optional
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  if (loading && !projects.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Зареждане...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-light text-gray-900">Създаване на оферта</h1>
              <p className="text-gray-600">Следвайте стъпките за създаване на нова оферта</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => {
              const Icon = step.icon;
              const isCurrent = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const isUpcoming = step.id > currentStep;

              return (
                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} ${stepIdx !== 0 ? 'pl-8 sm:pl-20' : ''}`}>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  </div>
                  <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                    isCompleted ? 'bg-blue-600' : isCurrent ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <Icon className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                    )}
                    <span className="sr-only">{step.name}</span>
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                    <span className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800">Грешка: {error}</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {currentStep === 1 && (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Избор на проект</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.projectId === project.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.clientName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Избор на клиент</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleClientSelect(client.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.clientId === client.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Детайли на офертата</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер на оферта
                </label>
                <input
                  type="text"
                  value={formData.offerNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, offerNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тема
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Валидна до
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Условия (по желание)
                </label>
                <textarea
                  value={formData.conditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Въведете специални условия или забележки..."
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Email настройки</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тема на email
                </label>
                <input
                  type="text"
                  value={formData.emailSubject}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailSubject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Вашата оферта от PARKETSENSE"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Съдържание на email
                </label>
                <textarea
                  value={formData.emailBody}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailBody: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Въведете съдържание на email съобщението..."
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">Преглед на офертата</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">Проект</h3>
                  <p className="text-gray-600">{selectedProject?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Клиент</h3>
                  <p className="text-gray-600">
                    {selectedClient?.firstName} {selectedClient?.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Номер на оферта</h3>
                  <p className="text-gray-600">{formData.offerNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Тема</h3>
                  <p className="text-gray-600">{formData.subject}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Валидна до</h3>
                  <p className="text-gray-600">{formData.validUntil}</p>
                </div>
              </div>
              
              {formData.conditions && (
                <div>
                  <h3 className="font-medium text-gray-900">Условия</h3>
                  <p className="text-gray-600">{formData.conditions}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Назад
        </button>
        
        <div className="flex space-x-4">
          {currentStep < steps.length ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Напред
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !isStepValid(currentStep)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Създаване...' : 'Създай оферта'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 