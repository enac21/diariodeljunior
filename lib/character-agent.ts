interface Vector2 {
  x: number;
  y: number;
}

type AgentState = 'idle' | 'walking';

export interface CharacterAgent {
  index: number;
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: AgentState;
  stateTimer: number;
  nextStateChange: number;
  maxSpeed: number;
  wanderStrength: number;
  maxDistance: number;
}

const IDLE_MIN = 2000;
const IDLE_MAX = 6000;
const WALK_MIN = 4000;
const WALK_MAX = 10000;
const BASE_SPEED = 20;
const SPEED_VARIANCE = 15;
const AVOIDANCE_RADIUS = 350;
const AVOIDANCE_STRENGTH = 0.8;
const WANDER_CHANGE_INTERVAL = 500;

export function createAgent(index: number, homeX: number, homeY: number): CharacterAgent {
  const maxSpeed = BASE_SPEED + Math.random() * SPEED_VARIANCE;
  const initialState: AgentState = Math.random() > 0.3 ? 'walking' : 'idle';
  
  return {
    index,
    homeX,
    homeY,
    x: homeX + (Math.random() - 0.5) * 100,
    y: homeY + (Math.random() - 0.5) * 100,
    vx: 0,
    vy: 0,
    state: initialState,
    stateTimer: 0,
    nextStateChange: getRandomStateDuration(initialState),
    maxSpeed,
    wanderStrength: 0.15 + Math.random() * 0.2,
    maxDistance: 100 + Math.random() * 100,
  };
}

function getRandomStateDuration(state: AgentState): number {
  if (state === 'idle') {
    return IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN);
  }
  return WALK_MIN + Math.random() * (WALK_MAX - WALK_MIN);
}

function getWanderForce(agent: CharacterAgent, time: number): Vector2 {
  const angle = (Math.sin(time * 0.001 + agent.index * 1.5) + 1) * Math.PI;
  const strength = agent.wanderStrength * (0.5 + Math.sin(time * 0.0005 + agent.index) * 0.5);
  
  return {
    x: Math.cos(angle) * strength,
    y: Math.sin(angle) * strength,
  };
}

function getHomeForce(agent: CharacterAgent): Vector2 {
  const dx = agent.homeX - agent.x;
  const dy = agent.homeY - agent.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < agent.maxDistance * 0.2) {
    return { x: 0, y: 0 };
  }
  
  const strength = Math.pow((distance - agent.maxDistance * 0.2) / agent.maxDistance, 1.5);
  
  if (distance === 0) return { x: 0, y: 0 };
  
  return {
    x: (dx / distance) * strength * 5,
    y: (dy / distance) * strength * 5,
  };
}

export function updateAgent(
  agent: CharacterAgent,
  deltaTime: number,
  visibleAgents: CharacterAgent[],
): void {
  agent.stateTimer += deltaTime;
  
  if (agent.stateTimer >= agent.nextStateChange) {
    agent.state = agent.state === 'idle' ? 'walking' : 'idle';
    agent.stateTimer = 0;
    agent.nextStateChange = getRandomStateDuration(agent.state);
    
    if (agent.state === 'walking') {
      const angle = Math.random() * Math.PI * 2;
      agent.vx = Math.cos(angle) * agent.maxSpeed * 0.3;
      agent.vy = Math.sin(angle) * agent.maxSpeed * 0.3;
    }
  }
  
  if (agent.state === 'idle') {
    agent.vx *= 0.9;
    agent.vy *= 0.9;
    agent.x += agent.vx * deltaTime * 0.001;
    agent.y += agent.vy * deltaTime * 0.001;
    return;
  }
  
  const wander = getWanderForce(agent, agent.stateTimer);
  let fx = wander.x;
  let fy = wander.y;
  
  for (const other of visibleAgents) {
    if (other.index === agent.index) continue;
    
    const dx = agent.x - other.x;
    const dy = agent.y - other.y;
    const distSq = dx * dx + dy * dy;
    
    if (distSq < AVOIDANCE_RADIUS * AVOIDANCE_RADIUS && distSq > 1) {
      const dist = Math.sqrt(distSq);
      const strength = Math.pow(1 - (dist / AVOIDANCE_RADIUS), 2);
      fx += (dx / dist) * strength * AVOIDANCE_STRENGTH;
      fy += (dy / dist) * strength * AVOIDANCE_STRENGTH;
    }
  }
  
  const home = getHomeForce(agent);
  fx += home.x;
  fy += home.y;
  
  agent.vx += fx * deltaTime * 0.06;
  agent.vy += fy * deltaTime * 0.06;
  
  const speed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
  if (speed > agent.maxSpeed) {
    agent.vx = (agent.vx / speed) * agent.maxSpeed;
    agent.vy = (agent.vy / speed) * agent.maxSpeed;
  }
  
  if (speed > 0.1) {
    agent.x += agent.vx * deltaTime * 0.001;
    agent.y += agent.vy * deltaTime * 0.001;
  }
}
