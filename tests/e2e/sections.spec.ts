import { expect, test } from "@playwright/test";

// Phase 2: content sections behave as in Ibera Landing v6.

const sheetTitle = (page: import("@playwright/test").Page) => page.locator("#ficha h3").first();

test.describe("desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("all v6 sections are present in order", async ({ page }) => {
    await page.goto("/");
    const ids = await page.locator("main > section[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(["descubrir", "intro", "territorio", "caminos", "portales", "ficha", "ecosistema", "fragilidad", "jugar", "actuar", "futuro"]);
  });

  test("choosing a road opens that portal sheet", async ({ page }) => {
    await page.goto("/");
    await page.locator("#caminos").getByRole("button", { name: /Galarza/ }).click();
    await expect(sheetTitle(page)).toHaveText("Galarza");
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("ficha")!.getBoundingClientRect().top))).toBeLessThan(5);
    await expect(page.locator("#ficha")).toContainText("Con precaución");
  });

  test("rail card and chips switch the portal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ver portal Carambola" }).click();
    await expect(sheetTitle(page)).toHaveText("Carambola");
    await page.locator("#ficha").getByRole("button", { name: "Mburucuyá", exact: true }).click();
    await expect(sheetTitle(page)).toHaveText("Mburucuyá");
    await expect(page.locator("#ficha")).toContainText("Sendero Yatay");
  });

  test("gallery steps, opens the lightbox and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const sheet = page.locator("#ficha");
    await sheet.scrollIntoViewIfNeeded();
    await expect(sheet.getByText("01 / 04")).toBeVisible();
    await sheet.getByRole("button", { name: "Foto siguiente" }).click();
    await expect(sheet.getByText("02 / 04")).toBeVisible();
    await sheet.getByRole("button", { name: "Pantalla completa", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Galería en pantalla completa" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Cormoranes sobre los camalotes.");
    await page.keyboard.press("ArrowRight");
    await expect(dialog).toContainText("03 / 04");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("portal challenge links go to the games and report sections", async ({ page }) => {
    await page.goto("/");
    await page.locator("#ficha").getByRole("button", { name: /Aprendelo jugando: Canales limpios/ }).click();
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("jugar")!.getBoundingClientRect().top))).toBeLessThan(5);
  });

  test("lit text lights up while scrolling the intro", async ({ page }) => {
    await page.goto("/");
    const litWords = () =>
      page.locator("#intro [data-w]").evaluateAll((els) => els.filter((e) => (e as HTMLElement).style.opacity === "1").length);
    expect(await litWords()).toBe(0);
    await page.evaluate(() => {
      const el = document.getElementById("intro")!;
      window.scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.9, behavior: "instant" });
    });
    await expect.poll(litWords).toBeGreaterThan(20);
  });
});

test.describe("phone 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("ecosystem shows each species with its own photo", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator("#ecosistema [data-fauna]");
    await expect(cards).toHaveCount(4);
    for (const card of await cards.all()) await expect(card.locator("img")).toBeVisible();
  });
});
