'use client';

import { useEffect, useCallback } from 'react';
import { CharacterSVG } from '@/components/CharacterSVG';
import type { Seleccion } from '@/lib/character-generator';

interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Seleccion;
  createdAt: string;
}

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
}

export function CharacterModal({ character, onClose }: CharacterModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!character) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <div className="rounded-xl bg-background p-4">
            <CharacterSVG
              seleccion={character.selectedParts}
              activeId={character.username}
            />
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-xl font-bold text-card-foreground">
              {character.username}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Seed: {character.seed}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Creado: {new Date(character.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
