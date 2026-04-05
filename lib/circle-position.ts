const RING_SPACING = 350;
const CHARACTERS_PER_RING_BASE = 8;

export interface Position {
  x: number;
  y: number;
  ring: number;
  positionInRing: number;
}

export function circlePosition(index: number, initialRadius: number = 0): Position {
  if (index < 0) {
    return { x: 0, y: 0, ring: 0, positionInRing: 0 };
  }

  let remainingIndex = index;
  let ring = 1;

  while (remainingIndex >= CHARACTERS_PER_RING_BASE * ring) {
    remainingIndex -= CHARACTERS_PER_RING_BASE * ring;
    ring++;
  }

  const charactersInCurrentRing = CHARACTERS_PER_RING_BASE * ring;
  const angleStep = (2 * Math.PI) / charactersInCurrentRing;
  const angle = remainingIndex * angleStep - Math.PI / 2;

  const radius = initialRadius + ring * RING_SPACING;

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    ring,
    positionInRing: remainingIndex
  };
}

export function getRingRange(ring: number): { startIndex: number; endIndex: number } {
  if (ring <= 0) {
    return { startIndex: 0, endIndex: -1 };
  }

  let startIndex = 0;
  for (let r = 1; r < ring; r++) {
    startIndex += CHARACTERS_PER_RING_BASE * r;
  }

  const endIndex = startIndex + CHARACTERS_PER_RING_BASE * ring - 1;

  return { startIndex, endIndex };
}

export function getVisibleRings(
  viewportCenterX: number,
  viewportCenterY: number,
  viewportWidth: number,
  viewportHeight: number,
  scale: number,
  initialRadius: number,
  padding: number
): { minRing: number; maxRing: number } {
  const distanceFromOrigin = Math.sqrt(viewportCenterX * viewportCenterX + viewportCenterY * viewportCenterY);

  const viewportRadius = Math.min(viewportWidth, viewportHeight) / (2 * scale);

  const minVisibleDistance = Math.max(0, distanceFromOrigin - viewportRadius - padding);
  const maxVisibleDistance = distanceFromOrigin + viewportRadius + padding;

  let minRing = 1;
  if (minVisibleDistance > initialRadius) {
    minRing = Math.max(1, Math.floor((minVisibleDistance - initialRadius) / RING_SPACING) + 1);
  }

  const maxRing = Math.ceil((maxVisibleDistance - initialRadius) / RING_SPACING) + 1;

  return { minRing, maxRing: Math.max(minRing, maxRing) };
}

