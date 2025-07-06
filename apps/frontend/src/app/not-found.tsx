export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">404 - Страницата не е намерена</h2>
      <p className="text-gray-600 mb-4">Страницата, която търсите, не съществува.</p>
      <a 
        href="/" 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Назад към началната страница
      </a>
    </div>
  );
} 