# gatroxm-portfolio-backend

API REST del portafolio GatroxM.dev (Node.js + Express + TypeScript + MongoDB Atlas).

## Requisitos
- Node.js 20+ (desarrollado con Node 24, npm 11)
- Acceso a MongoDB Atlas (URI ya configurada para desarrollo local)

## Configuración

```bash
cd gatroxm-portfolio-backend
npm.cmd install
# Edita .env si hace falta (ya viene preconfigurado para desarrollo local)
npm.cmd run seed     # siembra datos reales de la hoja de vida (idempotente)
npm.cmd run dev      # http://localhost:3000
```

> En PowerShell este equipo tiene bloqueada la ejecución de scripts, por eso se usa `npm.cmd`.

## Variables de entorno (.env)

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto HTTP (default 3000) |
| `MONGODB_URI` | Cadena de conexión a MongoDB Atlas |
| `MONGODB_DB` | Nombre de la base de datos (`gatroxm_portfolio`) |
| `FRONTEND_URL` | Origen permitido por CORS (`http://localhost:4200`) |
| `JWT_SECRET` | Secreto para firmar tokens admin |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales admin iniciales (seed + login fallback) |
| `AI_API_KEY` | Opcional. Clave para proveedor compatible con OpenAI |
| `AI_BASE_URL` | Base URL del proveedor (default `https://api.openai.com/v1`) |
| `AI_MODEL` | Modelo a usar (default `gpt-4o-mini`) |
| `WHATSAPP_PROVIDER` | Opcional. `callmebot`, `ultramsg` o `telegram`. Vacío = sin notificaciones |
| `WHATSAPP_PHONE` | Número destino con indicativo (ej. `+573133976999`) |
| `WHATSAPP_API_KEY` | API key de CallMeBot |
| `ULTRAMSG_INSTANCE` / `ULTRAMSG_TOKEN` | Credenciales de UltraMsg |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Credenciales del bot de Telegram |

## Notificaciones de contacto

Cada mensaje guardado en `POST /api/contact` se notifica en segundo plano (no bloquea la respuesta del formulario). Si el envío falla, solo se registra un `warn`; el mensaje queda guardado igual.

- **CallMeBot**: agrega el número del bot, envía `I allow callmebot to send me messages` y usa la API key que responde. Configura `WHATSAPP_PROVIDER=callmebot`, `WHATSAPP_PHONE` y `WHATSAPP_API_KEY`.
- **UltraMsg**: crea la instancia, escanea el QR y usa `WHATSAPP_PROVIDER=ultramsg` con `ULTRAMSG_INSTANCE` y `ULTRAMSG_TOKEN`.
- **Telegram**: crea un bot con @BotFather, obtén el `chat_id` y usa `WHATSAPP_PROVIDER=telegram` con `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`.

En Render, configura estas variables en el dashboard del servicio backend.

## Reacciones del blog

Cada publicación acepta seis reacciones (like, love, haha, wow, sad, angry). El visitante se identifica con un ID anónimo guardado en su navegador, así que solo cuenta una vez por publicación y puede cambiar o quitar su reacción.

- `GET /api/blog/:slug/reactions?visitorId=...` — conteos, total y la reacción del visitante.
- `POST /api/blog/:slug/reactions` — body `{ "visitorId": "...", "type": "like" }`. Repetir el mismo tipo la quita.
- Los listados (`/api/blog` y `/api/blog/admin/all`) incluyen `reactions: { counts, total }`.
- La IP se guarda solo como hash y el endpoint tiene rate limit.

## Chatbot con IA

- `POST /api/chat` usa `AI_API_KEY` si está configurada (OpenAI, Groq, OpenRouter u Ollama con API compatible según `AI_BASE_URL`).
- Sin clave o si falla el proveedor, responde desde la base de conocimientos local construida con los datos reales de la hoja de vida (`source: "knowledge"`). Nunca inventa información.

## Endpoints principales

- `GET /api/health` — estado del servicio y conexión MongoDB
- `GET /api/profile`, `/api/projects`, `/api/projects/:slug`, `/api/experience`, `/api/skills`, `/api/education`
- `POST /api/contact` — guarda mensajes (rate limit + honeypot)
- `POST /api/chat` — chatbot
- `POST /api/auth/login`, `GET /api/auth/me`
- CRUD protegido (Bearer): `POST|PUT|DELETE /api/projects|experience|skills|education`

## Datos

La semilla (`npm.cmd run seed`) carga únicamente información real desde la hoja de vida de Gustavo Adolfo Muñoz Reyes (`src/data/portfolio-content.ts`). MongoDB almacena solo URLs/metadatos multimedia, nunca archivos de vídeo.
