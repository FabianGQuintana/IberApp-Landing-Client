import { expect, test, type Page } from "@playwright/test";

// "Valorar": tourist rating modal opened from the header, the mobile menu or a portal sheet.

const openFromHeader = async (page: Page) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Principal" }).getByRole("button", { name: "Valorar" }).click();
  const dialog = page.getByRole("dialog", { name: "Valorá tu visita" });
  await expect(dialog).toBeVisible();
  return dialog;
};

const fillRequired = async (page: Page) => {
  await page.getByLabel("Portal visitado").selectOption("sanantonio");
  await page.getByRole("radio", { name: /4 estrellas/ }).click();
  await page.getByLabel("Tu mensaje").fill("Muy lindo lugar, pero faltan cestos de basura en el sendero.");
};

test.describe("desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("shows an error for each missing required field", async ({ page }) => {
    const dialog = await openFromHeader(page);
    await dialog.getByRole("button", { name: "Enviar valoración" }).click();
    await expect(dialog.getByText("Elegí el portal que visitaste.")).toBeVisible();
    await expect(dialog.getByText("Elegí de 1 a 5 estrellas.")).toBeVisible();
    await expect(dialog.getByText(/Contanos un poco más/)).toBeVisible();
  });

  test("rejects an invalid email and accepts it once fixed", async ({ page }) => {
    const dialog = await openFromHeader(page);
    await fillRequired(page);
    await page.getByLabel("Email").fill("no-es-un-mail");
    await dialog.getByRole("button", { name: "Enviar valoración" }).click();
    await expect(dialog.getByText("Revisá el email.")).toBeVisible();
    await page.getByLabel("Email").fill("turista@correo.com");
    await dialog.getByRole("button", { name: "Enviar valoración" }).click();
    await expect(page.getByRole("heading", { name: "¡Gracias por contarnos!" })).toBeVisible();
  });

  test("sends a complaint and shows the reference code", async ({ page }) => {
    const dialog = await openFromHeader(page);
    await fillRequired(page);
    await dialog.getByRole("radio", { name: "Queja" }).click();
    await dialog.getByRole("button", { name: "Enviar valoración" }).click();
    await expect(page.getByRole("heading", { name: "¡Gracias por contarnos!" })).toBeVisible();
    await expect(page.getByText(/se deriva al equipo del portal/)).toBeVisible();
    await expect(page.getByText(/IB-V\d{4}/)).toBeVisible();
  });

  test("compresses the photo before sending", async ({ page }) => {
    await openFromHeader(page);
    // 2000×1500 PNG generated in the page, bigger than the 1600 px upload size.
    const png = await page.evaluate(async () => {
      const c = document.createElement("canvas");
      c.width = 2000;
      c.height = 1500;
      const ctx = c.getContext("2d")!;
      for (let i = 0; i < 400; i++) {
        ctx.fillStyle = `hsl(${i * 7},60%,50%)`;
        ctx.fillRect(Math.random() * 2000, Math.random() * 1500, 120, 120);
      }
      return c.toDataURL("image/png").split(",")[1];
    });
    await page.locator("#fb-photo").setInputFiles({ name: "visita.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
    await expect(page.getByText(/Optimizada: \d+ KB/)).toBeVisible();
    await expect(page.getByAltText("Vista previa de la foto")).toBeVisible();
  });

  test("closes with Escape", async ({ page }) => {
    const dialog = await openFromHeader(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("saves the rating without signal and sends it when the connection returns", async ({ page, context }) => {
    const dialog = await openFromHeader(page);
    await fillRequired(page);
    await context.setOffline(true);
    await dialog.getByRole("button", { name: "Enviar valoración" }).click();
    await expect(page.getByRole("heading", { name: "Quedó guardada" })).toBeVisible();
    await page.getByRole("button", { name: "Volver a la página" }).click();
    await expect(page.getByRole("status").filter({ hasText: "1 valoración guardada" })).toBeVisible();
    await context.setOffline(false);
    await expect(page.getByRole("status").filter({ hasText: "enviamos tu valoración guardada" })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("ibera:feedback-queue"))).toBe("[]");
  });
});

test.describe("mobile 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("opens from the mobile menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menú" }).click();
    await page.getByRole("dialog", { name: "Menú" }).getByRole("button", { name: "Valorar" }).click();
    await expect(page.getByRole("dialog", { name: "Valorá tu visita" })).toBeVisible();
  });
});
