import type { Seleccion } from '@/lib/character-generator';

export interface Character {
  id: string;
  discordId: string | null;
  username: string;
  seed: number;
  selectedParts: Seleccion;
  generatorVersion: number;
  imageUrl: string | null;
  createdAt: string;
}
