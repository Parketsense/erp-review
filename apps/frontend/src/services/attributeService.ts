import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

// Types
export interface ProductType {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  icon: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  attributeTypes?: AttributeType[];
  _count?: {
    products: number;
  };
}

export interface AttributeType {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string;
  type: 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER';
  productTypeId: string;
  icon?: string;
  description?: string;
  isRequired: boolean;
  displayOrder: number;
  placeholder?: string;
  validation?: string;
  isActive: boolean;
  attributeValues?: AttributeValue[];
  values?: AttributeValue[]; // Alternative name used in some endpoints
}

export interface AttributeValue {
  id: string;
  nameBg: string;
  nameEn: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  attributeTypeId: string;
  manufacturerId?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  attributeType?: {
    nameBg: string;
    nameEn: string;
    type: string;
    productTypeId?: string;
  };
  manufacturer?: Manufacturer;
  _count?: {
    productAttributeValues: number;
  };
}

export interface Manufacturer {
  id: string;
  name: string;
  displayName: string;
  code?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  colorCode?: string;
  isActive: boolean;
  _count?: {
    products: number;
    attributeValues: number;
  };
}

// DTOs
export interface CreateAttributeValueDto {
  nameBg: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  attributeTypeId: string;
  manufacturerId?: string;
  sortOrder?: number;
  isDefault?: boolean;
}

export interface UpdateAttributeValueDto extends Partial<CreateAttributeValueDto> {}

export interface CreateAttributeTypeDto {
  name: string;
  nameBg: string;
  nameEn?: string;
  type: 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER';
  productTypeId: string;
  icon?: string;
  description?: string;
  isRequired?: boolean;
  displayOrder?: number;
  placeholder?: string;
  validation?: string;
}

export interface UpdateAttributeTypeDto extends Partial<CreateAttributeTypeDto> {}

export interface CreateProductTypeDto {
  name: string;
  nameBg: string;
  nameEn?: string;
  icon?: string;
  description?: string;
  displayOrder?: number;
}

export interface UpdateProductTypeDto extends Partial<CreateProductTypeDto> {}

export interface CreateManufacturerDto {
  name: string;
  displayName: string;
  code?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  colorCode?: string;
}

export interface UpdateManufacturerDto extends Partial<CreateManufacturerDto> {}

// Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

// Service
export const attributeService = {
  // ProductTypes
  async getProductTypes(): Promise<ProductType[]> {
    try {
      const response = await axios.get<ApiResponse<ProductType[]>>(`${BASE_URL}/product-types`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product types:', error);
      throw error;
    }
  },

  async getProductType(id: string): Promise<ProductType> {
    try {
      const response = await axios.get<ApiResponse<ProductType>>(`${BASE_URL}/product-types/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product type:', error);
      throw error;
    }
  },

  async getProductTypeAttributes(productTypeId: string): Promise<{ productType: ProductType; attributes: AttributeType[] }> {
    try {
      const response = await axios.get<ApiResponse<{ productType: ProductType; attributes: AttributeType[] }>>(
        `${BASE_URL}/product-types/${productTypeId}/attributes`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product type attributes:', error);
      throw error;
    }
  },

  async createProductType(data: CreateProductTypeDto): Promise<ProductType> {
    try {
      const response = await axios.post<ApiResponse<ProductType>>(`${BASE_URL}/product-types`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating product type:', error);
      throw error;
    }
  },

  async updateProductType(id: string, data: UpdateProductTypeDto): Promise<ProductType> {
    try {
      const response = await axios.patch<ApiResponse<ProductType>>(`${BASE_URL}/product-types/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating product type:', error);
      throw error;
    }
  },

  async deleteProductType(id: string): Promise<ProductType> {
    try {
      const response = await axios.delete<ApiResponse<ProductType>>(`${BASE_URL}/product-types/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting product type:', error);
      throw error;
    }
  },

  // Manufacturers
  async getManufacturers(): Promise<Manufacturer[]> {
    try {
      const response = await axios.get<ApiResponse<Manufacturer[]>>(`${BASE_URL}/manufacturers`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      throw error;
    }
  },

  async getManufacturer(id: string): Promise<Manufacturer> {
    try {
      const response = await axios.get<ApiResponse<Manufacturer>>(`${BASE_URL}/manufacturers/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching manufacturer:', error);
      throw error;
    }
  },

  async createManufacturer(data: CreateManufacturerDto): Promise<Manufacturer> {
    try {
      const response = await axios.post<ApiResponse<Manufacturer>>(`${BASE_URL}/manufacturers`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating manufacturer:', error);
      throw error;
    }
  },

  async updateManufacturer(id: string, data: UpdateManufacturerDto): Promise<Manufacturer> {
    try {
      const response = await axios.patch<ApiResponse<Manufacturer>>(`${BASE_URL}/manufacturers/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating manufacturer:', error);
      throw error;
    }
  },

  async deleteManufacturer(id: string): Promise<Manufacturer> {
    try {
      const response = await axios.delete<ApiResponse<Manufacturer>>(`${BASE_URL}/manufacturers/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting manufacturer:', error);
      throw error;
    }
  },

  // AttributeValues
  async getAttributeValues(attributeTypeId: string): Promise<AttributeValue[]> {
    try {
      const response = await axios.get<ApiResponse<AttributeValue[]>>(
        `${BASE_URL}/attribute-values?attributeTypeId=${attributeTypeId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attribute values:', error);
      throw error;
    }
  },

  async getAttributeValuesByManufacturer(manufacturerId: string): Promise<AttributeValue[]> {
    try {
      const response = await axios.get<ApiResponse<AttributeValue[]>>(
        `${BASE_URL}/attribute-values/by-manufacturer/${manufacturerId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attribute values by manufacturer:', error);
      throw error;
    }
  },

  async getAttributeValue(id: string): Promise<AttributeValue> {
    try {
      const response = await axios.get<ApiResponse<AttributeValue>>(`${BASE_URL}/attribute-values/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attribute value:', error);
      throw error;
    }
  },

  async createAttributeValue(data: CreateAttributeValueDto): Promise<AttributeValue> {
    try {
      const response = await axios.post<ApiResponse<AttributeValue>>(`${BASE_URL}/attribute-values`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating attribute value:', error);
      throw error;
    }
  },

  async updateAttributeValue(id: string, data: UpdateAttributeValueDto): Promise<AttributeValue> {
    try {
      const response = await axios.patch<ApiResponse<AttributeValue>>(`${BASE_URL}/attribute-values/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating attribute value:', error);
      throw error;
    }
  },

  async deleteAttributeValue(id: string): Promise<AttributeValue> {
    try {
      const response = await axios.delete<ApiResponse<AttributeValue>>(`${BASE_URL}/attribute-values/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting attribute value:', error);
      throw error;
    }
  },

  // Attributes (AttributeTypes)
  async getAttributes(): Promise<AttributeType[]> {
    try {
      const response = await axios.get<ApiResponse<AttributeType[]>>(`${BASE_URL}/attributes`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attributes:', error);
      throw error;
    }
  },

  async getAttribute(id: string): Promise<AttributeType> {
    try {
      const response = await axios.get<ApiResponse<AttributeType>>(`${BASE_URL}/attributes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching attribute:', error);
      throw error;
    }
  },

  async createAttribute(data: CreateAttributeTypeDto): Promise<AttributeType> {
    try {
      const response = await axios.post<ApiResponse<AttributeType>>(`${BASE_URL}/attributes`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating attribute:', error);
      throw error;
    }
  },

  async updateAttribute(id: string, data: UpdateAttributeTypeDto): Promise<AttributeType> {
    try {
      const response = await axios.patch<ApiResponse<AttributeType>>(`${BASE_URL}/attributes/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating attribute:', error);
      throw error;
    }
  },

  async deleteAttribute(id: string): Promise<AttributeType> {
    try {
      const response = await axios.delete<ApiResponse<AttributeType>>(`${BASE_URL}/attributes/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting attribute:', error);
      throw error;
    }
  },

  // Helper methods
  async getAttributesByProductType(productTypeId: string): Promise<AttributeType[]> {
    try {
      const { attributes } = await this.getProductTypeAttributes(productTypeId);
      return attributes;
    } catch (error) {
      console.error('Error fetching attributes by product type:', error);
      throw error;
    }
  },

  async getManufacturersByAttributeValues(attributeTypeId: string): Promise<Manufacturer[]> {
    try {
      const values = await this.getAttributeValues(attributeTypeId);
      const manufacturerIds = [...new Set(values.filter(v => v.manufacturerId).map(v => v.manufacturerId!))];
      const manufacturers = await Promise.all(manufacturerIds.map(id => this.getManufacturer(id)));
      return manufacturers;
    } catch (error) {
      console.error('Error fetching manufacturers by attribute values:', error);
      throw error;
    }
  },
};

export default attributeService; 