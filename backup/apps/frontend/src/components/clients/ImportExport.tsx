import React, { useState, useRef } from 'react';

interface ImportExportProps {
  onImport: (data: any[]) => void;
  onExport: () => void;
  totalClients: number;
}

export const ImportExport: React.FC<ImportExportProps> = ({ onImport, onExport, totalClients }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        // Simulate import progress
        const interval = setInterval(() => {
          setImportProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              setIsImporting(false);
              onImport(data);
              return 100;
            }
            return prev + 10;
          });
        }, 100);
      } catch (error) {
        console.error('Error parsing file:', error);
        setIsImporting(false);
        alert('Грешка при четене на файла. Моля, проверете формата.');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    onExport();
  };

  const downloadTemplate = () => {
    const template = [
      {
        firstName: "Иван",
        lastName: "Сивков",
        email: "ivan@example.com",
        phone: "+359888123456",
        companyName: "Архитектурно студио ЕООД",
        eik: "123456789",
        vatNumber: "BG123456789",
        address: "ул. Примерна 1, София",
        notes: "Примерни бележки",
        isArchitect: true,
        commission: 10
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clients-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-lg">
          📊
        </div>
        <h2 className="text-xl font-medium">Импорт / Експорт</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Импортиране на клиенти</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {isImporting ? (
                <div className="text-center">
                  <div className="text-blue-600 mb-2">Импортиране...</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{importProgress}%</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-2">📁</div>
                  <div className="text-gray-600">Кликнете за избор на файл</div>
                  <div className="text-sm text-gray-400 mt-1">Поддържа JSON формат</div>
                </div>
              )}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={downloadTemplate}
              className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              📥 Изтегли шаблон за импорт
            </button>
          </div>

          <div className="text-sm text-gray-600">
            <p>• Поддържа JSON формат</p>
            <p>• Максимум 1000 клиента наведнъж</p>
            <p>• Автоматично валидиране на данните</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Експортиране на клиенти</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📤 Експортирай всички клиенти ({totalClients})
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                📊 Excel (.xlsx)
              </button>
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                📄 PDF отчет
              </button>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-sm text-yellow-800">
                <strong>💡 Съвет:</strong> Експортирайте данните преди голями промени в системата
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>• Включва всички полета на клиентите</p>
            <p>• Автоматично форматиране</p>
            <p>• Архивиране на експортираните файлове</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Последна активност</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Експорт на клиенти</span>
            <span className="text-gray-400">преди 2 часа</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Импорт на 15 клиента</span>
            <span className="text-gray-400">вчера</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Експорт на архитекти</span>
            <span className="text-gray-400">преди 3 дни</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 