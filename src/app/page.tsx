'use client';

import { useState } from 'react';
import ClientsList from '../components/clients/ClientsList';
import AttributeManagement from '../components/attributes/AttributeManagement';
import ProductCreateForm from '../components/products/ProductCreateForm';
import ProductEditModal from '../components/products/ProductEditModal';
import { productsApi } from '../services/productsApi';
import { CreateProductDto } from '../types/product';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Import the interface from the component to avoid conflicts
interface ProductFormData {
  // Basic Information
  productType: string;
  code: string;
  supplier: string;
  manufacturer: string;
  
  // Additional Information
  unit: string;
  packageSize: string;
  active: boolean;
  recommended: boolean;
  newProduct: boolean;
  
  // Generated Names
  nameBg: string;
  nameEn: string;
  
  // Dynamic Attributes
  attributes: Record<string, unknown>;
  
  // Media
  images: File[];
  documents: File[];
  videoUrl: string;
  models3d: File[];
  textures: File[];
  
  // Pricing
  autoPricing: boolean;
  costEur: number;
  costBgn: number;
  saleBgn: number;
  saleEur: number;
  markup: number;
}

// Interface for the edit modal
interface Product {
  id: string;
  code: string;
  nameBg: string;
  nameEn: string;
  productType: string;
  manufacturer: string;
  supplier: string;
  unit: string;
  packageSize: string;
  active: boolean;
  recommended: boolean;
  newProduct: boolean;
  attributes: Record<string, string | number>;
  costEur: number;
  costBgn: number;
  saleBgn: number;
  saleEur: number;
  markup: number;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [showClients, setShowClients] = useState(false);
  const [showAttributes, setShowAttributes] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);

  // Mock product data for demo
  const mockProduct: Product = {
    id: '1',
    code: 'HX-EL-NAT-15120',
    nameBg: 'Hickx Elegance Дъб натурален 15x120x1200 Рустик',
    nameEn: 'Hickx Elegance Oak Natural 15x120x1200 Rustic',
    productType: 'parquet',
    manufacturer: 'hickx',
    supplier: 'Hickx Bulgaria',
    unit: 'm2',
    packageSize: '2.4 кв.м',
    active: true,
    recommended: true,
    newProduct: false,
    attributes: {
      construction_type: 'engineered',
      wood_type: 'oak',
      finish: 'natural',
      color: 'natural-oak',
      thickness: 15,
      width: 120,
      length: 1200,
      collection: 'elegance'
    },
    costEur: 45.50,
    costBgn: 89.02,
    saleBgn: 115.73,
    saleEur: 59.15,
    markup: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const handleSaveProduct = async (productData: ProductFormData) => {
    try {
      // Convert ProductFormData to CreateProductDto
      const productDto: CreateProductDto = {
        code: productData.code || `PROD-${Date.now()}`, // Generate code if empty
        nameBg: productData.nameBg,
        nameEn: productData.nameEn,
        productTypeId: productData.productType,
        manufacturerId: productData.manufacturer,
        supplier: productData.supplier,
        unit: productData.unit || 'm2',
        packageSize: productData.packageSize,
        costEur: productData.costEur,
        costBgn: productData.costBgn,
        saleBgn: productData.saleBgn,
        saleEur: productData.saleEur,
        markup: productData.markup,
        isActive: productData.active,
        isRecommended: productData.recommended,
        isNew: productData.newProduct,
        videoUrl: productData.videoUrl,
        attributes: Object.entries(productData.attributes || {}).map(([attributeTypeId, value]) => ({
          attributeTypeId,
          attributeValueId: typeof value === 'string' ? value : undefined,
          customValue: typeof value !== 'string' ? String(value) : undefined
        }))
      };

      // Prepare files for upload
      const files = {
        images: productData.images || [],
        documents: productData.documents || [],
        models3d: productData.models3d || [],
        textures: productData.textures || [],
      };

      // Check if we have any files to upload
      const hasFiles = Object.values(files).some(fileArray => fileArray.length > 0);

      let createdProduct;
      if (hasFiles) {
        createdProduct = await productsApi.createWithFiles(productDto, files);
      } else {
        createdProduct = await productsApi.create(productDto);
      }

      alert(`Продуктът "${createdProduct.nameBg}" е създаден успешно${hasFiles ? ' с прикачени файлове' : ''}!`);
    } catch (error) {
      alert(`Грешка при създаване на продукта: ${error instanceof Error ? error.message : 'Неизвестна грешка'}`);
    }
  };

  const handleSaveEditedProduct = async (productData: Product) => {
    // TODO: Implement product update
  };

  if (showClients) {
    return (
      <ErrorBoundary>
        <ClientsList />
      </ErrorBoundary>
    );
  }

  if (showAttributes) {
    return (
      <ErrorBoundary>
        <AttributeManagement 
          isOpen={true}
          onClose={() => setShowAttributes(false)}
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{
        padding: '40px',
        background: 'var(--background-light)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="card" style={{
          padding: '60px',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            color: 'var(--primary-black)',
            fontWeight: '700'
          }}>
            PARKETSENSE ERP v2.0
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '40px',
            fontSize: '1.1rem'
          }}>
            Професионална система за управление на паркетна компания
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <button
              onClick={() => setShowClients(true)}
              className="btn-primary"
              style={{
                padding: '20px 30px',
                fontSize: '16px',
                fontWeight: '500',
                minWidth: 'auto'
              }}
            >
              👥 Клиенти
            </button>

            <button
              onClick={() => setShowCreateProduct(true)}
              className="btn-primary"
              style={{
                padding: '20px 30px',
                fontSize: '16px',
                fontWeight: '500',
                minWidth: 'auto'
              }}
            >
              ➕ Създай продукт
            </button>

            <button
              onClick={() => setShowEditProduct(true)}
              className="btn-secondary"
              style={{
                padding: '20px 30px',
                fontSize: '16px',
                fontWeight: '500',
                minWidth: 'auto'
              }}
            >
              ✏️ Редактирай продукт
            </button>

            <button
              onClick={() => setShowAttributes(true)}
              className="btn-secondary"
              style={{
                padding: '20px 30px',
                fontSize: '16px',
                fontWeight: '500',
                minWidth: 'auto'
              }}
            >
              ⚙️ Атрибути
            </button>
          </div>

          <div className="text-small" style={{ color: 'var(--text-secondary)' }}>
            Изберете модул за работа
          </div>
        </div>
      </div>

      {/* Modals */}
      <ErrorBoundary>
        <ProductCreateForm
          isOpen={showCreateProduct}
          onClose={() => setShowCreateProduct(false)}
          onSave={handleSaveProduct}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <ProductEditModal
          isOpen={showEditProduct}
          onClose={() => setShowEditProduct(false)}
          onSave={handleSaveEditedProduct}
          product={mockProduct}
        />
      </ErrorBoundary>
    </ErrorBoundary>
  );
} 