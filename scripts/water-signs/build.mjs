import sharp from "sharp"; import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
mkdirSync("webp", { recursive: true });
let tot = 0;
for (const [n,w,h] of [["scene",720,900],["marker-signal",96,96],["marker-distractor",96,96]]) {
  const buf = await sharp(readFileSync(`out/${n}.svg`), { density: 384 })
    .resize(w,h,{fit:"fill",background:{r:0,g:0,b:0,alpha:0}})
    .webp({quality:82,alphaQuality:100,effort:6}).toBuffer();
  writeFileSync(`webp/${n}.webp`, buf);
  const m = await sharp(buf).metadata();
  tot += buf.length;
  console.log(`  ok  ${n}.webp  ${m.width}x${m.height}  ${(buf.length/1024).toFixed(1)} KB`);
}
console.log(`\nTotal: ${(tot/1024).toFixed(1)} KB  (presupuesto 400 KB)`);
