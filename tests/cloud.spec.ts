import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
// This suite requires the actual local Supabase services, never a request mock.
test.skip(
  !process.env.TEST_CLOUD,
  "Run npm run test:cloud against the local stack.",
);
test("real sign-in isolates accounts, explicitly imports guest records and syncs across devices/offline", async ({
  page,
  browser,
}) => {
  const url = process.env.VITE_SUPABASE_URL!,
    key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
    password = randomUUID() + "Aa1!";
  const api = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    email = `lex-browser-${randomUUID()}@example.test`;
  const signup = await api.auth.signUp({ email, password });
  expect(signup.error).toBeNull();
  const userId = signup.data.user!.id;
  const guestFood = {
    id: randomUUID(),
    name: "Guest-only meal",
    date: "2026-10-21",
    meal: "Lunch",
    calories: 333,
    protein: 20,
    carbs: 30,
    fat: 10,
  };
  await page.goto("/");
  await page.evaluate((f) => {
    localStorage.setItem(
      "lex-active:v1",
      JSON.stringify({
        version: 1,
        theme: "Blush",
        workouts: [],
        routines: [],
        foods: [f],
        active: null,
      }),
    );
  }, guestFood);
  await page.reload();
  async function signin(target: typeof page) {
    await target.getByRole("button", { name: "Profile and settings" }).click();
    await target
      .getByRole("button", { name: "Sign in or create account", exact: true })
      .click();
    await target.getByLabel("Email", { exact: true }).fill(email);
    await target.getByLabel("Password", { exact: true }).fill(password);
    await target
      .locator("form")
      .getByRole("button", { name: "Sign in", exact: true })
      .click();
    await expect(
      target.getByRole("button", { name: "Profile and settings" }),
    ).toBeVisible();
    await expect
      .poll(() =>
        target.evaluate(
          (id) =>
            Boolean(
              localStorage.getItem(`lex-active:v1:account:127.0.0.1:${id}`),
            ),
          userId,
        ),
      )
      .toBe(true);
  }
  await signin(page);
  const accountKey = `lex-active:v1:account:127.0.0.1:${userId}`;
  expect(
    await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k)!).foods.length,
      accountKey,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Profile and settings" }).click();
  await page.getByRole("button", { name: "Your account", exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", {
      name: "Import device records into account",
      exact: true,
    })
    .click();
  await expect
    .poll(async () => {
      const r = await api.from("food_entries").select("*");
      if (r.error) throw r.error;
      return r.data?.length;
    })
    .toBe(1);
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("lex-active:v1")!).foods[0].calories,
    ),
  ).toBe(333);
  const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    other = await context.newPage();
  await other.goto("/");
  await signin(other);
  await expect
    .poll(() =>
      other.evaluate(
        (k) => JSON.parse(localStorage.getItem(k)!).foods.length,
        accountKey,
      ),
    )
    .toBe(1);
  await other
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Nutrition", exact: true })
    .click();
  await other.getByRole("button", { name: "Log food", exact: true }).click();
  for (const [label, value] of [
    ["Food or meal name", "Offline meal"],
    ["Calories (kcal)", "500"],
    ["Protein (g)", "25"],
    ["Carbohydrates (g)", "65"],
    ["Fat (g)", "15"],
  ])
    await other.getByLabel(label, { exact: true }).fill(value);
  await context.setOffline(true);
  await other.getByRole("button", { name: "Save food", exact: true }).click();
  await other.reload();
  await other
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Nutrition", exact: true })
    .click();
  await expect(other.getByText("Offline meal", { exact: true })).toBeVisible();
  await context.setOffline(false);
  await expect
    .poll(
      async () => {
        const r = await api.from("food_entries").select("*");
        return r.data?.length;
      },
      { timeout: 20000 },
    )
    .toBe(2);
  await other.getByRole("button", { name: "Profile and settings" }).click();
  await other
    .getByRole("button", { name: "Your account", exact: true })
    .click();
  await other
    .getByRole("button", { name: "Sign out on this device", exact: true })
    .click();
  await other
    .getByRole("navigation", { name: "Main navigation", exact: true })
    .getByRole("button", { name: "Nutrition", exact: true })
    .click();
  await expect(other.getByText("Offline meal", { exact: true })).toHaveCount(0);
  await context.close();
  await api.auth.signOut();
});

test("real friends, messages, notifications and Workout Exchange work through the UI", async ({
  page,
  browser,
}) => {
  test.setTimeout(60000);
  const url = process.env.VITE_SUPABASE_URL!,
    key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
  expect(url).toBe("http://127.0.0.1:54321");
  const password = randomUUID() + "Aa1!",
    suffix = randomUUID().slice(0, 6),
    accounts = [];
  for (const tag of ["a", "b"]) {
    const api = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
      email = `lex-social-${tag}-${randomUUID()}@example.test`;
    const signup = await api.auth.signUp({ email, password });
    expect(signup.error).toBeNull();
    const username = `lex_${tag}_${suffix}`;
    expect(
      (
        await api
          .from("profiles")
          .update({ username, display_name: username })
          .eq("id", signup.data.user!.id)
      ).error,
    ).toBeNull();
    accounts.push({ api, email, username });
  }
  const otherContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    bob = await otherContext.newPage();
  async function login(p: typeof page, email: string) {
    await p.goto("/");
    await p.getByRole("button", { name: "Profile and settings" }).click();
    await p
      .getByRole("button", { name: "Sign in or create account", exact: true })
      .click();
    await p.getByLabel("Email", { exact: true }).fill(email);
    await p.getByLabel("Password", { exact: true }).fill(password);
    await p
      .locator("form")
      .getByRole("button", { name: "Sign in", exact: true })
      .click();
    await expect(p.getByRole("dialog")).toHaveCount(0);
  }
  const nav = (p: typeof page, name: string) =>
    p
      .getByRole("navigation", { name: "Main navigation", exact: true })
      .getByRole("button", { name, exact: true })
      .click();
  await login(page, accounts[0].email);
  await login(bob, accounts[1].email);
  await nav(page, "Train");
  await page.getByRole("button", { name: "New routine", exact: true }).click();
  await page.getByLabel("Routine name", { exact: true }).fill("Exchange day");
  await page.getByRole("button", { name: "Bench press", exact: true }).click();
  await page
    .getByLabel("Bench press planned weight", { exact: true })
    .fill("40");
  await page.getByRole("button", { name: "Save routine", exact: true }).click();
  await nav(page, "Social");
  await page
    .getByLabel("Search usernames", { exact: true })
    .fill(accounts[1].username);
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByRole("button", { name: "Add friend", exact: true }).click();
  await nav(bob, "Social");
  await bob.getByRole("button", { name: "Accept", exact: true }).click();
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await page.getByRole("button", { name: "Message", exact: true }).click();
  await page.getByLabel("Message", { exact: true }).fill("Ready for training?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await bob.getByRole("button", { name: "Message", exact: true }).click();
  await expect(
    bob.getByText("Ready for training?", { exact: true }),
  ).toBeVisible();
  await bob.getByRole("button", { name: "Notifications", exact: true }).click();
  await expect(
    bob.getByRole("dialog").getByText("New message", { exact: true }),
  ).toBeVisible();
  await bob.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("tab", { name: "Exchange", exact: true }).click();
  await page.getByRole("button", { name: "Send workout", exact: true }).click();
  await bob.getByRole("tab", { name: "Exchange", exact: true }).click();
  await bob.getByRole("button", { name: "Refresh", exact: true }).click();
  await bob
    .getByText("Routine, results & conversation", { exact: true })
    .click();
  await bob
    .getByRole("button", { name: "Accept workout", exact: true })
    .click();
  await bob
    .getByRole("button", { name: "Start this workout", exact: true })
    .click();
  await bob.getByLabel("Bench press set 1 weight", { exact: true }).fill("30");
  await bob.getByLabel("Bench press set 1 reps", { exact: true }).fill("12");
  await bob
    .getByRole("button", { name: "Complete Bench press set 1", exact: true })
    .click();
  await bob
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await bob.getByRole("button", { name: "Close", exact: true }).click();
  await nav(bob, "Social");
  await bob.getByRole("tab", { name: "Exchange", exact: true }).click();
  await bob
    .getByText("Routine, results & conversation", { exact: true })
    .click();
  await bob
    .getByRole("button", { name: "Return my results", exact: true })
    .click();
  await expect(
    bob.getByRole("heading", { name: "Returned actual results", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Refresh", exact: true }).click();
  await page
    .getByText("Routine, results & conversation", { exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Returned actual results", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("30 kg × 12", { exact: true })).toBeVisible();
  await otherContext.close();
  for (const a of accounts) await a.api.auth.signOut();
});

test("account UI exports private cloud records and deletes only the signed-in account", async ({
  page,
}) => {
  const url = process.env.VITE_SUPABASE_URL!,
    key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
  expect(url).toBe("http://127.0.0.1:54321");
  const password = randomUUID() + "Aa1!",
    email = `lex-delete-ui-${randomUUID()}@example.test`,
    api = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  const signup = await api.auth.signUp({ email, password });
  expect(signup.error).toBeNull();
  const uid = signup.data.user!.id;
  await page.goto("/");
  await page.getByRole("button", { name: "Profile and settings" }).click();
  await page
    .getByRole("button", { name: "Sign in or create account", exact: true })
    .click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .locator("form")
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Profile and settings" }).click();
  await page.getByRole("button", { name: "Your account", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Export cloud data (JSON, no image files)",
      exact: true,
    })
    .click();
  const file = await downloaded;
  const { readFile } = await import("node:fs/promises");
  const text = await readFile((await file.path())!, "utf8");
  expect(JSON.parse(text).profile.id).toBe(uid);
  expect(text).not.toContain("access_token");
  await page.getByText("Delete account permanently", { exact: true }).click();
  await page
    .getByLabel("Type DELETE to confirm", { exact: true })
    .fill("DELETE");
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Delete my account", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await api.auth.getUser()).error).not.toBeNull();
});
