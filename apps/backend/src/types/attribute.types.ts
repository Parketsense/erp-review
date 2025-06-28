export interface ProductType {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string | null;
  icon: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  products?: Product[];
  attributeTypes?: AttributeType[];
}

export interface Manufacturer {
  id: string;
  name: string;
  displayName: string;
  code: string | null;
  website: string | null;
  description: string | null;
  address: string | null;          // Адрес на производителя
  contactName: string | null;      // Име на контактно лице
  contactEmail: string | null;     // Мейл на контактно лице
  contactPhone: string | null;     // Телефон на контактно лице
  logoUrl: string | null;
  colorCode: string | null;
  discount: number | null;  // Отстъпка в процент (0-100)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  products?: Product[];
  attributeValues?: AttributeValue[];
}

export interface AttributeType {
  id: string;
  name: string;
  nameBg: string;
  nameEn: string | null;
  type: 'select' | 'color' | 'text' | 'number' | 'boolean';
  productTypeId: string;
  isRequired: boolean;
  displayOrder: number;
  placeholder: string | null;
  validation: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  productType?: ProductType;
  attributeValues?: AttributeValue[];
  productAttributeValues?: ProductAttributeValue[];
}

export interface AttributeValue {
  id: string;
  nameBg: string;
  nameEn: string | null;
  description: string | null;
  icon: string | null;
  colorCode: string | null;
  attributeTypeId: string;
  manufacturerId: string | null;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  updatedById: string | null;
  
  // Relations
  attributeType?: AttributeType;
  manufacturer?: Manufacturer;
  createdBy?: User;
  updatedBy?: User;
  productAttributeValues?: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  id: string;
  productId: string;
  attributeTypeId: string;
  attributeValueId: string | null;
  customValue: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  product?: Product;
  attributeType?: AttributeType;
  attributeValue?: AttributeValue;
}

export interface Product {
  id: string;
  code: string;
  nameBg: string;
  nameEn: string | null;
  productTypeId: string;
  manufacturerId: string;
  supplier: string | null;
  unit: string;
  packageSize: string | null;
  costEur: number | null;
  costBgn: number | null;
  saleBgn: number | null;
  saleEur: number | null;
  markup: number | null;
  isActive: boolean;
  isRecommended: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  updatedById: string | null;
  
  // Relations
  productType?: ProductType;
  manufacturer?: Manufacturer;
  createdBy?: User;
  updatedBy?: User;
  attributeValues?: ProductAttributeValue[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs
export interface CreateProductTypeDto {
  name: string;
  nameBg: string;
  nameEn?: string | null;
  icon?: string | null;
  description?: string | null;
  displayOrder?: number;
}

export interface Supplier {
  id: string;
  name: string;
  displayName: string;
  code: string | null;
  website: string | null;
  description: string | null;
  address: string | null;          // Адрес на доставчика
  contactName: string | null;      // Име на контактно лице
  contactEmail: string | null;     // Мейл на контактно лице
  contactPhone: string | null;     // Телефон на контактно лице
  logoUrl: string | null;
  colorCode: string | null;
  discount: number | null;  // Отстъпка в процент (0-100)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateManufacturerDto {
  name: string;
  displayName: string;
  code?: string | null;
  website?: string | null;
  description?: string | null;
  address?: string | null;         // Адрес на производителя
  contactName?: string | null;     // Име на контактно лице
  contactEmail?: string | null;    // Мейл на контактно лице
  contactPhone?: string | null;    // Телефон на контактно лице
  logoUrl?: string | null;
  colorCode?: string | null;
  discount?: number | null;  // Отстъпка в процент (0-100)
}

export interface CreateSupplierDto {
  name: string;
  displayName: string;
  code?: string | null;
  website?: string | null;
  description?: string | null;
  address?: string | null;         // Адрес на доставчика
  contactName?: string | null;     // Име на контактно лице
  contactEmail?: string | null;    // Мейл на контактно лице
  contactPhone?: string | null;    // Телефон на контактно лице
  logoUrl?: string | null;
  colorCode?: string | null;
  discount?: number | null;  // Отстъпка в процент (0-100)
}

export interface CreateAttributeTypeDto {
  name: string;
  nameBg: string;
  nameEn?: string | null;
  type: 'select' | 'color' | 'text' | 'number' | 'boolean';
  productTypeId: string;
  isRequired?: boolean;
  displayOrder?: number;
  placeholder?: string | null;
  validation?: string | null;
}

export interface CreateAttributeValueDto {
  nameBg: string;
  nameEn?: string | null;
  description?: string | null;
  icon?: string | null;
  colorCode?: string | null;
  attributeTypeId: string;
  manufacturerId?: string | null;
  sortOrder?: number;
  isDefault?: boolean;
}

export interface UpdateAttributeValueDto {
  nameBg?: string;
  nameEn?: string | null;
  description?: string | null;
  icon?: string | null;
  colorCode?: string | null;
  manufacturerId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  isDefault?: boolean;
}

// Query interfaces
export interface GetAttributeValuesQuery {
  attributeTypeId: string;
  manufacturerId?: string;
  isActive?: boolean;
}

export interface GetAttributesQuery {
  productTypeId: string;
  isActive?: boolean;
} 