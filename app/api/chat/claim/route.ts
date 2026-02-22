import { NextRequest, NextResponse } from 'next/server';

interface Claim {
  characterId: string;
  characterName: string;
  claimedBy: string;
  lastHeartbeat: number;
}

const claims = new Map<string, Claim>();
const CLAIM_TTL = 60 * 1000;

setInterval(() => {
  const now = Date.now();
  claims.forEach((claim, key) => {
    if (now - claim.lastHeartbeat > CLAIM_TTL) {
      claims.delete(key);
    }
  });
}, 10 * 1000);

export async function GET() {
  const now = Date.now();
  const activeClaims = Array.from(claims.values()).filter(
    c => now - c.lastHeartbeat < CLAIM_TTL
  );
  return NextResponse.json({ claims: activeClaims });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, characterId, characterName, sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    if (action === 'claim') {
      if (!characterId || !characterName) {
        return NextResponse.json({ error: 'Missing character data' }, { status: 400 });
      }

      const existingClaim = claims.get(characterId);
      if (existingClaim && existingClaim.claimedBy !== sessionId) {
        const now = Date.now();
        if (now - existingClaim.lastHeartbeat < CLAIM_TTL) {
          return NextResponse.json({ 
            error: 'Character already claimed',
            claimedBy: existingClaim.claimedBy 
          }, { status: 409 });
        }
      }

      claims.set(characterId, {
        characterId,
        characterName,
        claimedBy: sessionId,
        lastHeartbeat: Date.now(),
      });

      return NextResponse.json({ 
        success: true,
        claims: Array.from(claims.values())
      });
    }

    if (action === 'heartbeat') {
      if (!characterId) {
        return NextResponse.json({ error: 'Missing characterId' }, { status: 400 });
      }

      const claim = claims.get(characterId);
      if (claim && claim.claimedBy === sessionId) {
        claim.lastHeartbeat = Date.now();
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Claim not found or not owned' }, { status: 404 });
    }

    if (action === 'release') {
      if (!characterId) {
        return NextResponse.json({ error: 'Missing characterId' }, { status: 400 });
      }

      const claim = claims.get(characterId);
      if (claim && claim.claimedBy === sessionId) {
        claims.delete(characterId);
        return NextResponse.json({ 
          success: true,
          claims: Array.from(claims.values())
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'list') {
      const now = Date.now();
      const activeClaims = Array.from(claims.values()).filter(
        c => now - c.lastHeartbeat < CLAIM_TTL
      );
      return NextResponse.json({ claims: activeClaims });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
