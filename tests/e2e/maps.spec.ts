import { expect, test, type Page } from "@playwright/test";

// Phase 3: territory map and portal sheet map (Ibera Landing v6).
// Tiles come from the network (Esri / MapTiler); these tests check behaviour, not imagery.

const goToTerritory = async (page: Page, { waitForPins = true } = {}) => {
  await page.goto("/");
  await page.evaluate(() => document.getElementById("territorio")!.scrollIntoView({ behavior: "instant" }));
  if (!waitForPins) return;
  // Desktop territory is a 300vh scroll stage: let the pins finish their entrance so clicks do not trigger auto-scroll retries.
  await page.waitForFunction(() => {
    const pins = document.querySelectorAll<HTMLElement>("#territorio button[aria-pressed][aria-label]");
    return pins.length > 0 && Array.from(pins).every((p) => getComputedStyle(p).opacity === "1");
  }, undefined, { timeout: 25_000 }).catch(() => undefined);
};

const territoryCardName = (page: Page) => page.locator("#territorio [aria-hidden='false'] .title-display").first();

test.describe("desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("map loads, pins appear and picking a pin updates the card", async ({ page }) => {
    await goToTerritory(page);
    const pin = page.getByRole("button", { name: "Portal Carambola, Concepción del Yaguareté Corá" });
    await expect(pin).toHaveCSS("opacity", "1", { timeout: 20_000 });
    await pin.dispatchEvent("click"); // no real mouse: the camera flies pins under a still cursor and Playwright would retry with scrolls
    await expect(pin).toHaveAttribute("aria-pressed", "true");
    await expect(territoryCardName(page)).toHaveText("Carambola");
    await expect(page.locator("#territorio")).toContainText("28,428° S · 57,819° O");
  });

  test("national park is shown as a reference area", async ({ page }) => {
    await goToTerritory(page);
    await page.getByRole("button", { name: /Parque Nacional Mburucuyá/ }).dispatchEvent("click");
    await expect(page.locator("#territorio")).toContainText("Referencia del área protegida, no es un acceso exacto");
  });

  test("zoom controls change the scale bar", async ({ page }) => {
    await goToTerritory(page);
    const zoomIn = page.getByRole("button", { name: "Acercar" });
    await expect(zoomIn).toHaveCSS("opacity", "1", { timeout: 20_000 });
    const before = await page.locator("[data-scaletxt]").textContent();
    await zoomIn.click();
    await zoomIn.click();
    await expect.poll(() => page.locator("[data-scaletxt]").textContent()).not.toBe(before);
    await page.getByRole("button", { name: "Ver todo Iberá" }).click();
  });

  test("Explorar opens the portal sheet", async ({ page }) => {
    await goToTerritory(page);
    await page.getByRole("button", { name: "Portal Uguay, Paraje Uguay" }).dispatchEvent("click");
    await page.locator("#territorio [aria-hidden='false']").getByRole("button", { name: /Explorar/ }).click();
    await expect(page.locator("#ficha h3").first()).toHaveText("Uguay");
  });

  test("tile failures show the honest retry panel", async ({ page }) => {
    await page.route(/arcgisonline\.com|maptiler\.com/, (route) => route.abort());
    await goToTerritory(page, { waitForPins: false });
    const alert = page.locator("#territorio").getByRole("alert");
    await expect(alert).toContainText("No pudimos cargar el mapa interactivo.", { timeout: 25_000 });
    await expect(alert.getByRole("button", { name: "Reintentar" })).toBeVisible();
    await expect(alert.getByRole("button", { name: "Ver portales" })).toBeVisible();
  });

  test("portal sheet map loads and follows the selected portal", async ({ page }) => {
    await page.goto("/");
    await page.locator("#ficha").getByRole("button", { name: "Galarza", exact: true }).click();
    // The small map is lazy: it is created only when it gets near the viewport.
    const map = page.locator(`[aria-label="Ubicación de Portal Galarza"]`); // decorative (aria-hidden), as in v6
    await map.scrollIntoViewIfNeeded();
    await expect(page.locator("#ficha")).toContainText("Portal Galarza");
    await expect(page.locator("#ficha").getByText("Cargando mapa…")).toBeHidden({ timeout: 20_000 });
    await expect(map.locator("canvas")).toBeVisible();
  });
});

test.describe("phone 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("portal strip picks a portal", async ({ page }) => {
    await goToTerritory(page);
    const strip = page.getByRole("group", { name: "Elegí un portal" }).first();
    await strip.getByRole("button", { name: "Galarza" }).click();
    await expect(strip.getByRole("button", { name: "Galarza" })).toHaveAttribute("aria-pressed", "true");
    await expect(territoryCardName(page)).toHaveText("Galarza");
  });
});
