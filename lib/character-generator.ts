export interface Seleccion {
  cuerpo: number;
  ojos: number;
  boca: number;
  nariz: number;
  cabeza: number;
  pies: number;
  accesorio: number;
}

export interface VariantesPorParte {
  cuerpo: number;
  ojos: number;
  boca: number;
  nariz: number;
  cabeza: number;
  pies: number;
  accesorio: number;
}

const variantesDefault: VariantesPorParte = {
  cuerpo: 19,
  ojos: 16,
  boca: 14,
  nariz: 11,
  cabeza: 11,
  pies: 11,
  accesorio: 6,
};

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

export function seleccionarPartes(seed: number, variantes: VariantesPorParte = variantesDefault): Seleccion {
  const rand = createSeededRandom(seed);

  return {
    cuerpo: Math.floor(rand() * variantes.cuerpo) + 1,
    ojos: Math.floor(rand() * variantes.ojos) + 1,
    boca: Math.floor(rand() * variantes.boca) + 1,
    nariz: Math.floor(rand() * variantes.nariz) + 1,
    cabeza: Math.floor(rand() * variantes.cabeza) + 1,
    pies: Math.floor(rand() * variantes.pies) + 1,
    accesorio: Math.floor(rand() * variantes.accesorio) + 1,
  };
}
