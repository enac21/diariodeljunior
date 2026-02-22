'use server';

import prisma from '@/lib/prisma';
import { stringToSeed, seleccionarPartes } from '@/lib/character-generator';
import { handleApiError } from '@/lib/api-utils';
import { revalidatePath } from 'next/cache';

const USERNAME_MIN_LENGTH = 2;
const USERNAME_MAX_LENGTH = 24;

export async function createOrGetCharacter(username: string) {
  if (!username || typeof username !== 'string') {
    return { error: 'Username is required' };
  }

  const cleanUsername = username.trim().normalize('NFC').slice(0, USERNAME_MAX_LENGTH);

  if (cleanUsername.length < USERNAME_MIN_LENGTH) {
    return { error: 'Username must be at least 2 characters' };
  }

  try {
    const seed = stringToSeed(cleanUsername);
    const selectedParts = seleccionarPartes(seed);

    const character = await prisma.character.upsert({
      where: { username: cleanUsername },
      update: {},
      create: {
        username: cleanUsername,
        seed,
        selectedParts: selectedParts as any,
        generatorVersion: 1,
      },
    });

    revalidatePath('/galeria');
    revalidatePath('/galeriav2');
    
    return { character };
  } catch (error) {
    handleApiError(error, 'createOrGetCharacter');
    return { error: 'Internal server error' };
  }
}
