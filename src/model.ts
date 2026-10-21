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
export type State = {
  version: 1;
  theme: Theme;
  workouts: Workout[];
  routines: Routine[];
  foods: Food[];
  active: Workout | null;
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
export function fromRoutine(r: Routine): Workout {
  return {
    id: id(),
    date: today(),
    name: r.name,
    exercises: r.exercises.map((e) => ({
      ...e,
      id: id(),
      sets: e.sets.map((s) => ({ ...s, id: id(), done: false })),
    })),
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
    typeof v.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v.date) &&
    Array.isArray(v.exercises) &&
    v.exercises.every(validExercise)
  );
}
export function load(): State {
  const raw = localStorage.getItem(KEY);
  if (!raw) return structuredClone(initial);
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
    !s.routines.every(
      (r) =>
        record(r) &&
        typeof r.id === "string" &&
        typeof r.name === "string" &&
        Array.isArray(r.categories) &&
        r.categories.every((c) => typeof c === "string") &&
        Array.isArray(r.exercises) &&
        r.exercises.every(validExercise),
    ) ||
    !["Blush", "Classic", "Midnight", "Device"].includes(String(s.theme)) ||
    !(s.active === null || validWorkout(s.active))
  )
    throw new Error(
      "Unsupported or damaged saved data. Export your stored data before resetting this browser.",
    );
  return s as State;
}
export function persist(s: State) {
  localStorage.setItem(KEY, JSON.stringify(s));
}
