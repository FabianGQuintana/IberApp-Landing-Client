# IberAPP — Guía de implementación de la Landing v6

> Versión 2.0 · 1 de octubre de 2026 · Reemplaza la versión 1.0, que tomaba como base `Ibera Prototipo`.
> **Objetivo único:** que la app quede igual a `docs/prototipo/Esteros del Iberá_ Plataforma ambiental/Ibera Landing v6.dc.html`, en Next.js 16 y en todos los anchos (360–1440 px y más).

## Índice

1. [Objetivo y estado](#1-objetivo-y-estado)
2. [El prototipo objetivo, sección por sección](#2-el-prototipo-objetivo-sección-por-sección)
3. [Validación de tecnologías para Next.js](#3-validación-de-tecnologías-para-nextjs)
4. [Arquitectura](#4-arquitectura)
5. [Sistema visual](#5-sistema-visual)
6. [Responsive](#6-responsive)
7. [Mapas](#7-mapas)
8. [Coreografía de scroll](#8-coreografía-de-scroll)
9. [Reportar y uso sin señal](#9-reportar-y-uso-sin-señal)
10. [Minijuegos](#10-minijuegos)
11. [Datos y contenido](#11-datos-y-contenido)
12. [Plan por fases](#12-plan-por-fases)
13. [Checklist, decisiones y riesgos](#13-checklist-decisiones-y-riesgos)
14. [Convenciones](#14-convenciones)

---

## 1. Objetivo y estado

- **La app es una sola página** (`/`), igual que v6: una landing narrativa con anclas, no un sitio de varias rutas.
- **Paridad visual y funcional** con v6: mismo orden de secciones, textos, tipografía, colores (tema oscuro por defecto y claro), mapas, juegos e interacciones.
- **Lo simulado en v6 se vuelve real**: foto, GPS, código de seguimiento y detección de conexión (sección 9).
- **v6 ya es responsive.** Se validó con Playwright: 0 errores y 0 px de scroll horizontal en 1440 y 390 px.
- **Fase 0 completa** (rama `feat/landing-v6`). Se retiró el código del Prototipo, los datos quedaron alineados 1:1 con v6 y la base visual está lista.
- **Fase 1 completa.** Header, menú móvil, tema, franja “Caminos hoy” y footer iguales a v6.
- **Fase 2 completa.** Secciones de contenido iguales a v6.
- **Fase 3 completa.** Territorio y el mapa de la ficha con MapLibre. 10 de las 12 secciones implementadas; siguen provisorias Aprender jugando y Reportar (fase 4).
- **Fase 5 completa.** Coreografía de scroll de v6: parallax, mapa sticky por scroll, ondulación, sanación y cursor. La fase 4 (juegos y reporte) queda pendiente por decisión del equipo: los juegos no serán necesariamente como los de la landing.

Archivos del prototipo que **no** se implementan: `Ibera Prototipo`, `Ibera Mockup`, `Ibera Escritorio`, `Ibera Landing v2`–`v5` e `Ibera Landing`. `Ibera Sistema Visual` y `Icon` quedan como referencia de íconos.

---

## 2. El prototipo objetivo, sección por sección

Para verlo: `python -m http.server 8765` dentro de la carpeta del prototipo y abrir `http://localhost:8765/Ibera%20Landing%20v6.dc.html`.

| # | Ancla | Sección (`data-screen-label`) | Contenido | Interacción | Celular (< 700 px) / tablet (< 1024 px) |
| --- | --- | --- | --- | --- | --- |
| — | — | Header | Logo + “IBERÁ / Corrientes · Argentina”, links Explorar · Visitar · Ecosistema · Aprender, botón Reportar, selector de tema | Transparente sobre foto; vidrio con blur al hacer scroll; tono según sección (`data-tone`); link activo subrayado | Links reemplazados por “Menú” (panel a pantalla completa con animación escalonada) |
| — | — | Franja “Caminos hoy” | “Caminos hoy: 6 de 8 transitables →” | Aparece flotando abajo a la izquierda fuera de Territorio, Caminos y Actuar | Igual |
| 1 | `#descubrir` | Portada | Foto a sangre, “IBERÁ” gigante, bajada, “Explorar ↓” | Entrada con escala y subida; parallax de foto y texto | Igual, tipografía fluida |
| 2 | `#intro` | Conectado por el agua | Párrafo que se ilumina palabra por palabra | Progreso de scroll en sección de 190vh | 160vh |
| 3 | `#territorio` | Territorio | “Ocho puertas a un mismo estero”, mapa satelital con 8 pines, tarjeta del portal activo, brújula, leyenda, escala, zoom | Sección de 300vh con mapa sticky: el scroll recorre los 8 portales con vuelo de cámara; intro de pines escalonada | Mapa en bloque sin arrastre + tira de portales para elegir |
| 4 | `#caminos` | Estado de accesos | “Antes de salir, mirá el camino.” + lista de 8 accesos con estado | Hover: miniatura y desplazamiento | Lista apilada |
| 5 | — | Pausa | Foto a sangre “El estero se escucha antes de verse” | Parallax | Igual |
| 6 | `#portales` | Portales | “Explorá las puertas de entrada al Iberá.” Carrusel horizontal | Scroll-snap, flechas, barra de progreso, cursor “Ver” personalizado, imagen con parallax lateral | Tarjetas de 84vw |
| 7 | `#ficha` | Ficha del portal | Chips de los 8 portales, nombre gigante, galería (slides al 74%), qué hacer, puntos de interés, dónde quedarse, desafío de la zona, “Aprendelo jugando”, “Reportar en esta zona”, antes de ir (camino, cómo llegar, señal, combustible, visitantes), mapa chico, collage de 3 fotos, “Guardar sin conexión” | Galería con swipe, rueda y teclado; lightbox con miniaturas | Slides al 86% |
| 8 | `#ecosistema` | Ecosistema | “El estero respira”: yaguareté, ciervo, carpincho, embalsados | Sección de 100vh con la ficha activa según scroll y fundido entre fotos | Fichas apiladas |
| 9 | `#fragilidad` | Fragilidad | “Pero un ecosistema tan vivo también es vulnerable.” Residuos, lixiviados, fuego, luz | Texto iluminado (210vh), ondulación SVG y oscurecido de la foto, ficha activa por scroll | 170vh |
| 10 | `#jugar` | Aprender jugando | “Lo que se hace en el estero, se aprende jugando” + 4 juegos con índice | Cambio de juego con fundido | Área 4:5 en vez de 16:9 |
| 11 | `#actuar` | Reportar | “¿Viste algo que no debería estar acá?”, asistente de 4 pasos, indicador de señal, “Ver reclamos en el mapa” (panel superpuesto con mapa) | Pasos con transición; modo sin señal con cola y recuperación | Panel debajo del título |
| 12 | `#futuro` | Cierre | “Conocer para cuidar”, yaguareté | Foto de gris a color según scroll (“sanación”) | Igual |
| — | — | Footer | Explorar / Participar / Institucional (Prensa, Contacto, Parque Iberá), créditos | Links con subrayado animado | Columnas apiladas |

---

## 3. Validación de tecnologías para Next.js

Cada necesidad de v6, cómo la resuelve el prototipo y con qué se implementa. **Validado** = comprobado en este repo (versión instalada, documentación de Next 16 en `node_modules/next/dist/docs/` o typings del paquete).

| Necesidad | En v6 | En IberAPP | Estado |
| --- | --- | --- | --- |
| Framework | React 18.3 por CDN + runtime `support.js` (`DCLogic`) | **Next.js 16.3.6** App Router, **React 19.2.8**, una ruta `/` | Validado: build estático OK |
| Lenguaje | JS | **TypeScript 5** estricto | Validado |
| Estilos | Estilos inline + variables CSS (`--bg`, `--fg`…) | **Tailwind CSS 4.3** con `@theme`; las mismas variables de v6 mapeadas a utilidades (`bg-page`, `text-mute`…) | Validado (fase 0) |
| Tipografía | Google Fonts: Barlow 300/400/500/600 + 400 itálica; Barlow Semi Condensed 700/800 | **`next/font/google`** con los mismos pesos (autoalojadas, sin parpadeo) | Validado |
| Tema oscuro/claro | `data-theme` en `<html>` + `localStorage["ibera-theme"]` | Script inline en `<head>` + `suppressHydrationWarning`, patrón de la guía “Preventing flash before hydration” de Next 16 | Validado con test |
| Imágenes | `background: url()` enlazando Wikimedia a 1400–2400 px | **`next/image`** con archivos locales WebP en `public/img` (19 fotos, 4,7 MB) | Validado; 3 fotos de baja resolución (sección 13) |
| Mapa | **MapLibre GL 4.7.1** por CDN, cargado a mano | **`maplibre-gl` 6.11.2** por npm, `dynamic(..., { ssr: false })` dentro de un Client Component | Validado: las 18 APIs que usa v6 existen en los typings de 6.11 (`fitBounds`, `cameraForBounds`, `flyTo` con `offset`, `project`, `setPaintProperty` de `raster-saturation` y `raster-brightness-max`, `webglcontextlost`, `touchZoomRotate.disableRotation`, `cooperativeGestures`…) |
| Teselas | MapTiler Hybrid si hay clave; si no, Esri World Imagery + capas de referencia | Igual (`lib/map/config.ts`), clave en `NEXT_PUBLIC_MAPTILER_KEY` | Validado; producción: ver riesgos |
| Marcadores | Elementos HTML posicionados con `map.project()` en cada `move` | Igual, escribiendo `transform` por ref (sin `setState` por frame) | Implementado (fase 3) |
| Animación de scroll | `scroll` + `requestAnimationFrame` + `IntersectionObserver`, escribiendo estilos directo en el DOM | **Sin librería de animación.** Hooks propios con `rAF` + `IntersectionObserver` que escriben por ref. Se descarta `motion`: v6 no lo necesita y agrega peso | Decisión validada |
| Ondulación del agua | Filtro SVG `feTurbulence` + `feDisplacementMap` animado | Mismo filtro SVG inline | Compatible |
| Sonido (Voces de la noche) | **Web Audio API**: 4 osciladores con rampa descendente | Igual. No hacen falta archivos de audio | Compatible |
| Detección de conexión | Botón que simula “Sin señal” | **`useOffline`** de `next/offline` + `experimental.useOffline` (Next 16, experimental) para la UI; cola propia en IndexedDB para reportes | Validado: el hook y el flag existen en 16.3.6 |
| Uso sin conexión completo | Texto “Guardar sin conexión” | **Serwist** (`@serwist/next` 9.5.12 + `@serwist/cli`), recomendado por la guía PWA de Next 16 con ejemplo para Turbopack | Validado en compatibilidad; se instala en fase 6 |
| Fotos de reportes | Simulado | `<input type="file" accept="image/*" capture="environment">` + compresión en canvas (`utils/image.ts`) | Implementado como utilidad |
| Ubicación | Simulado (punto fijo en Pellegrini) | `navigator.geolocation` + mapa con pin central | A implementar (fase 4) |
| Validación | — | **zod 4.6** (`lib/validation/report.ts`), compartida con la futura Server Action | Validado |
| Persistencia | — | Fase 4: `localStorage`. Fase 6: Postgres + Drizzle, bucket S3 y Server Action | Pendiente |
| Pruebas | — | **Playwright 1.63**: 4 anchos, errores de runtime, tema; luego comparación visual contra v6 | Validado (5 tests en verde) |
| Lint | — | ESLint 9 + `eslint-config-next` 16 (incluye las reglas de React Compiler, como `set-state-in-effect`) | Validado |

**Conclusión:** todo lo que hace v6 tiene un equivalente directo en Next 16. No hace falta ninguna librería que v6 no use, salvo las de producción (Serwist, Drizzle). Además se quitan dos piezas: el runtime `support.js` y la carga de MapLibre por CDN.

---

## 4. Arquitectura

### Composición

`app/page.tsx` es un Server Component que arma las secciones en el orden de v6. Cada sección es un componente en `components/sections/`. Solo lo interactivo es cliente.

```text
app/
  layout.tsx            fuentes, ThemeScript, metadata
  page.tsx              <Header/> <RoadsBand/> + 12 secciones + <Footer/>
  globals.css           tokens v6 (oscuro/claro), animaciones ib-*, utilidades
  manifest.ts · not-found.tsx
components/
  layout/               SiteChrome (client: header + menú móvil + franja), Footer, Logo
  sections/             Hero, ConnectedByWater, Territory, RoadStatus, Pause, PortalsRail,
                        PortalSheet, Ecosystem, Fragility, Play, Act, Future
  map/                  MapView (client, MapLibre diferido), PortalMiniMap
  games/                CleanChannels, WaterSigns, DarkSky, NightVoices, GamesIndex
  report/               ReportWizard, ReportsMapDialog, TrackingTimeline
  ui/                   Icon, Lightbox, Controls (flechas, botón vidrio, acción subrayada, punto),
                        LitText, Reveal, CustomCursor (fase 5)
  theme/                ThemeScript, ThemeToggle (client)
context/
  LandingContext.tsx    portal y juego elegidos (`openPortal`, `openGame`), `scrollToSection`
hooks/                  useLandingScroll (header, sección activa, franja), useTheme,
                        useScrollFrame (+ sectionProgress, activeIndexAtMiddle), useMediaQuery
lib/
  data/                 portals, road-status, ecosystem, games, reports, copy, images, statuses
  map/config.ts         BOUNDS, PELLEGRINI, satStyle(), atribución
  storage/local-store.ts
  validation/report.ts
types/                  portal, report, game, content
utils/                  format, geo, image
public/img/             19 fotos WebP · public/iso.svg
tests/e2e/              Playwright
```

### Estado compartido

v6 guarda todo en un único componente. En Next se reparte así:

| Estado | Dónde | Por qué |
| --- | --- | --- |
| Portal elegido (`portal`) | `LandingContext` + `?portal=<id>` en la URL | Lo cambian Territorio, Caminos, Portales y Ficha; la URL permite compartir una ficha |
| Juego activo | `LandingContext` | Lo cambian la Ficha (“Aprendelo jugando”) y el índice de juegos |
| Sección activa, tono del header, franja | `useLandingScroll`: un listener pasivo con `rAF`; el estado solo cambia cuando cambia un valor | Mismas reglas que `update()` de v6 |
| Progreso de scroll (iluminado, parallax, mapa) | Refs + `rAF`, **nunca `setState` por frame** | Rendimiento en celulares y regla `set-state-in-effect` |
| Tema | `data-theme` + `localStorage` | Igual que v6 |
| Reporte en curso | Estado local de `ReportWizard` | Solo lo usa esa sección |

---

## 5. Sistema visual

Valores medidos en el código de v6 y ya cargados en `app/globals.css`.

| Token | Oscuro (defecto) | Claro | Uso |
| --- | --- | --- | --- |
| `--bg` → `bg-page` | `#0B100E` | `#F2F5F3` | Fondo |
| `--bg2` → `bg-page-2` | `#101813` | `#FFFFFF` | Paneles |
| `--forest` | `#002E1D` | `#003E25` | Bloques verdes |
| `--fg` → `text-fg` | `#EEF2EE` | `#111514` | Texto |
| `--head` → `text-head` | `#FFFFFF` | `#003E25` | Títulos y links |
| `--mute` → `text-mute` | `#8FA89A` | `#5E6663` | Texto secundario, etiquetas |
| `--rule` / `--rule2` | blanco 14% / 8% | `#C9D2CD` / `#DDE3DF` | Divisores |
| `--litoff` | blanco 16% | `#C9D2CD` | Palabras sin iluminar |
| `--btnbg` / `--btnfg` | `#EEF2EE` / `#0B100E` | `#003E25` / `#FFFFFF` | Botón principal |
| `--navglass` / `--navline` | negro 58% / blanco 8% | claro 74% / negro 8% | Header con blur |

Colores fijos: `mint #00D58A` (acento, foco, activo), `leaf #00B96C` (transitable/resuelto), `yellow #FACD05` (precaución/recibido), `orange #F68E13` (4×4, sin señal), `sky #90B4E1` (derivado).

**Tipografía (medida en v6):**

| Uso | Estilo | Tamaño |
| --- | --- | --- |
| Portada “IBERÁ” | Semi Condensed 800, mayúsculas | `clamp(64px, 10vw, 176px)` |
| Títulos de sección | Semi Condensed 800 | `clamp(52px, 6vw, 104px)` a `clamp(64px, 9vw, 156px)` |
| Títulos de tarjeta | Semi Condensed 800 | 18–32 px |
| Subtítulos editoriales (“Antes de salir, mirá el camino.”) | Barlow 400/500 | `clamp(44px, 4.4vw, 72px)` |
| Cuerpo | Barlow 400 | 15–18 px |
| Etiquetas (`eyebrow`) | Barlow 500, mayúsculas, interletra .08em | 11–12 px |
| Botones y links | Barlow 500 | 14–16 px |

**Radios:** 2, 4, 10 y 12 px y círculos (no los 28–44 px del Prototipo). **Margen lateral:** `clamp(24px, 4vw, 64px)` (constante `G` en v6). **Sin sombras.**

---

## 6. Responsive

v6 decide el layout en JavaScript: `narrow` = ancho < 1024 px y `mobile` = ancho < 700 px. En Next eso pasa a **CSS**, para que el HTML del servidor ya llegue con el layout correcto y sin saltos:

- `lg` (≥ 1024 px) = escritorio de v6 (sticky, 300vh, cursor personalizado, links en el header).
- Breakpoint propio `tab` (≥ 700 px) = tablet de v6. Se agrega en fase 1 con `--breakpoint-tab: 700px` en `@theme`.
- Debajo de 700 px = celular de v6.

Medidas que v6 cambia por ancho y que se replican:

| Elemento | Celular | Tablet | Escritorio |
| --- | --- | --- | --- |
| Conectado por el agua (alto) | 160vh | 160vh | 190vh |
| Fragilidad (intro) | 170vh | 170vh | 210vh |
| Territorio | Bloque, mapa `min(108vw, 560px)` | Mapa `min(72vw, 620px)` | 300vh, mapa sticky 100vh |
| Tarjeta del carrusel | `min(84vw, 640px)` | Igual | `min(58vw, 880px)` |
| Slide de la galería | 86% | 86% | 74% |
| Ecosistema | Alto automático, todo visible | Igual | 100vh, ficha activa |
| Juegos | 4:5 | 16:9 | 16:9 |
| Header | Logo + tema + “Menú” | Igual | Links + Reportar + tema |
| Padding del mapa | 56 / 48 / 36 / 36 | 90 / 90 / 64 / 84 | Deja libre la columna de texto |

Reglas: `100dvh` en lugar de `100vh` en celular. Todo lo que es hover (cursor “Ver”, miniaturas en Caminos) solo con `(hover: hover) and (pointer: fine)`. `prefers-reduced-motion` desactiva parallax, vuelos de cámara, iluminado progresivo y ondulación (v6 ya lo hace).

---

## 7. Mapas

Cuatro instancias de MapLibre, como en v6 (`mountMap`):

| Clave | Sección | Comportamiento |
| --- | --- | --- |
| `main` | Territorio | Encuadre `BOUNDS`, inclinación 6° solo en escritorio, vuelo al portal elegido, zoom ±, reiniciar vista, escala en km, brújula, leyenda, estados cargando / error con “Reintentar”; en celular sin arrastre ni zoom con dos dedos. Se reencuadra al cambiar el tamaño salvo que haya un portal enfocado ✅ |
| `aside` | Ficha | No interactivo, 8 pines con el actual resaltado ✅ |
| `loc` | Reportar | Interactivo, zoom 14; al soltar, el centro es la ubicación (“Marcar manualmente”) |
| `rmap` | Panel “Reclamos en el mapa” | Interactivo con teclado y rueda; marcadores por estado; el reporte propio aparece al enviarse |

Datos fijos: `BOUNDS = [[-58.0692, -28.6549], [-56.6969, -27.8572]]`, `PELLEGRINI = [-57.1745, -28.5405]`. Tratamiento del raster: saturación −0.15, contraste +0.08, brillo máximo 0.9 (oscuro) o 0.97 (claro). Atribución: “© MapTiler · © colaboradores de OpenStreetMap” o “Imágenes: Esri, Maxar, Earthstar Geographics · Referencias: Esri”.

**Sin WebGL o con error de carga:** como en v6, nunca se muestra una geografía falsa. Territorio muestra “No pudimos cargar el mapa interactivo” con **Reintentar** y **Ver portales**; el mapa de la ficha muestra “Mapa no disponible”. El resto de la página sigue funcionando.

**Worker de MapLibre 6:** MapLibre busca su worker junto a su módulo (`import.meta.url`), que no existe dentro del bundle de Next. `scripts/copy-maplibre-worker.mjs` (corre en `predev` y `prebuild`) copia `maplibre-gl-worker.mjs` y `maplibre-gl-shared.mjs` a `public/vendor/maplibre/`, y `MapView` llama a `setWorkerUrl` antes de crear el mapa. La carpeta está en `.gitignore`.

**Contenedor:** la hoja de estilos de MapLibre fuerza `position: relative` en el contenedor; por eso ocupa el 100% de un padre posicionado en lugar de usar `absolute inset-0`.

---

## 8. Coreografía de scroll

| Efecto | Marca en v6 | Implementación |
| --- | --- | --- |
| Parallax de portada | `data-hero-img`, `data-hero-txt`, `data-hero-meta` | `<ScrollMotion />` (un único listener + rAF, escribe por DOM) ✅ |
| Revelado al entrar | `data-rv` (opacidad + 28 px, 1,2 s) | `<Reveal>` con IntersectionObserver, `rootMargin: 0 0 -12% 0` |
| Líneas que suben | `data-lines` / `data-line` (escalonado 0,12 s) | `<Reveal lines>` |
| Parallax de imágenes | `data-par`, `data-drift` | `<ScrollMotion />` (collage de la ficha, títulos de Pausa y Cierre) ✅ |
| Texto iluminado | `data-litsec`, `data-w` | `<LitText>` con progreso de sección |
| Recorte al entrar | `data-reveal` (`clip-path: inset`) | `<ScrollMotion />` (Pausa) ✅ |
| Mapa por scroll | `secP(#territorio)` → `mapIdx` 0–7 | `Territory`: `useScrollFrame` + `sectionProgress`; sección de 300vh con escenario sticky; la cámara sigue al portal del scroll, y un pin o “Ver todo” la toman manualmente ✅ |
| Ondulación y oscurecido | `#ibera-ripple`, `data-dim`, `data-dimsec` | Filtro SVG en `Fragility`, 850 ms una vez por entrada ✅ |
| Sanación | `data-heal` (escala de grises a color) | `<ScrollMotion />` (Cierre) ✅ |
| Tono del header | `data-tone` | `useActiveSection` |
| Sección activa del menú | ids `territorio`, `portales`, `ecosistema`, `jugar` | `useActiveSection` |
| Ficha activa (Ecosistema / Fragilidad) | `data-fauna`, `data-frag` | `useActiveSection` por ítem |
| Carrusel | `onRailScroll`, `data-card`, `data-cimg`, `data-railbar` | `PortalsRail`: parallax por tarjeta, brillo, leyenda y transición al abrir ✅ |
| Cursor personalizado | `cursorRef`, `data-cursor` | `<CustomCursor />` delegado por `data-cursor` (carrusel y galería); solo puntero fino y sin reduced-motion ✅ |

---

## 9. Reportar y uso sin señal

El asistente de v6 tiene 4 paneles. Qué es simulado hoy y cómo queda:

| Paso | En v6 | En IberAPP |
| --- | --- | --- |
| 1 · ¿Qué encontraste? | 5 tipos (Minibasural, Agua contaminada, Humo o fuego, Fauna afectada, Otro) | Igual |
| 2 · Foto y ubicación | “Agregar foto” muestra una foto fija; “Detectar mi ubicación” pone un punto fijo en Pellegrini | Cámara o galería reales con compresión; GPS real; “Marcar manualmente” mueve el mapa `loc` |
| 3 · Revisá y enviá | Tipo, lugar, fecha, nota | Igual + validación zod. El botón dice “Guardar y enviar después” sin señal |
| 4 · Resultado | Código fijo `IB-0427`; “Sin señal” se activa a mano; pasos Guardado → Enviando → Recibido | Código generado; señal detectada con `useOffline`; la cola se envía sola al volver la conexión |
| Seguimiento | Recibido · Derivado · Resuelto con responsable | Igual (datos de ejemplo hasta fase 6) |
| Reclamos en el mapa | Panel superpuesto con los 5 de ejemplo + el propio | Igual |

Fase 4: los reportes se guardan en `localStorage`. Fase 6: Server Action + Postgres + bucket, y Serwist para la cola y el uso sin conexión.

---

## 10. Minijuegos

| Juego | Mecánica en v6 | Datos |
| --- | --- | --- |
| Canales limpios | 5 residuos flotando (`ib-bob`); al juntar los 5, aparecen 3 mensajes escalonados (0,45 / 1,5 / 2,6 s) | `WASTE_ITEMS` |
| Señales del agua | 4 puntos sobre la foto; hay que encontrar 3, cada uno muestra su explicación | `WATER_SIGNS` |
| Cielo oscuro | Control deslizante Estero → Ciudad: se apagan estrellas, sube el resplandor y la bruma; contador `2400 → 150` (“cifra ilustrativa”) | `STARS`, `visibleStars()` |
| Voces de la noche | “Escuchá”: canto sintetizado con Web Audio y 44 barras animadas; 3 opciones; la correcta es el urutaú | `NIGHT_VOICES`, `WAVE_BARS` |

`STARS` y `WAVE_BARS` usan la fórmula determinística de v6, así que el servidor y el cliente generan los mismos valores (sin errores de hidratación).

---

## 11. Datos y contenido

Todos en `lib/data/`, con claves en inglés y contenido en castellano, tomados 1:1 de v6:

| Archivo | Fuente en v6 | Contenido |
| --- | --- | --- |
| `portals.ts` | `static P` | 8 portales: coordenadas, offsets de etiqueta, textos, actividades, puntos de interés, alojamiento, señal, combustible, teléfono, problemática, juego, galería, collage |
| `road-status.ts` | `ROAD_STATUS` | Estado de cada camino y fecha de actualización (separado porque cambia a diario) |
| `statuses.ts` | `E`, `TIPOS`, colores de `R` | Etiquetas y colores de estados y tipos |
| `ecosystem.ts` | `FAUNA`, `FRAG` | 4 especies/hábitats y 4 amenazas |
| `games.ts` | `GAMES`, `G1`, `G2`, `STARS`, `BARS` | Juegos y sus datos |
| `reports.ts` | `R`, `track` | 5 reclamos de ejemplo y pasos de seguimiento |
| `copy.ts` | `LIT_A`, `LIT_B`, prop `heroCopy`, ids | Textos narrativos, anclas, links |
| `images.ts` | `static I` | 19 fotos locales con alt y archivo de origen |

Son **datos de ejemplo**: teléfonos `000 000`, estados de camino, reclamos y cifras de los juegos (v6 lo aclara en el footer).

---

## 12. Plan por fases

Rama de trabajo: `feat/landing-v6`. Cada fase termina con lint, build y Playwright en verde, y un commit convencional.

| Fase | Entregables | Criterio de cierre | Commit |
| --- | --- | --- | --- |
| **0 · Reestructuración** ✅ | Se retira el código del Prototipo; datos 1:1 con v6; 19 imágenes; fuentes, tokens y tema de v6; guía v2; tests base | Build de una sola ruta `/`; 5 tests en verde | `refactor(landing): restructure project around Ibera Landing v6` |
| **1 · Cáscara** ✅ | Header (tono, vidrio, link activo), menú móvil, selector de tema, franja “Caminos hoy”, footer, `Reveal`, breakpoint `tab`, `useLandingScroll`, secciones provisorias con ids/tonos/alturas de v6 | Comparación lado a lado con v6 (header arriba y sobre superficie, oscuro y claro, menú, franja, footer) en 1440 y 390 px; 12 tests en verde | `feat(layout): add v6 header, mobile menu, roads band and footer` |
| **2 · Secciones de contenido** ✅ | Portada (entrada animada), Conectado por el agua (texto iluminado), Caminos, Pausa, Carrusel de portales, Ficha con galería, lightbox y “Antes de ir”, Ecosistema y Fragilidad (ficha activa por scroll), Cierre; `LandingContext` (portal y juego elegidos) | Comparación lado a lado con v6 de 12 escenarios en 1440 y 390 px; 19 tests en verde | `feat(sections): build v6 content sections` |
| **3 · Mapas** ✅ | `MapView` (MapLibre diferido, marcadores HTML por `project()`, tratamiento del raster por tema, estados y reintento), Territorio (pines, etiquetas, tarjeta, zoom, reiniciar, brújula, escala, leyenda, intro, tira de portales en celular), mapa de la ficha; worker de MapLibre servido desde `public/` | Comparación lado a lado con v6 en 1440 y 390 px; 26 tests en verde (incluye fallo de teselas) | `feat(map): territory and portal sheet maps` |
| 4 · Interactivos | 4 juegos, asistente de reporte con foto y GPS reales, panel de reclamos, `useOffline` | Flujos E2E en verde | `feat(play,report): games and report wizard` |
| **5 · Coreografía** ✅ | Parallax, iluminado, mapa sticky por scroll, ondulación, sanación, cursor, carrusel con parallax, reduced-motion | Comparación visual con v6 en escritorio y celular; 36 tests en verde (10 nuevos en `motion.spec.ts`) | `feat(motion): scroll choreography from v6` |
| 6 · Producción | Postgres + Drizzle, bucket, Server Action, Serwist, imágenes de reemplazo, deploy en Railway | Reporte sin señal que llega al volver la conexión; Lighthouse móvil ≥ 90 | `feat(api): persist reports and offline queue` |

---

## 13. Checklist, decisiones y riesgos

### Listo

- [x] Next 16.3.6, React 19.2.8, Tailwind 4.3, TypeScript 5, ESLint 9, Playwright 1.63
- [x] Código y arquitectura en inglés; contenido en castellano
- [x] Datos, textos e imágenes de v6 en el repo
- [x] Tokens, fuentes y tema de v6 con script anti-parpadeo
- [x] Una sola ruta `/`; build estático

### Decisiones abiertas

- [ ] **“Modo historia”:** en v6 enlaza al archivo del Prototipo. ¿Se oculta hasta que exista el modo historia en 3 actos del docx?
- [ ] **Prensa y Contacto:** en v6 apuntan a parqueibera.gob.ar. ¿Se mantienen o se hacen secciones propias?
- [ ] **Copy de la portada:** v6 trae dos variantes (“Un paisaje hecho de agua” por defecto, o “El estero es de todos”).
- [ ] **Gestión de reclamos:** quién cambia Recibido → Derivado → Resuelto (fase 6).

### Riesgos

- **Fotos de baja resolución en el propio prototipo:** `water-pollution` (200 px), `grass-fire` (640 px) y `jaguar-standing` (727 px) se ven pixeladas a pantalla completa, igual que en v6. Conviene reemplazarlas por fotos libres de mayor resolución.
- **Teselas de Esri sin clave:** sirven para desarrollo; para producción usar MapTiler con clave o revisar los términos de Esri.
- **Rendimiento:** v6 hace `setState` en cada evento de scroll. Si se copia tal cual, se traba en celulares. Por eso la coreografía escribe por ref.
- **`useOffline` es experimental** en Next 16: aislarlo en un hook propio para poder reemplazarlo.
- **WebGL ausente** en algunos teléfonos: se muestra el panel de error con reintento (decisión de v6: nunca una geografía falsa).

---

## 14. Convenciones

- **Idioma:** código, archivos, carpetas, tipos, valores de uniones y comentarios en inglés. Contenido visible en castellano rioplatense, como en v6.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat`, `fix`, `refactor`, `chore`, `docs`, `test`) con scope (`layout`, `sections`, `map`, `play`, `report`, `motion`, `api`). Un commit por fase como mínimo.
- **Ramas:** trabajo en `feat/landing-v6`; PR a `main` al cerrar cada fase o al final.
- **Next 16 primero:** ante cualquier duda, `node_modules/next/dist/docs/` manda (AGENTS.md).
- **Comparación visual con v6:** con el prototipo servido en `:8765` (`python -m http.server 8765` en su carpeta) y `npm run dev -- -p 3005`, correr `npm run compare:v6 [escenario…]`. Deja capturas lado a lado (izquierda v6, derecha IberAPP) en `tests/.compare/`. Cada fase agrega sus escenarios en `tests/compare-v6.mjs`.
- **Una tarea está terminada cuando** pasan `npm run lint`, `npm run build` y `npm run test:e2e`; no hay scroll horizontal ni errores de runtime en 360, 768, 1024 y 1440 px; respeta `prefers-reduced-motion`; y se comparó con v6 en el navegador.

### Skills recomendadas (skills.sh)

```bash
npx skills add vercel-labs/agent-skills@vercel-react-best-practices
npx skills add vercel-labs/openreview@next-best-practices
npx skills add vercel-labs/agent-skills@web-design-guidelines
npx skills add wshobson/agents@tailwind-design-system
npx skills add currents-dev/playwright-best-practices-skill@playwright-best-practices
npx skills add maplibre/maplibre-agent-skills@maplibre-tile-sources
npx skills add addyosmani/web-quality-skills@accessibility
```

`frontend-design` (Anthropic) y `use-railway` ya están disponibles en Claude Code. Leer el `SKILL.md` de cada una antes de instalarla.
