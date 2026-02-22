import { create } from 'zustand';

interface MapPosition {
  x: number;
  y: number;
}

interface MapState {
  worldContainer: { x: number; y: number; scale: number } | null;
  characterPositions: Map<string, MapPosition>;
  
  setWorldContainer: (data: { x: number; y: number; scale: number }) => void;
  setCharacterPosition: (characterId: string, pos: MapPosition) => void;
  removeCharacterPosition: (characterId: string) => void;
}

export const useMapStore = create<MapState>((set) => ({
  worldContainer: null,
  characterPositions: new Map(),

  setWorldContainer: (data) => {
    set({ worldContainer: data });
  },

  setCharacterPosition: (characterId, pos) => {
    set((state) => {
      const newMap = new Map(state.characterPositions);
      newMap.set(characterId, pos);
      return { characterPositions: newMap };
    });
  },

  removeCharacterPosition: (characterId) => {
    set((state) => {
      const newMap = new Map(state.characterPositions);
      newMap.delete(characterId);
      return { characterPositions: newMap };
    });
  },
}));
