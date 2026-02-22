import { useCallback, useRef } from 'react';
import type { Character } from '@/lib/types/character';

const BATCH_SIZE = 100;

interface LoadedRange {
  start: number;
  end: number;
}

export function useCharactersData() {
  const charactersDataRef = useRef<Map<number, Character>>(new Map());
  const totalRef = useRef(0);
  const loadedRangesRef = useRef<LoadedRange[]>([]);
  const loadingBatchRef = useRef(false);

  const fetchRange = useCallback(async (startIndex: number, count: number) => {
    const offset = Math.max(0, startIndex);
    const res = await fetch(`/api/characters/map?offset=${offset}&limit=${count}`);

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return {
      characters: data.characters || [],
      total: data.total || 0,
    };
  }, []);

  const ensureLoaded = useCallback(async (neededIndices: number[]): Promise<number> => {
    if (neededIndices.length === 0) return totalRef.current;

    const totalChars = totalRef.current;
    const validIndices = neededIndices.filter(i => i >= 0 && (totalChars === 0 || i < totalChars));

    if (validIndices.length === 0) return totalRef.current;

    const unloadedIndices = validIndices.filter(i => !charactersDataRef.current.has(i));
    if (unloadedIndices.length === 0) return totalRef.current;

    const unloadedMin = Math.min(...unloadedIndices);
    const unloadedMax = Math.max(...unloadedIndices);

    const alreadyInRange = loadedRangesRef.current.some(
      range => unloadedMin >= range.start && unloadedMax <= range.end
    );

    if (alreadyInRange) return totalRef.current;

    if (loadingBatchRef.current) return totalRef.current;
    loadingBatchRef.current = true;

    try {
      const batchStart = Math.floor(unloadedMin / BATCH_SIZE) * BATCH_SIZE;

      const { characters, total: fetchedTotal } = await fetchRange(batchStart, BATCH_SIZE);

      if (fetchedTotal > 0 && totalRef.current === 0) {
        totalRef.current = fetchedTotal;
      }

      characters.forEach((char: Character, i: number) => {
        charactersDataRef.current.set(batchStart + i, char);
      });

      loadedRangesRef.current.push({ start: batchStart, end: batchStart + characters.length - 1 });
    } catch (e) {
      console.error('[useCharactersData] Error fetching:', e);
    } finally {
      loadingBatchRef.current = false;
    }

    return totalRef.current;
  }, [fetchRange]);

  const fetchTotal = useCallback(async (): Promise<number> => {
    try {
      const res = await fetch('/api/characters/count');
      if (res.ok) {
        const { total } = await res.json();
        totalRef.current = total;
        return total;
      }
    } catch (e) {
      console.error('[useCharactersData] Error fetching total:', e);
    }
    return 0;
  }, []);

  const get = useCallback((index: number): Character | undefined => {
    return charactersDataRef.current.get(index);
  }, []);

  const clear = useCallback(() => {
    charactersDataRef.current.clear();
    loadedRangesRef.current = [];
    totalRef.current = 0;
  }, []);

  return {
    charactersDataRef,
    totalRef,
    fetchTotal,
    ensureLoaded,
    get,
    clear,
  };
}
