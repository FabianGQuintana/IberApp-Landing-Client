import { expect, test } from "@playwright/test";

// Guide §9: the landing works from 360 px to 1440 px with no horizontal scroll and no runtime errors.
// New sections add their anchors here as they are built (phases 1–5).
const WIDTHS = [360, 768, 1024, 1440] as const;

for (const width of WIDTHS) {
  test(`landing renders at ${width}px without errors or horizontal scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
    await page.goto("/");
    await page.waitForTimeout(600); // map tiles keep the network busy: do not wait for networkidle
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `tests/.screens/${width}-landing.png` });
  });
}

test("saved light theme is applied before hydration", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ibera-theme", "light"));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
