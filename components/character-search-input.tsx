'use client';

import { useRef, useEffect } from 'react';

interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Record<string, number>;
  createdAt: string;
}

interface CharacterSearchInputProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Character[];
  isSearching: boolean;
  onSelect: (character: Character) => void;
  isDisabled?: (character: Character) => boolean;
  placeholder?: string;
  disabledLabel?: string;
}

export function CharacterSearchInput({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  onSelect,
  isDisabled,
  placeholder = 'Buscar personaje...',
  disabledLabel = 'No disponible',
}: CharacterSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border/50 bg-background pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 animate-spin text-muted-foreground" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-lg">
          {searchResults.map((char) => {
            const disabled = isDisabled?.(char);
            return (
              <button
                key={char.id}
                onClick={() => !disabled && onSelect(char)}
                disabled={disabled}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                  disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{char.username}</div>
                  <div className="text-xs text-muted-foreground">Seed: {char.seed}</div>
                </div>
                {disabled && (
                  <span className="text-xs text-muted-foreground">{disabledLabel}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
