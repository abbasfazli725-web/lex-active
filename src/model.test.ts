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
  quickLogToWorkout,
  lastPerformance,
  newExercise,
  nutritionForDate,
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

describe("fast logging compatibility", () => {
  it("restores existing v1 records without categories becoming a required step", () => {
    persist({
      ...initial,
      routines: [
        {
          id: "r",
          name: "Old routine",
          categories: ["Upper Body"],
          exercises: workout.exercises,
        },
      ],
    });
    expect(load().routines[0].categories).toEqual(["Upper Body"]);
  });
});

it("uses only actual completed previous sets, most recent date first", () => {
  const older = { ...workout, id: "old", date: "2026-10-20" };
  const latest = {
    ...workout,
    id: "new",
    date: "2026-10-22",
    exercises: [
      {
        ...workout.exercises[0],
        sets: [
          { id: "actual", weight: 42.5, reps: 8, done: true },
          { id: "unfinished", weight: 90, reps: 1, done: false },
        ],
      },
    ],
  };
  expect(lastPerformance("press", [latest, older])?.sets).toEqual([
    latest.exercises[0].sets[0],
  ]);
  const next = newExercise("Press", [older, latest]);
  expect(next.sets).toHaveLength(1);
  expect(next.sets[0]).toMatchObject({ weight: 42.5, reps: 8, done: false });
});
it("reuses results without rewriting a saved exercise group or completed history", () => {
  const r = {
    id: "r",
    name: "Simple",
    categories: [],
    exercises: workout.exercises,
  };
  const before = JSON.stringify([r, workout]);
  const next = fromRoutine(r, [workout]);
  expect(next.routineId).toBe("r");
  expect(next.exercises[0].sets.every((s) => !s.done)).toBe(true);
  expect(JSON.stringify([r, workout])).toBe(before);
});
it("does not turn incomplete or invalid quick drafts into logged performance", () => {
  const d = {
    id: "q",
    name: "Press",
    date: "2026-10-21",
    sets: [{ id: "s", weight: "", reps: "8" }],
  };
  expect(quickLogToWorkout(d)).toBeNull();
  expect(
    quickLogToWorkout({ ...d, sets: [{ id: "s", weight: "40", reps: "1.5" }] }),
  ).toBeNull();
  expect(
    quickLogToWorkout({ ...d, sets: [{ id: "s", weight: "0", reps: "8" }] })
      ?.exercises[0].sets[0],
  ).toMatchObject({ weight: 0, reps: 8, done: true });
});
it("shares the same dated nutrition calculation for Home and the diary", () => {
  const f = {
    id: "f",
    name: "Tofu",
    meal: "Lunch",
    calories: 400,
    protein: 30,
    carbs: 40,
    fat: 10,
    date: "2026-10-21",
  };
  expect(
    nutritionForDate(
      [f, { ...f, id: "other", date: "2026-10-20", calories: 100 }],
      f.date,
    ).calories,
  ).toBe(400);
  expect(nutritionForDate([f], "2026-10-22").calories).toBe(0);
});
it("round trips unfinished quick logs and exercise group drafts without touching v1 history", () => {
  const state = {
    ...initial,
    workouts: [workout],
    quickDraft: {
      id: "q",
      name: "Press",
      date: "2026-10-21",
      sets: [{ id: "s", weight: "40", reps: "" }],
    },
    routineDraft: { id: "r", name: "Draft", categories: [], exercises: [] },
  };
  persist(state);
  expect(load()).toEqual(state);
});
