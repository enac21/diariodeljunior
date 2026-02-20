'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GalleryMap } from '@/components/gallery/GalleryMap';
import { CharacterModal } from '@/components/gallery/CharacterModal';
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

  return (
    <main className="h-screen w-screen overflow-hidden">
      <div className="absolute left-4 top-4 z-10">
        <Link
          href="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Inicio
        </Link>
        <Link
          href="/galeria"
          className="ml-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          Galería clásica
        </Link>
      </div>
      
      <GalleryMap onCharacterClick={setSelectedCharacter} />
      
      <CharacterModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </main>
  );
}
