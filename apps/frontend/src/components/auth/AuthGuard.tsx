'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, UserCheck } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
}

export default function AuthGuard({ 
  children, 
  requiredPermissions = [], 
  fallback 
}: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // For now, we'll simulate authentication check
      // In a real app, you would check JWT tokens, session, etc.
      
      // Simulate API call to check authentication
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        setIsAuthenticated(false);
        setHasPermissions(false);
        setLoading(false);
        return;
      }

      // Simulate permission check
      const userPermissions = ['read:offers', 'write:offers', 'read:clients', 'write:clients'];
      const hasRequiredPermissions = requiredPermissions.length === 0 || 
        requiredPermissions.every(permission => userPermissions.includes(permission));

      setIsAuthenticated(true);
      setHasPermissions(hasRequiredPermissions);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setHasPermissions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Redirect to login page
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Проверка на достъпа...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Доступът е ограничен
            </h2>
            <p className="text-gray-600 mb-6">
              За да достъпите тази страница, трябва да сте влезли в системата.
            </p>
            <button
              onClick={handleLogin}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Влез в системата
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermissions) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Недостатъчни права
            </h2>
            <p className="text-gray-600 mb-6">
              Нямате необходимите права за достъп до тази страница.
            </p>
            <button
              onClick={() => router.back()}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 