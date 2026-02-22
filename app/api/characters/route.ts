import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stringToSeed, seleccionarPartes } from '@/lib/character-generator';
import { rateLimit, extractIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 24;
const PAGINATION_DEFAULT_LIMIT = 50;
const PAGINATION_MAX_LIMIT = 100;

function parsePagination(limit: string | null, offset: string | null) {
  const parsedLimit = parseInt(limit || '') || PAGINATION_DEFAULT_LIMIT;
  const parsedOffset = Math.max(parseInt(offset || '') || 0, 0);
  return {
    limit: Math.min(Math.max(parsedLimit, 1), PAGINATION_MAX_LIMIT),
    offset: parsedOffset,
  };
}

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
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().normalize('NFC').slice(0, USERNAME_MAX_LENGTH);

    if (cleanUsername.length < USERNAME_MIN_LENGTH) {
      return NextResponse.json(
        { error: 'Username must be at least 2 characters' },
        { status: 400 }
      );
    }

    const seed = stringToSeed(cleanUsername);
    const selectedParts = seleccionarPartes(seed);

    const character = await prisma.character.upsert({
      where: { username: cleanUsername },
      update: {},
      create: {
        username: cleanUsername,
        seed,
        selectedParts: selectedParts as any,
        generatorVersion: 1,
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error('Error creating/fetching character:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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
    const { limit, offset } = parsePagination(
      searchParams.get('limit'),
      searchParams.get('offset')
    );

    const characters = await prisma.character.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.character.count();

    return NextResponse.json(
      { characters, total, limit, offset },
      { headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' } }
    );
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
