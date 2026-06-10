# CV Forge · Optimizador de Currículums con IA Local

Aplicación web **local-first** para optimizar tu CV y preparar candidaturas, con IA 100% local.
Tus datos **nunca** salen de tu navegador. Sin backend, sin cuentas, sin telemetría.

![stack](https://img.shields.io/badge/React-18-61dafb) ![stack](https://img.shields.io/badge/Vite-5-646cff) ![stack](https://img.shields.io/badge/TypeScript-strict-3178c6)

## ✨ Funcionalidades

- **Análisis de ofertas** por tres vías: texto pegado, URL (parser local) o **imagen con OCR** (Tesseract.js, 100% en el cliente).
- **Editor de CV** paso a paso: contacto, resumen, experiencia, educación, habilidades, idiomas y proyectos, con medidor de completitud.
- **Dos plantillas estrictas**, pixel-perfect en impresión:
  - **Harvard** — serif clásica, jerarquía limpia, foco en logros.
  - **ATS** — sans-serif, una columna, máxima parseabilidad.
- **Recomendación inteligente** de plantilla (Harvard vs ATS) con justificación y score de confianza.
- **Gap Analysis** — cobertura de palabras clave de la oferta vs tu CV, con sugerencias.
- **Keywords que faltan, asistidas por IA** — la IA pre-selecciona las que encajan con tu perfil y tú confirmas cuáles añadir a tus habilidades (por si olvidaste alguna).
- **Optimización X-Y-Z de Google** — reescritura de viñetas con métricas y palabras clave.
- **Embellecer resumen con IA** — pule tu resumen profesional y lo alinea con la oferta.
- **Carta de presentación con IA** — redacta una carta personalizada conectando tus logros con el puesto; editable y exportable a PDF.
- **Exportación PDF** vía impresión nativa del navegador (vectorial, texto seleccionable → **parseable por ATS**).

## 🧠 IA local

- **Primario: [Ollama](https://ollama.com)** en `http://localhost:11434`. Modelos sugeridos: `llama3`, `gemma2`.
- **Fallback heurístico determinista**: si Ollama no está disponible, la app **sigue funcionando** por completo (recomendación, gap analysis y reescritura X-Y-Z con motor local sin IA).

Activar Ollama (opcional):

```bash
# 1. Instala Ollama desde https://ollama.com
ollama pull llama3      # o: ollama pull gemma2
ollama serve            # corre en localhost:11434
```

La app detecta Ollama automáticamente y deja elegir el modelo desde el panel de IA (icono en la barra lateral).

## 🚀 Puesta en marcha (paso a paso — para tus amigos)

La app corre **entera en tu ordenador**. Estos son todos los pasos desde cero:

### 1. Requisitos previos
- **Node.js 18 o superior** → descárgalo de [nodejs.org](https://nodejs.org) (versión LTS). Comprueba con:
  ```bash
  node --version
  ```
- **pnpm** (gestor de paquetes). Si no lo tienes, instálalo con:
  ```bash
  npm install -g pnpm
  ```
- *(Opcional)* **Ollama** para la IA avanzada — ver sección “IA local” abajo. **Sin Ollama la app funciona igual** con su motor heurístico local.

### 2. Conseguir el código
- Si te han dado acceso al repositorio privado de GitHub:
  ```bash
  git clone https://github.com/<usuario>/<repo>.git
  cd <repo>
  ```
  *(En un repo privado necesitas estar invitado como colaborador o usar un token; si no, pide un .zip del proyecto y descomprímelo.)*

### 3. Instalar y arrancar
```bash
pnpm install        # instala dependencias (una vez)
pnpm dev            # arranca la app
```
Abre el navegador en **http://localhost:5173** (se abre solo). ¡Listo!

### 4. (Opcional) Activar la IA local con Ollama
```bash
# Instala Ollama desde https://ollama.com y luego:
ollama pull llama3.1:8b      # modelo recomendado para esta app
ollama serve                 # corre en localhost:11434
```
En la app, abre el panel **IA** (barra lateral) → **Reintentar conexión** → elige `llama3.1:8b`.

### Otros comandos
```bash
pnpm build      # build de producción (tsc + vite) → carpeta dist/
pnpm preview    # sirve el build de producción
pnpm typecheck  # comprobación de tipos TypeScript
```

> **Nota:** todos tus datos (CV, ofertas, cartas) se guardan **solo en tu navegador** (localStorage). Si abres la app en otro navegador u ordenador, empiezas de cero. Nada se sube a ningún servidor.

## 🏗️ Arquitectura

Ver [`ARCHITECTURE.md`](./ARCHITECTURE.md) para el detalle completo. Resumen:

- **React + Vite + TypeScript** (`strict`).
- **Zustand + persist** → estado local-first en `localStorage`.
- **CSS Vanilla + design tokens** → control milimétrico y glassmorphism.
- **Servicios desacoplados** (`src/services/`): Ollama, OCR, parser, keywords, recomendación, optimizador, gateway.
- **Degradación elegante**: ningún módulo depende de la red para funcionar.

## 🔒 Privacidad

La única conexión saliente posible es a `localhost:11434` (Ollama, en tu máquina) y la descarga única de los modelos OCR de Tesseract. Ningún dato del CV se envía a ningún servidor.
