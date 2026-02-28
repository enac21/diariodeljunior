import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RevealedState {
    revealedCharacters: string[];
    allRevealed: boolean;
    revealCharacter: (id: string) => void;
    revealAll: () => void;
    isRevealed: (id: string) => boolean;
}

export const useRevealedStore = create<RevealedState>()(
    persist(
        (set, get) => ({
            revealedCharacters: [],
            allRevealed: false,
            revealCharacter: (id) =>
                set((state) => {
                    if (state.allRevealed) return state;
                    if (state.revealedCharacters.includes(id)) return state;
                    return { revealedCharacters: [...state.revealedCharacters, id] };
                }),
            revealAll: () =>
                set({ allRevealed: true, revealedCharacters: [] }),
            isRevealed: (id) => get().allRevealed || get().revealedCharacters.includes(id),
        }),
        {
            name: 'diario-del-junior-revealed-storage', // key in localStorage
        }
    )
);
