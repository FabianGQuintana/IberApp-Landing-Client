import { writeFileSync, mkdirSync } from "node:fs";
import { SPOTS, W, H } from "./spots.mjs";

const C = { ink:"#0B100E", agua:"#1C5068", aguaOsc:"#123848", sky:"#90B4E1",
            cloud:"#EEF2EE", sage:"#8FA89A", mint:"#00D58A", leaf:"#00B96C",
            forest:"#002E1D", ocre:"#B45F04", naranja:"#F68E13", amarillo:"#FACD05",
            turq:"#008275", bordo:"#6F0603",
            paja:"#E3C27E", tierra:"#7A3F05", barro:"#5E3203",
            te:"#5A3A14", lila:"#8C7BD0", hueso:"#D7DED8", limo:"#A8701A",
            yacare:"#7FA04A", yacareOsc:"#4E6B2C" };
const S = `stroke="${C.ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const at = id => SPOTS.find(s => s.id === id);
const g = (id, body) => { const s = at(id); return `<g transform="translate(${s.x} ${s.y})" ${S}>${body}</g>`; };

/* ---------- fondo por franjas ---------- */
const fondo = `
<rect width="${W}" height="${H}" fill="${C.agua}"/>
<path d="M0 0 h${W} v150 c-90 18 -170 -10 -260 8 -95 19 -180 -6 -270 10 -70 12 -130 2 -190 -8 z" fill="${C.ocre}"/>
<path d="M0 158 c60 10 120 20 190 8 90 -16 175 9 270 -10 90 -18 170 10 260 -8" fill="none" stroke="${C.ink}" stroke-width="3"/>
<path d="M0 ${H} h${W} v-150 c-80 -14 -150 10 -240 -4 -100 -16 -190 12 -280 -4 -70 -12 -130 -4 -200 6 z" fill="${C.forest}"/>
<path d="M0 ${H-144} c70 -10 130 -18 200 -6 90 16 180 -12 280 4 90 14 160 -10 240 4" fill="none" stroke="${C.ink}" stroke-width="3"/>`;

/* ---------- corrientes de fondo ---------- */
let corr = "";
for (let i = 0; i < 7; i++) {
  const y = 215 + i * 78, x = i % 2 ? 420 : 150;
  corr += `<path d="M${x} ${y} h110" stroke="${C.sky}" stroke-width="6" stroke-linecap="round" opacity="0.14"/>`;
}

/* ---------- los 15 elementos ---------- */
const E = [];

// SEÑALES
E.push(g("buried-waste", `
  <path d="M-54 24 c4 -13 14 -21 26 -22 8 -11 24 -14 36 -7 9 -7 22 -5 28 4 4 6 6 12 8 18 z" fill="${C.tierra}"/>
  <path d="M-34 22 l5 -36 a8 8 0 0 1 16 0 l4 36 z" fill="${C.cloud}"/>
  <path d="M-20 -32 h10" stroke-width="4"/>
  <path d="M-8 22 c-4 -17 3 -31 14 -33 11 -2 20 9 16 19 l-3 14 z" fill="${C.sky}"/>
  <path d="M22 22 l-3 -25 a6 6 0 0 1 6 -6 h12 a6 6 0 0 1 6 6 l-4 25 z" fill="${C.naranja}"/>
  <path d="M-46 30 c18 -6 40 -7 58 -2" stroke-width="4" opacity="0.4" fill="none"/>`));

E.push(g("dead-vegetation", `
  <path d="M-38 34 C-43 -5 -48 -21 -48 -30" stroke="${C.paja}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M-48 -30 c-7 4 -13 10 -13 18" stroke="${C.paja}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M-22 34 C-19 -15 -16 -34 -16 -46" stroke="${C.paja}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M-16 -46 c6 4 13 10 13 18" stroke="${C.paja}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M-6 34 C-10 -1 -13 -15 -13 -24" stroke="${C.paja}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M-13 -24 c-7 4 -13 10 -13 18" stroke="${C.paja}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M10 34 C15 -11 20 -29 20 -40" stroke="${C.paja}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M20 -40 c6 4 13 10 13 18" stroke="${C.paja}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M28 34 C24 -4 20 -19 20 -28" stroke="${C.paja}" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M20 -28 c-7 4 -13 10 -13 18" stroke="${C.paja}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M-46 28 c16 -6 34 -5 48 1" stroke="${C.paja}" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M6 34 c14 -3 28 -1 40 4" stroke="${C.paja}" stroke-width="6" fill="none" stroke-linecap="round"/>
`));

E.push(g("algae-bloom", `
  <path d="M-46 4 c-6 -20 10 -34 28 -30 10 -14 32 -12 40 2 15 0 22 16 13 28 3 15 -12 26 -29 24 -12 8 -30 4 -36 -8 -11 0 -17 -7 -16 -16 z" fill="${C.mint}"/>
  <g fill="${C.leaf}" stroke="none">
    <circle cx="-14" cy="-6" r="9"/><circle cx="12" cy="4" r="7"/><circle cx="2" cy="-16" r="5"/>
  </g>
  <circle cx="-38" cy="-24" r="7" fill="${C.mint}"/>
  <circle cx="34" cy="26" r="6" fill="${C.mint}"/>`));

E.push(g("oil-sheen", `
  <g stroke="none">
    <path d="M-54 4 c-6 -22 16 -36 40 -33 16 -12 38 -7 46 8 9 17 -4 33 -26 38 -26 6 -56 2 -60 -13 z" fill="${C.turq}" opacity="0.92"/>
    <path d="M-38 4 c-4 -14 11 -24 28 -22 11 -8 26 -4 32 6 6 11 -3 22 -19 25 -18 4 -39 1 -41 -9 z" fill="${C.sky}" opacity="0.9"/>
    <path d="M-20 5 c-2 -8 8 -14 19 -13 7 -4 16 -2 19 5 4 7 -3 14 -12 16 -11 2 -25 0 -26 -8 z" fill="${C.amarillo}" opacity="0.85"/>
    <ellipse cx="0" cy="4" rx="9" ry="5" fill="${C.lila}" opacity="0.8"/>
  </g>`));

E.push(g("persistent-foam", `
  <path d="M-44 10 c-8 -10 -2 -24 11 -26 1 -13 16 -20 27 -13 9 -10 25 -6 29 7 13 1 19 14 12 24 -6 9 -20 13 -38 12 -21 -1 -36 2 -41 -4 z" fill="${C.cloud}"/>
  <g fill="none" stroke="${C.sage}" stroke-width="3" opacity="0.75">
    <circle cx="-18" cy="-4" r="8"/><circle cx="4" cy="-9" r="6"/><circle cx="18" cy="2" r="7"/><circle cx="-4" cy="6" r="5"/>
  </g>
  <circle cx="-40" cy="18" r="6" fill="${C.cloud}"/>
  <circle cx="32" cy="18" r="5" fill="${C.cloud}"/>`));

E.push(g("dead-fish", `
  <g transform="translate(-14 -14) rotate(12) scale(0.95)">
    <path d="M-18 0 c4 -13 16 -20 30 -20 11 0 20 6 24 14 2 4 2 8 0 12 -4 8 -13 14 -24 14 -14 0 -26 -7 -30 -20 z" fill="${C.hueso}"/>
    <path d="M-18 0 l-16 -14 c-2 -2 -4 -1 -4 2 l0 24 c0 3 2 4 4 2 z" fill="${C.hueso}"/>
    <path d="M4 -20 c7 -7 16 -8 22 -3" fill="${C.hueso}"/>
    <path d="M28 -7 l8 9 M36 -7 l-8 9" stroke-width="3.4"/>
    <path d="M-6 -5 c8 4 16 4 24 0" stroke-width="2.6" fill="none" opacity="0.35"/>
  </g>
  <g transform="translate(6 20) rotate(-14) scale(0.8)">
    <path d="M-18 0 c4 -13 16 -20 30 -20 11 0 20 6 24 14 2 4 2 8 0 12 -4 8 -13 14 -24 14 -14 0 -26 -7 -30 -20 z" fill="${C.hueso}"/>
    <path d="M-18 0 l-16 -14 c-2 -2 -4 -1 -4 2 l0 24 c0 3 2 4 4 2 z" fill="${C.hueso}"/>
    <path d="M4 -20 c7 -7 16 -8 22 -3" fill="${C.hueso}"/>
    <path d="M28 -7 l8 9 M36 -7 l-8 9" stroke-width="3.4"/>
    <path d="M-6 -5 c8 4 16 4 24 0" stroke-width="2.6" fill="none" opacity="0.35"/>
  </g>
`));

E.push(g("bottom-bubbling", `
  <path d="M-26 34 c16 -5 34 -4 50 2" stroke="${C.limo}" stroke-width="8" fill="none" opacity="0.85" stroke-linecap="round"/>
  <circle cx="-8" cy="26" r="4" fill="${C.cloud}"/>
  <circle cx="4" cy="14" r="6" fill="${C.cloud}"/>
  <circle cx="-12" cy="2" r="8" fill="${C.cloud}"/>
  <circle cx="8" cy="-12" r="10" fill="${C.cloud}"/>
  <circle cx="-6" cy="-28" r="7" fill="${C.cloud}"/>
  <circle cx="16" cy="-32" r="5" fill="${C.cloud}"/>`));

E.push(g("murky-patch", `
  <g stroke="none">
    <path d="M-50 8 c-5 -26 19 -40 44 -34 16 -10 38 -2 41 15 3 19 -15 34 -41 35 -25 1 -42 -5 -44 -16 z" fill="${C.limo}" opacity="0.95"/>
    <path d="M-32 2 c-3 -14 13 -22 29 -18 10 -5 22 0 24 10 2 11 -10 19 -27 19 -14 0 -24 -4 -26 -11 z" fill="${C.tierra}" opacity="0.75"/>
    <circle cx="-42" cy="26" r="9" fill="${C.limo}" opacity="0.6"/>
    <circle cx="34" cy="-22" r="7" fill="${C.limo}" opacity="0.6"/>
    <circle cx="20" cy="30" r="6" fill="${C.limo}" opacity="0.5"/>
  </g>`));

E.push(g("stirred-mud", `
  <path d="M-46 4 c-5 -19 11 -30 30 -27 11 -10 30 -7 37 5 11 2 16 14 10 23 -6 10 -23 16 -42 15 -19 -1 -32 -6 -35 -16 z" fill="${C.barro}"/>
  <g fill="${C.paja}" stroke="none" opacity="0.65">
    <ellipse cx="-18" cy="0" rx="8" ry="6.5"/><ellipse cx="-24" cy="-12" rx="4" ry="3.4"/><ellipse cx="-13" cy="-13" rx="4" ry="3.4"/>
    <ellipse cx="12" cy="8" rx="8" ry="6.5"/><ellipse cx="6" cy="-4" rx="4" ry="3.4"/><ellipse cx="17" cy="-5" rx="4" ry="3.4"/>
  </g>`));

E.push(g("capybara", `
  <g transform="translate(-4 4)">
    <path d="M-44 2
             C-44 -14 -36 -24 -20 -27
             C-6 -30 8 -30 18 -28
             C24 -32 34 -32 41 -27
             C47 -23 49 -16 48 -9
             L48 -3
             C48 3 44 7 38 8
             C30 9 24 8 20 6
             C16 12 8 16 -2 17
             L-30 17
             C-39 17 -44 12 -44 2 Z" fill="${C.naranja}"/>
    <circle cx="20" cy="-33" r="7" fill="${C.naranja}"/>
    <circle cx="32" cy="-19" r="3.6" fill="${C.ink}" stroke="none"/>
    <ellipse cx="44" cy="-9" rx="3.4" ry="2.6" fill="${C.ink}" stroke="none"/>
    <path d="M34 -1 c4 2 8 2 11 0" fill="none" stroke-width="2.4" opacity="0.45"/>
    <path d="M-32 15 v13 M-12 16 v12 M6 15 v13" stroke-width="6"/>
  </g>`));

E.push(g("camalote", `
  <ellipse cx="-22" cy="12" rx="19" ry="15" fill="${C.leaf}"/>
  <ellipse cx="20" cy="14" rx="17" ry="13" fill="${C.leaf}"/>
  <ellipse cx="-4" cy="20" rx="20" ry="14" fill="${C.mint}"/>
  <ellipse cx="-26" cy="-6" rx="15" ry="12" fill="${C.mint}"/>
  <ellipse cx="14" cy="-6" rx="16" ry="12" fill="${C.leaf}"/>
  <path d="M-2 -8 v-14" stroke-width="5"/>
  <path d="M-2 -40 c8 0 13 5 13 11 0 7 -6 12 -13 12 -8 0 -13 -5 -13 -12 0 -6 5 -11 13 -11 z" fill="${C.lila}"/>
  <circle cx="-2" cy="-29" r="3.4" fill="${C.amarillo}" stroke="none"/>`));

E.push(g("tannin-water", `
  <g stroke="none">
    <path d="M-58 2 c-5 -26 19 -42 46 -38 17 -11 42 -5 50 12 10 19 -5 39 -30 45 -29 7 -62 1 -66 -19 z" fill="${C.te}"/>
    <path d="M-44 -4 c-3 -16 14 -26 32 -23 11 -7 27 -3 32 8 6 12 -4 24 -21 28 -19 4 -41 0 -43 -13 z" fill="#45290C"/>
    <path d="M-36 -14 c14 -8 32 -9 46 -2" stroke="${C.paja}" stroke-width="5" fill="none" opacity="0.35"/>
    <path d="M-30 16 c16 -7 34 -6 48 2" stroke="${C.paja}" stroke-width="4" fill="none" opacity="0.22"/>
  </g>`));

E.push(g("irupe", `
  <circle cx="0" cy="0" r="42" fill="${C.leaf}"/>
  <circle cx="0" cy="0" r="42" fill="none" stroke="${C.mint}" stroke-width="9"/>
  <circle cx="0" cy="0" r="42" fill="none" stroke="${C.ink}" stroke-width="3"/>
  <circle cx="0" cy="0" r="33" fill="${C.leaf}" stroke="${C.ink}" stroke-width="2.4"/>
  <g stroke="${C.mint}" stroke-width="2.6" opacity="0.75">
    <path d="M0 -33 V33 M-33 0 H33 M-23 -23 L23 23 M23 -23 L-23 23"/>
  </g>
  <circle cx="0" cy="0" r="5" fill="${C.mint}" stroke="none"/>`));

E.push(g("sunken-log", `
  <g transform="rotate(-16)">
    <path d="M-46 -13 h80 a13 13 0 0 1 0 26 h-80 a13 13 0 0 1 0 -26 z" fill="#35563A"/>
    <ellipse cx="-46" cy="0" rx="9" ry="13" fill="#446A45"/>
    <path d="M-20 -6 h44 M-14 7 h36" stroke="#223A26" stroke-width="3" opacity="0.8"/>
    <path d="M30 -10 l14 -8" stroke-width="5"/>
  </g>
  <path d="M-40 -26 c20 -6 44 -4 62 4" stroke="${C.sky}" stroke-width="4" fill="none" opacity="0.3"/>`));

E.push(g("caiman", `
  <path d="M-10 -15 C-30 -15 -50 -11 -64 -4 C-66 -2 -66 2 -64 4 C-50 11 -30 15 -10 15 Z" fill="${C.yacare}"/>
  <path d="M-10 -16 L-22 -32 L-12 -34 L-1 -18 Z" fill="${C.yacare}"/>
  <path d="M-10 16 L-22 32 L-12 34 L-1 18 Z" fill="${C.yacare}"/>
  <path d="M20 -16 L30 -32 L39 -28 L29 -13 Z" fill="${C.yacare}"/>
  <path d="M20 16 L30 32 L39 28 L29 13 Z" fill="${C.yacare}"/>
  <ellipse cx="6" cy="0" rx="26" ry="18" fill="${C.yacare}"/>
  <path d="M26 -13 C36 -15 46 -14 54 -9 C60 -5 60 5 54 9 C46 14 36 15 26 13 Z" fill="${C.yacare}"/>
  <g stroke="${C.yacareOsc}" stroke-width="4" stroke-linecap="round">
    <path d="M-16 -8 l-8 -2 M-30 -6 l-8 -1 M-44 -4 l-7 0"/>
    <path d="M-16 8 l-8 2 M-30 6 l-8 1 M-44 4 l-7 0"/>
    <path d="M0 -10 h10 M0 0 h10 M0 10 h10"/>
  </g>
  <circle cx="42" cy="-7" r="4.6" fill="${C.amarillo}"/>
  <circle cx="42" cy="7" r="4.6" fill="${C.amarillo}"/>
  <circle cx="43" cy="-7" r="2" fill="${C.ink}" stroke="none"/>
  <circle cx="43" cy="7" r="2" fill="${C.ink}" stroke="none"/>
  <path d="M56 -4 h3 M56 4 h3" stroke-width="3"/>`));

mkdirSync("out", { recursive: true });
writeFileSync("out/scene.svg",
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${fondo}
${corr}
${E.join("\n")}
</svg>
`);
console.log("scene.svg  " + W + "x" + H);
