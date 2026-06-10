# Guía para colaboradores · CV Forge

Bienvenido/a 👋. Esta guía te pone a producir en 5 minutos.

## Requisitos
- **Node.js 18+** ([nodejs.org](https://nodejs.org), versión LTS)
- **pnpm** → `npm install -g pnpm`
- *(Opcional)* **Ollama** para la IA avanzada ([ollama.com](https://ollama.com)). Sin Ollama la app funciona con su motor heurístico local.

## Arrancar en local
```bash
git clone https://github.com/Jsolh03/cv-forge.git
cd cv-forge
pnpm install
pnpm dev          # http://localhost:5173
```

### Activar la IA local (opcional)
```bash
ollama pull llama3.1:8b
ollama serve      # localhost:11434
```
En la app: panel **IA** (barra lateral) → *Reintentar conexión* → elige `llama3.1:8b`.

## Scripts
| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo con HMR |
| `pnpm build` | Build de producción (`tsc -b && vite build`) → `dist/` |
| `pnpm preview` | Sirve el build de producción |
| `pnpm typecheck` | Comprobación de tipos TypeScript |

> Antes de abrir un PR, asegúrate de que `pnpm typecheck` y `pnpm build` pasan sin errores.

## Estructura del proyecto
```
src/
├── components/   UI por dominio (job, cv, analysis, ai, cover, layout, ui)
├── services/     Lógica pura: ollama, ocr, jobParser, keywords, recommendation,
│                 optimizer, enhance, aiGateway, prompts  (con fallback heurístico)
├── store/        Estado global Zustand persistido en localStorage
├── hooks/        Hooks (estado de Ollama, etc.)
├── lib/          Utilidades puras (id, validación, formato, classnames)
├── types/        Modelo de dominio tipado
└── styles/       Design tokens, base y CSS de impresión
```
Detalle completo de decisiones en [`ARCHITECTURE.md`](../ARCHITECTURE.md).

## Convenciones
- **TypeScript `strict`** — sin `any` implícitos; tipa los datos de dominio en `src/types`.
- **Local-first** — nada de backends ni telemetría. La red saliente se limita a Ollama
  (`localhost:11434`), el OCR (WASM) y el proxy CORS *opt-in* de importación por URL.
- **Degradación elegante** — toda función con IA debe tener fallback heurístico que
  funcione sin Ollama. No dejes `TODO` ni placeholders.
- **CSS** — usa los design tokens de `src/styles/tokens.css`; evita estilos mágicos.
- **Commits** — mensajes claros en imperativo (`feat:`, `fix:`, `refactor:`…).

## Privacidad
Los datos del usuario (CV, ofertas, cartas) viven **solo en su navegador** (`localStorage`).
Nunca añadas envíos de datos a servidores externos sin consentimiento explícito en la UI.
