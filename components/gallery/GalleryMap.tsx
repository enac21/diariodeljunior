'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Application, Container, FederatedPointerEvent, Text, Graphics, Assets, Sprite, Texture } from 'pixi.js';
import type { Seleccion } from '@/lib/character-generator';
import { circlePosition, getRingRange, getVisibleRings } from '@/lib/circle-position';

const PARTES = ['pies', 'cuerpo', 'cabeza', 'ojos', 'nariz', 'boca'] as const;
type Parte = typeof PARTES[number];

interface Character {
  id: string;
  username: string;
  seed: number;
  selectedParts: Seleccion;
  createdAt: string;
}

interface GalleryMapProps {
  onCharacterClick: (character: Character) => void;
}

const LAYOUT: Record<Parte, { x: number; y: number; width: number; height: number }> = {
  pies: { x: 80, y: 225, width: 140, height: 55 },
  cuerpo: { x: 70, y: 105, width: 160, height: 175 },
  cabeza: { x: 70, y: 10, width: 160, height: 160 },
  ojos: { x: 95, y: 30, width: 110, height: 44 },
  nariz: { x: 135, y: 50, width: 30, height: 35 },
  boca: { x: 127, y: 80, width: 45, height: 25 },
};

const CHARACTER_SIZE = 280;
const LOGO_SIZE = 200;
const INITIAL_RADIUS = 350;
const LOAD_PADDING = 400;
const BATCH_SIZE = 100;

const textureCache = new Map<string, Texture>();
const characterContainerCache = new Map<string, Container>();

async function loadPartTexture(parte: Parte, variante: number): Promise<Texture> {
  const key = `${parte}-${variante}`;
  
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const texture = await Assets.load({
    src: `/assets/${parte}/${variante}.svg`,
    data: { width: LAYOUT[parte].width, height: LAYOUT[parte].height }
  });
  
  textureCache.set(key, texture);
  return texture;
}

export function GalleryMap({ onCharacterClick }: GalleryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldContainerRef = useRef<Container | null>(null);
  const charactersContainerRef = useRef<Container | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [visibleCount, setVisibleCount] = useState(0);
  
  const charactersDataRef = useRef<Map<number, Character>>(new Map());
  const totalRef = useRef(0);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const renderedIndicesRef = useRef<Set<number>>(new Set());
  const loadingBatchRef = useRef(false);
  const loadedRangesRef = useRef<Array<{ start: number; end: number }>>([]);
  const onCharacterClickRef = useRef(onCharacterClick);

  useEffect(() => {
    onCharacterClickRef.current = onCharacterClick;
  }, [onCharacterClick]);

  const fetchCharactersRange = useCallback(async (startIndex: number, count: number): Promise<{ characters: Character[]; total: number }> => {
    const offset = Math.max(0, startIndex);
    const res = await fetch(`/api/characters/map?offset=${offset}&limit=${count}`);
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    const data = await res.json();
    return {
      characters: data.characters || [],
      total: data.total || 0
    };
  }, []);

  const ensureCharactersLoaded = useCallback(async (neededIndices: number[]): Promise<void> => {
    if (neededIndices.length === 0) return;
    
    const totalChars = totalRef.current;
    const validIndices = neededIndices.filter(i => i >= 0 && (totalChars === 0 || i < totalChars));
    
    if (validIndices.length === 0) return;
    
    const unloadedIndices = validIndices.filter(i => !charactersDataRef.current.has(i));
    if (unloadedIndices.length === 0) return;
    
    const unloadedMin = Math.min(...unloadedIndices);
    const unloadedMax = Math.max(...unloadedIndices);
    
    const alreadyInRange = loadedRangesRef.current.some(
      range => unloadedMin >= range.start && unloadedMax <= range.end
    );
    
    if (alreadyInRange) return;
    
    if (loadingBatchRef.current) return;
    loadingBatchRef.current = true;
    
    try {
      const batchStart = Math.floor(unloadedMin / BATCH_SIZE) * BATCH_SIZE;
      
      const { characters, total: fetchedTotal } = await fetchCharactersRange(batchStart, BATCH_SIZE);
      
      if (fetchedTotal > 0 && totalRef.current === 0) {
        totalRef.current = fetchedTotal;
        setTotal(fetchedTotal);
      }
      
      characters.forEach((char, i) => {
        charactersDataRef.current.set(batchStart + i, char);
      });
      
      loadedRangesRef.current.push({ start: batchStart, end: batchStart + characters.length - 1 });
      console.log(`[GalleryMap] Loaded batch: ${batchStart} - ${batchStart + characters.length - 1}, total: ${fetchedTotal}`);
    } catch (e) {
      console.error('[GalleryMap] Error fetching characters:', e);
    } finally {
      loadingBatchRef.current = false;
    }
  }, [fetchCharactersRange]);

  const createCharacterContainer = useCallback(async (character: Character, index: number): Promise<Container> => {
    const cacheKey = character.id;
    
    if (characterContainerCache.has(cacheKey)) {
      return characterContainerCache.get(cacheKey)!;
    }
    
    const pos = circlePosition(index, INITIAL_RADIUS);
    
    const wrapper = new Container();
    wrapper.x = pos.x;
    wrapper.y = pos.y;
    wrapper.eventMode = 'static';
    wrapper.cursor = 'pointer';
    wrapper.label = `character-${character.id}`;
    
    const nameText = new Text({
      text: character.username,
      style: { 
        fontSize: 18, 
        fill: 0xffffff, 
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '500'
      }
    });
    nameText.x = -nameText.width / 2;
    nameText.y = -CHARACTER_SIZE / 2 - 30;
    wrapper.addChild(nameText);
    
    const charContainer = new Container();
    charContainer.y = 10;
    wrapper.addChild(charContainer);
    
    const bg = new Graphics();
    bg.roundRect(-CHARACTER_SIZE / 2 - 8, -CHARACTER_SIZE / 2 - 8, CHARACTER_SIZE + 16, CHARACTER_SIZE + 16, 12);
    bg.fill({ color: 0x2a2118, alpha: 0.9 });
    charContainer.addChild(bg);
    
    for (const parte of PARTES) {
      try {
        const texture = await loadPartTexture(parte, character.selectedParts[parte]);
        const sprite = new Sprite(texture);
        sprite.x = LAYOUT[parte].x - CHARACTER_SIZE / 2;
        sprite.y = LAYOUT[parte].y - CHARACTER_SIZE / 2;
        sprite.width = LAYOUT[parte].width;
        sprite.height = LAYOUT[parte].height;
        charContainer.addChild(sprite);
      } catch (e) {
        console.error(`[GalleryMap] Error loading ${parte}:`, e);
      }
    }
    
    wrapper.on('pointerdown', () => {
      onCharacterClickRef.current(character);
    });
    
    wrapper.on('pointerover', () => {
      bg.clear();
      bg.roundRect(-CHARACTER_SIZE / 2 - 8, -CHARACTER_SIZE / 2 - 8, CHARACTER_SIZE + 16, CHARACTER_SIZE + 16, 12);
      bg.fill({ color: 0x3a2d22, alpha: 0.95 });
    });
    
    wrapper.on('pointerout', () => {
      bg.clear();
      bg.roundRect(-CHARACTER_SIZE / 2 - 8, -CHARACTER_SIZE / 2 - 8, CHARACTER_SIZE + 16, CHARACTER_SIZE + 16, 12);
      bg.fill({ color: 0x2a2118, alpha: 0.9 });
    });
    
    characterContainerCache.set(cacheKey, wrapper);
    return wrapper;
  }, []);

  const updateVisibleCharacters = useCallback(async (
    charactersContainer: Container,
    worldContainer: Container,
    screenWidth: number,
    screenHeight: number
  ) => {
    const scale = worldContainer.scale.x;
    const centerX = (screenWidth / 2 - worldContainer.x) / scale;
    const centerY = (screenHeight / 2 - worldContainer.y) / scale;
    
    const { minRing, maxRing } = getVisibleRings(
      centerX, centerY, screenWidth, screenHeight, scale, INITIAL_RADIUS, LOAD_PADDING
    );
    
    const totalChars = totalRef.current;
    const neededIndices: number[] = [];
    
    const effectiveMaxRing = totalChars > 0 
      ? Math.min(maxRing, Math.ceil(totalChars / 8) + 2)
      : maxRing;
    
    console.log(`[GalleryMap] Updating visible: minRing=${minRing}, maxRing=${maxRing}, effectiveMaxRing=${effectiveMaxRing}, total=${totalChars}`);
    
    for (let ring = Math.max(1, minRing); ring <= effectiveMaxRing; ring++) {
      const range = getRingRange(ring);
      const maxPossibleIndex = totalChars > 0 ? Math.min(range.endIndex, totalChars - 1) : range.endIndex;
      
      if (range.startIndex > maxPossibleIndex) continue;
      
      for (let i = range.startIndex; i <= maxPossibleIndex; i++) {
        neededIndices.push(i);
      }
    }
    
    if (neededIndices.length > 0) {
      await ensureCharactersLoaded(neededIndices);
    }
    
    const toRemove: number[] = [];
    renderedIndicesRef.current.forEach(index => {
      if (!neededIndices.includes(index)) {
        toRemove.push(index);
      }
    });
    
    for (const index of toRemove) {
      const character = charactersDataRef.current.get(index);
      if (character) {
        const child = charactersContainer.children.find(c => c.label === `character-${character.id}`);
        if (child) {
          let alpha = 1;
          const fadeOut = () => {
            alpha -= 0.1;
            if (alpha <= 0) {
              charactersContainer.removeChild(child);
            } else {
              child.alpha = alpha;
              requestAnimationFrame(fadeOut);
            }
          };
          requestAnimationFrame(fadeOut);
        }
      }
      renderedIndicesRef.current.delete(index);
    }
    
    const halfViewWidth = (screenWidth / scale) / 2;
    const halfViewHeight = (screenHeight / scale) / 2;
    const viewportLeft = centerX - halfViewWidth;
    const viewportRight = centerX + halfViewWidth;
    const viewportTop = centerY - halfViewHeight;
    const viewportBottom = centerY + halfViewHeight;
    
    const CHARACTER_HALF_SIZE = CHARACTER_SIZE / 2 + 20;
    
    let individualVisibleCount = 0;
    renderedIndicesRef.current.forEach(index => {
      const pos = circlePosition(index, INITIAL_RADIUS);
      const inViewport = 
        pos.x + CHARACTER_HALF_SIZE > viewportLeft &&
        pos.x - CHARACTER_HALF_SIZE < viewportRight &&
        pos.y + CHARACTER_HALF_SIZE > viewportTop &&
        pos.y - CHARACTER_HALF_SIZE < viewportBottom;
      if (inViewport) individualVisibleCount++;
    });
    
    setVisibleCount(individualVisibleCount);
    
    const toAdd = neededIndices.filter(i => 
      !renderedIndicesRef.current.has(i) && 
      i >= 0 && 
      charactersDataRef.current.has(i)
    );
    
    if (toAdd.length > 0) {
      const renderStartTime = performance.now();
      
      for (const index of toAdd) {
        const character = charactersDataRef.current.get(index);
        if (!character) continue;
        
        const charStartTime = performance.now();
        
        try {
          const container = await createCharacterContainer(character, index);
          container.alpha = 0;
          charactersContainer.addChild(container);
          renderedIndicesRef.current.add(index);
          
          let alpha = 0;
          const fadeIn = () => {
            alpha += 0.1;
            if (alpha >= 1) {
              container.alpha = 1;
            } else {
              container.alpha = alpha;
              requestAnimationFrame(fadeIn);
            }
          };
          requestAnimationFrame(fadeIn);
          
          const charEndTime = performance.now();
          console.log(`[TODO: Remove] Character "${character.username}" (ring ${circlePosition(index, INITIAL_RADIUS).ring}, pos ${index}) rendered in ${(charEndTime - charStartTime).toFixed(2)}ms`);
        } catch (e) {
          console.error(`[GalleryMap] Error creating character:`, e);
        }
      }
      
      const renderEndTime = performance.now();
      console.log(`[TODO: Remove] Batch of ${toAdd.length} characters rendered in ${(renderEndTime - renderStartTime).toFixed(2)}ms`);
    }
    
    let finalVisibleCount = 0;
    renderedIndicesRef.current.forEach(index => {
      const pos = circlePosition(index, INITIAL_RADIUS);
      const inViewport = 
        pos.x + CHARACTER_HALF_SIZE > viewportLeft &&
        pos.x - CHARACTER_HALF_SIZE < viewportRight &&
        pos.y + CHARACTER_HALF_SIZE > viewportTop &&
        pos.y - CHARACTER_HALF_SIZE < viewportBottom;
      if (inViewport) finalVisibleCount++;
    });
    setVisibleCount(finalVisibleCount);
  }, [ensureCharactersLoaded, createCharacterContainer]);

  useEffect(() => {
    let mounted = true;
    let updateScheduled = false;
    
    const init = async () => {
      const container = containerRef.current;
      if (!container) {
        console.error('[GalleryMap] No container ref - retrying...');
        requestAnimationFrame(init);
        return;
      }
      
      console.log('[GalleryMap] Starting initialization...');
      
      try {
        const res = await fetch('/api/characters/count');
        if (res.ok) {
          const { total: fetchedTotal } = await res.json();
          console.log(`[GalleryMap] Fetched initial total: ${fetchedTotal}`);
          
          if (!mounted) return;
          
          totalRef.current = fetchedTotal;
          setTotal(fetchedTotal);
        }
      } catch (e) {
        console.error('[GalleryMap] Error fetching initial total:', e);
        if (!mounted) return;
        totalRef.current = 0;
        setTotal(0);
      }
      
      if (!mounted) return;
      
      try {
        const app = new Application();
        
        await app.init({
          background: '#1a1612',
          resizeTo: container!,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        });
        
        if (!mounted || !container) {
          app.destroy(true);
          return;
        }
        
        container!.appendChild(app.canvas);
        appRef.current = app;
        console.log('[GalleryMap] PixiJS initialized');
        
        const worldContainer = new Container();
        worldContainer.sortableChildren = true;
        app.stage.addChild(worldContainer);
        worldContainerRef.current = worldContainer;
        
        const logoContainer = new Container();
        logoContainer.zIndex = 1000;
        worldContainer.addChild(logoContainer);
        
        try {
          const logoTexture = await Assets.load('/logo.png');
          const logoSprite = new Sprite(logoTexture);
          logoSprite.anchor.set(0.5);
          logoSprite.width = LOGO_SIZE;
          logoSprite.height = LOGO_SIZE;
          logoContainer.addChild(logoSprite);
          
          const coordText = new Text({
            text: '0, 0',
            style: { 
              fontSize: 24, 
              fill: 0xF97316, 
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }
          });
          coordText.anchor.set(0.5);
          coordText.y = LOGO_SIZE / 2 + 20;
          logoContainer.addChild(coordText);
          
          console.log('[GalleryMap] Logo loaded at 0,0');
        } catch (e) {
          console.error('[GalleryMap] Error loading logo:', e);
        }
        
        const charactersContainer = new Container();
        charactersContainer.label = 'characters';
        charactersContainer.zIndex = 0;
        worldContainer.addChild(charactersContainer);
        charactersContainerRef.current = charactersContainer;
        
        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;
        
        const viewWidth = app.screen.width;
        const viewHeight = app.screen.height;
        worldContainer.x = viewWidth / 2;
        worldContainer.y = viewHeight / 2;
        
        console.log('[GalleryMap] Setting loading to false');
        setLoading(false);
        
        await updateVisibleCharacters(charactersContainer, worldContainer, viewWidth, viewHeight);
        
        app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
          isDraggingRef.current = true;
          lastPointerRef.current = { x: e.global.x, y: e.global.y };
        });
        
        app.stage.on('pointermove', (e: FederatedPointerEvent) => {
          if (!isDraggingRef.current) return;
          
          const dx = e.global.x - lastPointerRef.current.x;
          const dy = e.global.y - lastPointerRef.current.y;
          
          worldContainer.x += dx;
          worldContainer.y += dy;
          
          lastPointerRef.current = { x: e.global.x, y: e.global.y };
          
          if (!updateScheduled) {
            updateScheduled = true;
            requestAnimationFrame(() => {
              if (appRef.current) {
                updateVisibleCharacters(charactersContainer, worldContainer, app.screen.width, app.screen.height);
              }
              updateScheduled = false;
            });
          }
        });
        
        app.stage.on('pointerup', () => {
          isDraggingRef.current = false;
        });
        
        app.stage.on('pointerupoutside', () => {
          isDraggingRef.current = false;
        });
        
        app.canvas.addEventListener('wheel', (e: WheelEvent) => {
          e.preventDefault();
          
          const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
          const newScale = Math.max(0.5, Math.min(1.5, worldContainer.scale.x * zoomFactor));
          
          const mouseX = e.clientX - app.canvas.getBoundingClientRect().left;
          const mouseY = e.clientY - app.canvas.getBoundingClientRect().top;
          
          const worldX = (mouseX - worldContainer.x) / worldContainer.scale.x;
          const worldY = (mouseY - worldContainer.y) / worldContainer.scale.y;
          
          worldContainer.scale.set(newScale);
          worldContainer.x = mouseX - worldX * newScale;
          worldContainer.y = mouseY - worldY * newScale;
          
          setZoom(Math.round(newScale * 100));
          
          if (!updateScheduled) {
            updateScheduled = true;
            requestAnimationFrame(() => {
              if (appRef.current) {
                updateVisibleCharacters(charactersContainer, worldContainer, app.screen.width, app.screen.height);
              }
              updateScheduled = false;
            });
          }
        }, { passive: false });
        
      } catch (e) {
        console.error('[GalleryMap] Initialization error:', e);
        if (mounted) {
          setError('Error initializing map');
          setLoading(false);
        }
      }
    }
    
    init();
    
    return () => {
      console.log('[GalleryMap] Cleanup');
      mounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: false });
        appRef.current = null;
      }
      characterContainerCache.clear();
      renderedIndicesRef.current.clear();
      charactersDataRef.current.clear();
      loadedRangesRef.current = [];
      totalRef.current = 0;
    };
  }, [fetchCharactersRange, updateVisibleCharacters]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-background">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-xl border border-border/50 bg-card/80 px-4 py-3 text-sm text-foreground backdrop-blur-sm">
          <div className="font-mono text-muted-foreground">Zoom: <span className="text-foreground">{zoom}%</span></div>
          <div className="font-mono text-muted-foreground">Personajes: <span className="text-foreground">{total}</span></div>
          <div className="font-mono text-muted-foreground">Visibles: <span className="text-primary">{visibleCount}</span></div>
          <div className="mt-2 text-xs text-muted-foreground">
            Rueda: zoom | Arrastrar: mover | Click: ver detalle
          </div>
        </div>
      )}
    </div>
  );
}
