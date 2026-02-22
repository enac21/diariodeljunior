import { useState, useCallback, useEffect, useRef } from 'react';

interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Record<string, number>;
  createdAt: string;
}

interface UseCharacterSearchResult {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Character[];
  isSearching: boolean;
  clearSearch: () => void;
}

export function useCharacterSearch(): UseCharacterSearchResult {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Character[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const cacheRef = useRef<Character[] | null>(null);
  const cacheTimeRef = useRef<number>(0);
  const CACHE_TTL = 5 * 60 * 1000;

  const fetchCharacters = useCallback(async () => {
    const now = Date.now();
    
    if (cacheRef.current && now - cacheTimeRef.current < CACHE_TTL) {
      return cacheRef.current;
    }

    const res = await fetch('/api/characters?limit=9999');
    if (!res.ok) throw new Error('Failed to fetch characters');
    const data = await res.json();
    
    cacheRef.current = data.characters || [];
    cacheTimeRef.current = now;
    
    return cacheRef.current;
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      try {
        const characters = await fetchCharacters();
        const filtered = (characters || [])
          .filter((char: Character) =>
            char.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 10);
        setSearchResults(filtered);
      } catch (e) {
        console.error('Search error:', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, fetchCharacters]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch,
  };
}
