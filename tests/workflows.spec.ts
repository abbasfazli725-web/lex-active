import { test, expect } from "@playwright/test";
test.use({ timezoneId: "Europe/London" });
test("logs a real workout, restores interruption, reuses routines and displays progress", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start a workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  await page.getByRole("button", { name: "Bench press", exact: true }).click();
  await page.getByRole("button", { name: /^Done adding/ }).click();
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
  await page.getByRole("button", { name: /^Done adding/ }).click();
  await page
    .getByRole("button", { name: "Complete Bench press set 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("1 sets");
});

test("quick exercise logging needs no workout, supports repeat sets and leaves every tab free", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Log an exercise", exact: true })
    .click();
  await page.getByRole("button", { name: "Bench press", exact: true }).click();
  await page
    .getByLabel("Bench press set 1 weight", { exact: true })
    .fill("42.5");
  await page.getByLabel("Bench press set 1 reps", { exact: true }).fill("8");
  await page
    .getByRole("button", { name: "Same again · add set", exact: true })
    .click();
  await expect(
    page.getByLabel("Bench press set 2 weight", { exact: true }),
  ).toHaveValue("42.5");
  await page
    .getByRole("button", { name: "Save exercise", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("lex-active:v1")!),
  );
  expect(stored.active).toBeNull();
  expect(stored.workouts[0].exercises[0].sets).toHaveLength(2);
  for (const tab of ["Nutrition", "Progress", "Social", "Train", "Home"])
    await page
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("button", { name: tab, exact: true })
      .click();
  await page.getByRole("button", { name: "Log again", exact: true }).click();
  await expect(
    page.getByLabel("Bench press set 1 weight", { exact: true }),
  ).toHaveValue("42.5");
  await page
    .getByRole("button", { name: "Save exercise", exact: true })
    .click();
  await page.reload();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("lex-active:v1")!).workouts.length,
    ),
  ).toBe(2);
});
test("exercise drafts survive closing, navigation and reload without becoming completed results", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Log an exercise", exact: true })
    .click();
  await page.getByRole("button", { name: "Hip thrust", exact: true }).click();
  await page.getByLabel("Hip thrust set 1 weight", { exact: true }).fill("60");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Continue exercise log", exact: true })
    .click();
  await expect(
    page.getByLabel("Hip thrust set 1 weight", { exact: true }),
  ).toHaveValue("60");
  await expect(
    page.getByLabel("Hip thrust set 1 reps", { exact: true }),
  ).toHaveValue("");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("lex-active:v1")!).workouts.length,
    ),
  ).toBe(0);
});
test("creates and edits an optional exercise group directly, without categories or a workout", async ({
  page,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await nav.getByRole("button", { name: "Train", exact: true }).click();
  await page.getByRole("button", { name: "New routine", exact: true }).click();
  await page.getByLabel("Routine name", { exact: true }).fill("My quick lifts");
  await page.getByRole("button", { name: "Bench press", exact: true }).click();
  await page.getByRole("button", { name: "Lat pulldown", exact: true }).click();
  await page.getByLabel("Bench press planned sets", { exact: true }).fill("2");
  await page
    .getByLabel("Bench press planned weight", { exact: true })
    .fill("35");
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("lex-active:v1")!).active,
    ),
  ).toBeNull();
  await page
    .getByRole("button", { name: "Edit routine My quick lifts", exact: true })
    .click();
  await page.getByLabel("Routine name", { exact: true }).fill("Quick lifts");
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  await nav.getByRole("button", { name: "Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Quick lifts 2 exercises", exact: true })
    .click();
  await expect(
    page.getByLabel("Bench press set 1 weight", { exact: true }),
  ).toHaveValue("35");
  await expect(
    page.getByRole("button", {
      name: "Complete Bench press set 2",
      exact: true,
    }),
  ).toBeVisible();
  await nav.getByRole("button", { name: "Nutrition", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Good food. Your way.", exact: true }),
  ).toBeVisible();
});
test("Home calories match today’s food, update after editing, and refresh across tabs", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await nav.getByRole("button", { name: "Nutrition", exact: true }).click();
  await page.getByRole("button", { name: "Log food", exact: true }).click();
  for (const [label, value] of [
    ["Food or meal name", "Rice and tofu"],
    ["Calories (kcal)", "520"],
    ["Protein (g)", "30"],
    ["Carbohydrates (g)", "60"],
    ["Fat (g)", "18"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Save food", exact: true }).click();
  await nav.getByRole("button", { name: "Home", exact: true }).click();
  const card = page.getByRole("button", { name: /Today’s nutrition/ });
  await expect(card).toContainText("520");
  await expect(card).toContainText("30g protein");
  const other = await context.newPage();
  await other.goto("/");
  await other
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Nutrition", exact: true })
    .click();
  await other
    .getByRole("button", { name: "Edit Rice and tofu", exact: true })
    .click();
  await other.getByLabel("Calories (kcal)", { exact: true }).fill("620");
  await other.getByRole("button", { name: "Save food", exact: true }).click();
  await expect(card).toContainText("620");
  await page.bringToFront();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Today’s nutrition/ }),
  ).toContainText("620");
});

test("editing a past food date moves calories to today without duplicating the entry", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Quick log", exact: true }).click();
  await page.getByRole("button", { name: "Log food", exact: true }).click();
  const today = await page
    .getByLabel("Food date", { exact: true })
    .inputValue();
  for (const [label, value] of [
    ["Food or meal name", "Dated meal"],
    ["Calories (kcal)", "380"],
    ["Protein (g)", "20"],
    ["Carbohydrates (g)", "45"],
    ["Fat (g)", "14"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByLabel("Food date", { exact: true }).fill("2020-01-01");
  await page.getByRole("button", { name: "Save food", exact: true }).click();
  const nav = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await nav.getByRole("button", { name: "Home", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Today’s nutrition/ }),
  ).toContainText("0");
  await nav.getByRole("button", { name: "Nutrition", exact: true }).click();
  await page
    .getByRole("button", { name: "View 2020-01-01", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Edit Dated meal", exact: true })
    .click();
  await page.getByLabel("Food date", { exact: true }).fill(today);
  await page.getByRole("button", { name: "Save food", exact: true }).click();
  await nav.getByRole("button", { name: "Home", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Today’s nutrition/ }),
  ).toContainText("380");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("lex-active:v1")!).foods.length,
    ),
  ).toBe(1);
});

test("nutrition follows the local day after midnight without silently moving older food", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-21T22:59:45Z") });
  await page.clock.pauseAt(new Date("2026-10-21T22:59:46Z"));
  await page.goto("/");
  await page.getByRole("button", { name: "Quick log", exact: true }).click();
  await page.getByRole("button", { name: "Log food", exact: true }).click();
  await expect(page.getByLabel("Food date", { exact: true })).toHaveValue(
    "2026-10-21",
  );
  for (const [label, value] of [
    ["Food or meal name", "Late meal"],
    ["Calories (kcal)", "500"],
    ["Protein (g)", "25"],
    ["Carbohydrates (g)", "70"],
    ["Fat (g)", "12"],
  ])
    await page.getByLabel(label, { exact: true }).fill(value);
  await page.getByRole("button", { name: "Save food", exact: true }).click();
  const nav = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await nav.getByRole("button", { name: "Home", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Today’s nutrition/ }),
  ).toContainText("500");
  await page.clock.fastForward(60000);
  await expect(
    page.getByRole("button", { name: /Today’s nutrition/ }),
  ).toContainText("0");
  await page.getByRole("button", { name: /Today’s nutrition/ }).click();
  await expect(page.getByLabel("Diary date", { exact: true })).toHaveValue(
    "2026-10-22",
  );
  await page.getByRole("button", { name: "Log food", exact: true }).click();
  await expect(page.getByLabel("Food date", { exact: true })).toHaveValue(
    "2026-10-22",
  );
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("lex-active:v1")!).foods[0].date,
    ),
  ).toBe("2026-10-21");
});
