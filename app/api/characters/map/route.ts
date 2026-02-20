import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    const characters = await prisma.character.findMany({
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
    });

    const total = await prisma.character.count();

    return NextResponse.json({
      characters,
      total,
      limit,
      offset,
      startIndex: offset,
      endIndex: offset + characters.length - 1,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error('Error fetching map characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
