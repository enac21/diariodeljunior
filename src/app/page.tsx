"use client";

import { useState } from "react";
import { CharacterSVG, rutaAsset, type Seleccion } from "@/src/components/CharacterSVG";

// ─── Seeded Pseudo-Random Number Generator ───────────────────────────────────
function createSeededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return function next(): number {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ─── Partes del personaje ────────────────────────────────────────────────────
const VARIANTES = 5;

function seleccionarPartes(seed: number): Seleccion {
  const rand = createSeededRandom(seed);
  const pick = () => Math.floor(rand() * VARIANTES) + 1;

  return {
    cuerpo: pick(),
    ojos: pick(),
    boca: pick(),
    nariz: pick(),
    cabeza: pick(),
    pies: pick(),
  };
}

// ─── Pagina principal ────────────────────────────────────────────────────────
export default function Page() {
  const [inputId, setInputId] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleGenerate = () => {
    if (inputId.trim()) {
      setActiveId(inputId.trim());
    }
  };

  const seed = activeId ? stringToSeed(activeId) : null;
  const seleccion = seed !== null ? seleccionarPartes(seed) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-card-foreground">
          Generador de Personajes
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Ingresa un ID para generar un personaje procedimental unico
        </p>

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
            disabled={!inputId.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar
          </button>
        </form>

        {seleccion && activeId && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <CharacterSVG seleccion={seleccion} activeId={activeId} />
            </div>

            <details className="w-full">
              <summary className="cursor-pointer rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Ver Atributos
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                {JSON.stringify(
                  {
                    id: activeId,
                    seed: seed,
                    cuerpo: { variante: seleccion.cuerpo, archivo: rutaAsset("cuerpo", seleccion.cuerpo) },
                    ojos: { variante: seleccion.ojos, archivo: rutaAsset("ojos", seleccion.ojos) },
                    boca: { variante: seleccion.boca, archivo: rutaAsset("boca", seleccion.boca) },
                    nariz: { variante: seleccion.nariz, archivo: rutaAsset("nariz", seleccion.nariz) },
                    cabeza: { variante: seleccion.cabeza, archivo: rutaAsset("cabeza", seleccion.cabeza) },
                    pies: { variante: seleccion.pies, archivo: rutaAsset("pies", seleccion.pies) },
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}

        {!seleccion && (
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
