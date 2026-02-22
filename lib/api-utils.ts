import { NextResponse } from 'next/server';

export function handleApiError(error: unknown, context?: string): NextResponse {
  const timestamp = new Date().toISOString();

  if (error instanceof Error) {
    console.error(JSON.stringify({
      timestamp,
      context,
      error: error.message,
      stack: error.stack,
    }));
  } else {
    console.error(JSON.stringify({ timestamp, context, error: 'Unknown error' }));
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown };
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'Resource already exists' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: 'Invalid reference' },
          { status: 400 }
        );
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
