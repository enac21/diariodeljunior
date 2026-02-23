import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit, extractIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import { verifyAuthToken } from '@/lib/auth';
import { stringToSeed, seleccionarPartes } from '@/lib/character-generator';

const PAGINATION_DEFAULT_LIMIT = 50;
const PAGINATION_MAX_LIMIT = 100;
const SEARCH_MAX_LIMIT = 20;
const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 24;

interface TikTokFollower {
  Date: string;
  UserName: string;
}

interface TikTokExport {
  'Profile And Settings'?: {
    Follower?: {
      FansList?: TikTokFollower[];
    };
  };
}

function parsePagination(limit: string | null, offset: string | null) {
  const parsedLimit = parseInt(limit || '') || PAGINATION_DEFAULT_LIMIT;
  const parsedOffset = Math.max(parseInt(offset || '') || 0, 0);
  return {
    limit: Math.min(Math.max(parsedLimit, 1), PAGINATION_MAX_LIMIT),
    offset: parsedOffset,
  };
}

function extractUsernames(data: unknown): string[] {
  const exportData = data as TikTokExport;
  const fansList = exportData?.['Profile And Settings']?.Follower?.FansList;
  if (!Array.isArray(fansList)) return [];
  return fansList.map(f => f.UserName).filter(Boolean);
}

function validateUsername(username: string): string | null {
  const clean = username.trim().normalize('NFC').slice(0, USERNAME_MAX_LENGTH);
  if (clean.length < USERNAME_MIN_LENGTH) return null;
  return clean;
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

export async function POST(request: NextRequest) {
  const auth = await verifyAuthToken();
  if (!auth.valid) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const usernames = extractUsernames(body);

    if (usernames.length === 0) {
      return NextResponse.json(
        { error: 'No valid usernames found in FansList' },
        { status: 400 }
      );
    }

    let created = 0;
    let existing = 0;
    let invalid = 0;

    for (const rawUsername of usernames) {
      const username = validateUsername(rawUsername);
      if (!username) {
        invalid++;
        continue;
      }

      const existingChar = await prisma.character.findUnique({
        where: { username },
      });

      if (existingChar) {
        existing++;
        continue;
      }

      const seed = stringToSeed(username);
      const selectedParts = seleccionarPartes(seed);

      await prisma.character.create({
        data: {
          username,
          seed,
          selectedParts: selectedParts as any,
          generatorVersion: 1,
        },
      });
      created++;
    }

    return NextResponse.json({
      total: usernames.length,
      created,
      existing,
      invalid,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/characters');
  }
}
