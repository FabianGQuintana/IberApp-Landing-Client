# IberAPP

Landing narrativa del Gran Parque Iberá (Corrientes, Argentina): portales, ecosistema, estado de los caminos, minijuegos educativos y reporte ambiental. Next.js 16 (App Router), React 19, Tailwind 4 y TypeScript.

## Documentación

La guía de implementación es la fuente de verdad: [`docs/GUIA_IMPLEMENTACION.md`](docs/GUIA_IMPLEMENTACION.md). Empezá por ahí.

## Estado

| Fase | Contenido | Estado |
| --- | --- | --- |
| 0–3 | Base, cáscara, secciones de contenido, mapas | ✅ |
| 4 | Asistente de reporte y minijuegos | ⏳ pendiente |
| 5 | Coreografía de scroll | ✅ |
| 6 | Producción (base de datos, uso sin conexión, deploy) | ⏳ pendiente |

## ⚠️ Decisión pactada: los minijuegos no son los de la landing v6

La app replica la landing v6 (`docs/prototipo/`) **salvo en los minijuegos**. De la sección *Aprender jugando* se conserva la estructura (lugar en la página, índice de cuatro temas y vínculos con los portales y las amenazas), pero **las mecánicas de v6 son solo una referencia**: el equipo quiere hacer juegos **mejores**. Si vas a continuar el desarrollo, no los copies; leé la sección 10 de la guía para saber qué es contrato y qué queda libre.

## Desarrollo

```bash
npm run dev            # servidor de desarrollo (copia antes el worker de MapLibre)
npm run lint
npm run build
npm run test:e2e       # Playwright
npm run compare:v6     # capturas lado a lado contra el prototipo (ver guía, sección 14)
```

Este proyecto usa una versión de Next.js con cambios incompatibles: ante cualquier duda, leé `node_modules/next/dist/docs/` (ver `AGENTS.md`).
