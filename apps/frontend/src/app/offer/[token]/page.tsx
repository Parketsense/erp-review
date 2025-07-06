import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { verifyOfferTokenWithDetails, OfferTokenError } from '@/lib/auth/jwt';
import { interactiveOffersApi } from '@/lib/api/offers';
import InteractiveOfferPage from '@/components/offers/interactive/InteractiveOfferPage';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// SEO metadata generation
export async function generateMetadata({ 
  params 
}: { 
  params: { token: string } 
}): Promise<Metadata> {
  try {
    const { valid, payload, error } = await verifyOfferTokenWithDetails(params.token);
    
    if (!valid || !payload) {
      return {
        title: 'Оферта не е налична | PARKETSENSE ERP',
        description: 'Офертата не е налична или е изтекла.',
        robots: 'noindex, nofollow'
      };
    }

    // Try to fetch offer data for better SEO
    try {
      const offerData = await interactiveOffersApi.getClientOffer(params.token, payload.offerId);
      const projectName = offerData.offer.projectName || offerData.project.name;
      
      return {
        title: `${projectName} - Оферта | PARKETSENSE ERP`,
        description: `Интерактивна оферта за проект: ${projectName}. Преглед на варианти, цени и спецификации.`,
        keywords: ['оферта', 'проект', 'варианти', 'цени', 'спецификации'],
        openGraph: {
          title: `${projectName} - Оферта`,
          description: `Интерактивна оферта за проект: ${projectName}`,
          type: 'website',
          locale: 'bg_BG',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${projectName} - Оферта`,
          description: `Интерактивна оферта за проект: ${projectName}`,
        }
      };
    } catch (error) {
      // Fallback metadata if offer data can't be fetched
      return {
        title: 'Интерактивна оферта | PARKETSENSE ERP',
        description: 'Преглед на интерактивна оферта с варианти и цени.',
        keywords: ['оферта', 'проект', 'варианти', 'цени'],
      };
    }
  } catch (error) {
    return {
      title: 'Оферта не е налична | PARKETSENSE ERP',
      description: 'Офертата не е налична или е изтекла.',
      robots: 'noindex, nofollow'
    };
  }
}

// Viewport configuration
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1f2937'
};

// Loading component
function OfferLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="large" />
        <h2 className="mt-4 text-xl font-semibold text-slate-700">
          Зареждане на офертата...
        </h2>
        <p className="mt-2 text-slate-500">
          Моля, изчакайте докато се заредят данните
        </p>
      </div>
    </div>
  );
}

// Error component
function OfferError({ error }: { error: OfferTokenError }) {
  const getErrorMessage = (code: OfferTokenError['code']) => {
    switch (code) {
      case 'EXPIRED':
        return {
          title: 'Офертата е изтекла',
          message: 'Срокът на валидност на тази оферта е изтекъл. Моля, свържете се с нас за нова оферта.',
          action: 'Свържете се с нас'
        };
      case 'INVALID':
        return {
          title: 'Невалидна оферта',
          message: 'Тази оферта не е валидна или е била променена.',
          action: 'Проверете връзката'
        };
      case 'MALFORMED':
        return {
          title: 'Невалидна връзка',
          message: 'Връзката към офертата е повредена.',
          action: 'Проверете връзката'
        };
      default:
        return {
          title: 'Грешка при зареждане',
          message: 'Възникна грешка при зареждане на офертата.',
          action: 'Опитайте отново'
        };
    }
  };

  const errorInfo = getErrorMessage(error.code);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {errorInfo.title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {errorInfo.message}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {errorInfo.action}
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Назад
          </button>
        </div>
        
        {error.code === 'EXPIRED' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              За нова оферта моля се свържете с нас на:{' '}
              <a href="mailto:info@parketsense.com" className="font-semibold hover:underline">
                info@parketsense.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Main offer page component
async function OfferPageContent({ token }: { token: string }) {
  // Verify token
  const { valid, payload, error } = await verifyOfferTokenWithDetails(token);
  
  if (!valid || !payload) {
    if (error?.code === 'EXPIRED') {
      redirect('/offer/expired');
    } else if (error?.code === 'INVALID' || error?.code === 'MALFORMED') {
      redirect('/offer/invalid');
    } else {
      notFound();
    }
  }

  // Fetch offer data
  let offerData;
  try {
    offerData = await interactiveOffersApi.getClientOffer(token, payload.offerId);
  } catch (error) {
    console.error('Failed to fetch offer data:', error);
    throw new Error('Failed to load offer data');
  }

  // Validate that the offer belongs to the client in the token
  if (offerData.offer.clientId !== payload.clientId) {
    console.error('Token client ID mismatch:', {
      tokenClientId: payload.clientId,
      offerClientId: offerData.offer.clientId
    });
    redirect('/offer/invalid');
  }

  return (
    <InteractiveOfferPage
      token={token}
      offerId={payload.offerId}
    />
  );
}

// Main page component
export default function OfferPage({ 
  params 
}: { 
  params: { token: string } 
}) {
  return (
    <Suspense fallback={<OfferLoading />}>
      <OfferPageContent token={params.token} />
    </Suspense>
  );
}

// Error boundary for the page
export function generateStaticParams() {
  // This ensures the page is statically generated
  return [];
} 