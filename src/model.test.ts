import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  initial,
  volume,
  completedSets,
  totals,
  fromRoutine,
  load,
  persist,
  KEY,
} from "./model";
import type { Workout, Routine } from "./model";
const workout: Workout = {
  id: "w",
  name: "Upper",
  date: "2026-10-21",
  exercises: [
    {
      id: "e",
      name: "Press",
      sets: [
        { id: "1", weight: 20, reps: 10, done: true },
        { id: "2", weight: 30, reps: 8, done: false },
        { id: "3", weight: 0, reps: 12, done: true },
      ],
    },
  ],
};
beforeEach(() => localStorage.clear());
describe("real workout calculations", () => {
  it("excludes incomplete sets and counts bodyweight sets", () => {
    expect(volume(workout)).toBe(200);
    expect(completedSets(workout)).toBe(2);
  });
  it("creates independent routine sessions with reset completion", () => {
    const r: Routine = { ...workout, categories: ["Upper Body"] };
    const a = fromRoutine(r),
      b = fromRoutine(r);
    expect(a.id).not.toBe(b.id);
    expect(a.exercises[0].sets.every((s) => !s.done)).toBe(true);
    a.exercises[0].sets[0].weight = 100;
    expect(r.exercises[0].sets[0].weight).toBe(20);
  });
});
describe("device persistence", () => {
  it("round trips interrupted workouts, routines, meals and appearance", () => {
    const s = {
      ...initial,
      active: workout,
      theme: "Midnight" as const,
      workouts: [workout],
    };
    persist(s);
    expect(load()).toEqual(s);
  });
  it("fails explicitly on corrupt data without replacing it", () => {
    localStorage.setItem(KEY, "bad json");
    expect(() => load()).toThrow();
    expect(localStorage.getItem(KEY)).toBe("bad json");
  });
  it("propagates storage failure", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw Error("full");
      });
    expect(() => persist(initial)).toThrow("full");
    spy.mockRestore();
  });
});
it("sums entered macros without inferring absent food", () => {
  expect(totals([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  expect(
    totals([
      {
        id: "f",
        name: "Meal",
        date: "2026-10-21",
        meal: "Lunch",
        calories: 450,
        protein: 24,
        carbs: 50,
        fat: 17,
      },
      {
        id: "g",
        name: "Snack",
        date: "2026-10-21",
        meal: "Snack",
        calories: 150,
        protein: 6,
        carbs: 20,
        fat: 5,
      },
    ]),
  ).toEqual({ calories: 600, protein: 30, carbs: 70, fat: 22 });
});
