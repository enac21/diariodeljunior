'use client';

import { useEffect, useState, useRef } from 'react';
import { useChatStore, ChatMessage } from '@/lib/stores/chat-store';
import { useMapStore } from '@/lib/stores/map-store';

interface BubbleMessage {
  id: string;
  text: string;
  timestamp: number;
}

interface CharacterBubbles {
  characterId: string;
  messages: BubbleMessage[];
}

const BUBBLE_DURATION = 60000;
const BUBBLE_OFFSET_Y = 190;

export function ChatBubbles() {
  const messages = useChatStore((state) => state.messages);
  const characterPositions = useMapStore((state) => state.characterPositions);
  const [characterBubbles, setCharacterBubbles] = useState<Map<string, CharacterBubbles>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  const [worldTransform, setWorldTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  useEffect(() => {
    const unsubscribe = useMapStore.subscribe((state) => {
      if (state.worldContainer) {
        setWorldTransform({
          x: state.worldContainer.x,
          y: state.worldContainer.y,
          scale: state.worldContainer.scale,
        });
      }
    });
    
    const initialState = useMapStore.getState();
    if (initialState.worldContainer) {
      setWorldTransform({
        x: initialState.worldContainer.x,
        y: initialState.worldContainer.y,
        scale: initialState.worldContainer.scale,
      });
    }
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    const now = Date.now();
    
    messages.forEach((msg: ChatMessage) => {
      const existingTimeout = timeoutsRef.current.get(msg.id);
      if (existingTimeout) return;
      
      const messageAge = now - msg.timestamp;
      if (messageAge >= BUBBLE_DURATION) return;

      setCharacterBubbles((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(msg.characterId);
        
        const alreadyExists = existing?.messages.some(m => m.id === msg.id);
        if (alreadyExists) return prev;
        
        const newMessages = existing 
          ? [...existing.messages, { id: msg.id, text: msg.text, timestamp: msg.timestamp }]
          : [{ id: msg.id, text: msg.text, timestamp: msg.timestamp }];

        newMap.set(msg.characterId, {
          characterId: msg.characterId,
          messages: newMessages,
        });

        return newMap;
      });

      const timeUntilExpiry = BUBBLE_DURATION - messageAge;
      const timeout = setTimeout(() => {
        setCharacterBubbles((prev) => {
          const newMap = new Map(prev);
          const existing = newMap.get(msg.characterId);
          if (existing) {
            const filtered = existing.messages.filter((m) => m.id !== msg.id);
            if (filtered.length === 0) {
              newMap.delete(msg.characterId);
            } else {
              newMap.set(msg.characterId, { ...existing, messages: filtered });
            }
          }
          return newMap;
        });
        timeoutsRef.current.delete(msg.id);
      }, timeUntilExpiry);
      
      timeoutsRef.current.set(msg.id, timeout);
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const transform = `translate(${worldTransform.x}px, ${worldTransform.y}px) scale(${worldTransform.scale})`;

  return (
    <div 
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div 
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform }}
      >
        {Array.from(characterBubbles.entries()).map(([characterId, data]) => {
          const pos = characterPositions.get(characterId);
          if (!pos) return null;

          return (
            <div
              key={characterId}
              className="absolute flex flex-col items-center"
              style={{
                left: pos.x + 10,
                top: pos.y - BUBBLE_OFFSET_Y,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {data.messages.map((msg, index) => {
                return (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: index === data.messages.length - 1 ? 0 : 14,
                    }}
                  >
                    <div className="relative max-w-[180px] rounded-2xl bg-white px-3 py-1.5 text-sm text-gray-900 shadow-md border-2 border-gray-300">
                      <div className="whitespace-pre-wrap break-words text-center font-medium leading-tight">
                        {msg.text}
                      </div>
                      <svg 
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{ bottom: -10 }}
                        width="16" 
                        height="10" 
                        viewBox="0 0 16 10"
                      >
                        <path 
                          d="M8 10L0 0H16L8 10Z" 
                          fill="white"
                        />
                        <path 
                          d="M8 10L0 0" 
                          stroke="#d1d5db" 
                          strokeWidth="2"
                          fill="none"
                        />
                        <path 
                          d="M8 10L16 0" 
                          stroke="#d1d5db" 
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useActiveChatCharacters() {
  const [activeCharacters, setActiveCharacters] = useState<Set<string>>(new Set());
  const messages = useChatStore((state) => state.messages);

  useEffect(() => {
    const now = Date.now();
    const active = new Set<string>();
    
    messages.forEach((msg) => {
      if (now - msg.timestamp < BUBBLE_DURATION) {
        active.add(msg.characterId);
      }
    });
    
    setActiveCharacters(active);
  }, [messages]);

  return activeCharacters;
}
