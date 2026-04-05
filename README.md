# Diario Del Junior - Generador de Personajes

Mapa interactivo de personajes generados a partir de seguidores de TikTok.

## Estado del Proyecto (Febrero 2026)

### Stack Tecnológico
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Base de datos**: PostgreSQL + Prisma
- **Visualización**: Pixi.js (mapa interactivo)
- **Estilos**: Tailwind CSS
- **State Management**: Zustand
- **Storage**: AWS S3 (Supabase Storage)

### Estructura del Proyecto

```
modular_model_generator/
├── app/
│   ├── api/
│   │   ├── auth/login/         # Login endpoint
│   │   ├── characters/         # CRUD de personajes
│   │   │   ├── route.ts        # GET (list) + POST (create from users)
│   │   │   ├── [username]/     # GET by username
│   │   │   ├── count/          # Contador de personajes
│   │   │   └── map/            # Datos para el mapa
│   │   └── health/             # Health check
│   ├── galeria/                # Galería de personajes
│   ├── galeriav2/             # Mapa interactivo (Pixi.js)
│   ├── login/                  # Página de login
│   └── page.tsx                # Página principal
├── components/
│   └── gallery/
│       ├── GalleryMap.tsx       # Mapa Pixi.js
│       ├── CharacterModal.tsx  # Modal al clickar personaje
│       └── LinksModal.tsx      # Modal de enlaces
├── lib/
│   ├── character-generator.ts  # Lógica de generación Habbo + S3 upload
│   ├── character-agent.ts      # Agentes para posicionamiento
│   ├── circle-position.ts      # Posicionamiento circular
│   ├── supabase.ts            # Cliente S3 para avatares
│   ├── data/                  # JSONs de assets Habbo
│   │   ├── male_head.json
│   │   ├── female_head.json
│   │   ├── male_hair.json
│   │   ├── female_hair.json
│   │   ├── male_trousers.json
│   │   ├── female_trousers.json
│   │   ├── male_chess.json
│   │   ├── female_chess.json
│   │   └── hats.json
│   └── prisma.ts              # Cliente Prisma
├── prisma/
│   └── schema.prisma           # Schema de base de datos
└── scripts/
    ├── seed.ts                 # Seed para pruebas (aleatorio)
    └── clean.ts                # Limpiar base de datos
```

### Base de Datos

**Schema Prisma:**
```prisma
model Character {
  id               String   @id @default(uuid()) @db.Uuid
  username         String
  seed             Int      @unique
  generatorVersion Int      @default(1)
  selectedParts    Json
  imageUrl         String?  // URL del avatar en S3
  createdAt        DateTime @default(now())
}
```

### APIs

#### POST /api/characters
Crea personajes a partir de usuarios.

**Body:**
```json
{
  "users": [
    {
      "id": "123456789",
      "username": "nombre_usuario",
      "joinedAt": "2024-02-27T16:00:00.000Z"
    }
  ]
}
```

**Respuesta:**
```json
{
  "message": "Users processed",
  "total": 1,
  "results": { "created": 1, "skipped": 0, "errors": 0 }
}
```

**Lógica:**
1. Recibe lista de usuarios
2. Por cada usuario:
   - Genera seed desde `id` del usuario
   - Verifica si la seed ya existe (evita duplicados)
   - Selecciona partes aleatorias del cuerpo (head, hair, trousers, chess, hat)
   - Descarga avatar de Habbo
   - Sube a AWS S3
   - Guarda URL en PostgreSQL

#### GET /api/characters
Lista personajes con paginación.

#### GET /api/characters/[username]
Obtiene personaje por username (busca por seed).

### Generación de Personajes

**Sistema Habbo:**
- Cada personaje se genera usando la API de Habbo
- Parts disponibles (cargadas desde JSONs):
  - Head: 94 opciones (M) + 94 (F)
  - Hair: 237 opciones (M) + 257 (F)
  - Trousers: 119 opciones (M) + 138 (F)
  - Chess: 297 opciones (M) + 320 (F)
  - Hats: 465 opciones (sin género)

**Parámetros de URL Habbo:**
```
https://www.habbo.fi/habbo-imaging/avatarimage
  ?figure=head.hair.trousers.chess.hat
  &gender=M|F
  &size=l
```

**Selección de partes:**
- Gender: 50% M / 50% F
- Cada parte: selección aleatoria basada en seed
- Hat: 50% probabilidad de tener

### Assets Habbo (lib/data/)

| Archivo | Part | Gender | Cantidad |
|---------|------|--------|----------|
| male_head.json | head | M | 94 |
| female_head.json | head | F | 94 |
| male_hair.json | hair | M | 237 |
| female_hair.json | hair | F | 257 |
| male_trousers.json | trousers | M | 119 |
| female_trousers.json | trousers | F | 138 |
| male_chess.json | chess | M | 297 |
| female_chess.json | chess | F | 320 |
| hats.json | hats | - | 465 |

### Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con contador de personajes |
| `/galeria` | Galería grid de personajes |
| `/galeriav2` | Mapa interactivo con Pixi.js |
| `/login` | Login de admin |
| `/privacy` | Política de privacidad |
| `/terms` | Términos de servicio |

### Configuración de Entorno (.env)

```env
# Base de datos
DATABASE_URL=postgresql://...

# Supabase Storage (S3)
SUPABASE_ACCESS_KEY_ID=tu-access-key-id
SUPABASE_SECRET_ACCESS_KEY=tu-secret-access-key
SUPABASE_BUCKET=avatars
```

### Scripts

```bash
# Desarrollo
npm run dev

# Build producción
npm run build
npm run start

# Seed de pruebas (100 personajes aleatorios)
npx tsx scripts/seed.ts 100

# Limpiar base de datos
npx tsx scripts/clean.ts
```

### Historial de Cambios

- **[2026-04-05]:** Añadidos tooltips CSS en los botones de navegación superior (`app/page.tsx`): al pasar el cursor sobre "Explorar el Mapa" y "Ver Galería" aparece una tarjeta con título y descripción breve, usando `group/tip` de Tailwind sin JS adicional.
- **[2026-04-05]:** Fix resiliencia ante fallo de BD en la página principal (`app/page.tsx`): se valida `res.ok` antes de leer la respuesta del API, se comprueba que `data.total` sea un número, y se añade `?? 0` como fallback defensivo en el render para evitar `toLocaleString` sobre `undefined`.

#### v0.2.0 - Migración a Habbo + S3 (Feb 2026)
- Sistema de generación de personajes migrate de SVGs a API de Habbo
- Integración con AWS S3 para almacenamiento de avatares
- Nuevas partes: head, hair, trousers, chess, hats
- Soporte para género M/F
- Sistema de seeds únicas por usuario
- Campo `imageUrl` en base de datos
- Personajes ahora son estáticos (sin movimiento)

#### v0.1.0 - Versión Inicial
- Generación de personajes con SVGs simples
- Mapa interactivo con Pixi.js
- Galería de personajes

### Licencia

MIT
