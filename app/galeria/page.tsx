import Link from 'next/link';
import { CharacterSVG } from '@/components/CharacterSVG';
import type { Seleccion } from '@/lib/character-generator';

export const runtime = "nodejs"

interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Seleccion;
  generatorVersion: number;
  createdAt: string;
}

async function getCharacters() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/characters?limit=100`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch characters');
    }
    
    const data = await res.json();
    return data.characters as Character[];
  } catch (error) {
    console.error('Error fetching characters:', error);
    return [];
  }
}

export default async function GaleriaPage() {
  const characters = await getCharacters();

  return (
    <main className="min-h-screen bg-muted p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Galería de Personajes
            </h1>
            <p className="mt-2 text-muted-foreground">
              {characters.length} personajes únicos creados
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Crear Personaje
          </Link>
        </div>

        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
            <svg
              viewBox="0 0 300 300"
              width={120}
              height={120}
              className="mb-4 opacity-20 text-muted-foreground"
            >
              <ellipse cx={150} cy={190} rx={60} ry={70} fill="currentColor" />
              <circle cx={130} cy={155} r={12} fill="#fff" />
              <circle cx={170} cy={155} r={12} fill="#fff" />
              <polygon points="150,85 110,125 190,125" fill="currentColor" />
            </svg>
            <h2 className="text-xl font-semibold text-foreground">
              No hay personajes aún
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea tu primer personaje para verlo aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {characters.map((character) => (
              <div
                key={character.id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
              >
                <div className="flex items-center justify-center bg-background p-6">
                  <CharacterSVG
                    seleccion={character.selectedParts}
                    activeId={character.username}
                  />
                </div>
                <div className="border-t border-border p-4">
                  <h3 className="truncate font-semibold text-card-foreground">
                    {character.username}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Seed: {character.seed}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(character.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
