import { useEffect, useState } from "react";
import { Check, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import type { Exercise, Routine, Workout, SetEntry } from "./model";
import { id, lastPerformance, newExercise } from "./model";
import { exercises as library } from "./training";

/** Keep temporary empty input editable without writing invalid records to storage. */
function NumberInput({
  value,
  onChange,
  label,
  kind,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  kind: "weight" | "reps" | "count";
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const min = kind === "weight" ? 0 : 1,
    max = kind === "weight" ? 2000 : kind === "count" ? 30 : 1000;
  return (
    <input
      aria-label={label}
      type="number"
      inputMode={kind === "weight" ? "decimal" : "numeric"}
      min={min}
      max={max}
      step={kind === "weight" ? "any" : 1}
      value={text}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        if (
          e.target.value !== "" &&
          Number.isFinite(n) &&
          n >= min &&
          n <= max &&
          (kind === "weight" || Number.isInteger(n))
        )
          onChange(n);
      }}
      onBlur={() => setText(String(value))}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export function ExercisePicker({
  selected,
  onAdd,
  history = [],
}: {
  selected: string[];
  onAdd: (name: string) => void;
  history?: Workout[];
}) {
  const [query, setQuery] = useState("");
  const all = [
    ...new Set([
      ...history
        .slice()
        .reverse()
        .flatMap((w) => w.exercises.map((e) => e.name)),
      ...library,
    ]),
  ];
  const matches = all.filter((n) =>
    n.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const custom =
    query.trim() &&
    !all.some((n) => n.toLowerCase() === query.trim().toLowerCase());
  return (
    <div className="exercise-picker">
      <label className="field">
        <span>Search or enter a custom exercise</span>
        <input
          value={query}
          maxLength={100}
          placeholder="e.g. Hip thrust"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="exercise-list">
        {matches.map((name) => {
          const added = selected.some(
            (n) => n.toLowerCase() === name.toLowerCase(),
          );
          return (
            <button
              type="button"
              key={name}
              aria-pressed={added}
              disabled={added}
              onClick={() => onAdd(name)}
            >
              <span>{name}</span>
              {added ? <Check size={18} /> : <Plus size={18} />}
            </button>
          );
        })}
      </div>
      {custom && (
        <button
          type="button"
          className="button secondary"
          disabled={selected.some(
            (n) => n.toLowerCase() === query.trim().toLowerCase(),
          )}
          onClick={() => {
            onAdd(query.trim());
            setQuery("");
          }}
        >
          <Plus size={17} /> Add “{query.trim()}”
        </button>
      )}
    </div>
  );
}

export function SetEditor({
  exercises,
  onChange,
  history,
}: {
  exercises: Exercise[];
  onChange: (e: Exercise[]) => void;
  history: Workout[];
}) {
  const patch = (exerciseId: string, fn: (e: Exercise) => Exercise) =>
    onChange(exercises.map((e) => (e.id === exerciseId ? fn(e) : e)));
  return (
    <div className="session-exercises">
      {exercises.map((ex, index) => {
        const previous = lastPerformance(ex.name, history);
        return (
          <section className="exercise" key={ex.id}>
            <div className="section-heading">
              <h3>{ex.name}</h3>
              <span className="set-count">
                {ex.sets.filter((s) => s.done).length}/{ex.sets.length} sets
              </span>
            </div>
            {previous && (
              <p className="previous-result">
                Last time:{" "}
                {previous.sets
                  .map((s) => `${s.weight} kg × ${s.reps}`)
                  .join(" · ")}
              </p>
            )}
            <div className="fast-set-row set-head">
              <span>SET</span>
              <span>KG</span>
              <span>REPS</span>
              <span>LOG</span>
            </div>
            {ex.sets.map((s, i) => (
              <div
                className={`fast-set-row ${s.done ? "set-done" : ""}`}
                key={s.id}
              >
                <span className="set-number">{i + 1}</span>
                <NumberInput
                  label={`${ex.name} set ${i + 1} weight`}
                  kind="weight"
                  value={s.weight}
                  onChange={(weight) =>
                    patch(ex.id, (e) => ({
                      ...e,
                      sets: e.sets.map((t) =>
                        t.id === s.id ? { ...t, weight } : t,
                      ),
                    }))
                  }
                />
                <NumberInput
                  label={`${ex.name} set ${i + 1} reps`}
                  kind="reps"
                  value={s.reps}
                  onChange={(reps) =>
                    patch(ex.id, (e) => ({
                      ...e,
                      sets: e.sets.map((t) =>
                        t.id === s.id ? { ...t, reps } : t,
                      ),
                    }))
                  }
                />
                <button
                  type="button"
                  className={`complete ${s.done ? "checked" : ""}`}
                  aria-label={`Complete ${ex.name} set ${i + 1}`}
                  aria-pressed={s.done}
                  onClick={() =>
                    patch(ex.id, (e) => ({
                      ...e,
                      sets: e.sets.map((t) =>
                        t.id === s.id ? { ...t, done: !t.done } : t,
                      ),
                    }))
                  }
                >
                  <Check size={21} />
                </button>
              </div>
            ))}
            <div className="exercise-footer">
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  patch(ex.id, (e) => ({
                    ...e,
                    sets: [
                      ...e.sets,
                      {
                        id: id(),
                        weight: e.sets.at(-1)?.weight ?? 0,
                        reps: e.sets.at(-1)?.reps ?? 10,
                        done: false,
                      },
                    ],
                  }))
                }
              >
                <Plus size={16} /> Add set
              </button>
              <details className="exercise-options">
                <summary aria-label={`Options for ${ex.name}`}>
                  Edit exercise
                </summary>
                <div className="exercise-menu">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...exercises];
                      [next[index - 1], next[index]] = [
                        next[index],
                        next[index - 1],
                      ];
                      onChange(next);
                    }}
                  >
                    <ArrowUp size={16} /> Move up
                  </button>
                  <button
                    type="button"
                    disabled={index === exercises.length - 1}
                    onClick={() => {
                      const next = [...exercises];
                      [next[index + 1], next[index]] = [
                        next[index],
                        next[index + 1],
                      ];
                      onChange(next);
                    }}
                  >
                    <ArrowDown size={16} /> Move down
                  </button>
                  {ex.sets.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Delete ${ex.name} set ${i + 1}`}
                      onClick={() =>
                        patch(ex.id, (e) => ({
                          ...e,
                          sets: e.sets.filter((t) => t.id !== s.id),
                        }))
                      }
                    >
                      <Trash2 size={16} /> Remove set {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      onChange(exercises.filter((e) => e.id !== ex.id))
                    }
                  >
                    <Trash2 size={16} /> Remove exercise
                  </button>
                </div>
              </details>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function RoutineEditor({
  draft,
  onChange,
  onSave,
  onDiscard,
  history,
  canStart,
}: {
  draft: Routine;
  onChange: (r: Routine) => void;
  onSave: (start: boolean) => void;
  onDiscard: () => void;
  history: Workout[];
  canStart: boolean;
}) {
  const [picking, setPicking] = useState(!draft.exercises.length);
  const changeExercise = (exerciseId: string, fn: (e: Exercise) => Exercise) =>
    onChange({
      ...draft,
      exercises: draft.exercises.map((e) => (e.id === exerciseId ? fn(e) : e)),
    });
  const resize = (e: Exercise, count: number): Exercise => ({
    ...e,
    sets: Array.from(
      { length: count },
      (_, i) =>
        e.sets[i] || {
          id: id(),
          weight: e.sets.at(-1)?.weight ?? 0,
          reps: e.sets.at(-1)?.reps ?? 10,
          done: false,
        },
    ),
  });
  const apply = (
    e: Exercise,
    key: "reps" | "weight",
    value: number,
  ): Exercise => ({
    ...e,
    sets: e.sets.map((s) => ({ ...s, [key]: value, done: false })),
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(false);
      }}
      className="routine-builder"
    >
      <label className="field">
        <span>Routine name</span>
        <input
          required
          maxLength={80}
          placeholder="e.g. Upper body A"
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
        />
      </label>
      <p className="builder-hint">
        Set it up once. Next time, just start and tick off your sets. These are
        plans, not logged results.
      </p>
      {draft.exercises.map((ex, index) => (
        <section className="routine-exercise" key={ex.id}>
          <div className="section-heading">
            <h3>
              {index + 1}. {ex.name}
            </h3>
            <button
              className="icon-button"
              type="button"
              aria-label={`Remove ${ex.name}`}
              onClick={() =>
                onChange({
                  ...draft,
                  exercises: draft.exercises.filter((e) => e.id !== ex.id),
                })
              }
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className="routine-targets">
            <label>
              <span>Sets</span>
              <NumberInput
                label={`${ex.name} planned sets`}
                kind="count"
                value={ex.sets.length || 1}
                onChange={(n) => changeExercise(ex.id, (e) => resize(e, n))}
              />
            </label>
            <label>
              <span>Reps / set</span>
              <NumberInput
                label={`${ex.name} planned reps`}
                kind="reps"
                value={ex.sets[0]?.reps ?? 10}
                onChange={(n) =>
                  changeExercise(ex.id, (e) => apply(e, "reps", n))
                }
              />
            </label>
            <label>
              <span>Weight (kg)</span>
              <NumberInput
                label={`${ex.name} planned weight`}
                kind="weight"
                value={ex.sets[0]?.weight ?? 0}
                onChange={(n) =>
                  changeExercise(ex.id, (e) => apply(e, "weight", n))
                }
              />
            </label>
          </div>
          <details>
            <summary>Individual set targets & order</summary>
            <div className="actions">
              <button
                type="button"
                className="text-button"
                disabled={index === 0}
                onClick={() => {
                  const next = [...draft.exercises];
                  [next[index - 1], next[index]] = [
                    next[index],
                    next[index - 1],
                  ];
                  onChange({ ...draft, exercises: next });
                }}
              >
                <ArrowUp size={16} /> Move up
              </button>
              <button
                type="button"
                className="text-button"
                disabled={index === draft.exercises.length - 1}
                onClick={() => {
                  const next = [...draft.exercises];
                  [next[index + 1], next[index]] = [
                    next[index],
                    next[index + 1],
                  ];
                  onChange({ ...draft, exercises: next });
                }}
              >
                <ArrowDown size={16} /> Move down
              </button>
            </div>
            {ex.sets.map((s, i) => (
              <div className="routine-single-set" key={s.id}>
                <span>{i + 1}</span>
                {(["weight", "reps"] as const).map((key) => (
                  <NumberInput
                    key={key}
                    label={`${ex.name} planned set ${i + 1} ${key}`}
                    kind={key}
                    value={s[key]}
                    onChange={(n) =>
                      changeExercise(ex.id, (e) => ({
                        ...e,
                        sets: e.sets.map((t) =>
                          t.id === s.id ? { ...t, [key]: n } : t,
                        ),
                      }))
                    }
                  />
                ))}
              </div>
            ))}
          </details>
        </section>
      ))}
      <div className="routine-add">
        <button
          className="button secondary"
          type="button"
          onClick={() => setPicking(!picking)}
        >
          <Plus size={18} /> {picking ? "Hide exercise list" : "Add exercises"}
        </button>
        {picking && (
          <>
            <p>
              Tap several exercises. They’re added immediately—no separate
              screens.
            </p>
            <ExercisePicker
              selected={draft.exercises.map((e) => e.name)}
              history={history}
              onAdd={(name) =>
                onChange({
                  ...draft,
                  exercises: [...draft.exercises, newExercise(name, history)],
                })
              }
            />
          </>
        )}
      </div>
      <div className="builder-save">
        <button
          className="button secondary"
          type="submit"
          disabled={!draft.name.trim() || !draft.exercises.length}
        >
          Save routine
        </button>
        {canStart && (
          <button
            className="button"
            type="button"
            disabled={!draft.name.trim() || !draft.exercises.length}
            onClick={() => onSave(true)}
          >
            Save & start
          </button>
        )}
      </div>
      <button className="text-button danger" type="button" onClick={onDiscard}>
        Discard routine draft
      </button>
    </form>
  );
}
