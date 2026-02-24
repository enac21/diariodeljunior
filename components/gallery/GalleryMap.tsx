'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Application, Container, FederatedPointerEvent, Text, Graphics, Assets, Sprite, Texture } from 'pixi.js';
import type { Character } from '@/lib/types/character';
import { circlePosition, getRingRange, getVisibleRings } from '@/lib/circle-position';
import { createAgent, updateAgent, type CharacterAgent } from '@/lib/character-agent';
import { useMapStore } from '@/lib/stores/map-store';
import { useCharactersData } from '@/lib/hooks/useCharactersData';

const PARTES = ['pies', 'cuerpo', 'cabeza', 'accesorio', 'ojos', 'nariz', 'boca'] as const;
type Parte = typeof PARTES[number];

interface GalleryMapProps {
  onCharacterClick: (character: Character) => void;
  focusCharacterId: string | null;
  onLogoClick: () => void;
}

const LAYOUT: Record<Parte, { x: number; y: number; width: number; height: number }> = {
  pies: { x: 80, y: 225, width: 140, height: 55 },
  cuerpo: { x: 70, y: 105, width: 160, height: 175 },
  cabeza: { x: 70, y: 10, width: 160, height: 160 },
  accesorio: { x: 65, y: -15, width: 170, height: 70 },
  ojos: { x: 95, y: 30, width: 110, height: 44 },
  nariz: { x: 135, y: 50, width: 30, height: 35 },
  boca: { x: 127, y: 80, width: 45, height: 25 },
};

const CHARACTER_SIZE = 280;
const LOGO_SIZE = 120;
const INITIAL_RADIUS = 350;
const LOAD_PADDING = 400;
const BATCH_SIZE = 100;
const REMOVE_PADDING = 300;

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

export function GalleryMap({ onCharacterClick, focusCharacterId, onLogoClick }: GalleryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const worldContainerRef = useRef<Container | null>(null);
  const charactersContainerRef = useRef<Container | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [visibleCount, setVisibleCount] = useState(0);
  const [fps, setFps] = useState(0);
  
  const { setWorldContainer, setCharacterPosition, removeCharacterPosition } = useMapStore();
  const { charactersDataRef, totalRef, fetchTotal, ensureLoaded, get: getCharacter, clear: clearCharactersData } = useCharactersData();
  
  const setWorldContainerRef = useRef(setWorldContainer);
  const setCharacterPositionRef = useRef(setCharacterPosition);
  const removeCharacterPositionRef = useRef(removeCharacterPosition);

  useEffect(() => {
    setWorldContainerRef.current = setWorldContainer;
    setCharacterPositionRef.current = setCharacterPosition;
    removeCharacterPositionRef.current = removeCharacterPosition;
  }, [setWorldContainer, setCharacterPosition, removeCharacterPosition]);
  
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const renderedIndicesRef = useRef<Set<number>>(new Set());
  const onCharacterClickRef = useRef(onCharacterClick);
  const lastTouchDistanceRef = useRef(0);
  const lastTouchCenterRef = useRef({ x: 0, y: 0 });
  const lastScaleRef = useRef(1);
  const isPinchingRef = useRef(false);
  const worldContainerRefForZoom = useRef<Container | null>(null);
  
  const agentsRef = useRef<Map<number, CharacterAgent>>(new Map());
  const lastFrameTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const fpsFramesRef = useRef(0);
  const fpsLastTimeRef = useRef(0);
  const focusCharacterIdRef = useRef<string | null>(null);
  const followedIndexRef = useRef<number | null>(null);
  const onLogoClickRef = useRef(onLogoClick);
  const pulseArrowRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onCharacterClickRef.current = onCharacterClick;
  }, [onCharacterClick]);

  useEffect(() => {
    onLogoClickRef.current = onLogoClick;
  }, [onLogoClick]);

  useEffect(() => {
    focusCharacterIdRef.current = focusCharacterId;
    
    if (!focusCharacterId || !worldContainerRef.current || !appRef.current) {
      followedIndexRef.current = null;
      return;
    }
    
    const worldContainer = worldContainerRef.current;
    const app = appRef.current;
    
    let foundIndex = -1;
    charactersDataRef.current.forEach((char, index) => {
      if (char.id === focusCharacterId || char.username.toLowerCase() === focusCharacterId.toLowerCase()) {
        foundIndex = index;
      }
    });
    
    if (foundIndex === -1) {
      followedIndexRef.current = null;
      return;
    }

    followedIndexRef.current = foundIndex;
    
    const agent = agentsRef.current.get(foundIndex);
    if (!agent) {
      const pos = circlePosition(foundIndex, INITIAL_RADIUS);
      worldContainer.x = app.screen.width / 2 - pos.x;
      worldContainer.y = app.screen.height / 2 - pos.y;
    } else {
      worldContainer.x = app.screen.width / 2 - agent.x;
      worldContainer.y = app.screen.height / 2 - agent.y;
    }
    
    worldContainer.scale.set(1);
    setZoom(100);
  }, [focusCharacterId]);

  const createCharacterContainer = useCallback(async (character: Character, index: number): Promise<Container> => {
    const cacheKey = character.id;
    
    if (characterContainerCache.has(cacheKey)) {
      const cached = characterContainerCache.get(cacheKey)!;
      cached.alpha = 1;
      const agent = agentsRef.current.get(index);
      if (agent) {
        cached.x = agent.x;
        cached.y = agent.y;
      }
      return cached;
    }
    
    const pos = circlePosition(index, INITIAL_RADIUS);
    
    if (!agentsRef.current.has(index)) {
      agentsRef.current.set(index, createAgent(index, pos.x, pos.y));
    }
    
    const agent = agentsRef.current.get(index)!;
    
    const wrapper = new Container();
    wrapper.x = agent.x;
    wrapper.y = agent.y;
    wrapper.eventMode = 'static';
    wrapper.cursor = 'pointer';
    wrapper.label = `character-${character.id}`;
    
    const nameText = new Text({
      text: character.username,
      style: { 
        fontSize: 14, 
        fill: 0xffffff, 
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '500'
      }
    });
    nameText.x = -nameText.width / 2;
    nameText.y = -CHARACTER_SIZE / 2 - 24;
    nameText.alpha = 0.8;
    wrapper.addChild(nameText);
    
    const charContainer = new Container();
    wrapper.addChild(charContainer);
    
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
      if (!isPinchingRef.current) {
        onCharacterClickRef.current(character);
      }
    });
    
    wrapper.on('pointerover', () => {
      nameText.alpha = 1;
    });
    
    wrapper.on('pointerout', () => {
      nameText.alpha = 0.8;
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
    
    for (let ring = Math.max(1, minRing); ring <= effectiveMaxRing; ring++) {
      const range = getRingRange(ring);
      const maxPossibleIndex = totalChars > 0 ? Math.min(range.endIndex, totalChars - 1) : range.endIndex;
      
      if (range.startIndex > maxPossibleIndex) continue;
      
      for (let i = range.startIndex; i <= maxPossibleIndex; i++) {
        neededIndices.push(i);
      }
    }
    
    if (neededIndices.length > 0) {
      const newTotal = await ensureLoaded(neededIndices);
      if (newTotal !== total) {
        setTotal(newTotal);
      }
    }
    
    const halfViewWidth = (screenWidth / scale) / 2;
    const halfViewHeight = (screenHeight / scale) / 2;
    const viewportLeft = centerX - halfViewWidth;
    const viewportRight = centerX + halfViewWidth;
    const viewportTop = centerY - halfViewHeight;
    const viewportBottom = centerY + halfViewHeight;
    const CHARACTER_HALF_SIZE = CHARACTER_SIZE / 2 + 100;
    
    const toRemove: number[] = [];
    renderedIndicesRef.current.forEach(index => {
      if (neededIndices.includes(index)) return;
      
      const agent = agentsRef.current.get(index);
      const pos = agent 
        ? { x: agent.x, y: agent.y }
        : circlePosition(index, INITIAL_RADIUS);
      
      const isOutsideViewport = 
        pos.x + CHARACTER_HALF_SIZE < viewportLeft - REMOVE_PADDING ||
        pos.x - CHARACTER_HALF_SIZE > viewportRight + REMOVE_PADDING ||
        pos.y + CHARACTER_HALF_SIZE < viewportTop - REMOVE_PADDING ||
        pos.y - CHARACTER_HALF_SIZE > viewportBottom + REMOVE_PADDING;
      
      if (isOutsideViewport) {
        toRemove.push(index);
      }
    });
    
    for (const index of toRemove) {
      const character = charactersDataRef.current.get(index);
      if (character) {
        removeCharacterPositionRef.current(character.id);
        const child = charactersContainer.children.find(c => c.label === `character-${character.id}`);
        if (child) {
          renderedIndicesRef.current.delete(index);
          let alpha = 1;
          const fadeOut = () => {
            alpha -= 0.15;
            if (alpha <= 0) {
              charactersContainer.removeChild(child);
            } else {
              child.alpha = alpha;
              requestAnimationFrame(fadeOut);
            }
          };
          requestAnimationFrame(fadeOut);
        } else {
          renderedIndicesRef.current.delete(index);
        }
      } else {
        renderedIndicesRef.current.delete(index);
      }
    }
    
    let individualVisibleCount = 0;
    renderedIndicesRef.current.forEach(index => {
      const agent = agentsRef.current.get(index);
      const pos = agent 
        ? { x: agent.x, y: agent.y }
        : circlePosition(index, INITIAL_RADIUS);
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
      for (const index of toAdd) {
        const character = charactersDataRef.current.get(index);
        if (!character) continue;
        
        try {
          const container = await createCharacterContainer(character, index);
          
          const alreadyInStage = charactersContainer.children.includes(container);
          
          if (alreadyInStage) {
            container.alpha = 1;
            renderedIndicesRef.current.add(index);
            continue;
          }
          
          const alreadyExists = charactersContainer.children.some(c => c.label === `character-${character.id}`);
          if (alreadyExists) {
            renderedIndicesRef.current.add(index);
            continue;
          }
          
          container.alpha = 0;
          charactersContainer.addChild(container);
          renderedIndicesRef.current.add(index);
          
          let alpha = 0;
          const fadeIn = () => {
            alpha += 0.15;
            if (alpha >= 1) {
              container.alpha = 1;
            } else {
              container.alpha = alpha;
              requestAnimationFrame(fadeIn);
            }
          };
          requestAnimationFrame(fadeIn);
         } catch (e) {
          console.error(`[GalleryMap] Error creating character:`, e);
        }
      }
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
  }, [ensureLoaded, createCharacterContainer]);

  const handleZoom = useCallback((zoomIn: boolean, centerX?: number, centerY?: number) => {
    const worldContainer = worldContainerRefForZoom.current;
    const app = appRef.current;
    if (!worldContainer || !app) return;
    
    const zoomFactor = zoomIn ? 1.2 : 0.8;
    const newScale = Math.max(0.15, Math.min(1.5, worldContainer.scale.x * zoomFactor));
    
    const rect = app.canvas.getBoundingClientRect();
    const pivotX = centerX ?? rect.width / 2;
    const pivotY = centerY ?? rect.height / 2;
    
    const worldX = (pivotX - worldContainer.x) / worldContainer.scale.x;
    const worldY = (pivotY - worldContainer.y) / worldContainer.scale.y;
    
    worldContainer.scale.set(newScale);
    worldContainer.x = pivotX - worldX * newScale;
    worldContainer.y = pivotY - worldY * newScale;
    
    setZoom(Math.round(newScale * 100));
  }, []);

  useEffect(() => {
    let mounted = true;
    let updateScheduled = false;
    
    const init = async () => {
      const container = containerRef.current;
      if (!container) {
        requestAnimationFrame(init);
        return;
      }
      
      try {
        const fetchedTotal = await fetchTotal();
        
        if (!mounted) return;
        
        setTotal(fetchedTotal);
      } catch (e) {
        if (!mounted) return;
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
        
        const worldContainer = new Container();
        worldContainer.sortableChildren = true;
        app.stage.addChild(worldContainer);
        worldContainerRef.current = worldContainer;
        worldContainerRefForZoom.current = worldContainer;
        
        const logoContainer = new Container();
        logoContainer.zIndex = 1000;
        logoContainer.eventMode = 'static';
        logoContainer.cursor = 'pointer';
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
              fontSize: 35, 
              fill: 0xF97316, 
              fontFamily: 'monospace',
              fontWeight: 'bold'
            }
          });
          coordText.anchor.set(0.5);
          coordText.y = LOGO_SIZE / 2 + 28;
          logoContainer.addChild(coordText);
          
          const ctaText = new Text({
            text: 'Síguenos para conseguir\ntu personaje',
            style: { 
              fontSize: 20, 
              fill: 0xffffff, 
              fontFamily: 'system-ui, sans-serif',
              fontWeight: '500',
              align: 'center',
              lineHeight: 26,
            }
          });
          ctaText.anchor.set(0.5);
          ctaText.y = LOGO_SIZE / 2 + 75;
          ctaText.alpha = 0.8;
          logoContainer.addChild(ctaText);
          
          const clickArrowContainer = new Container();
          clickArrowContainer.x = -LOGO_SIZE / 2 - 30;
          clickArrowContainer.eventMode = 'none';
          logoContainer.addChild(clickArrowContainer);
          
          const clickBg = new Graphics();
          clickBg.roundRect(-35, -10, 40, 20, 6);
          clickBg.fill({ color: 0xF97316 });
          clickArrowContainer.addChild(clickBg);
          
          const clickText = new Text({
            text: 'Click!',
            style: { 
              fontSize: 11, 
              fill: 0xffffff, 
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 'bold',
            }
          });
          clickText.anchor.set(0.5);
          clickText.x = -15;
          clickArrowContainer.addChild(clickText);
          
          const arrowGraphics = new Graphics();
          arrowGraphics.moveTo(10, -8);
          arrowGraphics.lineTo(20, 0);
          arrowGraphics.lineTo(10, 8);
          arrowGraphics.closePath();
          arrowGraphics.fill({ color: 0xF97316 });
          clickArrowContainer.addChild(arrowGraphics);
          
          let pulseDirection = 1;
          let pulseScale = 1;
          pulseArrowRef.current = () => {
            pulseScale += pulseDirection * 0.008;
            if (pulseScale >= 1.08) pulseDirection = -1;
            if (pulseScale <= 0.96) pulseDirection = 1;
            clickArrowContainer.scale.set(pulseScale);
          };
          
          logoContainer.on('pointerdown', () => {
            onLogoClickRef.current();
          });
          
          logoContainer.on('pointerover', () => {
            ctaText.alpha = 1;
          });
          
          logoContainer.on('pointerout', () => {
            ctaText.alpha = 0.8;
          });
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
        
        setLoading(false);
        
        await updateVisibleCharacters(charactersContainer, worldContainer, viewWidth, viewHeight);
        
        app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
          isDraggingRef.current = true;
          lastPointerRef.current = { x: e.global.x, y: e.global.y };
        });
        
        app.stage.on('pointermove', (e: FederatedPointerEvent) => {
          if (!isDraggingRef.current) return;
          
          followedIndexRef.current = null;
          
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
          const newScale = Math.max(0.15, Math.min(1.5, worldContainer.scale.x * zoomFactor));
          
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
        
        const handleTouchStart = (e: TouchEvent) => {
          if (e.touches.length === 2) {
            e.preventDefault();
            isPinchingRef.current = true;
            
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
            lastScaleRef.current = worldContainer.scale.x;
            
            const rect = app.canvas.getBoundingClientRect();
            lastTouchCenterRef.current = {
              x: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
              y: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
            };
          }
        };
        
        const handleTouchMove = (e: TouchEvent) => {
          if (e.touches.length === 2 && isPinchingRef.current) {
            e.preventDefault();
            
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (lastTouchDistanceRef.current > 0) {
              const scaleDelta = distance / lastTouchDistanceRef.current;
              const newScale = Math.max(0.15, Math.min(1.5, lastScaleRef.current * scaleDelta));
              
              const centerX = lastTouchCenterRef.current.x;
              const centerY = lastTouchCenterRef.current.y;
              
              const worldX = (centerX - worldContainer.x) / worldContainer.scale.x;
              const worldY = (centerY - worldContainer.y) / worldContainer.scale.y;
              
              worldContainer.scale.set(newScale);
              worldContainer.x = centerX - worldX * newScale;
              worldContainer.y = centerY - worldY * newScale;
              
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
            }
          }
        };
        
        const handleTouchEnd = () => {
          setTimeout(() => {
            isPinchingRef.current = false;
          }, 100);
          lastTouchDistanceRef.current = 0;
        };
        
        app.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        app.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        app.canvas.addEventListener('touchend', handleTouchEnd);
        
        const animationLoop = (currentTime: number) => {
          if (!mounted) return;
          
          const deltaTime = lastFrameTimeRef.current ? currentTime - lastFrameTimeRef.current : 16;
          lastFrameTimeRef.current = currentTime;
          
          if (pulseArrowRef.current) {
            pulseArrowRef.current();
          }

          setWorldContainerRef.current({
            x: worldContainer.x,
            y: worldContainer.y,
            scale: worldContainer.scale.x,
          });
          
          fpsFramesRef.current++;
          if (currentTime - fpsLastTimeRef.current >= 1000) {
            setFps(fpsFramesRef.current);
            fpsFramesRef.current = 0;
            fpsLastTimeRef.current = currentTime;
          }
          
          const visibleAgents: CharacterAgent[] = [];
          renderedIndicesRef.current.forEach(index => {
            const agent = agentsRef.current.get(index);
            if (agent) visibleAgents.push(agent);
          });
          
          renderedIndicesRef.current.forEach(index => {
            const agent = agentsRef.current.get(index);
            if (!agent) return;
            
            const character = charactersDataRef.current.get(index);
            const isChatting = false;
            
            updateAgent(agent, deltaTime, visibleAgents, isChatting);
            
            if (character) {
              const container = charactersContainer.children.find(
                c => c.label === `character-${character.id}`
              );
              if (container) {
                container.x = agent.x;
                container.y = agent.y;
                setCharacterPositionRef.current(character.id, { x: agent.x, y: agent.y });
              }
            }
          });

          if (followedIndexRef.current !== null && worldContainer && app) {
            const followedAgent = agentsRef.current.get(followedIndexRef.current);
            if (followedAgent) {
              worldContainer.x = app.screen.width / 2 - followedAgent.x;
              worldContainer.y = app.screen.height / 2 - followedAgent.y;
            }
          }
          
          animationFrameRef.current = requestAnimationFrame(animationLoop);
        };
        
        animationFrameRef.current = requestAnimationFrame(animationLoop);
        
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
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: false });
        appRef.current = null;
      }
      characterContainerCache.clear();
      agentsRef.current.clear();
      renderedIndicesRef.current.clear();
      clearCharactersData();
    };
  }, [updateVisibleCharacters, clearCharactersData]);

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
        <>
          <div className="pointer-events-auto absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] z-10 flex flex-col gap-2">
            <button
              onClick={() => handleZoom(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/90 text-foreground backdrop-blur-sm transition-all hover:bg-card active:scale-95 md:h-10 md:w-10"
              aria-label="Zoom in"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button
              onClick={() => handleZoom(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/90 text-foreground backdrop-blur-sm transition-all hover:bg-card active:scale-95 md:h-10 md:w-10"
              aria-label="Zoom out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
              </svg>
            </button>
          </div>
          
          <div className="pointer-events-none absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-16 right-[calc(1rem+env(safe-area-inset-right))] z-10 flex items-center justify-between rounded-lg border border-border/50 bg-card/80 px-3 py-2 text-xs text-foreground backdrop-blur-sm md:left-20 md:right-auto md:justify-start md:gap-4 md:px-4 md:py-3 md:text-sm">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="font-mono text-muted-foreground">
                <span className="text-foreground">{zoom}%</span>
              </span>
              <span className="text-border">|</span>
              <span className="font-mono text-muted-foreground">
                <span className="text-foreground">{total}</span> total
              </span>
              <span className="text-border">|</span>
              <span className="font-mono text-muted-foreground">
                <span className="text-primary">{visibleCount}</span>
              </span>
              <span className="text-border">|</span>
              <span className="font-mono text-muted-foreground">
                <span className="text-amber-400">{fps}</span> fps
              </span>
            </div>
            <div className="hidden text-xs text-muted-foreground md:block">
              Rueda/pinch: zoom | Arrastrar: mover | Click: detalle
            </div>
          </div>
        </>
      )}
    </div>
  );
}
