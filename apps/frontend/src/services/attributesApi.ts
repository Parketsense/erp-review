import { ProductType, Manufacturer, AttributeValue, AttributeType, CreateAttributeValueDto, ApiResponse } from '../types/attribute';

const API_BASE_URL = 'http://localhost:4000/api';

class AttributesApiService {
  // Product Types
  async getProductTypes(): Promise<ProductType[]> {
    const response = await fetch(`${API_BASE_URL}/product-types`);
    if (!response.ok) {
      throw new Error('Failed to fetch product types');
    }
    
    const result: ApiResponse<ProductType[]> = await response.json();
    return result.data;
  }

  async getProductTypeById(id: string): Promise<ProductType> {
    const response = await fetch(`${API_BASE_URL}/product-types/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch product type');
    }
    
    const result: ApiResponse<ProductType> = await response.json();
    return result.data;
  }

  async getProductTypeAttributes(productTypeId: string): Promise<AttributeValue[]> {
    const response = await fetch(`${API_BASE_URL}/product-types/${productTypeId}/attributes`);
    if (!response.ok) {
      throw new Error('Failed to fetch product type attributes');
    }
    
    const result: ApiResponse<AttributeValue[]> = await response.json();
    return result.data;
  }

  async createProductType(productType: Partial<ProductType>): Promise<ProductType> {
    const response = await fetch(`${API_BASE_URL}/product-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productType),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product type');
    }
    
    const result: ApiResponse<ProductType> = await response.json();
    return result.data;
  }

  async updateProductType(id: string, productType: Partial<ProductType>): Promise<ProductType> {
    const response = await fetch(`${API_BASE_URL}/product-types/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productType),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product type');
    }
    
    const result: ApiResponse<ProductType> = await response.json();
    return result.data;
  }

  async deleteProductType(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/product-types/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product type');
    }
  }

  // Manufacturers
  async getManufacturers(): Promise<Manufacturer[]> {
    const response = await fetch(`${API_BASE_URL}/manufacturers`);
    if (!response.ok) {
      throw new Error('Failed to fetch manufacturers');
    }
    
    const result: ApiResponse<Manufacturer[]> = await response.json();
    return result.data;
  }

  async getManufacturerById(id: string): Promise<Manufacturer> {
    const response = await fetch(`${API_BASE_URL}/manufacturers/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch manufacturer');
    }
    
    const result: ApiResponse<Manufacturer> = await response.json();
    return result.data;
  }

  async createManufacturer(manufacturer: Partial<Manufacturer>): Promise<Manufacturer> {
    const response = await fetch(`${API_BASE_URL}/manufacturers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(manufacturer),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create manufacturer');
    }
    
    const result: ApiResponse<Manufacturer> = await response.json();
    return result.data;
  }

  async updateManufacturer(id: string, manufacturer: Partial<Manufacturer>): Promise<Manufacturer> {
    const response = await fetch(`${API_BASE_URL}/manufacturers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(manufacturer),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update manufacturer');
    }
    
    const result: ApiResponse<Manufacturer> = await response.json();
    return result.data;
  }

  async deleteManufacturer(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/manufacturers/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete manufacturer');
    }
  }

  // Attribute Values
  async getAttributeValues(params?: {
    attributeTypeId?: string;
    manufacturerId?: string;
    isActive?: boolean;
  }): Promise<AttributeValue[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.attributeTypeId) searchParams.append('attributeTypeId', params.attributeTypeId);
    if (params?.manufacturerId) searchParams.append('manufacturerId', params.manufacturerId);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

    const url = `${API_BASE_URL}/attribute-values${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch attribute values');
    }
    
    const result: ApiResponse<AttributeValue[]> = await response.json();
    return result.data;
  }

  async getAttributeValuesByManufacturer(manufacturerId: string): Promise<AttributeValue[]> {
    const response = await fetch(`${API_BASE_URL}/attribute-values/by-manufacturer/${manufacturerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attribute values by manufacturer');
    }
    
    const result: ApiResponse<AttributeValue[]> = await response.json();
    return result.data;
  }

  async getAttributeValueById(id: string): Promise<AttributeValue> {
    const response = await fetch(`${API_BASE_URL}/attribute-values/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attribute value');
    }
    
    const result: ApiResponse<AttributeValue> = await response.json();
    return result.data;
  }

  async createAttributeValue(attributeValue: CreateAttributeValueDto): Promise<AttributeValue> {
    const response = await fetch(`${API_BASE_URL}/attribute-values`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributeValue),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create attribute value');
    }
    
    const result: ApiResponse<AttributeValue> = await response.json();
    return result.data;
  }

  async updateAttributeValue(id: string, attributeValue: Partial<CreateAttributeValueDto>): Promise<AttributeValue> {
    const response = await fetch(`${API_BASE_URL}/attribute-values/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attributeValue),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update attribute value');
    }
    
    const result: ApiResponse<AttributeValue> = await response.json();
    return result.data;
  }

  async deleteAttributeValue(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/attribute-values/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete attribute value');
    }
  }

  // Attribute Types
  async getAttributes(): Promise<AttributeType[]> {
    const response = await fetch(`/api/attributes`);
    if (!response.ok) {
      throw new Error('Failed to fetch attributes');
    }
    
    // Next.js API route returns data directly, not wrapped in ApiResponse
    const data: AttributeType[] = await response.json();
    return data;
  }

  async getAttributeById(id: string): Promise<AttributeType> {
    const response = await fetch(`${API_BASE_URL}/attributes/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch attribute');
    }
    
    const result: ApiResponse<AttributeType> = await response.json();
    return result.data;
  }

  async createAttribute(attribute: any): Promise<AttributeType> {
    const response = await fetch(`${API_BASE_URL}/attributes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attribute),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create attribute');
    }
    
    const result: ApiResponse<AttributeType> = await response.json();
    return result.data;
  }

  async updateAttribute(id: string, attribute: Partial<AttributeType>): Promise<AttributeType> {
    const response = await fetch(`${API_BASE_URL}/attributes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(attribute),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update attribute');
    }
    
    const result: ApiResponse<AttributeType> = await response.json();
    return result.data;
  }

  async deleteAttribute(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/attributes/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete attribute');
    }
  }
}

export const attributesApi = new AttributesApiService(); 