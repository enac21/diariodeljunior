"use client";

import { useState } from "react";
import Link from "next/link";
import { CharacterSVG, rutaAsset, type Seleccion } from "@/src/components/CharacterSVG";

export const runtime = "nodejs"

interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Seleccion;
  generatorVersion: number;
  createdAt: string;
}

export default function Page() {
  const [inputId, setInputId] = useState("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputId.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputId.trim() }),
      });

      if (!res.ok) {
        throw new Error('Error al crear el personaje');
      }

      const data = await res.json();
      setCharacter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
              Generador de Personajes
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresa un ID para generar un personaje procedimental único
            </p>
          </div>
          <Link
            href="/galeria"
            className="rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            Galería
          </Link>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="mb-6 flex gap-2"
        >
          <input
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Ingresa un ID..."
            className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="ID del personaje"
          />
          <button
            type="submit"
            disabled={!inputId.trim() || loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar'}
          </button>
        </form>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {character && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <CharacterSVG seleccion={character.selectedParts} activeId={character.username} />
            </div>

            <details className="w-full">
              <summary className="cursor-pointer rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Ver Atributos
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                {JSON.stringify(
                  {
                    id: character.username,
                    seed: character.seed,
                    cuerpo: { variante: character.selectedParts.cuerpo, archivo: rutaAsset("cuerpo", character.selectedParts.cuerpo) },
                    ojos: { variante: character.selectedParts.ojos, archivo: rutaAsset("ojos", character.selectedParts.ojos) },
                    boca: { variante: character.selectedParts.boca, archivo: rutaAsset("boca", character.selectedParts.boca) },
                    nariz: { variante: character.selectedParts.nariz, archivo: rutaAsset("nariz", character.selectedParts.nariz) },
                    cabeza: { variante: character.selectedParts.cabeza, archivo: rutaAsset("cabeza", character.selectedParts.cabeza) },
                    pies: { variante: character.selectedParts.pies, archivo: rutaAsset("pies", character.selectedParts.pies) },
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}

        {!character && !loading && (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
            <svg viewBox="0 0 300 300" width={120} height={120} className="opacity-20">
              <ellipse cx={150} cy={190} rx={60} ry={70} fill="currentColor" />
              <circle cx={130} cy={155} r={12} fill="#fff" />
              <circle cx={170} cy={155} r={12} fill="#fff" />
              <polygon points="150,85 110,125 190,125" fill="currentColor" />
            </svg>
            <p className="text-sm">Escribe un ID arriba para generar un personaje</p>
          </div>
        )}
      </div>
    </main>
  );
}
