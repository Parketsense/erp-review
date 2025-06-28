export interface ProductType {
  id: string;
  name: string;
  nameBg: string;
  nameEn?: string;
  icon: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  attributeTypes?: AttributeType[];
  _count?: {
    products: number;
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
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    attributeValues: number;
  };
}

export interface AttributeType {
  id: string;
  name: string;
  nameBg: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  type: 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER';
  productTypeId: string;
  dependencyType?: string;
  dependencyValue?: string;
  displayOrder: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productType?: ProductType;
  attributeValues?: AttributeValue[];
}

export interface AttributeValue {
  id: string;
  nameBg: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  attributeTypeId: string;
  manufacturerId?: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  attributeType?: AttributeType;
  manufacturer?: Manufacturer;
}

export interface CreateAttributeValueDto {
  nameBg: string;
  nameEn?: string;
  description?: string;
  icon?: string;
  colorCode?: string;
  attributeTypeId: string;
  manufacturerId?: string | null;
  sortOrder?: number;
  isDefault?: boolean;
}

export interface CreateProductTypeDto {
  name: string;
  nameBg: string;
  nameEn?: string;
  icon: string;
  description?: string;
  displayOrder?: number;
}

export interface CreateManufacturerDto {
  name: string;
  displayName: string;
  code?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  colorCode?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  total?: number;
} 