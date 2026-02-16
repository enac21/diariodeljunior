export interface Seleccion {
  cuerpo: number;
  ojos: number;
  boca: number;
  nariz: number;
  cabeza: number;
  pies: number;
}

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

  return {
    cuerpo: pick(),
    ojos: pick(),
    boca: pick(),
    nariz: pick(),
    cabeza: pick(),
    pies: pick(),
  };
}
