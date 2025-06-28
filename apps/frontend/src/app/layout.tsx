import type { Metadata } from "next";
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingProvider } from '../components/LoadingProvider';
import { validateEnvironment, APP_CONFIG } from '../lib/env';
import "./globals.css";

// Validate environment on startup
if (typeof window === 'undefined') {
  validateEnvironment();
}

export const metadata: Metadata = {
  title: "PARKETSENSE ERP v2.0",
  description: "Професионална система за управление на паркетна компания",
  keywords: "паркет, ERP, управление, склад, продукти, клиенти",
  authors: [{ name: "PARKETSENSE" }],
  robots: {
    index: false, // Disable indexing for internal ERP system
    follow: false,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  other: {
    'application-name': APP_CONFIG.name,
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1a1a1a" />
        <meta name="color-scheme" content="light" />
      </head>
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
        margin: 0,
        padding: 0,
        background: '#f8f9fa',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}>
        <ErrorBoundary>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </ErrorBoundary>
        
        {/* Development Tools */}
        {APP_CONFIG.isDev && (
          <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            zIndex: 10000,
            fontFamily: 'monospace',
          }}>
            {APP_CONFIG.env} v{APP_CONFIG.version}
          </div>
        )}
      </body>
    </html>
  );
}
