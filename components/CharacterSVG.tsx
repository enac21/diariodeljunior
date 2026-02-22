import type { Seleccion } from '@/lib/character-generator';

const PARTES = ["cuerpo", "ojos", "boca", "nariz", "cabeza", "pies"] as const;
type Parte = (typeof PARTES)[number];

export function rutaAsset(parte: Parte, variante: number): string {
  return `/assets/${parte}/${variante}.svg`;
}

export function CharacterSVG({ seleccion, activeId }: { seleccion: Seleccion; activeId: string }) {
  const capas: Parte[] = ["pies", "cuerpo", "cabeza", "ojos", "nariz", "boca"];

  const layout: Record<Parte, { x: number; y: number; width: number; height: number; preserveAspectRatio: string }> = {
    pies: { x: 80, y: 225, width: 140, height: 55, preserveAspectRatio: "xMidYMax meet" },
    cuerpo: { x: 70, y: 105, width: 160, height: 175, preserveAspectRatio: "xMidYMid meet" },
    cabeza: { x: 70, y: 10, width: 160, height: 160, preserveAspectRatio: "xMidYMin meet" },
    ojos: { x: 95, y: 30, width: 110, height: 44, preserveAspectRatio: "xMidYMid meet" },
    nariz: { x: 135, y: 50, width: 30, height: 35, preserveAspectRatio: "xMidYMid meet" },
    boca: { x: 127, y: 80, width: 45, height: 25, preserveAspectRatio: "xMidYMid meet" },
  };

  return (
    <svg
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 300 300"
      width={280}
      height={280}
      role="img"
      aria-label={`Personaje generado para el ID: ${activeId}`}
    >
      <circle cx={150} cy={165} r={100} fill="none" stroke="#e5e7eb" strokeWidth={1} strokeDasharray="4 4" />
      {capas.map((parte) => (
        <image
          key={parte}
          xlinkHref={rutaAsset(parte, seleccion[parte])}
          x={layout[parte].x}
          y={layout[parte].y}
          width={layout[parte].width}
          height={layout[parte].height}
          preserveAspectRatio={layout[parte].preserveAspectRatio}
        />
      ))}
    </svg>
  );
}
