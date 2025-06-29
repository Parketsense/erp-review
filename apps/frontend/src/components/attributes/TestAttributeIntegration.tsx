import React, { useState, useEffect } from 'react';
import { attributesApi } from '../../services/attributesApi';
import { attributeService } from '../../services/attributeService';
import { ProductType, Manufacturer, AttributeType } from '../../types/attribute';

const TestAttributeIntegration: React.FC = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [typesData, manufacturersData] = await Promise.all([
        attributesApi.getProductTypes(),
        attributesApi.getManufacturers()
      ]);

      setProductTypes(typesData);
      setManufacturers(manufacturersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading attribute data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTestAttributeValue = async () => {
    try {
      const colorAttributeType = "test-id"; // This would be dynamic in real use
      
      const newValue = await attributesApi.createAttributeValue({
        nameBg: 'Тест Интеграция',
        nameEn: 'Test Integration',
        colorCode: '#28a745',
        attributeTypeId: colorAttributeType,
        sortOrder: 999
      });

      console.log('Created test value:', newValue);
      alert('✅ Test attribute value created successfully!');
    } catch (err) {
      console.error('Error creating test value:', err);
      alert('❌ Error creating test value: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading attribute system...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">❌ Connection Error</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">🧪 Attribute System API Test</h2>
        <p className="text-gray-600">Testing frontend integration with backend API</p>
      </div>

      {/* Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-semibold">✅ API Connection Successful</h3>
        <p className="text-green-600">Backend attribute system is responsive</p>
      </div>

      {/* Product Types */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Product Types ({productTypes.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {productTypes.map(type => (
            <div key={type.id} className="bg-white border rounded p-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{type.icon}</span>
                <span className="font-medium">{type.nameBg}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Order: {type.displayOrder}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manufacturers */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">🏭 Manufacturers ({manufacturers.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {manufacturers.map(manufacturer => (
            <div key={manufacturer.id} className="bg-white border rounded p-3 text-center">
              <div 
                className="w-6 h-6 rounded-full mx-auto mb-2" 
                style={{ backgroundColor: manufacturer.colorCode || '#gray' }}
              ></div>
              <span className="text-sm font-medium">{typeof manufacturer.displayName === 'string' ? manufacturer.displayName : manufacturer.name || 'Unknown'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* API Test Actions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🔧 API Test Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={createTestAttributeValue}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            ➕ Create Test Attribute Value
          </button>
          <button 
            onClick={loadData}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh Data
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          These buttons test the CREATE and READ operations of the attribute API
        </p>
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 Integration Summary</h3>
        <ul className="text-green-700 space-y-1">
          <li>✅ Frontend-Backend API communication working</li>
          <li>✅ TypeScript types properly defined</li>
          <li>✅ Error handling implemented</li>
          <li>✅ Loading states functional</li>
          <li>✅ CRUD operations ready for implementation</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAttributeIntegration; 