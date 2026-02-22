import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit, extractIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';

const PAGINATION_DEFAULT_LIMIT = 50;
const PAGINATION_MAX_LIMIT = 100;
const SEARCH_MAX_LIMIT = 20;

function parsePagination(limit: string | null, offset: string | null) {
  const parsedLimit = parseInt(limit || '') || PAGINATION_DEFAULT_LIMIT;
  const parsedOffset = Math.max(parseInt(offset || '') || 0, 0);
  return {
    limit: Math.min(Math.max(parsedLimit, 1), PAGINATION_MAX_LIMIT),
    offset: parsedOffset,
  };
}

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
    const search = searchParams.get('search')?.trim();

    if (search) {
      const limit = Math.min(
        parseInt(searchParams.get('limit') || '') || SEARCH_MAX_LIMIT,
        SEARCH_MAX_LIMIT
      );

      const characters = await prisma.character.findMany({
        where: {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({ characters, total: characters.length, limit, offset: 0 });
    }

    const { limit, offset } = parsePagination(
      searchParams.get('limit'),
      searchParams.get('offset')
    );

    const [characters, total] = await Promise.all([
      prisma.character.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.character.count(),
    ]);

    return NextResponse.json(
      { characters, total, limit, offset },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } }
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/characters');
  }
}
