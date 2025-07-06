'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Plus, Building2, User } from 'lucide-react';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useLoading } from '../../../components/LoadingProvider';
import { apiClient } from '../../../lib/api';
import { OfferCreateForm } from '../../../components/offers/admin/OfferCreateForm';
import { CreateOfferDto } from '../../../types/offer';

// UUID validation function
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function CreateOfferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get pre-filled data from URL params (when creating from project)
  const projectIdParam = searchParams.get('projectId');
  const projectName = searchParams.get('projectName');
  const clientIdParam = searchParams.get('clientId');
  const clientName = searchParams.get('clientName');
  
  const [project, setProject] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showLoading, hideLoading } = useLoading('create-offer');

  // Load project and client data if IDs are provided
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load project data if projectId is provided
        if (projectIdParam) {
          showLoading('Зареждане на проект...');
          
          // Check if projectIdParam is already a valid UUID
          if (isValidUUID(projectIdParam)) {
            // Direct API call with UUID
            const response = await apiClient.get(`/projects/${projectIdParam}`) as { success: boolean; data: any };
            setProject(response.data);
            
            // If no clientId is provided, try to get client from project
            if (!clientIdParam && response.data.clientId) {
              try {
                const clientResponse = await apiClient.get(`/clients/${response.data.clientId}`) as { success: boolean; data: any };
                setClient(clientResponse.data);
              } catch (clientError) {
                console.warn('Could not load client from project:', clientError);
              }
            }
          } else {
            // Try to find project by slug or custom ID
            // First, try to get all projects and find the one with matching slug
            const projectsResponse = await apiClient.get('/projects') as { success: boolean; data: any[] };
            const foundProject = projectsResponse.data.find(p => 
              p.id === projectIdParam || 
              p.slug === projectIdParam || 
              p.name?.toLowerCase().includes(projectIdParam.toLowerCase())
            );
            
            if (foundProject) {
              setProject(foundProject);
              
              // If no clientId is provided, try to get client from project
              if (!clientIdParam && foundProject.clientId) {
                try {
                  const clientResponse = await apiClient.get(`/clients/${foundProject.clientId}`) as { success: boolean; data: any };
                  setClient(clientResponse.data);
                } catch (clientError) {
                  console.warn('Could not load client from project:', clientError);
                }
              }
            } else {
              setError(`Проект с ID "${projectIdParam}" не е намерен`);
            }
          }
        }
        
        // Load client data if clientId is provided
        if (clientIdParam) {
          showLoading('Зареждане на клиент...');
          
          // Check if clientIdParam is already a valid UUID
          if (isValidUUID(clientIdParam)) {
            // Direct API call with UUID
            const response = await apiClient.get(`/clients/${clientIdParam}`) as { success: boolean; data: any };
            setClient(response.data);
          } else {
            // Try to find client by slug or custom ID
            const clientsResponse = await apiClient.get('/clients') as { success: boolean; data: any[] };
            const foundClient = clientsResponse.data.find(c => 
              c.id === clientIdParam || 
              c.slug === clientIdParam || 
              `${c.firstName} ${c.lastName}`.toLowerCase().includes(clientIdParam.toLowerCase())
            );
            
            if (foundClient) {
              setClient(foundClient);
            } else {
              setError(`Клиент с ID "${clientIdParam}" не е намерен`);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Грешка при зареждане на данните');
      } finally {
        setLoading(false);
        hideLoading();
      }
    };

    loadData();
  }, [projectIdParam, clientIdParam]);

  const handleSaveOffer = async (offerData: CreateOfferDto) => {
    try {
      showLoading('Създаване на оферта...');
      
      const response = await apiClient.post('/offers', offerData) as { success: boolean; data: any };
      
      // Redirect to the newly created offer
      router.push(`/offers/${response.data.id}`);
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    } finally {
      hideLoading();
    }
  };

  const handleCancel = () => {
    // Go back to previous page or offers list
    if (projectIdParam) {
      router.push(`/projects/${projectIdParam}`);
    } else {
      router.push('/offers');
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm max-w-md">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Грешка</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/offers')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Назад към офертите
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане на данните...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Създаване на оферта</h1>
                <p className="text-gray-300 text-sm">
                  {project ? `Проект: ${project.name}` : 'Нова оферта'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <OfferCreateForm
            onSuccess={(offerId) => router.push(`/offers/${offerId}`)}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default function CreateOfferPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Зареждане...</p>
          </div>
        </div>
      }>
        <CreateOfferContent />
      </Suspense>
    </ErrorBoundary>
  );
} 