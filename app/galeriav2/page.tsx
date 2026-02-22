'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GalleryMap } from '@/components/gallery/GalleryMap';
import { CharacterModal } from '@/components/gallery/CharacterModal';
import { LinksModal } from '@/components/gallery/LinksModal';
import { ChatWidget, ChatBubbles } from '@/components/chat';
import { CharacterSearchInput } from '@/components/character-search-input';
import { useCharacterSearch } from '@/lib/hooks/use-character-search';
import type { Seleccion } from '@/lib/character-generator';

interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Seleccion;
  createdAt: string;
}

export default function GaleriaV2Page() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [focusCharacterId, setFocusCharacterId] = useState<string | null>(null);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch,
  } = useCharacterSearch();

  const handleSelectCharacter = (character: { id: string; username: string }) => {
    setFocusCharacterId(character.id);
    clearSearch();
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
        <CharacterSearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onSelect={handleSelectCharacter}
        />
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
      
      <ChatBubbles />
      <ChatWidget onCharacterClaimed={setFocusCharacterId} />
    </main>
  );
}
