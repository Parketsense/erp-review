import type { Metadata } from "next";
import { ErrorBoundary } from '../components/ErrorBoundary';
import "./globals.css";

export const metadata: Metadata = {
  title: "PARKETSENSE ERP v2.0",
  description: "Професионална система за управление на паркетна компания",
  keywords: "паркет, ERP, управление, склад, продукти, клиенти",
  authors: [{ name: "PARKETSENSE" }],
  robots: {
    index: false, // Disable indexing for internal ERP system
    follow: false,
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
      </head>
      <body style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
        margin: 0,
        padding: 0,
        background: '#f8f9fa'
      }}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
} 