import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stringToSeed, seleccionarPartes } from '@/lib/character-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    
    let character = await prisma.character.findUnique({
      where: { username: cleanUsername },
    });

    if (!character) {
      const seed = stringToSeed(cleanUsername);
      const selectedParts = seleccionarPartes(seed);

      character = await prisma.character.create({
        data: {
          username: cleanUsername,
          seed,
          selectedParts: selectedParts as any,
          generatorVersion: 1,
        },
      });
    }

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
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const characters = await prisma.character.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.character.count();

    return NextResponse.json({
      characters,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
