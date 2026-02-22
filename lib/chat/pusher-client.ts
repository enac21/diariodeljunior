import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
    console.warn('[Chat] Pusher key not configured. Chat will not work.');
    return null;
  }

  if (!pusherClient) {
    pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
    });
  }
  return pusherClient;
}

export function disconnectPusher(): void {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
}
