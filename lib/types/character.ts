import type { Seleccion } from '@/lib/character-generator';

export interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Seleccion;
  generatorVersion: number;
  imageUrl: string | null;
  createdAt: string;
}
