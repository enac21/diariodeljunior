'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { CharacterSVG } from '@/components/CharacterSVG';
import type { Character } from '@/lib/types/character';

const BATCH_SIZE = 20;

export default function GaleriaPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchCharacters = useCallback(async (offset: number, limit: number) => {
    const res = await fetch(`/api/characters?offset=${offset}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  }, []);

  useEffect(() => {
    async function loadInitial() {
      try {
        const data = await fetchCharacters(0, BATCH_SIZE);
        setCharacters(data.characters || []);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Error loading characters:', error);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [fetchCharacters]);

  const loadMore = useCallback(async () => {
    if (loadingMore || characters.length >= total) return;
    
    setLoadingMore(true);
    try {
      const offset = characters.length;
      const data = await fetchCharacters(offset, BATCH_SIZE);
      setCharacters(prev => [...prev, ...(data.characters || [])]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, characters.length, total, fetchCharacters]);

  useEffect(() => {
    if (loading) return;

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, options);

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, loadMore]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-[0.02]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute right-1/4 bottom-0 translate-y-1/2 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>
      
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-foreground">Character</span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Forge</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-1">
          <span className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Galería
          </span>
          <Link href="/galeriav2" className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98]">
            Mapa
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-12 md:py-12">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Galería de Personajes
            </h1>
            <p className="mt-2 text-muted-foreground">
              <span className="font-semibold text-foreground">{total}</span> personajes únicos creados
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Personaje
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
                <div className="flex items-center justify-center bg-gradient-to-br from-muted/30 to-background p-6">
                  <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-muted/50" />
                </div>
                <div className="border-t border-border/50 p-4">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted/50" />
                  <div className="mt-2 h-4 w-16 animate-pulse rounded bg-muted/50" />
                </div>
              </div>
            ))}
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-16 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-2xl" />
              <div className="relative rounded-full border border-border/50 bg-muted/30 p-6">
                <svg viewBox="0 0 300 300" width={80} height={80} className="text-muted-foreground/50">
                  <ellipse cx={150} cy={190} rx={60} ry={70} fill="currentColor" />
                  <circle cx={130} cy={155} r={12} fill="currentColor" opacity="0.5" />
                  <circle cx={170} cy={155} r={12} fill="currentColor" opacity="0.5" />
                  <polygon points="150,85 110,125 190,125" fill="currentColor" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              No hay personajes aún
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Crea tu primer personaje usando cualquier ID y aparecerá aquí automáticamente.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
            >
              Crear primer personaje
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up"
                >
                  <div className="relative flex items-center justify-center bg-gradient-to-br from-muted/30 to-background p-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <CharacterSVG
                      seleccion={character.selectedParts}
                      activeId={character.username}
                    />
                  </div>
                  <div className="border-t border-border/50 p-4">
                    <h3 className="truncate font-semibold text-foreground transition-colors">
                      {character.username}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">seed: {character.seed}</span>
                      <span className="text-border">•</span>
                      <span>
                        {new Date(character.createdAt).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm">Cargando más personajes...</span>
                </div>
              )}
              {!loadingMore && characters.length >= total && total > 0 && (
                <p className="text-sm text-muted-foreground">
                  Has visto los {total} personajes
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
