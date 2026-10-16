import { writeFileSync } from "node:fs";
const ink="#0B100E", mint="#00D58A", sky="#90B4E1";
// Marca de señal: circulo menta con tilde. Marca de distractor: circulo celeste con guion.
const base = (fill, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
<circle cx="48" cy="48" r="36" fill="${fill}" stroke="${ink}" stroke-width="6"/>
${inner}
</svg>
`;
writeFileSync("out/marker-signal.svg", base(mint,
  `<path d="M32 50 l11 12 l21 -26" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`));
writeFileSync("out/marker-distractor.svg", base(sky,
  `<path d="M33 48 h30" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>`));
console.log("marcadores ok");
