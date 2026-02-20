import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const total = await prisma.character.count();
    
    return NextResponse.json({ total });
  } catch (error) {
    console.error('Error counting characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
