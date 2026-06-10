# CV Forge — Arquitectura Técnica

> Aplicación Web **Local-First** para optimización de CV y preparación de candidaturas, con IA 100% local.
> Sin backend, sin telemetría, sin red obligatoria. Todos los datos viven en el navegador del usuario.

---

## 1. Principios rectores

| Principio | Implicación técnica |
|-----------|---------------------|
| **Local-First** | Persistencia en `localStorage` (Zustand `persist`). IA vía Ollama en `localhost`. OCR en el cliente (Tesseract.js / WASM). Cero llamadas a servidores propios. |
| **Privacidad por diseño** | Ningún dato del CV abandona la máquina. La única red saliente posible es `http://localhost:11434` (Ollama) y la descarga *una vez* de modelos WASM/Transformers.js. |
| **Degradación elegante** | Si Ollama no está disponible → fallback heurístico determinista (extracción de keywords, plantillas de reescritura) + opción Transformers.js en navegador. La app **nunca** se rompe por falta de IA. |
| **Clean code estricto** | TypeScript `strict`, sin `any` implícitos, sin `TODO`, errores tipados (`Result`/excepciones controladas), componentes puros y servicios sin estado de UI. |
| **Estética premium** | Glassmorphism, tokens de diseño, transiciones de 200–320ms con `cubic-bezier`, tipografía variable, layout responsive y *pixel-perfect* en impresión. |

---

## 2. Stack tecnológico (decisiones cerradas)

| Capa | Elección | Justificación |
|------|----------|---------------|
| Core | **React 18 + Vite 5 + TypeScript** | Reactividad, HMR instantáneo, build óptimo, tipado estricto. |
| Estado | **Zustand + middleware `persist`** | Local-first nativo, mínimo boilerplate, selectores granulares. |
| Estilos | **CSS Vanilla + Custom Properties** | Control milimétrico de las plantillas de impresión (Harvard/ATS) y del glassmorphism. Tailwind añade fricción en `@media print`. |
| IA local | **Ollama (HTTP `localhost:11434`)** primario · **Transformers.js** fallback en navegador | Ollama da modelos potentes (llama3/gemma2); Transformers.js cubre el caso sin Ollama. |
| OCR | **Tesseract.js** | OCR WASM 100% cliente para capturas de ofertas. |
| Exportación | **`@media print` nativo** (+ `html2pdf.js` opcional) | La impresión del navegador produce PDF vectorial de máxima calidad; superior a la rasterización de html2pdf. |

---

## 3. Estructura de carpetas

```
src/
├── main.tsx                # Bootstrap React
├── App.tsx                 # Router de vistas (state-driven, sin react-router)
├── styles/
│   ├── tokens.css          # Sistema de diseño: color, tipografía, espaciado, sombras
│   ├── global.css          # Reset + base + utilidades
│   └── print.css           # Reglas @media print para plantillas de CV
├── types/index.ts          # Modelo de dominio (CV, JobOffer, Analysis…)
├── store/useAppStore.ts    # Estado global persistido
├── services/
│   ├── ollama.ts           # Conector Ollama (status, generate, stream)
│   ├── localLLM.ts         # Fallback Transformers.js
│   ├── aiGateway.ts        # Fachada: enruta a Ollama → Transformers → heurística
│   ├── ocr.ts              # Tesseract.js
│   ├── jobParser.ts        # Normalización texto / URL (con manejo CORS)
│   ├── keywords.ts         # Extracción de keywords + gap analysis determinista
│   ├── recommendation.ts   # Algoritmo Harvard vs ATS
│   ├── optimizer.ts        # Reescritura X-Y-Z (IA + heurística)
│   └── prompts.ts          # Builders de prompts (IA)
├── hooks/
│   ├── useToast.ts
│   └── useOllamaStatus.ts
├── components/
│   ├── layout/   AppShell, Sidebar, TopBar, StepNav
│   ├── ui/       Button, Card, Field, TextArea, Tag, Spinner, Toast, Modal, Stepper, ProgressRing, EmptyState
│   ├── job/      JobInput (tabs: texto/URL/imagen), KeywordCloud
│   ├── cv/       ProfileForm, ExperienceEditor, EducationEditor, SkillsEditor
│   ├── cv/templates/  HarvardTemplate, ATSTemplate, CVPreview
│   ├── analysis/ RecommendationCard, GapAnalysis
│   └── ai/       AssistantPanel, OptimizeBullet
└── lib/          id, validation, format, classnames
```

---

## 4. Modelo de dominio (resumen)

- **UserProfile**: datos personales, resumen, `experience[]`, `education[]`, `skills[]`, `languages[]`, `projects[]`.
- **ExperienceItem**: empresa, rol, fechas, ubicación, `bullets: string[]` (logros).
- **JobOffer**: fuente (`text|url|image`), texto crudo, título/empresa detectados, `keywords[]`.
- **Analysis**: `recommendedTemplate`, `rationale`, `matchedKeywords`, `missingKeywords`, `score`.
- **TemplateKind**: `'harvard' | 'ats'`.

Todo el modelo en `src/types/index.ts`, con tipos estrictos y discriminated unions para las fuentes de oferta y los estados de IA.

---

## 5. Flujo de IA (Gateway)

```
aiGateway.run(task)
   │
   ├─ ¿Ollama vivo? ──► POST /api/generate (modelo configurable) ──► resultado
   │
   ├─ ¿Transformers.js cargado? ──► inferencia en navegador ──► resultado
   │
   └─ Fallback heurístico determinista ──► resultado (siempre disponible)
```

Tareas IA: `optimizeBullet` (fórmula X-Y-Z de Google), `gapAnalysis`, `recommendTemplate`, `summarize`. Cada tarea tiene su builder de prompt y su heurística equivalente, de modo que el resultado nunca es vacío ni un placeholder.

---

## 6. Algoritmo de recomendación Harvard vs ATS

Señales ponderadas extraídas de la oferta:
- Indicadores ATS (Workday, Greenhouse, Taleo, "applicant tracking", "sube tu CV", portal corporativo, empresa grande) → **+ATS**.
- Indicadores Harvard (referido, contacto directo, startup pequeña, networking, "envía a [email]", consultoría/academia) → **+Harvard**.
- Densidad de keywords técnicas duras → favorece ATS (parseabilidad).
Resultado: plantilla recomendada + `rationale` legible + score 0–100. Si Ollama está disponible, se enriquece con justificación en lenguaje natural; si no, la heurística ya produce una explicación completa.

---

## 7. Plantillas de CV (impresión pixel-perfect)

- **Harvard**: serif (Georgia), márgenes A4 estrictos, jerarquía limpia, sin color/iconos, foco en logros cuantitativos.
- **ATS**: sans-serif (Inter/Arial), una columna, secciones etiquetadas, sin tablas/gráficos, máxima parseabilidad.
Ambas renderizan en pantalla dentro de un "papel" A4 simulado y, vía `@media print`, ocupan página real sin artefactos de la UI (sidebar/topbar ocultos con `print:hidden`).

---

## 8. Plan de fases

1. **Fundación**: Vite/TS, tokens CSS, primitivos UI, store, shell, navegación.
2. **IA + OCR**: conector Ollama, Tesseract, parser de ofertas, estados de carga.
3. **CV + plantillas**: formularios paso a paso, Harvard, ATS, impresión/PDF.
4. **Inteligencia**: recomendación, optimización X-Y-Z, gap analysis.
5. **Pulido**: micro-animaciones, validaciones, accesibilidad, estados vacíos.

---

## 9. Calidad y "definición de hecho"

- Sin `TODO`/placeholders. Cada módulo funciona end-to-end (con o sin Ollama).
- TypeScript `strict` sin errores. Build de producción limpio.
- Responsive verificado y plantillas validadas en vista de impresión.
