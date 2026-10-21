import { initial, parseState } from "../model";
import type { State, Theme } from "../model";
export type Kind = "workout" | "routine" | "food" | "preferences" | "drafts";
export type CloudRecord = {
  kind: Kind;
  recordId: string;
  revision: number;
  payload: unknown;
};
export type Records = Record<
  string,
  { kind: Kind; recordId: string; payload: unknown }
>;
export const recordKey = (kind: Kind, id: string) => `${kind}:${id}`;
export function canonical(value: unknown): string {
  const sort = (v: unknown): unknown =>
    Array.isArray(v)
      ? v.map(sort)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v)
              .filter(([, v]) => v !== undefined)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, v]) => [k, sort(v)]),
          )
        : v;
  return JSON.stringify(sort(value)) ?? "undefined";
}
export function recordsFromState(s: State): Records {
  const r: Records = {};
  for (const w of s.workouts)
    r[recordKey("workout", w.id)] = {
      kind: "workout",
      recordId: w.id,
      payload: { ...w, kind: w.kind ?? "workout" },
    };
  for (const routine of s.routines)
    r[recordKey("routine", routine.id)] = {
      kind: "routine",
      recordId: routine.id,
      payload: {
        ...routine,
        exercises: routine.exercises.map((e) => ({
          ...e,
          sets: e.sets.map((t) => ({ ...t, done: false })),
        })),
      },
    };
  for (const food of s.foods)
    r[recordKey("food", food.id)] = {
      kind: "food",
      recordId: food.id,
      payload: food,
    };
  r["preferences:preferences"] = {
    kind: "preferences",
    recordId: "preferences",
    payload: { theme: s.theme },
  };
  r["drafts:drafts"] = {
    kind: "drafts",
    recordId: "drafts",
    payload: {
      active: s.active,
      routineDraft: s.routineDraft ?? null,
      quickDraft: s.quickDraft ?? null,
    },
  };
  return r;
}
export function stateFromRecords(records: Records): State {
  const state: State = structuredClone(initial);
  state.routineDraft = null;
  state.quickDraft = null;
  for (const r of Object.values(records)) {
    if (r.payload === null) continue;
    if (r.kind === "workout")
      state.workouts.push(r.payload as State["workouts"][number]);
    if (r.kind === "routine")
      state.routines.push(r.payload as State["routines"][number]);
    if (r.kind === "food")
      state.foods.push(r.payload as State["foods"][number]);
    if (r.kind === "preferences")
      state.theme = (r.payload as { theme: Theme }).theme;
    if (r.kind === "drafts") {
      const draft = r.payload as Pick<
        State,
        "active" | "routineDraft" | "quickDraft"
      >;
      state.active = draft.active ?? null;
      state.routineDraft = draft.routineDraft ?? null;
      state.quickDraft = draft.quickDraft ?? null;
    }
  }
  return parseState(JSON.stringify(state));
}
export function mergeDeviceRecords(account: State, device: State): State {
  const current = recordsFromState(account),
    guest = recordsFromState(device);
  for (const [key, value] of Object.entries(guest))
    if (!current[key]) current[key] = value;
  const merged = stateFromRecords(current);
  if (
    !merged.active &&
    device.active &&
    !merged.workouts.some((w) => w.id === device.active!.id)
  )
    merged.active = structuredClone(device.active);
  if (!merged.routineDraft)
    merged.routineDraft = structuredClone(device.routineDraft ?? null);
  if (
    !merged.quickDraft &&
    device.quickDraft &&
    !merged.workouts.some((w) => w.id === device.quickDraft!.id)
  )
    merged.quickDraft = structuredClone(device.quickDraft);
  return merged;
}

export function mergeConcurrentState(
  expected: State,
  current: State,
  incoming: State,
): State {
  const before = recordsFromState(expected),
    local = recordsFromState(current),
    merged = recordsFromState(incoming);
  for (const key of new Set([...Object.keys(before), ...Object.keys(local)]))
    if (canonical(before[key]) !== canonical(local[key])) {
      if (local[key]) merged[key] = local[key];
      else delete merged[key];
    }
  return stateFromRecords(merged);
}
