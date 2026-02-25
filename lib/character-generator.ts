import fs from 'fs';
import path from 'path';

export interface Seleccion {
  gender: 'M' | 'F';
  head: string;
  hair: string;
  trousers: string;
  chess: string;
  hat: string | null;
}

interface HabboAssets {
  gender: string;
  part: string;
  ids: string[];
}

function loadHabboAssets(part: string, gender: string | null): string[] {
  const genderPrefix = gender ? `${gender}_` : '';
  const dataPath = path.join(process.cwd(), 'lib', 'data', `${genderPrefix}${part}.json`);
  const data: HabboAssets = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return data.ids;
}

const MALE_HEAD_IDS = loadHabboAssets('head', 'male');
const FEMALE_HEAD_IDS = loadHabboAssets('head', 'female');
const MALE_HAIR_IDS = loadHabboAssets('hair', 'male');
const FEMALE_HAIR_IDS = loadHabboAssets('hair', 'female');
const MALE_TROUSERS_IDS = loadHabboAssets('trousers', 'male');
const FEMALE_TROUSERS_IDS = loadHabboAssets('trousers', 'female');
const MALE_CHESS_IDS = loadHabboAssets('chess', 'male');
const FEMALE_CHESS_IDS = loadHabboAssets('chess', 'female');
const HATS_IDS = loadHabboAssets('hats', null);

function createSeededRandom(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return function next(): number {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function seleccionarPartes(seed: number): Seleccion {
  const rand = createSeededRandom(seed);
  
  const gender: 'M' | 'F' = rand() > 0.5 ? 'M' : 'F';
  
  const headIds = gender === 'M' ? MALE_HEAD_IDS : FEMALE_HEAD_IDS;
  const hairIds = gender === 'M' ? MALE_HAIR_IDS : FEMALE_HAIR_IDS;
  const trousersIds = gender === 'M' ? MALE_TROUSERS_IDS : FEMALE_TROUSERS_IDS;
  const chessIds = gender === 'M' ? MALE_CHESS_IDS : FEMALE_CHESS_IDS;
  
  const headBase = headIds[Math.floor(rand() * headIds.length)];
  const headParts = headBase.split('-');
  const color1 = Math.floor(rand() * 100) + 1;
  const color2 = Math.floor(rand() * 100);
  const headWithColor = `${headParts[0]}-${headParts[1]}-${color1}-${color2}`;
  
  const hairIndex = Math.floor(rand() * hairIds.length);
  const trousersIndex = Math.floor(rand() * trousersIds.length);
  const chessIndex = Math.floor(rand() * chessIds.length);
  const hatIndex = Math.floor(rand() * (HATS_IDS.length + 1));
  const hat = hatIndex < HATS_IDS.length ? HATS_IDS[hatIndex] : null;

  return {
    gender,
    head: headWithColor,
    hair: hairIds[hairIndex],
    trousers: trousersIds[trousersIndex],
    chess: chessIds[chessIndex],
    hat,
  };
}

export async function generateAndSaveAvatar(username: string, parts: Seleccion, retries: number = 3): Promise<string> {
  const figureParts = [
    parts.head,
    parts.hair,
    parts.trousers,
    parts.chess,
    parts.hat,
  ].filter(Boolean);

  const figure = figureParts.join('.');
  const avatarUrl = `https://www.habbo.fi/habbo-imaging/avatarimage?figure=${figure}&gender=${parts.gender}&size=l`;

  console.log(`[generateAndSaveAvatar] URL for ${username}: ${avatarUrl}`);

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(avatarUrl, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch Habbo avatar: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(buffer);

      if (imageBuffer.length === 0) {
        throw new Error('Empty response from Habbo API');
      }

      const publicDir = path.join(process.cwd(), 'public', 'avatars');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const imagePath = `/avatars/${username}.png`;
      const fullPath = path.join(process.cwd(), 'public', imagePath);
      fs.writeFileSync(fullPath, imageBuffer);

      return imagePath;
    } catch (error) {
      lastError = error as Error;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[generateAndSaveAvatar] Attempt ${attempt + 1} failed for ${username}:`, errorMessage);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw new Error(`Failed to generate avatar after ${retries} attempts: ${lastError?.message}`);
}
