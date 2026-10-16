import { writeFileSync, readFileSync } from "node:fs";
import { SPOTS, W, H } from "./spots.mjs";

// ---- hotspots.ts ----
const rows = SPOTS.map(s =>
  `  { id: "${s.id}",${" ".repeat(18-s.id.length)}kind: "${s.kind}",${s.kind==="signal"?"     ":" "}x: ${String(s.x).padStart(3)}, y: ${String(s.y).padStart(3)}, r: ${s.r} },`
).join("\n");
writeFileSync("out/hotspots.ts",
`// Generado por scripts/build-water-signs.mjs — no editar a mano.
// La escena (scene.webp) se dibuja a partir de estas mismas coordenadas,
// asi que no hace falta medir nada sobre la imagen.

export const SCENE_WIDTH = ${W};
export const SCENE_HEIGHT = ${H};

export type HotspotKind = "signal" | "distractor";

export interface Hotspot {
  id: string;
  kind: HotspotKind;
  x: number;
  y: number;
  r: number;
}

export const HOTSPOTS: readonly Hotspot[] = [
${rows}
] as const;
`);

// ---- preview ----
const b64 = f => "data:image/webp;base64," + readFileSync(`webp/${f}.webp`).toString("base64");
const circles = SPOTS.map(s =>
  `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" fill="none" stroke="${s.kind==="signal"?"#00D58A":"#90B4E1"}" stroke-width="4" stroke-dasharray="10 8"/>
   <text x="${s.x}" y="${s.y+s.r+22}" text-anchor="middle" font-family="Barlow,sans-serif" font-size="19" font-weight="600" fill="${s.kind==="signal"?"#00D58A":"#90B4E1"}" stroke="#000" stroke-width="4" paint-order="stroke">${s.id}</text>`
).join("\n");

writeFileSync("/mnt/user-data/outputs/preview-water-signs.html",
`<!doctype html><html lang=es><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Escena water-signs</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@800&family=Barlow:wght@400;600&display=swap" rel=stylesheet>
<style>
:root{--bg:#0b100e;--bg2:#101813;--fg:#eef2ee;--head:#fff;--mute:#8fa89a;--rule:rgba(255,255,255,.14)}
:root[data-theme=light]{--bg:#f2f5f3;--bg2:#fff;--fg:#111514;--head:#003e25;--mute:#5e6663;--rule:#c9d2cd}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:Barlow,sans-serif;padding:34px 16px 80px}
.w{max-width:860px;margin:0 auto}
h1{font-family:"Barlow Semi Condensed",sans-serif;font-weight:800;color:var(--head);font-size:clamp(26px,6vw,40px);margin:0 0 4px;line-height:1.05}
p.s{color:var(--mute);margin:0 0 18px}
.ctl{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px}
button{font-family:inherit;font-weight:600;font-size:14px;background:transparent;color:var(--fg);border:2px solid var(--rule);border-radius:10px;padding:8px 14px;cursor:pointer}
button[aria-pressed=true]{border-color:#00d58a;color:#00d58a}
.stage{position:relative;max-width:420px;margin:0 auto;border:2px solid var(--rule);border-radius:12px;overflow:hidden;background:var(--bg2)}
.stage img{display:block;width:100%}
#ov{position:absolute;inset:0;width:100%;height:100%}
#ov.off{display:none}
.mk{display:flex;gap:26px;justify-content:center;align-items:center;margin-top:26px}
.mk figure{margin:0;text-align:center}.mk figcaption{font-size:12px;color:var(--mute);margin-top:6px}
.note{color:var(--mute);font-size:13px;line-height:1.55;margin-top:16px}
h2{font-family:"Barlow Semi Condensed",sans-serif;font-weight:800;color:var(--head);font-size:18px;margin:30px 0 10px}
</style></head><body><div class=w>
<h1>Escena de water-signs</h1>
<p class=s>720 × 900. Las zonas se dibujaron antes que la escena, así que calzan por construcción.</p>
<div class=ctl>
<button id=z aria-pressed="true">Mostrar zonas</button>
<button id=t>Cambiar tema</button>
</div>
<div class=stage>
<img src="${b64("scene")}" alt="">
<svg id=ov viewBox="0 0 ${W} ${H}">${circles}</svg>
</div>
<p class=note>Verde: las 8 señales. Celeste: los 7 distractores. Apagá las zonas para verla como la ve el jugador.</p>
<h2>Marcadores</h2>
<div class=mk>
<figure><img src="${b64("marker-signal")}" width=96 height=96><figcaption>Señal encontrada</figcaption></figure>
<figure><img src="${b64("marker-distractor")}" width=96 height=96><figcaption>Falsa alarma</figcaption></figure>
</div>
</div><script>
const r=document.documentElement,ov=document.getElementById("ov");
z.onclick=()=>{const on=ov.classList.toggle("off");z.ariaPressed=String(!on);z.textContent=on?"Mostrar zonas":"Ocultar zonas"};
t.onclick=()=>r.setAttribute("data-theme",r.getAttribute("data-theme")==="light"?"dark":"light");
</script></body></html>`);
console.log("hotspots.ts + preview ok");
