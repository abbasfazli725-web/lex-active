import { it, expect } from "vitest";
import { publicConfiguration, accountStorageKey } from "./client";
it("rejects secret/service-role keys and insecure hosted endpoints", () => {
  expect(() =>
    publicConfiguration(
      "https://example.supabase.co",
      "sb_secret_not-a-real-key",
    ),
  ).toThrow();
  const jwt =
    "e30." + btoa(JSON.stringify({ role: "service_role" })) + ".signature";
  expect(() =>
    publicConfiguration("https://example.supabase.co", jwt),
  ).toThrow();
  expect(() =>
    publicConfiguration("http://example.supabase.co", "sb_publishable_test"),
  ).toThrow();
  expect(() =>
    publicConfiguration("https://example.supabase.co", ""),
  ).toThrow();
  expect(publicConfiguration("", "")).toBeNull();
});
it("separates caches for each project and authenticated identity", () => {
  expect(accountStorageKey("https://a.supabase.co", "alice")).not.toBe(
    accountStorageKey("https://a.supabase.co", "bob"),
  );
  expect(accountStorageKey("https://a.supabase.co", "alice")).not.toBe(
    accountStorageKey("https://b.supabase.co", "alice"),
  );
});
