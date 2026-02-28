import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { rateLimit, extractIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import { stringToSeed, seleccionarPartes, generateAndSaveAvatar } from '@/lib/character-generator';

const PAGINATION_DEFAULT_LIMIT = 50;
const PAGINATION_MAX_LIMIT = 100;
const SEARCH_MAX_LIMIT = 20;
const USERNAME_MAX_LENGTH = 24;

const HABBO_BATCH_THRESHOLD = parseInt(process.env.HABBO_BATCH_THRESHOLD || '20');
const HABBO_DELAY_SMALL_BATCH_MS = parseInt(process.env.HABBO_DELAY_SMALL_BATCH_MS || '2000');
const HABBO_DELAY_LARGE_BATCH_MS = parseInt(process.env.HABBO_DELAY_LARGE_BATCH_MS || '25000');

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(maxMs: number): Promise<void> {
  return delay(Math.random() * maxMs);
}

function randomDelayRange(minMs: number, maxMs: number): Promise<void> {
  const range = maxMs - minMs;
  const actualDelay = minMs + Math.random() * range;
  return delay(actualDelay);
}

async function processWithRateLimit(
  users: User[],
  processor: (user: User) => Promise<{ created: number; skipped: number; errors: number }>
) {
  const results = { created: 0, skipped: 0, errors: 0 };
  const isLargeBatch = users.length > HABBO_BATCH_THRESHOLD;

  const processUser = async (user: User, index: number) => {
    const result = await processor(user);
    
    if (result.created) results.created++;
    else if (result.skipped) results.skipped++;
    else results.errors++;

    if (index < users.length - 1) {
      if (isLargeBatch) {
        const minDelay = Math.max(HABBO_DELAY_LARGE_BATCH_MS - 5000, 2000);
        const maxDelay = 5000;
        console.log(`[RateLimit] Large batch: random delay between ${minDelay}ms and ${maxDelay}ms...`);
        await randomDelayRange(minDelay, maxDelay);
      } else {
        console.log(`[RateLimit] Small batch: random delay up to ${HABBO_DELAY_SMALL_BATCH_MS}ms...`);
        await randomDelay(HABBO_DELAY_SMALL_BATCH_MS);
      }
    }
  };

  for (let i = 0; i < users.length; i++) {
    await processUser(users[i], i);
  }

  return results;
}

interface User {
  id: string;
  username: string;
  joinedAt: string;
}

interface RequestBody {
  users: User[];
}

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
        where: { username: { contains: search, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({ characters, total: characters.length, limit, offset: 0 });
    }

    const { limit, offset } = parsePagination(searchParams.get('limit'), searchParams.get('offset'));

    const [characters, total] = await Promise.all([
      prisma.character.findMany({ orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
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

async function createCharacter(userId: string, username: string) {
  if (!username || typeof username !== 'string') {
    return null;
  }

  const cleanUsername = username.trim().normalize('NFC').slice(0, USERNAME_MAX_LENGTH);

  if (cleanUsername.length < 2) {
    return null;
  }

  const seed = stringToSeed(userId);
  const existingBySeed = await prisma.character.findUnique({ where: { seed } });
  if (existingBySeed) {
    return { character: existingBySeed, created: false };
  }

  const selectedParts = seleccionarPartes(seed);
  let imageUrl: string | null = null;

  try {
    imageUrl = await generateAndSaveAvatar(cleanUsername, selectedParts);
  } catch (e) {
    console.error(`Error generating avatar for ${cleanUsername}:`, e);
  }

  const character = await prisma.character.create({
    data: {
      username: cleanUsername,
      seed,
      selectedParts: selectedParts as any,
      generatorVersion: 1,
      imageUrl,
    },
  });

  return { character, created: true };
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
    let body: RequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body?.users || !Array.isArray(body.users) || body.users.length === 0) {
      return NextResponse.json({ error: 'Invalid body: expected { users: [...] }' }, { status: 400 });
    }

    const results = await processWithRateLimit(body.users, async (user) => {
      const result = await createCharacter(user.id, user.username);
      if (result === null) return { created: 0, skipped: 0, errors: 1 };
      if (result.created) return { created: 1, skipped: 0, errors: 0 };
      return { created: 0, skipped: 1, errors: 0 };
    });

    return NextResponse.json({
      message: 'Users processed',
      total: body.users.length,
      results,
    });
  } catch (error) {
    return handleApiError(error, 'POST /api/characters');
  }
}
