import { it, expect } from "vitest";
import { platePairs, estimatedOneRepMax } from "./TrainingTools";
it("calculates balanced barbell plates and reports an unmatched target", () => {
  expect(platePairs(62.5, 20)).toEqual({ perSide: [20, 1.25], unmatchedKg: 0 });
  expect(platePairs(61, 20)).toEqual({ perSide: [20], unmatchedKg: 0.5 });
  expect(platePairs(20, 20).perSide).toEqual([]);
  expect(platePairs(80, 20, [25, 20, 15])).toEqual({
    perSide: [15, 15],
    unmatchedKg: 0,
  });
  expect(() => platePairs(10, 20)).toThrow();
});
it("uses an explicitly labelled estimate only for completed supported rep ranges", () => {
  expect(
    estimatedOneRepMax({ id: "s", weight: 60, reps: 10, done: true }),
  ).toBe(80);
  expect(estimatedOneRepMax({ id: "s", weight: 80, reps: 1, done: true })).toBe(
    80,
  );
  expect(
    estimatedOneRepMax({ id: "s", weight: 0, reps: 10, done: true }),
  ).toBeNull();
  expect(
    estimatedOneRepMax({ id: "s", weight: 60, reps: 20, done: true }),
  ).toBeNull();
  expect(
    estimatedOneRepMax({ id: "s", weight: 60, reps: 10, done: false }),
  ).toBeNull();
});
