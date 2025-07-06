import { jwtVerify, SignJWT } from 'jose';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ALGORITHM = 'HS256';
const OFFER_TOKEN_EXPIRY = '7d'; // 7 days for offer tokens

// Types for JWT payload
export interface OfferTokenPayload {
  offerId: string;
  clientId: string;
  projectId: string;
  variantId?: string;
  iat: number;
  exp: number;
}

export interface OfferTokenData {
  offerId: string;
  clientId: string;
  projectId: string;
  variantId?: string;
}

// JWT secret key
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Generate a JWT token for offer access
 */
export async function generateOfferToken(
  offerId: string, 
  clientId: string, 
  projectId: string, 
  variantId?: string
): Promise<string> {
  try {
    const payload: Omit<OfferTokenPayload, 'iat' | 'exp'> = {
      offerId,
      clientId,
      projectId,
      variantId,
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: JWT_ALGORITHM })
      .setIssuedAt()
      .setExpirationTime(OFFER_TOKEN_EXPIRY)
      .sign(secretKey);

    return token;
  } catch (error) {
    console.error('Error generating offer token:', error);
    throw new Error('Failed to generate offer token');
  }
}

/**
 * Verify and decode an offer JWT token
 */
export async function verifyOfferToken(token: string): Promise<OfferTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [JWT_ALGORITHM],
    });

    // Validate required fields
    if (!payload.offerId || !payload.clientId || !payload.projectId) {
      throw new Error('Invalid token payload: missing required fields');
    }

    return payload as OfferTokenPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('JWTExpired')) {
        throw new Error('Offer token has expired');
      }
      if (error.message.includes('JWTInvalid')) {
        throw new Error('Invalid offer token');
      }
    }
    console.error('Error verifying offer token:', error);
    throw new Error('Failed to verify offer token');
  }
}

/**
 * Extract offer data from token without verification (for debugging only)
 */
export async function extractOfferData(token: string): Promise<OfferTokenData> {
  try {
    const payload = await verifyOfferToken(token);
    
    return {
      offerId: payload.offerId,
      clientId: payload.clientId,
      projectId: payload.projectId,
      variantId: payload.variantId,
    };
  } catch (error) {
    console.error('Error extracting offer data:', error);
    throw error;
  }
}

/**
 * Check if token is expired without throwing error
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    await verifyOfferToken(token);
    return false;
  } catch (error) {
    if (error instanceof Error && error.message.includes('expired')) {
      return true;
    }
    return false;
  }
}

/**
 * Get token expiration time
 */
export async function getTokenExpiration(token: string): Promise<Date | null> {
  try {
    const payload = await verifyOfferToken(token);
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
}

/**
 * Validate token format without verification
 */
export function isValidTokenFormat(token: string): boolean {
  // Basic JWT format validation (3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Create a secure offer URL with token
 */
export function createOfferUrl(
  baseUrl: string,
  token: string,
  offerId: string
): string {
  return `${baseUrl}/offer/${token}`;
}

/**
 * Error types for better error handling
 */
export class OfferTokenError extends Error {
  constructor(
    message: string,
    public code: 'EXPIRED' | 'INVALID' | 'MALFORMED' | 'MISSING_FIELDS' | 'VERIFICATION_FAILED'
  ) {
    super(message);
    this.name = 'OfferTokenError';
  }
}

/**
 * Enhanced token verification with detailed error handling
 */
export async function verifyOfferTokenWithDetails(token: string): Promise<{
  valid: boolean;
  payload?: OfferTokenPayload;
  error?: OfferTokenError;
}> {
  try {
    // Check token format first
    if (!isValidTokenFormat(token)) {
      return {
        valid: false,
        error: new OfferTokenError('Invalid token format', 'MALFORMED')
      };
    }

    const payload = await verifyOfferToken(token);
    
    return {
      valid: true,
      payload
    };
  } catch (error) {
    if (error instanceof Error) {
      let code: OfferTokenError['code'] = 'VERIFICATION_FAILED';
      
      if (error.message.includes('expired')) {
        code = 'EXPIRED';
      } else if (error.message.includes('Invalid')) {
        code = 'INVALID';
      } else if (error.message.includes('missing required fields')) {
        code = 'MISSING_FIELDS';
      }

      return {
        valid: false,
        error: new OfferTokenError(error.message, code)
      };
    }

    return {
      valid: false,
      error: new OfferTokenError('Unknown verification error', 'VERIFICATION_FAILED')
    };
  }
} 