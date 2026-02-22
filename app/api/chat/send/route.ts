import Pusher from 'pusher';
import { NextRequest, NextResponse } from 'next/server';
import { ChatMessage } from '@/lib/stores/chat-store';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body as { message: ChatMessage; sessionId: string };

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    if (message.text.length > 500) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    if (message.text.trim().length === 0) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 });
    }

    await pusher.trigger('chat-global', 'new-message', {
      ...message,
      text: message.text.trim(),
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
