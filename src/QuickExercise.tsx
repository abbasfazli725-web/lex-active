import { Plus, Trash2 } from "lucide-react";
import { ExercisePicker } from "./TrainingEditor";
import { id, lastPerformance, today } from "./model";
import type { ExerciseLogDraft, Workout } from "./model";
export function exerciseDraft(
  name: string,
  history: Workout[],
): ExerciseLogDraft {
  const previous = lastPerformance(name, history)?.sets.filter((s) => s.done);
  return {
    id: id(),
    name,
    date: today(),
    sets: previous?.length
      ? previous.map((s) => ({
          id: id(),
          weight: String(s.weight),
          reps: String(s.reps),
        }))
      : [{ id: id(), weight: "", reps: "" }],
  };
}
export default function QuickExercise({
  draft,
  onChange,
  onSave,
  history,
}: {
  draft: ExerciseLogDraft;
  onChange: (d: ExerciseLogDraft) => void;
  onSave: () => void;
  history: Workout[];
}) {
  if (!draft.name)
    return (
      <>
        <p>
          No session to start or finish. Choose an exercise, log what you did,
          then carry on.
        </p>
        <ExercisePicker
          selected={[]}
          history={history}
          onAdd={(name) => onChange(exerciseDraft(name, history))}
        />
      </>
    );
  return (
    <form
      className="quick-exercise"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="section-heading">
        <h3>{draft.name}</h3>
        <button
          type="button"
          className="text-button"
          onClick={() => onChange({ ...draft, name: "" })}
        >
          Change exercise
        </button>
      </div>
      <p className="logging-hint">
        {lastPerformance(draft.name, history)
          ? "Your last results are filled in. Adjust anything that changed."
          : "Enter what you did. Use 0 kg for bodyweight or no added weight."}
      </p>
      <label className="field">
        <span>Exercise date</span>
        <input
          type="date"
          required
          value={draft.date}
          onChange={(e) => {
            if (e.target.value) onChange({ ...draft, date: e.target.value });
          }}
        />
      </label>
      <div className="quick-log-row set-head">
        <span>SET</span>
        <span>KG</span>
        <span>REPS</span>
        <span />
      </div>
      {draft.sets.map((s, i) => (
        <div className="quick-log-row" key={s.id}>
          <span>{i + 1}</span>
          {(["weight", "reps"] as const).map((key) => (
            <input
              required
              key={key}
              aria-label={`${draft.name} set ${i + 1} ${key}`}
              type="number"
              inputMode={key === "weight" ? "decimal" : "numeric"}
              min={key === "weight" ? 0 : 1}
              max={key === "weight" ? 2000 : 1000}
              step={key === "weight" ? "any" : 1}
              value={s[key]}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) =>
                onChange({
                  ...draft,
                  sets: draft.sets.map((t) =>
                    t.id === s.id ? { ...t, [key]: e.target.value } : t,
                  ),
                })
              }
            />
          ))}
          <button
            type="button"
            className="icon-button"
            disabled={draft.sets.length === 1}
            aria-label={`Remove set ${i + 1}`}
            onClick={() =>
              onChange({
                ...draft,
                sets: draft.sets.filter((t) => t.id !== s.id),
              })
            }
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <div className="actions">
        <button
          type="button"
          className="button secondary"
          onClick={() =>
            onChange({
              ...draft,
              sets: [...draft.sets, { ...draft.sets.at(-1)!, id: id() }],
            })
          }
        >
          <Plus size={17} /> Same again · add set
        </button>
      </div>
      <p className="footnote">
        Only saving records these as completed sets. Closing keeps a private
        draft. You can use any tab at any time.
      </p>
      <div className="builder-save">
        <button className="button" type="submit">
          Save exercise
        </button>
      </div>
    </form>
  );
}
