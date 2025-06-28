import { ProductsResponse, ProductStats, Product, CreateProductDto } from '../types/product';

const BASE_URL = 'http://localhost:4000/api';

export const productsApi = {
  // Get all products with optional filters
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: boolean;
    isFeatured?: boolean;
  }): Promise<ProductsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.inStock !== undefined) searchParams.append('inStock', params.inStock.toString());
    if (params?.isFeatured !== undefined) searchParams.append('isFeatured', params.isFeatured.toString());

    const response = await fetch(`${BASE_URL}/products?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return response.json();
  },

  // Get product statistics
  async getStats(): Promise<ProductStats> {
    const response = await fetch(`${BASE_URL}/products/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product statistics');
    }
    
    return response.json(); // Already returns { success, data }
  },

  // Get single product by ID
  async getById(id: string): Promise<Product> {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    
    return response.json();
  },

  // Create new product
  async create(productData: CreateProductDto): Promise<Product> {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }
    
    const result = await response.json();
    return result.data; // Backend returns { success, data, message }
  },

  // Upload files for a product
  async uploadFiles(productId: string, files: File[], mediaType: string): Promise<Product> {
    const formData = new FormData();
    
    // Add files to FormData
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Add media type
    formData.append('mediaType', mediaType);

    const response = await fetch(`${BASE_URL}/products/${productId}/upload`, {
      method: 'POST',
      body: formData, // Don't set Content-Type header - browser will set it automatically with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload files');
    }

    const result = await response.json();
    return result.data;
  },

  // Create product with files (two-step process)
  async createWithFiles(productData: CreateProductDto, files: {
    images?: File[];
    documents?: File[];
    models3d?: File[];
    textures?: File[];
  }): Promise<Product> {
    // Step 1: Create product
    const product = await this.create(productData);
    
    // Step 2: Upload files if any
    if (files.images && files.images.length > 0) {
      await this.uploadFiles(product.id, files.images, 'images');
    }
    
    if (files.documents && files.documents.length > 0) {
      await this.uploadFiles(product.id, files.documents, 'documents');
    }
    
    if (files.models3d && files.models3d.length > 0) {
      await this.uploadFiles(product.id, files.models3d, 'models3d');
    }
    
    if (files.textures && files.textures.length > 0) {
      await this.uploadFiles(product.id, files.textures, 'textures');
    }

    // Return updated product
    return this.getById(product.id);
  },

  // Update existing product
  async update(id: string, productData: Partial<CreateProductDto>): Promise<Product> {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update product');
    }
    
    return response.json();
  },

  // Soft delete product
  async delete(id: string): Promise<{ message: string }> {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete product');
    }
    
    return response.json();
  },

  // Check if product code exists
  async checkCode(code: string): Promise<{ exists: boolean; product?: Product }> {
    const response = await fetch(`${BASE_URL}/products/check-code/${code}`);
    
    if (!response.ok) {
      throw new Error('Failed to check product code');
    }
    
    return response.json();
  },
}; 