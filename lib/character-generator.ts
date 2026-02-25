import fs from 'fs';
import path from 'path';

export interface Seleccion {
  cuerpo: number;
  ojos: number;
  boca: number;
  nariz: number;
  cabeza: number;
  pies: number;
  habboHead: string;
}

interface HabboAssets {
  gender: string;
  part: string;
  ids: string[];
}

function loadHabboAssets(part: string, gender: string): string[] {
  const dataPath = path.join(process.cwd(), 'lib', 'data', `${gender}_${part}.json`);
  const data: HabboAssets = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return data.ids;
}

const MALE_HEAD_IDS = loadHabboAssets('head', 'male');

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

export function seleccionarPartes(seed: number, variantes: number = 5): Seleccion {
  const rand = createSeededRandom(seed);
  const pick = () => Math.floor(rand() * variantes) + 1;

  const headIndex = Math.floor(rand() * MALE_HEAD_IDS.length);

  return {
    cuerpo: pick(),
    ojos: pick(),
    boca: pick(),
    nariz: pick(),
    cabeza: pick(),
    pies: pick(),
    habboHead: MALE_HEAD_IDS[headIndex],
  };
}

export async function generateAndSaveAvatar(username: string, parts: Seleccion): Promise<string> {
  const figureParts = [parts.habboHead].join('.');
  const avatarUrl = `https://www.habbo.fi/habbo-imaging/avatarimage?figure=${figureParts}&gender=M&size=l`;

  const response = await fetch(avatarUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Habbo avatar: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(buffer);

  const publicDir = path.join(process.cwd(), 'public', 'avatars');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const imagePath = `/avatars/${username}.png`;
  const fullPath = path.join(process.cwd(), 'public', imagePath);
  fs.writeFileSync(fullPath, imageBuffer);

  return imagePath;
}
