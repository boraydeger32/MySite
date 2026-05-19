// =============================================================================
// CSRF Protection for API Routes
// =============================================================================
// Two modes:
// - validateCsrf(): Strict - for authenticated/dashboard endpoints
// - validatePublicCsrf(): Lenient - for public endpoints (QR menu orders, etc.)
//   Only checks origin if present, never rejects missing headers
// =============================================================================

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean);

/**
 * Strict CSRF validation for authenticated endpoints (dashboard API calls).
 * Rejects requests without origin/referer in production.
 */
export function validateCsrf(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Require at least one header for non-GET requests
  if (!origin && !referer) {
    if (process.env.NODE_ENV === 'development') return true;
    return false;
  }

  if (origin) {
    return ALLOWED_ORIGINS.some((allowed) => origin === allowed);
  }

  if (referer) {
    return ALLOWED_ORIGINS.some((allowed) => allowed && referer.startsWith(allowed));
  }

  return false;
}

/**
 * Lenient CSRF validation for public endpoints (orders, reservations, contact, newsletter).
 * Allows requests without origin/referer (mobile browsers, WebView, etc.)
 * but rejects requests with a mismatched origin.
 */
export function validatePublicCsrf(request: Request): boolean {
  const origin = request.headers.get('origin');

  // No origin header = allow (mobile browsers, server calls, etc.)
  if (!origin) return true;

  // If origin IS present, verify it matches allowed origins
  return ALLOWED_ORIGINS.some((allowed) => origin === allowed);
}
