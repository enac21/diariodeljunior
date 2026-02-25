'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Character } from '@/lib/types/character';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl p-4 shadow-2xl shadow-primary/5 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border text-muted-foreground transition-all hover:bg-muted hover:text-foreground z-10"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-xl" />
            <div className="relative rounded-xl border border-border/50 bg-background/50 p-2">
              <Image
                src={`/avatars/${character.username}.png`}
                alt={character.username}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
          
          <div className="mt-3 text-center">
            <h2 className="text-lg font-bold text-foreground">
              {character.username}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-3 text-xs">
              <div className="rounded-lg bg-muted/50 px-2 py-1 font-mono text-muted-foreground">
                seed: <span className="text-foreground">{character.seed}</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(character.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
