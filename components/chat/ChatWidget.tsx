'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/lib/hooks/use-chat';
import { useCharacterSearch } from '@/lib/hooks/use-character-search';
import { CharacterSearchInput } from '@/components/character-search-input';

const isPusherConfigured = !!process.env.NEXT_PUBLIC_PUSHER_KEY;

interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Record<string, number>;
  createdAt: string;
}

interface ChatWidgetProps {
  onCharacterClaimed?: (characterId: string) => void;
}

export function ChatWidget({ onCharacterClaimed }: ChatWidgetProps) {
  const {
    messages,
    isOpen,
    myCharacterId,
    myCharacterName,
    setOpen,
    claimCharacter,
    releaseCharacter,
    sendMessage,
    isCharacterClaimed,
  } = useChat();

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch,
  } = useCharacterSearch();

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);
    const result = await sendMessage(inputValue);
    if (result.success) {
      setInputValue('');
    }
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectCharacter = async (character: Character) => {
    if (isCharacterClaimed(character.id)) {
      return;
    }

    const result = await claimCharacter(character.id, character.username);
    if (result.success) {
      clearSearch();
      onCharacterClaimed?.(character.id);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <button
        onClick={() => setOpen(!isOpen)}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border/50 bg-card/90 text-foreground shadow-lg backdrop-blur-sm transition-all hover:bg-card hover:scale-105 active:scale-95 md:h-14 md:w-14"
        aria-label="Chat"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-50 flex h-[70vh] w-[90vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl md:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]">
          {!myCharacterId ? (
            <div className="flex flex-1 flex-col">
              <div className="border-b border-border/50 p-4">
                <h3 className="text-lg font-semibold text-foreground">Únete al chat</h3>
                <p className="text-sm text-muted-foreground">Selecciona tu personaje para chatear</p>
                {!isPusherConfigured && (
                  <p className="mt-2 text-xs text-amber-500">
                    ⚠️ Pusher no configurado - El chat no funcionará hasta configurarlo
                  </p>
                )}
              </div>

              <div className="p-4">
                <CharacterSearchInput
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  onSelect={handleSelectCharacter}
                  isDisabled={(char) => isCharacterClaimed(char.id)}
                  disabledLabel="En uso"
                />
              </div>

              <div className="flex-1 overflow-y-auto px-4">
                {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No se encontraron personajes
                  </p>
                )}
                {searchQuery.length < 2 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Escribe al menos 2 caracteres para buscar
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-border/50 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {myCharacterName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{myCharacterName}</p>
                    <p className="text-xs text-muted-foreground">Chat global</p>
                  </div>
                </div>
                <button
                  onClick={releaseCharacter}
                  className="rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cambiar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">No hay mensajes todavía</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col rounded-lg p-2 ${
                        msg.characterId === myCharacterId
                          ? 'bg-primary/10 ml-8'
                          : 'bg-muted/50 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium ${
                          msg.characterId === myCharacterId ? 'text-primary' : 'text-foreground'
                        }`}>
                          {msg.characterName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground break-words">{msg.text}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border/50 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    maxLength={500}
                    className="flex-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isSending}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
