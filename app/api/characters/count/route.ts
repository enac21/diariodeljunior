import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit, extractIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';

export async function GET(request: Request) {
  const { success, resetIn } = rateLimit(extractIp(request), RATE_LIMIT_PRESETS.GET);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
    );
  }

  try {
    const total = await prisma.character.count();

    return NextResponse.json(
      { total },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/characters/count');
  }
}
