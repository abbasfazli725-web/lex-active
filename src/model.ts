export type Theme = "Blush" | "Classic" | "Midnight" | "Device";
export type SetEntry = {
  id: string;
  weight: number;
  reps: number;
  done: boolean;
};
export type Exercise = { id: string; name: string; sets: SetEntry[] };
export type Workout = {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
  routineId?: string;
  kind?: "exercise" | "workout";
};
export type Routine = {
  id: string;
  name: string;
  categories: string[];
  exercises: Exercise[];
};
export type Food = {
  id: string;
  date: string;
  name: string;
  meal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
export type ExerciseLogDraft = {
  id: string;
  name: string;
  date: string;
  sets: { id: string; weight: string; reps: string }[];
};
export type State = {
  version: 1;
  theme: Theme;
  workouts: Workout[];
  routines: Routine[];
  foods: Food[];
  active: Workout | null;
  routineDraft?: Routine | null;
  quickDraft?: ExerciseLogDraft | null;
};
export const initial: State = {
  version: 1,
  theme: "Blush",
  workouts: [],
  routines: [],
  foods: [],
  active: null,
};
export const id = () => crypto.randomUUID();
export const today = () => localDate(new Date());
export function localDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const volume = (w: Workout) =>
  w.exercises.reduce(
    (n, e) =>
      n +
      e.sets.filter((s) => s.done).reduce((v, s) => v + s.weight * s.reps, 0),
    0,
  );
export const completedSets = (w: Workout) =>
  w.exercises.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
export const totals = (foods: Food[]) =>
  foods.reduce(
    (a, f) => ({
      calories: a.calories + f.calories,
      protein: a.protein + f.protein,
      carbs: a.carbs + f.carbs,
      fat: a.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
export const nutritionForDate = (foods: Food[], date: string) =>
  totals(foods.filter((f) => f.date === date));
export function lastPerformance(
  name: string,
  history: Workout[],
): Exercise | undefined {
  const found = [...history]
    .map((w, index) => ({ w, index }))
    .sort((a, b) => b.w.date.localeCompare(a.w.date) || b.index - a.index)
    .flatMap(({ w }) => w.exercises)
    .find(
      (e) =>
        e.name.toLowerCase() === name.toLowerCase() &&
        e.sets.some((s) => s.done),
    );
  return found
    ? { ...found, sets: found.sets.filter((s) => s.done) }
    : undefined;
}
export function newExercise(name: string, history: Workout[] = []): Exercise {
  const previous = lastPerformance(name, history)?.sets.filter((s) => s.done);
  return {
    id: id(),
    name,
    sets: previous?.length
      ? previous.map((s) => ({ ...s, id: id(), done: false }))
      : Array.from({ length: 3 }, () => ({
          id: id(),
          weight: 0,
          reps: 10,
          done: false,
        })),
  };
}
export function fromRoutine(r: Routine, history: Workout[] = []): Workout {
  return {
    id: id(),
    routineId: r.id,
    date: today(),
    name: r.name,
    exercises: r.exercises.map((e) => {
      const previous = lastPerformance(e.name, history)?.sets.filter(
        (s) => s.done,
      );
      return {
        ...e,
        id: id(),
        sets: e.sets.map((s, i) => {
          const last = previous?.[i] ?? previous?.at(-1);
          return {
            ...s,
            weight: last?.weight ?? s.weight,
            reps: last?.reps ?? s.reps,
            id: id(),
            done: false,
          };
        }),
      };
    }),
  };
}
export function quickLogToWorkout(draft: ExerciseLogDraft): Workout | null {
  if (
    !draft.name.trim() ||
    !/^\d{4}-\d{2}-\d{2}$/.test(draft.date) ||
    !draft.sets.length ||
    draft.sets.some(
      (s) =>
        s.weight.trim() === "" ||
        s.reps.trim() === "" ||
        !Number.isFinite(Number(s.weight)) ||
        Number(s.weight) < 0 ||
        Number(s.weight) > 2000 ||
        !Number.isInteger(Number(s.reps)) ||
        Number(s.reps) < 1 ||
        Number(s.reps) > 1000,
    )
  )
    return null;
  return {
    id: draft.id,
    name: draft.name.trim(),
    date: draft.date,
    kind: "exercise",
    exercises: [
      {
        id: id(),
        name: draft.name.trim(),
        sets: draft.sets.map((s) => ({
          id: s.id,
          weight: Number(s.weight),
          reps: Number(s.reps),
          done: true,
        })),
      },
    ],
  };
}
export const KEY = "lex-active:v1";
function record(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function validExercise(v: unknown): boolean {
  return (
    record(v) &&
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    Array.isArray(v.sets) &&
    v.sets.every(
      (s) =>
        record(s) &&
        typeof s.id === "string" &&
        typeof s.done === "boolean" &&
        typeof s.weight === "number" &&
        Number.isFinite(s.weight) &&
        s.weight >= 0 &&
        typeof s.reps === "number" &&
        Number.isInteger(s.reps) &&
        s.reps > 0,
    )
  );
}
function validWorkout(v: unknown): boolean {
  return (
    record(v) &&
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    (v.routineId === undefined || typeof v.routineId === "string") &&
    (v.kind === undefined || v.kind === "workout" || v.kind === "exercise") &&
    typeof v.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.date) &&
    Array.isArray(v.exercises) &&
    v.exercises.every(validExercise)
  );
}
function validRoutine(r: unknown): boolean {
  return (
    record(r) &&
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    Array.isArray(r.categories) &&
    r.categories.every((c) => typeof c === "string") &&
    Array.isArray(r.exercises) &&
    r.exercises.every(validExercise)
  );
}
export function load(storageKey = KEY): State {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return structuredClone(initial);
  return parseState(raw);
}
export function parseState(raw: string): State {
  const s: unknown = JSON.parse(raw);
  if (
    !record(s) ||
    s.version !== 1 ||
    !Array.isArray(s.workouts) ||
    !s.workouts.every(validWorkout) ||
    !Array.isArray(s.foods) ||
    !s.foods.every(
      (f) =>
        record(f) &&
        typeof f.id === "string" &&
        typeof f.name === "string" &&
        typeof f.meal === "string" &&
        typeof f.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(f.date) &&
        ["calories", "protein", "carbs", "fat"].every(
          (k) => typeof f[k] === "number" && Number.isFinite(f[k]) && f[k] >= 0,
        ),
    ) ||
    !Array.isArray(s.routines) ||
    !s.routines.every(validRoutine) ||
    !(
      s.routineDraft === undefined ||
      s.routineDraft === null ||
      validRoutine(s.routineDraft)
    ) ||
    !["Blush", "Classic", "Midnight", "Device"].includes(String(s.theme)) ||
    !(
      s.quickDraft === undefined ||
      s.quickDraft === null ||
      (record(s.quickDraft) &&
        typeof s.quickDraft.id === "string" &&
        typeof s.quickDraft.name === "string" &&
        typeof s.quickDraft.date === "string" &&
        Array.isArray(s.quickDraft.sets) &&
        s.quickDraft.sets.every(
          (t) =>
            record(t) &&
            typeof t.id === "string" &&
            typeof t.weight === "string" &&
            typeof t.reps === "string",
        ))
    ) ||
    !(s.active === null || validWorkout(s.active))
  )
    throw new Error(
      "Unsupported or damaged saved data. Export your stored data before resetting this browser.",
    );
  return s as State;
}
export function persist(s: State, storageKey = KEY) {
  localStorage.setItem(storageKey, JSON.stringify(s));
}
