// Side-by-side visual comparison with Ibera Landing v6.
// Usage: serve the prototype folder on :8765 (python -m http.server 8765) and run `npm run dev -- -p 3005`, then:
//   node tests/compare-v6.mjs <scenario...>
// Output: tests/.compare/<scenario>-<width>.png (left: v6, right: IberAPP).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const V6 = "http://localhost:8765/Ibera%20Landing%20v6.dc.html";
const APP = "http://localhost:3005/";
const OUT = "tests/.compare";
mkdirSync(OUT, { recursive: true });

const scroll = (id, offset = 40) => async (page) => {
  await page.evaluate(([i, o]) => {
    const el = document.getElementById(i);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + o, behavior: "instant" });
  }, [id, offset]);
};

// Scrolls to a fraction of a tall section (0 = its top, 1 = its end minus one viewport).
const scrollFrac = (id, frac) => async (page) => {
  await page.evaluate(([i, f]) => {
    const el = document.getElementById(i);
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    window.scrollTo({ top: top + (el.offsetHeight - innerHeight) * f, behavior: "instant" });
  }, [id, frac]);
};

const SCENARIOS = {
  // Phase 2 — content sections
  intro: { widths: [1440, 390], act: scrollFrac("intro", 0.5) },
  roads: { widths: [1440, 390], act: scroll("caminos", 0) },
  pause: { widths: [1440, 390], act: async (page) => { await scroll("portales", 0)(page); await page.evaluate(() => window.scrollBy(0, -innerHeight * 0.95)); } },
  portals: { widths: [1440, 390], act: scroll("portales", 0) },
  sheet: { widths: [1440, 390], act: scroll("ficha", 0) },
  "sheet-info": { widths: [1440, 390], act: scroll("ficha", 1150) },
  "sheet-aside": { widths: [1440], act: scroll("ficha", 1900) },
  ecosystem: { widths: [1440, 390], act: scroll("ecosistema", 0) },
  "ecosystem-2": { widths: [1440, 390], act: scroll("ecosistema", 1900) },
  "fragility-intro": { widths: [1440, 390], act: scrollFrac("fragilidad", 0.18) },
  "fragility-items": { widths: [1440, 390], act: scrollFrac("fragilidad", 0.62) },
  future: { widths: [1440, 390], act: scroll("futuro", 0) },

  top: { widths: [1440, 390], act: async () => {} },
  "header-surface": { widths: [1440, 390], act: scroll("caminos") },
  "band": { widths: [1440, 390], act: scroll("portales", 300) },
  "menu": {
    widths: [390],
    act: async (page) => {
      await page.getByRole("button", { name: "Menú" }).first().click();
      await page.waitForTimeout(1200);
    },
  },
  "light-surface": {
    widths: [1440],
    light: true,
    act: scroll("caminos"),
  },
  footer: { widths: [1440, 390], act: async (page) => page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })) },
};

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCENARIOS);
const browser = await chromium.launch();
for (const name of names) {
  const sc = SCENARIOS[name];
  for (const width of sc.widths) {
    const shots = [];
    for (const url of [V6, APP]) {
      const page = await browser.newPage({ viewport: { width, height: width < 700 ? 844 : 900 } });
      if (sc.light) await page.addInitScript(() => localStorage.setItem("ibera-theme", "light"));
      await page.goto(url);
      await page.waitForTimeout(url === V6 ? 3500 : 1500);
      await sc.act(page);
      await page.waitForTimeout(1600);
      shots.push(await page.screenshot());
      await page.close();
    }
    const [a, b] = await Promise.all(shots.map((s) => sharp(s).metadata()));
    await sharp({ create: { width: a.width + b.width + 16, height: Math.max(a.height, b.height), channels: 3, background: "#ff00aa" } })
      .composite([{ input: shots[0], left: 0, top: 0 }, { input: shots[1], left: a.width + 16, top: 0 }])
      .png()
      .toFile(`${OUT}/${name}-${width}.png`);
    console.log(`${OUT}/${name}-${width}.png`);
  }
}
await browser.close();
