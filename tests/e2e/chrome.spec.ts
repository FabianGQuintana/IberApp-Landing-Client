import { expect, test, type Page } from "@playwright/test";

// Phase 1: header, mobile menu, theme toggle and "Caminos hoy" band behave as in Ibera Landing v6.

const scrollToSection = (page: Page, id: string, offset = 40) =>
  page.evaluate(
    ([sectionId, extra]) => {
      const el = document.getElementById(sectionId as string)!;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (extra as number), behavior: "instant" });
    },
    [id, offset],
  );

test.describe("desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("header is transparent on top and turns into glass after scrolling", async ({ page }) => {
    await page.goto("/");
    // The site header (banner landmark): sections may have their own <header>, like #jugar and the game stage.
    const header = page.getByRole("banner");
    await expect(header).toHaveCSS("background-color", "rgba(11, 16, 14, 0)");
    await page.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
    await expect(header).not.toHaveCSS("background-color", "rgba(11, 16, 14, 0)");
    await expect(header).toHaveCSS("backdrop-filter", /blur/);
  });

  test("shows section links, marks the active one and hides the menu button", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav.getByRole("link", { name: "Ecosistema" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menú" })).toBeHidden();
    await scrollToSection(page, "ecosistema");
    await expect(nav.getByRole("link", { name: "Ecosistema" })).toHaveAttribute("aria-current", "true");
  });

  test("header text follows the section tone in light theme", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("ibera-theme", "light"));
    await page.goto("/");
    const logo = page.getByRole("link", { name: "Iberá, inicio" });
    await expect(logo).toHaveCSS("color", "rgb(255, 255, 255)"); // over the hero photo
    await scrollToSection(page, "caminos");
    await expect(logo).toHaveCSS("color", "rgb(0, 62, 37)"); // over a light surface: var(--head)
  });

  test("roads band is hidden on top and over Caminos, visible in between", async ({ page }) => {
    await page.goto("/");
    const band = page.getByRole("link", { name: /Caminos hoy: \d de 8 transitables/, includeHidden: true });
    await expect(band).toHaveCSS("opacity", "0");
    await scrollToSection(page, "portales", 200);
    await expect(band).toHaveCSS("opacity", "1");
    await scrollToSection(page, "caminos");
    await expect(band).toHaveCSS("opacity", "0");
  });
});

test.describe("phone 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("menu opens full screen, navigates and closes", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();
    await page.getByRole("button", { name: "Menú" }).click();
    const menu = page.getByRole("dialog", { name: "Menú", includeHidden: true });
    await expect(menu).toHaveCSS("opacity", "1");
    await menu.getByRole("link", { name: "Aprender" }).click();
    await expect(menu).toHaveCSS("opacity", "0");
    await expect(page).toHaveURL(/#jugar$/);
  });

  test("Escape closes the menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menú" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Menú", includeHidden: true })).toHaveCSS("opacity", "0");
  });
});

test("theme toggle switches and persists", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Cambiar a modo claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Cambiar a modo oscuro" })).toBeVisible();
});
