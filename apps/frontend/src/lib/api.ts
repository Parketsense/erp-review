/**
 * Centralized API Client with Error Handling and Retry Logic
 */

import { API_CONFIG, SECURITY_CONFIG, PERFORMANCE_CONFIG } from './env';

// API Error Classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Request/Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp?: string;
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: RequestCache;
}

// Request Queue for handling concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private maxConcurrent = 5;
  private active = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.active++;
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.active--;
          this.processNext();
        }
      });
      
      this.processNext();
    });
  }

  private processNext() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (request) {
      request();
    }
  }
}

// Request interceptors
const requestInterceptors: Array<(config: ApiRequestConfig) => ApiRequestConfig> = [];
const responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

// Global request queue
const requestQueue = new RequestQueue();

// API Client Class
class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.defaultTimeout = API_CONFIG.timeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: (config: ApiRequestConfig) => ApiRequestConfig) {
    requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    responseInterceptors.push(interceptor);
  }

  // Main request method
  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let finalConfig = { ...config };
    requestInterceptors.forEach(interceptor => {
      finalConfig = interceptor(finalConfig);
    });

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const method = finalConfig.method || 'GET';
    const timeout = finalConfig.timeout || this.defaultTimeout;
    const retries = finalConfig.retries || (method === 'GET' ? 3 : 1);

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...finalConfig.headers,
      },
      cache: finalConfig.cache || (method === 'GET' ? 'default' : 'no-cache'),
    };

    // Add body for non-GET requests
    if (finalConfig.body && method !== 'GET') {
      if (finalConfig.body instanceof FormData) {
        // Remove Content-Type for FormData (browser sets it automatically)
        const headers = requestOptions.headers as Record<string, string>;
        delete headers['Content-Type'];
        requestOptions.body = finalConfig.body;
      } else {
        requestOptions.body = JSON.stringify(finalConfig.body);
      }
    }

    // Retry logic
    const executeRequest = async (attempt: number): Promise<ApiResponse<T>> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Apply response interceptors
        let finalResponse = response;
        for (const interceptor of responseInterceptors) {
          finalResponse = await interceptor(finalResponse);
        }

        // Handle response
        if (!finalResponse.ok) {
          const errorData = await this.parseErrorResponse(finalResponse);
          throw new ApiError(
            errorData.message || `HTTP ${finalResponse.status}: ${finalResponse.statusText}`,
            finalResponse.status,
            errorData.code,
            errorData.data
          );
        }

        // Parse successful response
        const data = await this.parseSuccessResponse<T>(finalResponse);
        return data;

      } catch (error) {
        // Handle different error types
        if (error instanceof ApiError) {
          throw error;
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError('Няма връзка със сървъра. Моля проверете интернет връзката.');
        }

        if (error.name === 'AbortError') {
          throw new NetworkError(`Заявката беше прекъсната (timeout: ${timeout}ms)`);
        }

        // Retry logic for network errors
        if (attempt < retries && (error instanceof NetworkError || error.name === 'AbortError')) {
          if (SECURITY_CONFIG.enableDebug) {
            console.log(`🔄 Retrying request (${attempt + 1}/${retries}):`, endpoint);
          }
          
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return executeRequest(attempt + 1);
        }

        throw error;
      }
    };

    // Execute request (with queueing for non-critical requests)
    if (method === 'GET') {
      return requestQueue.add(() => executeRequest(0));
    } else {
      return executeRequest(0);
    }
  }

  // Parse error response
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return { message: await response.text() };
      }
    } catch {
      return { message: `HTTP ${response.status}: ${response.statusText}` };
    }
  }

  // Parse success response
  private async parseSuccessResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        
        // Handle different response formats
        if (typeof jsonData === 'object' && jsonData !== null) {
          if ('data' in jsonData && 'success' in jsonData) {
            return jsonData as ApiResponse<T>;
          } else {
            return {
              data: jsonData as T,
              success: true,
              timestamp: new Date().toISOString(),
            };
          }
        }
      }
      
      // Fallback for non-JSON responses
      const textData = await response.text();
      return {
        data: textData as T,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new ApiError('Грешка при обработка на отговора от сървъра', response.status);
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: data });
  }

  async put<T = any>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: data });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: data });
  }

  async delete<T = any>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export error classes and types
export { ApiClient };
export type { ApiResponse, ApiRequestConfig }; 