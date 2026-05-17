# Diario Del Junior - Web

> Mapa interactivo de personajes generados a partir de miembros del servidor de Discord.

---

## 🇪🇸 Español

### Descripción

**Diario del Junior** es una plataforma que genera personajes únicos estilo Habbo para cada miembro del servidor de Discord. Cada miembro recibe un avatar procedural generado a partir de su ID, creando una experiencia visual interactiva con un mapa en tiempo real, chat en vivo integrado y galería de personajes.

### Estado del Proyecto (Mayo 2026)

**Versión actual:** v2.0.0

### Stack Tecnológico

| Tecnología | Versión |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Base de datos** | PostgreSQL + Prisma 7 |
| **Visualización** | Pixi.js 8 |
| **Estilos** | Tailwind CSS 4 |
| **State Management** | Zustand 5 |
| **Storage** | Supabase Storage (S3-compatible) |
| **Tipado** | TypeScript 5.7 |
| **Real-time** | Socket.io 4 |
| **Bot** | Discord.js 14 |

### Estructura del Proyecto

```
modular_model_generator/
├── server.ts                      # Custom server: Next.js + Socket.io + Discord Bot
├── bot/
│   ├── config.ts                  # Configuración y validación de env vars del bot
│   ├── client.ts                  # Cliente Discord.js + registro de eventos
│   └── events/
│       ├── guild-member-add.ts    # Sincronización automática de nuevos miembros
│       └── message-create.ts      # Reenvío de mensajes de Discord al frontend vía Socket.io
├── app/
│   ├── api/
│   │   ├── auth/login/            # Endpoint de autenticación
│   │   ├── characters/            # CRUD de personajes
│   │   │   ├── route.ts           # GET (lista) + POST (crear desde usuarios)
│   │   │   ├── [username]/        # GET por username
│   │   │   ├── count/             # Contador de personajes
│   │   │   └── map/               # Datos para el mapa interactivo
│   │   └── health/                # Health check
│   ├── galeria/                   # Galería en cuadrícula
│   ├── galeriav2/                 # Mapa interactivo (Pixi.js)
│   ├── login/                     # Página de login admin
│   ├── privacy/                   # Política de privacidad
│   ├── terms/                     # Términos de servicio
│   ├── layout.tsx                 # Layout raíz (Geist font, dark mode)
│   └── page.tsx                   # Landing page con contador y redes sociales
├── components/
│   ├── Footer.tsx                 # Footer con enlaces legales
│   └── gallery/
│       ├── GalleryMap.tsx         # Mapa Pixi.js con personajes
│       ├── CharacterModal.tsx     # Modal de detalle de personaje
│       ├── LinksModal.tsx         # Modal de enlaces sociales
│       ├── OnboardingModal.tsx    # Modal de bienvenida en 3 pasos
│       ├── ClickRevealAvatar.tsx  # Avatar con revelado al clic + confetti
│       ├── ChatOverlay.tsx        # Overlay de burbujas de chat en tiempo real
│       └── ChatBubble.tsx         # Componente de burbuja individual estilo Habbo
├── lib/
│   ├── character-generator.ts     # Lógica de generación Habbo + upload S3
│   ├── character-agent.ts         # Agentes para posicionamiento en mapa
│   ├── circle-position.ts         # Algoritmo de posicionamiento circular
│   ├── supabase.ts                # Cliente S3 para avatares
│   ├── prisma.ts                  # Cliente Prisma
│   ├── rate-limit.ts              # Rate limiting por IP
│   ├── api-utils.ts               # Utilidades de manejo de errores API
│   ├── social-links.tsx           # Configuración de redes sociales
│   ├── types/
│   │   ├── character.ts           # Tipos TypeScript de Character
│   │   └── chat.ts                # Tipos de mensajes de chat
│   ├── stores/
│   │   ├── revealed-store.ts      # Zustand store para avatares revelados
│   │   └── chat-store.ts          # Zustand store para burbujas de chat (stack de 5)
│   ├── hooks/
│   │   ├── useCharactersData.ts   # Hook para datos de personajes
│   │   └── useSocket.ts           # Hook de conexión Socket.io con reconexión
│   └── data/                      # JSONs de assets Habbo
│       ├── male_head.json         # 94 opciones de cabeza (M)
│       ├── female_head.json       # 94 opciones de cabeza (F)
│       ├── male_hair.json         # 237 opciones de pelo (M)
│       ├── female_hair.json       # 257 opciones de pelo (F)
│       ├── male_trousers.json     # 119 opciones de pantalón (M)
│       ├── female_trousers.json   # 138 opciones de pantalón (F)
│       ├── male_chess.json        # 297 opciones de camisa (M)
│       ├── female_chess.json      # 320 opciones de camisa (F)
│       └── hats.json              # 465 opciones de sombrero
├── prisma/
│   └── schema.prisma              # Schema de base de datos
├── scripts/
│   ├── seed.ts                    # Seed de pruebas (aleatorio)
│   └── clean.ts                   # Limpiar base de datos
├── public/                        # Assets estáticos (logo, etc.)
├── docker-compose.yml             # PostgreSQL local
├── Makefile                       # Comandos de desarrollo
└── package.json
```

### Base de Datos

**Schema Prisma:**

```prisma
model Character {
  id               String   @id @default(uuid()) @db.Uuid
  discordId        String?  @unique
  username         String
  seed             Int      @unique
  generatorVersion Int      @default(1)
  selectedParts    Json
  imageUrl         String?
  createdAt        DateTime @default(now())

  @@index([createdAt])
}
```

### Páginas

| Ruta | Descripción |
|---|---|
| `/` | Landing page con contador de personajes, enlaces a redes sociales y tooltips de navegación |
| `/galeria` | Galería en cuadrícula de todos los personajes |
| `/galeriav2` | Mapa interactivo con Pixi.js, onboarding modal y sistema de revelado |
| `/login` | Login de administrador |
| `/privacy` | Política de privacidad |
| `/terms` | Términos de servicio |

### Funcionalidades Clave

#### Bot de Discord

El bot se integra directamente en el mismo proceso del servidor, gestionando dos flujos principales:

**Sincronización automática de miembros:**
- Escucha el evento `guildMemberAdd` en tiempo real
- Cuando un nuevo miembro se une, llama a `POST /api/characters` automáticamente
- Genera avatar procedural, lo sube a Supabase Storage y lo guarda en PostgreSQL
- No hay fetch inicial de miembros al arrancar — todo es event-driven

**Chat en tiempo real:**
- Escucha `messageCreate` en canales configurados vía `ALLOWED_CHANNEL_IDS`
- Ignora mensajes de bots automáticamente
- Emite mensajes por Socket.io a todos los clientes conectados
- Los mensajes aparecen como burbujas sobre los personajes en el mapa

#### Chat en Tiempo Real (Burbujas sobre Personajes)

Cada mensaje de Discord aparece como una burbuja de diálogo sobre el personaje correspondiente:

- **Posicionamiento:** Las burbujas siguen al personaje con zoom/scroll del mapa (mismo `transform` que el world container de PixiJS)
- **Apilamiento:** Hasta 5 mensajes por usuario, los nuevos aparecen más cerca del personaje
- **Duración:** 15 segundos por mensaje con fade-out suave
- **Estilo:** Fondo oscuro, borde amber, cola triangular centrada, nombre de canal en negrita
- **Formato:** `#canal: contenido del mensaje`

#### Generación de Personajes (Habbo)

Cada personaje se genera usando la API de Habbo Imaging:

- **Gender:** 50% M / 50% F (basado en seed)
- **Partes disponibles:**
  - Head: 94 opciones (M) + 94 (F)
  - Hair: 237 opciones (M) + 257 (F)
  - Trousers: 119 opciones (M) + 138 (F)
  - Chess: 297 opciones (M) + 320 (F)
  - Hats: 465 opciones (sin género, 50% probabilidad)

**URL de Habbo Imaging:**
```
https://www.habbo.fi/habbo-imaging/avatarimage
  ?figure=head.hair.trousers.chess.hat
  &gender=M|F
  &size=l
```

#### Sistema de Revelado

- Los avatares en el mapa aparecen ocultos con un patrón del logo
- Al hacer clic se revela el personaje con efecto de confetti
- El estado de revelado se persiste en `localStorage` vía Zustand
- Modal de onboarding en 3 pasos para nuevos usuarios

#### APIs

**POST /api/characters** — Crea personajes a partir de usuarios

```json
// Body
{
  "users": [
    { "id": "123456789", "username": "nombre_usuario", "joinedAt": "2024-02-27T16:00:00.000Z", "discordId": "123456789" }
  ]
}

// Respuesta
{
  "message": "Users processed",
  "total": 1,
  "results": { "created": 1, "skipped": 0, "errors": 0 }
}
```

**Lógica:**
1. Recibe lista de usuarios
2. Genera seed única desde el `id` del usuario
3. Verifica si la seed ya existe (evita duplicados)
4. Selecciona partes aleatorias del cuerpo
5. Descarga avatar de Habbo
6. Sube a Supabase Storage (S3)
7. Guarda registro en PostgreSQL

**Otros endpoints:**
- `GET /api/characters` — Lista personajes con paginación
- `GET /api/characters/[username]` — Obtiene personaje por username
- `GET /api/characters/count` — Contador total de personajes
- `GET /api/characters/map` — Datos para el mapa interactivo
- `GET /api/health` — Health check
- `POST /api/auth/login` — Autenticación admin

#### Seguridad

- **Rate limiting:** 10 req/min (POST) / 60 req/min (GET) por IP
- **API Auth Token:** Requerido para creación de personajes
- **Page Password:** Protección de páginas admin
- **Manejo de errores:** Respuestas estructuradas con códigos Prisma

### Configuración de Entorno

Copia `.env.example` a `.env` y configura:

```env
# Base de datos
DATABASE_URL=postgresql://...

# Supabase Storage (S3)
SUPABASE_ACCESS_KEY_ID=tu-access-key-id
SUPABASE_SECRET_ACCESS_KEY=tu-secret-access-key
SUPABASE_BUCKET=supabase-bucket-name
SUPABASE_PROJECT_REF=project-ref
SUPABASE_S3_ENDPOINT=s3-supabase-endpoint

# Autenticación
API_AUTH_TOKEN=your-secure-token-here
PAGE_PASSWORD=password

# Habbo (rate limiting interno)
HABBO_BATCH_THRESHOLD=20
HABBO_DELAY_SMALL_BATCH_MS=2500
HABBO_DELAY_LARGE_BATCH_MS=25000

# Discord Bot
DISCORD_TOKEN=tu-token-de-bot
GUILD_ID=id-del-servidor
WEB_AUTH_TOKEN=mismo-valor-que-API_AUTH_TOKEN
ALLOWED_CHANNEL_IDS=id-canal-1,id-canal-2,id-canal-3

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Instalación y Desarrollo

**Requisitos:**
- Node.js 20+
- Docker (para PostgreSQL local)

**Con Makefile:**
```bash
make dev          # Levanta DB + sync + modo desarrollo
make db-up        # Levanta PostgreSQL
make db-sync      # Prisma db push + generate
make seed         # Seed de pruebas
make seed-1000    # Seed con 1000 personajes
make db-clean     # Limpia la base de datos
make db-down      # Apaga PostgreSQL
```

**Manual:**
```bash
# Instalar dependencias
npm install

# Levantar base de datos
docker compose up -d

# Sincronizar schema
npx prisma db push
npx prisma generate

# Desarrollo
npm run dev         # tsx watch server.ts --dev (Next.js + Socket.io + Bot)

# Build producción
npm run build
npm run start       # tsx server.ts (único proceso: Next.js + Socket.io + Bot)
```

### Despliegue en Render

Un solo servicio always-on gestiona todo:

**Build Command:** `next build`
**Start Command:** `npm start` (ejecuta `tsx server.ts`)

**Variables de entorno necesarias:**
| Variable | Descripción |
|---|---|
| `DISCORD_TOKEN` | Token del bot de Discord |
| `GUILD_ID` | ID del servidor de Discord |
| `WEB_AUTH_TOKEN` | Token para autenticación de `/api/characters` |
| `ALLOWED_CHANNEL_IDS` | IDs de canales permitidos (separados por coma) |
| `NEXT_PUBLIC_SOCKET_URL` | URL pública de la app (ej: `https://tu-app.onrender.com`) |

**Intents de Discord requeridos** (en Discord Developer Portal → Bot):
- `SERVER MEMBERS INTENT` — para detectar nuevos miembros
- `MESSAGE CONTENT INTENT` — para leer mensajes de chat

### Historial de Cambios

- **[2026-05]:** v2.0.0 — Discord bot integrado, chat en tiempo real con burbujas sobre personajes, Socket.io, sincronización automática de miembros, campo `discordId`
- **[2026-05]:** v1.0.0 — Lanzamiento estable con onboarding modal, sistema de revelado con confetti, rate limiting, y social links
- **[2026-04-05]:** Tooltips CSS en navegación + fix de resiliencia ante fallo de BD en landing page
- **[2026-02]:** v0.2.0 — Migración a Habbo Imaging + Supabase Storage
- **v0.1.0:** Versión inicial con SVGs y mapa Pixi.js

---

## 🇬🇧 English

### Description

**Diario del Junior** is a platform that generates unique Habbo-style characters for each Discord server member. Every member receives a procedural avatar generated from their ID, creating an interactive visual experience with a real-time map, live chat integration, and character gallery.

### Project Status (May 2026)

**Current version:** v2.0.0

### Tech Stack

| Technology | Version |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | React 19 |
| **Database** | PostgreSQL + Prisma 7 |
| **Visualization** | Pixi.js 8 |
| **Styling** | Tailwind CSS 4 |
| **State Management** | Zustand 5 |
| **Storage** | Supabase Storage (S3-compatible) |
| **Typing** | TypeScript 5.7 |
| **Real-time** | Socket.io 4 |
| **Bot** | Discord.js 14 |

### Key Features

#### Discord Bot

The bot is integrated directly into the same server process, managing two main flows:

**Automatic member synchronization:**
- Listens to `guildMemberAdd` event in real time
- When a new member joins, automatically calls `POST /api/characters`
- Generates procedural avatar, uploads to Supabase Storage, and saves to PostgreSQL
- No initial member fetch on startup — everything is event-driven

**Real-time chat:**
- Listens to `messageCreate` on channels configured via `ALLOWED_CHANNEL_IDS`
- Ignores bot messages automatically
- Emits messages via Socket.io to all connected clients
- Messages appear as bubbles over characters on the map

#### Real-time Chat (Bubbles over Characters)

Each Discord message appears as a speech bubble over the corresponding character:

- **Positioning:** Bubbles follow the character with map zoom/scroll (same `transform` as PixiJS world container)
- **Stacking:** Up to 5 messages per user, newest appear closest to the character
- **Duration:** 15 seconds per message with smooth fade-out
- **Style:** Dark background, amber border, centered tail, channel name in bold
- **Format:** `#channel: message content`

#### Character Generation (Habbo)

Each character is generated using the Habbo Imaging API:

- **Gender:** 50% M / 50% F (seed-based)
- **Available parts:**
  - Head: 94 options (M) + 94 (F)
  - Hair: 237 options (M) + 257 (F)
  - Trousers: 119 options (M) + 138 (F)
  - Chess: 297 options (M) + 320 (F)
  - Hats: 465 options (no gender, 50% chance)

#### Reveal System

- Avatars on the map appear hidden with a logo pattern overlay
- Clicking reveals the character with a confetti effect
- Reveal state persists in `localStorage` via Zustand
- 3-step onboarding modal for new users

#### APIs

**POST /api/characters** — Creates characters from users

```json
// Body
{
  "users": [
    { "id": "123456789", "username": "username", "joinedAt": "2024-02-27T16:00:00.000Z" }
  ]
}

// Response
{
  "message": "Users processed",
  "total": 1,
  "results": { "created": 1, "skipped": 0, "errors": 0 }
}
```

**Flow:**
1. Receives user list
2. Generates unique seed from user `id`
3. Checks if seed already exists (prevents duplicates)
4. Selects random body parts
5. Downloads avatar from Habbo
6. Uploads to Supabase Storage (S3)
7. Saves record in PostgreSQL

**Other endpoints:**
- `GET /api/characters` — List characters with pagination
- `GET /api/characters/[username]` — Get character by username
- `GET /api/characters/count` — Total character count
- `GET /api/characters/map` — Interactive map data
- `GET /api/health` — Health check
- `POST /api/auth/login` — Admin authentication

#### Security

- **Rate limiting:** 10 req/min (POST) / 60 req/min (GET) per IP
- **API Auth Token:** Required for character creation
- **Page Password:** Admin page protection
- **Error handling:** Structured responses with Prisma error codes

### Pages

| Route | Description |
|---|---|
| `/` | Landing page with character counter, social links, and navigation tooltips |
| `/galeria` | Grid gallery of all characters |
| `/galeriav2` | Interactive map with Pixi.js, onboarding modal, and reveal system |
| `/login` | Admin login |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

### Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://...

# Supabase Storage (S3)
SUPABASE_ACCESS_KEY_ID=your-access-key-id
SUPABASE_SECRET_ACCESS_KEY=your-secret-access-key
SUPABASE_BUCKET=supabase-bucket-name
SUPABASE_PROJECT_REF=project-ref
SUPABASE_S3_ENDPOINT=s3-supabase-endpoint

# Authentication
API_AUTH_TOKEN=your-secure-token-here
PAGE_PASSWORD=password

# Habbo (internal rate limiting)
HABBO_BATCH_THRESHOLD=20
HABBO_DELAY_SMALL_BATCH_MS=2500
HABBO_DELAY_LARGE_BATCH_MS=25000

# Discord Bot
DISCORD_TOKEN=your-discord-bot-token
GUILD_ID=your-discord-guild-id
WEB_AUTH_TOKEN=same-as-API_AUTH_TOKEN
ALLOWED_CHANNEL_IDS=channel-id-1,channel-id-2,channel-id-3

# Socket.io
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Installation & Development

**Requirements:**
- Node.js 20+
- Docker (for local PostgreSQL)

**With Makefile:**
```bash
make dev          # Start DB + sync + dev mode
make db-up        # Start PostgreSQL
make db-sync      # Prisma db push + generate
make seed         # Test seed
make seed-1000    # Seed with 1000 characters
make db-clean     # Clean database
make db-down      # Stop PostgreSQL
```

**Manual:**
```bash
# Install dependencies
npm install

# Start database
docker compose up -d

# Sync schema
npx prisma db push
npx prisma generate

# Development
npm run dev         # tsx watch server.ts --dev (Next.js + Socket.io + Bot)

# Production build
npm run build
npm run start       # tsx server.ts (single process: Next.js + Socket.io + Bot)
```

### Deploying on Render

A single always-on service handles everything:

**Build Command:** `next build`
**Start Command:** `npm start` (runs `tsx server.ts`)

**Required environment variables:**
| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Discord bot token |
| `GUILD_ID` | Discord server ID |
| `WEB_AUTH_TOKEN` | Auth token for `/api/characters` |
| `ALLOWED_CHANNEL_IDS` | Allowed channel IDs (comma-separated) |
| `NEXT_PUBLIC_SOCKET_URL` | Public app URL (e.g., `https://tu-app.onrender.com`) |

**Required Discord Intents** (in Discord Developer Portal → Bot):
- `SERVER MEMBERS INTENT` — to detect new members
- `MESSAGE CONTENT INTENT` — to read chat messages

### Changelog

- **[2026-05]:** v2.0.0 — Integrated Discord bot, real-time chat with character bubbles, Socket.io, automatic member sync, `discordId` field
- **[2026-05]:** v1.0.0 — Stable release with onboarding modal, confetti reveal system, rate limiting, and social links
- **[2026-04-05]:** CSS tooltips on navigation + BD failure resilience fix on landing page
- **[2026-02]:** v0.2.0 — Migration to Habbo Imaging + Supabase Storage
- **v0.1.0:** Initial version with SVGs and Pixi.js map

### License

MIT