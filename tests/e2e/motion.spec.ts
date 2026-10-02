import { expect, test, type Page } from "@playwright/test";

// Phase 5: scroll choreography (Ibera Landing v6 update()).

const scrollTo = (page: Page, y: number) => page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
const sectionTop = (page: Page, id: string) => page.evaluate((i) => document.getElementById(i)!.getBoundingClientRect().top + window.scrollY, id);
const settle = (page: Page) => page.waitForTimeout(250);

test.describe("desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("hero parallax: photo settles, text rises and fades", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const txt = page.locator("[data-hero-txt]");
    await expect(txt).toHaveCSS("opacity", "1");
    await scrollTo(page, 450);
    await settle(page);
    const opacity = Number(await txt.evaluate((el) => getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.2);
    expect(opacity).toBeLessThan(0.8);
    expect(await txt.evaluate((el) => (el as HTMLElement).style.transform)).toContain("translate3d(0px, -35");
    await scrollTo(page, 900);
    await settle(page);
    await expect(txt).toHaveCSS("opacity", "0");
  });

  test("pause: clip-path opens as the block enters", async ({ page }) => {
    await page.goto("/");
    const block = page.locator("[data-reveal]").first();
    const top = await block.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await scrollTo(page, top - 800);
    await settle(page);
    const early = await block.evaluate((el) => (el as HTMLElement).style.clipPath);
    expect(early).toMatch(/inset\((?!0%)/);
    await scrollTo(page, top - 40);
    await settle(page);
    expect(await block.evaluate((el) => (el as HTMLElement).style.clipPath)).toMatch(/inset\(0\.?0*%/);
  });

  test("closing photo heals from grayscale to color", async ({ page }) => {
    await page.goto("/");
    const top = await sectionTop(page, "futuro");
    const filter = () => page.locator("[data-heal]").evaluate((el) => (el as HTMLElement).style.filter);
    await scrollTo(page, top - 880);
    await expect.poll(filter).toMatch(/grayscale\(0\.[5-9]/);
    await scrollTo(page, top + 300); // pinned: fully healed
    await expect.poll(filter).toMatch(/grayscale\(0(\.0+)?\)/);
  });

  test("closing stage fades into the footer's night", async ({ page }) => {
    await page.goto("/");
    const top = await sectionTop(page, "futuro");
    const height = await page.locator("#futuro").evaluate((el) => el.getBoundingClientRect().height);
    const outro = () => page.locator("[data-outro]").evaluate((el) => Number((el as HTMLElement).style.opacity));
    await scrollTo(page, top + 300);
    await expect.poll(outro).toBe(0);
    await scrollTo(page, top + height - 900);
    await expect.poll(outro).toBeGreaterThan(0.95);
  });

  test("fragility: photo darkens with the scroll and ripples once", async ({ page }) => {
    await page.goto("/");
    const top = await sectionTop(page, "fragilidad");
    await scrollTo(page, top + 100);
    await page.waitForTimeout(150);
    expect(await page.locator("[data-dim]").evaluate((el) => (el as HTMLElement).style.filter)).toContain("ibera-ripple");
    await page.waitForTimeout(1000);
    expect(await page.locator("[data-dim]").evaluate((el) => (el as HTMLElement).style.filter)).not.toContain("ibera-ripple");
    await scrollTo(page, top + 900);
    await settle(page);
    const overlay = await page.locator("[data-dim] + div").evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(overlay).toBeGreaterThan(0.3);
  });

  test("territory is sticky and the scroll flies through the portals", async ({ page }) => {
    await page.goto("/");
    const top = await sectionTop(page, "territorio");
    const height = await page.locator("#territorio").evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeCloseTo(2700, -1); // 300vh at 900 px
    const card = page.locator("#territorio [aria-hidden='false'] .title-display").first();

    await scrollTo(page, top);
    await settle(page);
    await expect(card).toHaveText("Laguna Iberá");
    const stage = page.locator("#territorio [data-map-stage]");
    expect(Math.abs((await stage.boundingBox())!.y)).toBeLessThan(2);

    await scrollTo(page, top + 900); // mid-section: still pinned
    await settle(page);
    expect(Math.abs((await stage.boundingBox())!.y)).toBeLessThan(2);
    const mid = await card.textContent();
    expect(mid).not.toBe("Laguna Iberá");

    await scrollTo(page, top + 1700);
    await settle(page);
    await expect(card).not.toHaveText(mid!);
    const num = page.locator("#territorio [aria-hidden='false'] .eyebrow").last();
    await expect(num).toHaveText(/0[5-8] \/ 08/);
  });

  test("custom cursor follows cards in the rail and shows the label", async ({ page }) => {
    await page.goto("/");
    await page.locator("#portales").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById("portales")!.scrollIntoView({ behavior: "instant" }));
    const card = page.getByRole("button", { name: "Ver portal Laguna Iberá" });
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.move(box.x + 140, box.y + 120);
    const cursor = page.getByTestId("custom-cursor");
    await expect(cursor).toHaveCSS("opacity", "1");
    await expect(cursor).toContainText("Ver portal");
    await page.mouse.move(5, 5);
    await expect(cursor).toHaveCSS("opacity", "0");
  });

  test("rail cards parallax with the horizontal scroll", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => document.getElementById("portales")!.scrollIntoView({ behavior: "instant" }));
    await settle(page);
    const second = page.locator("[data-card]").nth(1).locator("[data-cimg]");
    const t0 = await second.evaluate((el) => (el as HTMLElement).style.transform);
    await page.getByRole("button", { name: "Portal siguiente" }).click();
    await page.waitForTimeout(900);
    const t1 = await second.evaluate((el) => (el as HTMLElement).style.transform);
    expect(t0).not.toBe(t1);
  });

  test("collage photos drift with the scroll", async ({ page }) => {
    await page.goto("/");
    const photo = page.locator("#ficha [data-par]").first();
    await photo.scrollIntoViewIfNeeded();
    await settle(page);
    const a = await photo.evaluate((el) => (el as HTMLElement).style.transform);
    await page.mouse.wheel(0, 300);
    await settle(page);
    const b = await photo.evaluate((el) => (el as HTMLElement).style.transform);
    expect(a).not.toBe(b);
  });
});

test.describe("mobile 390", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("territory stays a plain block and no horizontal scroll appears", async ({ page }) => {
    await page.goto("/");
    const h = await page.locator("#territorio").evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThan(1600);
    for (const id of ["territorio", "fragilidad", "futuro"]) {
      await page.evaluate((i) => document.getElementById(i)!.scrollIntoView({ behavior: "instant" }), id);
      await settle(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("effects fall back to their static end states", async ({ page }) => {
    await page.goto("/");
    const top = await page.locator("[data-reveal]").first().evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await scrollTo(page, top - 800);
    await settle(page);
    expect(await page.locator("[data-reveal]").first().evaluate((el) => (el as HTMLElement).style.clipPath)).toBe("none");
    expect(await page.locator("[data-heal]").evaluate((el) => (el as HTMLElement).style.filter)).toBe("none");
    expect(await page.locator("[data-hero-txt]").evaluate((el) => (el as HTMLElement).style.transform)).toBe("");
    await expect(page.locator("html")).not.toHaveAttribute("data-custom-cursor", "on");
  });
});
