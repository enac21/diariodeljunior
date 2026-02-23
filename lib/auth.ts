import { headers } from 'next/headers';

const AUTH_TOKEN = process.env.API_AUTH_TOKEN;

export async function verifyAuthToken(): Promise<{ valid: boolean; error?: string }> {
  if (!AUTH_TOKEN) {
    console.error('[Auth] API_AUTH_TOKEN not configured');
    return { valid: false, error: 'Server configuration error' };
  }

  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  if (!authHeader) {
    return { valid: false, error: 'Authorization header required' };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Invalid authorization format. Use: Bearer <token>' };
  }

  const token = authHeader.slice(7);

  if (token !== AUTH_TOKEN) {
    return { valid: false, error: 'Invalid token' };
  }

  return { valid: true };
}
