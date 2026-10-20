import { expect, test } from "@playwright/test";

test.use({
  geolocation: { latitude: -28.5367, longitude: -57.1772 },
  permissions: ["geolocation"],
});

test("demo circuit: ranger reports → sync → admin resolves it", async ({ page }) => {
  const note = `e2e-${Date.now()}`;

  // Ranger: login
  await page.goto("/rangers");
  await page.getByRole("button", { name: "Completar como guardaparque" }).click();
  await page.getByRole("button", { name: /Entrar/ }).click();

  // New report
  await page.getByRole("button", { name: /Nuevo reporte/ }).click();
  await page.getByRole("button", { name: /Usar foto de ejemplo/ }).click();
  await expect(page.getByText("Foto lista")).toBeVisible();
  await page.getByRole("radio").first().click();
  await page.getByLabel(/Notas/).fill(note);
  await page.getByRole("button", { name: /Guardar reporte/ }).click();
  await expect(page.getByText("¡Reporte guardado!")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /Volver al inicio/ }).click();

  // Sync
  await page.getByRole("button", { name: /^.*Sincronizar/ }).click();
  await page.getByRole("button", { name: /Enviar todo al servidor/ }).click();
  await expect(page.getByText(/¡1 reporte enviado!|reportes enviados!/)).toBeVisible({ timeout: 15_000 });

  // Admin: login
  await page.goto("/admin");
  await page.getByRole("button", { name: "Completar como administrador" }).click();
  await page.getByRole("button", { name: /Entrar/ }).click();
  await page.waitForURL(/\/admin\/reportes/);

  // The new report is first and Pending
  const rows = page.getByTestId("report-row");
  await expect(rows.first()).toBeVisible();
  await expect(rows.first()).toContainText(/Pendiente/);
  await expect(rows.first()).toContainText(/Juan Pérez|e2e-/);
  const id = await rows.first().getAttribute("data-report-id");

  await page.getByTestId("filter-status").selectOption("Pending");
  const row = page.locator(`[data-testid=report-row][data-report-id="${id}"]`);
  await expect(row).toBeVisible();

  // Detail → resolve
  await row.click();
  await expect(page.getByTestId("detail-status")).toContainText("Pendiente");
  await page.getByTestId("action-Done").click();
  await page.getByTestId("confirm-status").click();
  await expect(page.getByTestId("detail-status")).toContainText("Resuelto");

  // Back: gone under Pending, present under Done
  await page.getByTestId("back-to-list").click();
  await expect(page.getByTestId("filter-status")).toHaveValue("Pending");
  await expect(row).toHaveCount(0);
  await page.getByTestId("filter-status").selectOption("Done");
  await expect(row).toBeVisible();
  await expect(row).toContainText(/Resuelto/);
});
