"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { CharacterSVG } from "@/components/CharacterSVG";
import { createOrGetCharacter } from "@/app/actions/characters";
import type { Character } from "@/lib/types/character";

export default function Page() {
  const [inputId, setInputId] = useState("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCharacters, setTotalCharacters] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/characters/count');
        const data = await res.json();
        setTotalCharacters(data.total);
      } catch {
        setTotalCharacters(0);
      }
      requestAnimationFrame(() => {
        setIsReady(true);
      });
    };
    fetchData();
  }, []);

  const handleGenerate = async () => {
    if (!inputId.trim()) return;

    setLoading(true);
    setError(null);

    const result = await createOrGetCharacter(inputId.trim());

    if (result.error) {
      setError(result.error);
    } else if (result.character) {
      setCharacter(result.character as unknown as Character);
      if (totalCharacters !== null) {
        setTotalCharacters(prev => prev !== null ? prev + 1 : 1);
      }
    }

    setLoading(false);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-[0.02]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>
      
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-foreground">Character</span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">Forge</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-1">
          <Link href="/galeria" className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98]">
            Galería
          </Link>
          <Link href="/galeriav2" className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-[0.98]">
            Mapa
          </Link>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-12 md:px-12 md:pt-20">
        <div className={`flex flex-col items-center text-center transition-all duration-500 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {totalCharacters === null ? (
              <span className="inline-block h-4 w-16 animate-pulse rounded bg-muted-foreground/20" />
            ) : (
              `${totalCharacters.toLocaleString()} personajes generados`
            )}
          </div>
          
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Genera personajes{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">únicos</span>
            {" "}con solo un ID
          </h1>
          
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            Algoritmo procedimental que crea combinaciones infinitas de personajes SVG. 
            El mismo ID siempre genera el mismo personaje.
          </p>
        </div>

        <div className={`mt-12 md:mt-16 transition-all duration-500 delay-100 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mx-auto max-w-md">
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 glow">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Generar Personaje</h2>
                  <p className="text-xs text-muted-foreground">Ingresa cualquier texto como ID</p>
                </div>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate();
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    placeholder="tu-nombre, palabra, cualquier cosa..."
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 pr-20"
                    aria-label="ID del personaje"
                  />
                  <button
                    type="submit"
                    disabled={!inputId.trim() || loading}
                    className="absolute right-1 top-1 bottom-1 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : 'Crear'}
                  </button>
                </div>
                
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </form>
            </div>
          </div>
        </div>

        {character && (
          <div className="mt-8 animate-scale-in">
            <div className="mx-auto max-w-md">
              <div className="rounded-xl border border-border bg-card overflow-hidden glow">
                <div className="flex flex-col items-center p-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 blur-xl" />
                    <div className="relative rounded-xl border border-border/50 bg-background/50 p-4">
                      <CharacterSVG 
                        seleccion={character.selectedParts} 
                        activeId={character.username} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                      {character.username}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      seed: {character.seed}
                    </p>
                  </div>
                </div>
                
                <details className="border-t border-border">
                  <summary className="cursor-pointer px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    Ver desglose de partes
                  </summary>
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(['cuerpo', 'ojos', 'boca', 'nariz', 'cabeza', 'pies'] as const).map((parte) => (
                        <div key={parte} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                          <span className="capitalize text-muted-foreground">{parte}</span>
                          <span className="font-mono text-foreground">#{character.selectedParts[parte]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {!character && (
          <div className={`mt-12 text-center transition-all duration-500 delay-200 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-8 flex items-center justify-center gap-8 text-muted-foreground/50">
              <div className="flex flex-col items-center gap-2">
                <div className="h-16 w-16 rounded-full border border-border/50 bg-muted/20" />
                <span className="text-xs">Cabeza</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-16 rounded-lg border border-border/50 bg-muted/20" />
                <span className="text-xs">Cuerpo</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-16 rounded-md border border-border/50 bg-muted/20" />
                <span className="text-xs">Pies</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              6 partes × 5 variantes = <span className="font-semibold text-foreground">15,625 combinaciones</span>
            </p>
          </div>
        )}

        <div className={`mt-20 grid gap-6 md:grid-cols-3 transition-all duration-500 delay-300 ${isReady ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link href="/galeria" className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm group p-6 transition-all hover:border-primary/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Galería</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ver todos los personajes en cuadrícula
            </p>
          </Link>
          
          <Link href="/galeriav2" className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm group p-6 transition-all hover:border-primary/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Mapa Interactivo</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Explora personajes en un mapa infinito
            </p>
          </Link>
          
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-foreground">Open Source</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Algoritmo determinista y replicable
            </p>
          </div>
        </div>
      </div>

      <footer className="relative z-10 mt-20 border-t border-border/50 py-6">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>Character Forge — Generador de personajes procedimental</p>
            <p className="font-mono text-xs">v1.0.0</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
