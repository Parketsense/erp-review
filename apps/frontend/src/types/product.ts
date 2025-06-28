export enum ProductCategory {
  PARQUET = 'PARQUET',
  LAMINATE = 'LAMINATE', 
  VINYL = 'VINYL',
  FURNITURE = 'FURNITURE',
  ACCESSORIES = 'ACCESSORIES',
  TOOLS = 'TOOLS',
}

export interface ProductAttribute {
  attributeTypeId: string;
  attributeValueId?: string;
  customValue?: string;
}

export interface Product {
  id: string;
  code: string;
  nameBg: string;
  nameEn?: string;
  
  // Relations
  productTypeId: string;
  manufacturerId: string;
  productType?: {
    nameBg: string;
    nameEn?: string;
  };
  manufacturer?: {
    displayName: string;
    colorCode: string;
  };
  
  // Product Details
  supplier?: string;
  unit: string;
  packageSize?: string;
  
  // Pricing
  costEur?: number;
  costBgn?: number;
  saleBgn?: number;
  saleEur?: number;
  markup?: number;
  
  // Status
  isActive: boolean;
  isRecommended: boolean;
  isNew: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
  createdBy?: {
    name: string;
    email: string;
  };
  
  // Media
  images?: string[];
  documents?: string[];
  models3d?: string[];
  textures?: string[];
  videoUrl?: string;
  
  // Attributes
  attributes?: ProductAttribute[];
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductStats {
  success: boolean;
  data: {
    total: number;
    active: number;
    recommended: number;
  };
}

export interface CreateProductDto {
  code: string;
  nameBg: string;
  nameEn?: string;
  
  // Relations
  productTypeId: string;
  manufacturerId: string;
  
  // Product Details
  supplier?: string;
  unit?: string;
  packageSize?: string;
  
  // Pricing
  costEur?: number;
  costBgn?: number;
  saleBgn?: number;
  saleEur?: number;
  markup?: number;
  
  // Status
  isActive?: boolean;
  isRecommended?: boolean;
  isNew?: boolean;
  
  // Attributes
  attributes?: ProductAttribute[];
  
  // Media
  images?: string[];
  documents?: string[];
  models3d?: string[];
  textures?: string[];
  videoUrl?: string;
} 