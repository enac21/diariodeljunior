import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  timestamp: number;
}

export interface ClaimedCharacter {
  characterId: string;
  characterName: string;
  claimedBy: string;
  lastHeartbeat: number;
}

interface ChatState {
  messages: ChatMessage[];
  claimedCharacters: Map<string, ClaimedCharacter>;
  myCharacterId: string | null;
  myCharacterName: string | null;
  mySessionId: string;
  isOpen: boolean;
  
  addMessage: (message: ChatMessage) => void;
  removeOldMessages: () => void;
  setClaimedCharacters: (claims: ClaimedCharacter[]) => void;
  updateClaim: (claim: ClaimedCharacter) => void;
  removeClaim: (characterId: string) => void;
  setMyCharacter: (id: string | null, name: string | null) => void;
  setOpen: (open: boolean) => void;
}

const SESSION_ID = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const MESSAGE_TTL = 20 * 60 * 1000;
const CLAIM_TTL = 60 * 1000;

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      claimedCharacters: new Map(),
      myCharacterId: null,
      myCharacterName: null,
      mySessionId: SESSION_ID,
      isOpen: false,

      addMessage: (message) => {
        set((state) => {
          const exists = state.messages.some(m => m.id === message.id);
          if (exists) return state;
          
          const newMessages = [...state.messages, message];
          const cutoff = Date.now() - MESSAGE_TTL;
          return {
            messages: newMessages.filter(m => m.timestamp > cutoff)
          };
        });
      },

      removeOldMessages: () => {
        set((state) => {
          const cutoff = Date.now() - MESSAGE_TTL;
          return {
            messages: state.messages.filter(m => m.timestamp > cutoff)
          };
        });
      },

      setClaimedCharacters: (claims) => {
        set(() => {
          const map = new Map<string, ClaimedCharacter>();
          const now = Date.now();
          claims.forEach(claim => {
            if (now - claim.lastHeartbeat < CLAIM_TTL) {
              map.set(claim.characterId, claim);
            }
          });
          return { claimedCharacters: map };
        });
      },

      updateClaim: (claim) => {
        set((state) => {
          const map = new Map(state.claimedCharacters);
          map.set(claim.characterId, claim);
          return { claimedCharacters: map };
        });
      },

      removeClaim: (characterId) => {
        set((state) => {
          const map = new Map(state.claimedCharacters);
          map.delete(characterId);
          return { claimedCharacters: map };
        });
      },

      setMyCharacter: (id, name) => {
        set({ myCharacterId: id, myCharacterName: name });
      },

      setOpen: (open) => {
        set({ isOpen: open });
      },
    }),
    {
      name: 'character-forge-chat',
      partialize: (state) => ({
        mySessionId: state.mySessionId,
      }),
    }
  )
);

const CHAT_ACTIVE_DURATION = 60000;

export function useActiveChatCharacterIds(): Set<string> {
  const messages = useChatStore((state) => state.messages);
  const activeCharacters = new Set<string>();
  const now = Date.now();
  
  messages.forEach((msg) => {
    if (now - msg.timestamp < CHAT_ACTIVE_DURATION) {
      activeCharacters.add(msg.characterId);
    }
  });
  
  return activeCharacters;
}

export { generateId };
