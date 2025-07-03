/**
 * Environment Configuration with Validation
 * Centralized environment variables for type safety and validation
 */

// Environment validation helper
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value!;
}

function getEnvBool(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

// Application Configuration
export const APP_CONFIG = {
  name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'PARKETSENSE ERP'),
  version: getEnvVar('NEXT_PUBLIC_APP_VERSION', '2.0.0'),
  env: getEnvVar('NODE_ENV', 'development'),
  isDev: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:4001/api'),
  backendUrl: getEnvVar('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:4001'),
  timeout: getEnvNumber('NEXT_PUBLIC_API_TIMEOUT', 30000),
  requestTimeout: getEnvNumber('NEXT_PUBLIC_REQUEST_TIMEOUT', 10000),
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  enableDebug: getEnvBool('NEXT_PUBLIC_ENABLE_DEBUG', APP_CONFIG.isDev),
  enableAnalytics: getEnvBool('NEXT_PUBLIC_ENABLE_ANALYTICS', true),
  enableErrorReporting: getEnvBool('NEXT_PUBLIC_ENABLE_ERROR_REPORTING', APP_CONFIG.isProduction),
} as const;

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: getEnvNumber('NEXT_PUBLIC_MAX_FILE_SIZE', 10485760), // 10MB
  allowedFileTypes: getEnvVar('NEXT_PUBLIC_ALLOWED_FILE_TYPES', 'jpg,jpeg,png,pdf,doc,docx').split(','),
  maxFiles: 10,
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  cacheTtl: getEnvNumber('NEXT_PUBLIC_CACHE_TTL', 300000), // 5 minutes
  debounceMs: 300,
  throttleMs: 1000,
} as const;

// Localization Configuration
export const LOCALE_CONFIG = {
  locale: getEnvVar('NEXT_PUBLIC_LOCALE', 'bg'),
  currency: getEnvVar('NEXT_PUBLIC_CURRENCY', 'BGN'),
  timezone: getEnvVar('NEXT_PUBLIC_TIMEZONE', 'Europe/Sofia'),
  dateFormat: 'DD.MM.YYYY',
  timeFormat: 'HH:mm',
  datetimeFormat: 'DD.MM.YYYY HH:mm',
} as const;

// External Services (optional)
export const EXTERNAL_CONFIG = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

// Validation function to check all required env vars
export function validateEnvironment(): void {
  try {
    // Test all required configurations by accessing them
    const configs = [
      APP_CONFIG,
      API_CONFIG,
      SECURITY_CONFIG,
      UPLOAD_CONFIG,
      PERFORMANCE_CONFIG,
      LOCALE_CONFIG,
    ];
    
    // This forces evaluation of all config objects
    configs.forEach(config => {
      Object.keys(config).forEach(key => {
        // Access each property to trigger validation
        const value = (config as any)[key];
        if (value === undefined) {
          throw new Error(`Configuration validation failed for ${key}`);
        }
      });
    });
    
    if (APP_CONFIG.isProduction) {
      // Additional production validation
      if (!API_CONFIG.baseUrl.startsWith('https://') && !APP_CONFIG.isDev) {
        console.warn('⚠️  API URL should use HTTPS in production');
      }
      
      if (SECURITY_CONFIG.enableDebug) {
        console.warn('⚠️  Debug mode is enabled in production');
      }
    }
    
    console.log('✅ Environment configuration validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw error;
  }
}

// Log configuration on startup (only in development)
if (APP_CONFIG.isDev && typeof window === 'undefined') {
  console.log('🔧 Environment Configuration:', {
    app: APP_CONFIG,
    api: API_CONFIG,
    security: SECURITY_CONFIG,
    upload: UPLOAD_CONFIG,
    performance: PERFORMANCE_CONFIG,
    locale: LOCALE_CONFIG,
  });
} 