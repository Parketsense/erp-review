'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExpiredOfferPage() {
  const router = useRouter();

  useEffect(() => {
    // Автоматично пренасочване към контакт форма след 10 секунди
    const timeout = setTimeout(() => {
      router.push('/contact');
    }, 10000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8 text-center border-t-4 border-yellow-400">
        <h1 className="text-3xl font-bold text-yellow-600 mb-4">Офертата е изтекла</h1>
        <p className="text-lg text-gray-700 mb-4">
          Съжаляваме, но тази оферта вече не е активна. Ако желаете, можем да подготвим нова оферта специално за Вас.
        </p>
        <p className="text-gray-600 mb-6">
          Моля, свържете се с нашия екип за съдействие или използвайте контактната форма. Ще бъдете автоматично пренасочени след 10 секунди.
        </p>
        <a href="/contact" className="inline-block px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 font-medium transition">Свържете се с нас</a>
        <div className="mt-6 text-sm text-gray-500">
          <div>Телефон: <a href="tel:+359888123456" className="text-blue-600 hover:underline">+359 888 123 456</a></div>
          <div>Email: <a href="mailto:office@parketsense.bg" className="text-blue-600 hover:underline">office@parketsense.bg</a></div>
        </div>
      </div>
    </div>
  );
} 