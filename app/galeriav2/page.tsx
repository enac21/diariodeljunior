'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { GalleryMap } from '@/components/gallery/GalleryMap';
import { CharacterModal } from '@/components/gallery/CharacterModal';
import { LinksModal } from '@/components/gallery/LinksModal';
import { useRevealedStore } from '@/lib/stores/revealed-store';
import { useCharactersData } from '@/lib/hooks/useCharactersData';
import type { Character } from '@/lib/types/character';

export default function GaleriaV2Page() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusCharacterId, setFocusCharacterId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Character[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);

  const revealAll = useRevealedStore((state) => state.revealAll);

  const handleRevealAll = () => {
    revealAll();
  };

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch(`/api/characters?search=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      setSearchResults(data.characters || []);
    } catch (e) {
      console.error('Search error:', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectCharacter = (character: Character) => {
    setFocusCharacterId(character.id);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <nav className="absolute left-[calc(1rem+env(safe-area-inset-left))] top-[calc(1rem+env(safe-area-inset-top))] z-10 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-card">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Inicio
        </Link>
        <Link href="/galeria" className="rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-card">
          Galería
        </Link>
      </nav>

      <div className="absolute left-1/2 top-[calc(1rem+env(safe-area-inset-top))] z-10 -translate-x-1/2">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/90 backdrop-blur-sm px-3 py-2">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar personaje..."
                className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none md:w-64"
              />
              {isSearching && (
                <svg className="h-4 w-4 animate-spin text-muted-foreground" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>

            <button
              onClick={handleRevealAll}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-border/50 bg-card/90 backdrop-blur-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-card hover:text-foreground"
              title="Mostrar todos los personajes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-64 overflow-auto rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm">
              {searchResults.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{char.username}</div>
                    <div className="text-xs text-muted-foreground">Seed: {char.seed}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <GalleryMap
        onCharacterClick={setSelectedCharacter}
        focusCharacterId={focusCharacterId}
        onLogoClick={() => setIsLinksModalOpen(true)}
      />

      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />

      <LinksModal
        isOpen={isLinksModalOpen}
        onClose={() => setIsLinksModalOpen(false)}
      />

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 text-[10px] text-muted-foreground/50 text-center max-w-xs px-2">
        Diario del Junior is not affiliated with, endorsed, or sponsored by Sulake Suomi. Habbo assets used under Fan Site Policy.
      </div>
    </main>
  );
}
