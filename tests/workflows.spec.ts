import { test, expect } from "@playwright/test";
test("logs a real workout, restores interruption, reuses routines and displays progress", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start a workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await page.getByRole("button", { name: "Bench press", exact: true }).click();
  await page
    .getByRole("spinbutton", { name: "Bench press set 1 weight" })
    .fill("40");
  await page.reload();
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Train", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Bench press set 1 weight" }),
  ).toHaveValue("40");
  await page
    .getByRole("button", { name: "Complete Bench press set 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save as routine", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Routine name" }).fill("Push day");
  await page.getByRole("checkbox", { name: "Push", exact: true }).check();
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("400 kg volume");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Progress", exact: true })
    .click();
  await page.getByText("View recorded data").click();
  await expect(page.getByText("400", { exact: true })).toBeVisible();
  await page.reload();
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Train", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start routine", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Complete Bench press set 1",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("spinbutton", { name: "Bench press set 1 weight" }),
  ).toHaveValue("40");
});
test("saves real food and theme, previews social without fake users, fits iPhone", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await nav.getByRole("button", { name: "Nutrition", exact: true }).click();
  await page.getByRole("button", { name: "Log food", exact: true }).click();
  for (const [label, value] of [
    ["Food or meal name", "Tofu bowl"],
    ["Calories (kcal)", "450"],
    ["Protein (g)", "24"],
    ["Carbohydrates (g)", "50"],
    ["Fat (g)", "17"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Save food", exact: true }).click();
  await page.reload();
  await nav.getByRole("button", { name: "Nutrition", exact: true }).click();
  await expect(page.getByText("Tofu bowl", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Profile and settings" }).click();
  await page.getByLabel("Appearance").selectOption("Midnight");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "Midnight");
  await nav.getByRole("button", { name: "Social", exact: true }).click();
  await expect(page.getByText("PREVIEW · NOT YET AVAILABLE")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "/tmp/lex-active-mobile.png", fullPage: true });
});
test("handles no records and storage failures honestly", async ({ page }) => {
  await page.goto("/");
  await page.screenshot({ path: "/tmp/lex-active-home.png", fullPage: true });
  await page
    .getByRole("button", { name: "Start a workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Complete at least one set",
  );
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Full", "QuotaExceededError");
    };
  });
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Must not silently save");
  await expect(page.getByRole("alert")).toContainText("Could not save");
  await page.reload();
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Train", exact: true })
    .click();
  await expect(page.getByLabel("Workout name", { exact: true })).toHaveValue(
    "My workout",
  );
});
test("production app shell and saved workout survive offline reload", async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.TEST_PRODUCTION,
    "Service worker is enabled only in production builds",
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start a workout", exact: true })
    .click();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Train", exact: true })
    .click();
  await expect(page.getByLabel("Workout name", { exact: true })).toHaveValue(
    "My workout",
  );
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await page.getByRole("button", { name: "Bench press", exact: true }).click();
  await page
    .getByRole("button", { name: "Complete Bench press set 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("1 sets");
});
