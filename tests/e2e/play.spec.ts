import { expect, test, type Page } from "@playwright/test";

// Phase 4: "Aprender jugando" (#jugar). The minigames' own behavior is covered by the conformance suite of the separate
// project (iberapp-games); here, only how the section lives inside the landing.

const play = (page: Page) => page.locator("#jugar");
const stage = (page: Page) => play(page).getByTestId("game-stage");

async function toPlay(page: Page) {
  await page.goto("/");
  await play(page).scrollIntoViewIfNeeded();
}

test.describe("desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the section lists the four topics, two playable and two coming soon", async ({ page }) => {
    await toPlay(page);
    await expect(play(page).locator("[data-game-card]")).toHaveCount(4);
    await expect(play(page).locator("[data-game-card]")).toContainText(["Canales limpios", "Señales del agua", "Cielo oscuro", "Voces de la noche"]);
    await expect(stage(page)).toHaveAttribute("data-game", "clean-channels");
    await expect(stage(page).getByRole("button", { name: "Empezar", exact: true })).toBeVisible();
  });

  for (const [id, title] of [
    ["dark-sky", "Cielo oscuro"],
    ["night-voices", "Voces de la noche"],
  ] as const) {
    test(`${title} shows "Próximamente" without a canvas`, async ({ page }) => {
      await toPlay(page);
      await play(page).locator(`[data-game-card="${id}"]`).click();
      await expect(stage(page)).toHaveAttribute("data-state", "coming-soon");
      await expect(stage(page)).toContainText("Próximamente");
      await expect(play(page).locator("canvas")).toHaveCount(0);
    });
  }

  test('"Empezar" in Canales limpios mounts one canvas', async ({ page }) => {
    await toPlay(page);
    await stage(page).getByRole("button", { name: "Empezar", exact: true }).click();
    await expect(stage(page)).toHaveAttribute("data-state", "playing", { timeout: 30_000 });
    await expect(play(page).locator("canvas")).toHaveCount(1);
  });

  test('"Aprendelo jugando" from the sheet opens that game with the sheet\'s portal', async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Ver portal San Nicolás" }).click();
    await page.locator("#ficha").getByRole("button", { name: /Aprendelo jugando: Señales del agua/ }).click();
    await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById("jugar")!.getBoundingClientRect().top))).toBeLessThan(5);
    await expect(stage(page)).toHaveAttribute("data-game", "water-signs");
    await expect(stage(page)).toContainText("San Nicolás");
  });
});

for (const width of [360, 768, 1024, 1440]) {
  test(`no horizontal scroll around the games at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await toPlay(page);
    await expect(stage(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
}
