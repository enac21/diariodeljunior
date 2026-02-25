import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit, extractIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import { stringToSeed, seleccionarPartes, generateAndSaveAvatar } from '@/lib/character-generator';

const PAGINATION_DEFAULT_LIMIT = 50;
const PAGINATION_MAX_LIMIT = 100;
const SEARCH_MAX_LIMIT = 20;

function parsePagination(limit: string | null, offset: string | null) {
  const parsedLimit = parseInt(limit || '') || PAGINATION_DEFAULT_LIMIT;
  const parsedOffset = Math.max(parseInt(offset || '') || 0,0);
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

const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 24;

export async function POST(request: NextRequest) {
  const { success, resetIn } = rateLimit(extractIp(request), RATE_LIMIT_PRESETS.POST);
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.trim().normalize('NFC').slice(0, USERNAME_MAX_LENGTH);

    if (cleanUsername.length < USERNAME_MIN_LENGTH) {
      return NextResponse.json({ error: 'Username must be at least 2 characters' }, { status: 400 });
    }

    const existingCharacter = await prisma.character.findUnique({
      where: { username: cleanUsername },
    });

    if (existingCharacter) {
      return NextResponse.json(existingCharacter);
    }

    const seed = stringToSeed(cleanUsername);
    const selectedParts = seleccionarPartes(seed);

    await generateAndSaveAvatar(cleanUsername, selectedParts);

    const character = await prisma.character.create({
      data: {
        username: cleanUsername,
        seed,
        selectedParts: selectedParts as any,
        generatorVersion: 1,
      },
    });

    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/characters');
  }
}
