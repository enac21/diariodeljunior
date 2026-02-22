import { useEffect, useCallback, useRef } from 'react';
import { getPusherClient } from '@/lib/chat/pusher-client';
import { useChatStore, ChatMessage, generateId, ClaimedCharacter } from '@/lib/stores/chat-store';

const CHANNEL_NAME = 'chat-global';
const HEARTBEAT_INTERVAL = 30 * 1000;
const CLEANUP_INTERVAL = 60 * 1000;

export function useChat() {
  const {
    messages,
    claimedCharacters,
    myCharacterId,
    myCharacterName,
    mySessionId,
    isOpen,
    addMessage,
    removeOldMessages,
    setClaimedCharacters,
    updateClaim,
    removeClaim,
    setMyCharacter,
    setOpen,
  } = useChatStore();

  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribedRef = useRef(false);

  const claimCharacter = useCallback(async (characterId: string, characterName: string) => {
    try {
      const res = await fetch('/api/chat/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim',
          characterId,
          characterName,
          sessionId: mySessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to claim' };
      }

      setMyCharacter(characterId, characterName);
      setClaimedCharacters(data.claims);

      heartbeatRef.current = setInterval(async () => {
        try {
          await fetch('/api/chat/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'heartbeat',
              characterId,
              sessionId: mySessionId,
            }),
          });
        } catch (e) {
          console.error('Heartbeat error:', e);
        }
      }, HEARTBEAT_INTERVAL);

      return { success: true };
    } catch (error) {
      console.error('Claim error:', error);
      return { success: false, error: 'Network error' };
    }
  }, [mySessionId, setMyCharacter, setClaimedCharacters]);

  const releaseCharacter = useCallback(async () => {
    if (!myCharacterId) return;

    try {
      await fetch('/api/chat/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release',
          characterId: myCharacterId,
          sessionId: mySessionId,
        }),
      });
    } catch (error) {
      console.error('Release error:', error);
    }

    setMyCharacter(null, null);
    removeClaim(myCharacterId);

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, [myCharacterId, mySessionId, setMyCharacter, removeClaim]);

  const sendMessage = useCallback(async (text: string) => {
    if (!myCharacterId || !myCharacterName) {
      return { success: false, error: 'No character selected' };
    }

    if (!text.trim()) {
      return { success: false, error: 'Empty message' };
    }

    const message: ChatMessage = {
      id: generateId(),
      characterId: myCharacterId,
      characterName: myCharacterName,
      text: text.trim(),
      timestamp: Date.now(),
    };

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId: mySessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send' };
      }

      return { success: true };
    } catch (error) {
      console.error('Send error:', error);
      return { success: false, error: 'Network error' };
    }
  }, [myCharacterId, myCharacterName, mySessionId]);

  const fetchClaims = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/claim?action=list');
      if (!res.ok) return;
      const data = await res.json();
      if (data.claims) {
        setClaimedCharacters(data.claims);
      }
    } catch (error) {
      console.error('Fetch claims error:', error);
    }
  }, [setClaimedCharacters]);

  const isCharacterClaimed = useCallback((characterId: string): boolean => {
    if (characterId === myCharacterId) return false;
    return claimedCharacters.has(characterId);
  }, [claimedCharacters, myCharacterId]);

  const getClaimedBy = useCallback((characterId: string): string | null => {
    const claim = claimedCharacters.get(characterId);
    return claim ? claim.claimedBy : null;
  }, [claimedCharacters]);

  useEffect(() => {
    const pusher = getPusherClient();
    
    if (pusher) {
      const channel = pusher.subscribe(CHANNEL_NAME);

      channel.bind('new-message', (message: ChatMessage) => {
        addMessage(message);
      });

      channel.bind('claim-updated', (claims: ClaimedCharacter[]) => {
        setClaimedCharacters(claims);
      });

      pusher.connection.bind('connected', () => {
        fetchClaims();
      });

      isSubscribedRef.current = true;

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(CHANNEL_NAME);
        isSubscribedRef.current = false;
      };
    }

    fetchClaims();

    cleanupRef.current = setInterval(() => {
      removeOldMessages();
    }, CLEANUP_INTERVAL);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
      releaseCharacter();
    };
  }, [addMessage, fetchClaims, removeOldMessages, setClaimedCharacters]);

  return {
    messages,
    isOpen,
    myCharacterId,
    myCharacterName,
    mySessionId,
    claimedCharacters,
    setOpen,
    claimCharacter,
    releaseCharacter,
    sendMessage,
    fetchClaims,
    isCharacterClaimed,
    getClaimedBy,
  };
}
