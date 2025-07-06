import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute for offer pages
const RATE_LIMIT_MAX_REQUESTS_STRICT = 10; // 10 requests per minute for strict routes

// Define protected routes
const protectedRoutes = [
  '/offers',
  '/clients',
  '/projects',
  '/products',
  '/orders',
  '/documents',
  '/architects',
  '/attributes',
  '/suppliers',
  '/manufacturers',
];

// Define public routes
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api',
];

// Define client offer routes (need special rate limiting)
const clientOfferRoutes = [
  '/offer',
];

/**
 * Rate limiting function
 */
function checkRateLimit(ip: string, pathname: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = `${ip}:${pathname}`;
  const isStrictRoute = pathname.startsWith('/offer/');
  const maxRequests = isStrictRoute ? RATE_LIMIT_MAX_REQUESTS_STRICT : RATE_LIMIT_MAX_REQUESTS;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment count
  current.count++;
  rateLimitStore.set(key, current);
  
  return { allowed: true, remaining: maxRequests - current.count };
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection remote address
  return 'unknown';
}

/**
 * Analytics tracking for offer views
 */
function trackOfferView(request: NextRequest, pathname: string) {
  if (pathname.startsWith('/offer/')) {
    const token = pathname.split('/')[2]; // Get token from URL
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    // In production, send to analytics service
    console.log('Offer View:', {
      token: token ? `${token.substring(0, 8)}...` : 'unknown',
      ip: ip.substring(0, 8) + '...',
      userAgent: userAgent.substring(0, 50) + '...',
      referer: referer.substring(0, 50) + '...',
      timestamp: new Date().toISOString(),
      pathname
    });
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // Track offer views for analytics
  trackOfferView(request, pathname);

  // Rate limiting for offer routes
  if (clientOfferRoutes.some(route => pathname.startsWith(route))) {
    const rateLimit = checkRateLimit(ip, pathname);
    
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(RATE_LIMIT_WINDOW / 1000).toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS_STRICT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_WINDOW).toString()
          }
        }
      );
    }
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );

  // For now, allow all routes (authentication will be implemented later)
  // In a real application, you would check for authentication tokens here
  
  // Example of how authentication would work:
  /*
  const token = request.cookies.get('auth-token')?.value;
  
  if (isProtectedRoute && !token) {
    // Redirect to login if accessing protected route without token
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (isPublicRoute && token && pathname === '/login') {
    // Redirect to dashboard if accessing login with valid token
    return NextResponse.redirect(new URL('/', request.url));
  }
  */

  // Add security headers
  const response = NextResponse.next();
  
  // Enhanced security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Additional headers for offer pages
  if (pathname.startsWith('/offer/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }
  
  // Content Security Policy - Enhanced for offer pages
  const baseCSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' http://localhost:4000",
    "frame-ancestors 'none'",
  ];

  // Additional CSP rules for offer pages
  if (pathname.startsWith('/offer/')) {
    baseCSP.push("object-src 'none'");
    baseCSP.push("base-uri 'self'");
    baseCSP.push("form-action 'self'");
    baseCSP.push("frame-src 'none'");
    baseCSP.push("media-src 'none'");
  }
  
  response.headers.set('Content-Security-Policy', baseCSP.join('; '));

  // Add rate limit headers for offer routes
  if (clientOfferRoutes.some(route => pathname.startsWith(route))) {
    const rateLimit = checkRateLimit(ip, pathname);
    const maxRequests = pathname.startsWith('/offer/') ? RATE_LIMIT_MAX_REQUESTS_STRICT : RATE_LIMIT_MAX_REQUESTS;
    
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', (Date.now() + RATE_LIMIT_WINDOW).toString());
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 