'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const GlobalNavigation = () => {
  const pathname = usePathname();
  
  // Don't show navigation on home page
  if (pathname === '/') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Link href="/">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors font-medium border-2 border-white"
          title="Към началната страница"
        >
          🏠 Начало
        </button>
      </Link>
    </div>
  );
};

export default GlobalNavigation; 