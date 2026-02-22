import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit, extractIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const { success, resetIn } = rateLimit(extractIp(request), RATE_LIMIT_PRESETS.GET);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    const [characters, total] = await Promise.all([
      prisma.character.findMany({
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          username: true,
          seed: true,
          selectedParts: true,
          createdAt: true,
        },
        take: limit,
        skip: offset,
      }),
      prisma.character.count(),
    ]);

    return NextResponse.json(
      {
        characters,
        total,
        limit,
        offset,
        startIndex: offset,
        endIndex: offset + characters.length - 1,
        hasMore: offset + limit < total,
      },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } }
    );
  } catch (error) {
    console.error('Error fetching map characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
