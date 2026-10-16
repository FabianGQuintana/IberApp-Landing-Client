# IberAPP

Landing narrativa del Gran Parque Iberá (Corrientes, Argentina): portales, ecosistema, estado de los caminos, minijuegos educativos y valoración de la visita para turistas. Next.js 16 (App Router), React 19, Tailwind 4 y TypeScript.

## Documentación

La guía de implementación es la fuente de verdad: [`docs/GUIA_IMPLEMENTACION.md`](docs/GUIA_IMPLEMENTACION.md). Empezá por ahí.

## Estado

| Fase | Contenido | Estado |
| --- | --- | --- |
| 0–3 | Base, cáscara, secciones de contenido, mapas | ✅ |
| 4 | Valoración para turistas (modal "Valorar") | ✅ |
| 4 | Minijuegos (*Aprender jugando*): Canales limpios y Señales del agua | ✅ (Cielo oscuro y Voces de la noche: próximamente) |
| 5 | Coreografía de scroll | ✅ |
| 6 | Uso sin conexión (service worker) y deploy en Vercel | ✅ |
| 6 | Backend [IberaReclamos](https://github.com/FabianGQuintana/IBERA-Rangers-API) (recibe las valoraciones) | ✅ (falta publicarlo en Railway) |
| 6 | Estado real de los caminos | ⏳ pendiente |

## ⚠️ Decisión pactada: los minijuegos no son los de la landing v6

La app replica la landing v6 (`docs/prototipo/`) **salvo en los minijuegos**. De la sección *Aprender jugando* se conserva la estructura (lugar en la página, índice de cuatro temas y vínculos con los portales y las amenazas), pero **las mecánicas de v6 son solo una referencia**: el equipo quiere hacer juegos **mejores**. Si vas a continuar el desarrollo, no los copies; leé la sección 10 de la guía para saber qué es contrato y qué queda libre.

## Desarrollo

```bash
npm run dev            # servidor de desarrollo (antes copia el worker de MapLibre y genera el arte de los juegos)
npm run lint
npm run build
npm run test:e2e       # Playwright
npm run compare:v6     # capturas lado a lado contra el prototipo (ver guía, sección 14)
```

Este proyecto usa una versión de Next.js con cambios incompatibles: ante cualquier duda, leé `node_modules/next/dist/docs/` (ver `AGENTS.md`).

## Deploy en Vercel

1. En Vercel: **Add New → Project**, importar este repositorio. Framework: Next.js (se detecta solo). No hace falta cambiar comandos: `npm run build` ya copia el worker de MapLibre.
2. Variables de entorno (ver `.env.example`):
   - `NEXT_PUBLIC_API_URL`: URL del backend IberaReclamos. Vacía = modo demo (el formulario "Valorar" no envía nada).
   - `NEXT_PUBLIC_MAPTILER_KEY`: opcional, mapas de MapTiler en vez de Esri.
   - `NEXT_PUBLIC_SITE_URL`: opcional; si queda vacía se usa el dominio de producción de Vercel.
3. El backend tiene que permitir por CORS el dominio de Vercel (y `http://localhost:3000` para desarrollo).

## Uso sin señal

En producción, `public/sw.js` guarda la página, las fotos y los mapas ya vistos: después de una primera visita con señal, la landing abre sin conexión. Las valoraciones enviadas sin señal quedan en el teléfono y se envían solas al volver la conexión. Al cambiar la estrategia de caché, subir `VERSION` en `public/sw.js`.
