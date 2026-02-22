const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS_POST = 10;
const RATE_LIMIT_MAX_REQUESTS_GET = 60;

const requests = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxRequests?: number;
}

export function rateLimit(
  ip: string,
  config?: RateLimitConfig
): { success: boolean; remaining: number; resetIn: number } {
  const maxRequests = config?.maxRequests ?? RATE_LIMIT_MAX_REQUESTS_POST;
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { success: true, remaining: maxRequests - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count, resetIn: entry.resetAt - now };
}

export function extractIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export const RATE_LIMIT_PRESETS = {
  POST: { maxRequests: RATE_LIMIT_MAX_REQUESTS_POST },
  GET: { maxRequests: RATE_LIMIT_MAX_REQUESTS_GET },
} as const;
