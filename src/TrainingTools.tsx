import { useEffect, useState } from "react";
import type { SetEntry } from "./model";
export function estimatedOneRepMax(s: SetEntry): number | null {
  if (!s.done || s.weight <= 0 || s.reps < 1 || s.reps > 12) return null;
  return (
    Math.round((s.reps === 1 ? s.weight : s.weight * (1 + s.reps / 30)) * 10) /
    10
  );
}
export function platePairs(
  total: number,
  bar: number,
  available: number[] = [25, 20, 15, 10, 5, 2.5, 1.25],
) {
  if (
    !Number.isFinite(total) ||
    !Number.isFinite(bar) ||
    bar < 0 ||
    total < bar
  )
    throw Error("Total weight must be at least the bar weight.");
  if (total > 2000 || bar > 100)
    throw Error("Enter a total up to 2000 kg and a bar up to 100 kg.");
  const target = Math.round(((total - bar) / 2) * 100);
  const plates = [...new Set(available)]
    .filter((p) => p > 0 && Number.isFinite(p))
    .sort((a, b) => b - a)
    .map((p) => Math.round(p * 100))
    .filter((p) => p > 0);
  if (!plates.length) return { perSide: [], unmatchedKg: target / 100 };
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a),
    unit = plates.reduce(gcd),
    goal = Math.floor(target / unit),
    sizes = plates.map((p) => p / unit);
  const counts = new Int32Array(goal + 1).fill(1e9),
    used = new Int32Array(goal + 1).fill(-1);
  counts[0] = 0;
  for (let amount = 1; amount <= goal; amount++)
    for (let i = 0; i < sizes.length; i++)
      if (
        sizes[i] <= amount &&
        counts[amount - sizes[i]] + 1 < counts[amount]
      ) {
        counts[amount] = counts[amount - sizes[i]] + 1;
        used[amount] = i;
      }
  let filled = goal;
  while (filled > 0 && used[filled] === -1) filled--;
  const result: number[] = [];
  for (let remaining = filled; remaining > 0;) {
    const i = used[remaining];
    result.push(plates[i] / 100);
    remaining -= sizes[i];
  }
  return {
    perSide: result.sort((a, b) => b - a),
    unmatchedKg: (target - filled * unit) / 100,
  };
}

type Timer = { remaining: number; deadline: number | null; duration: number };
export function useRestTimer(scope: string) {
  const key = `${scope}:rest-timer`;
  const [timer, setTimer] = useState<Timer>(() => {
    try {
      const s = JSON.parse(localStorage.getItem(key) || "null");
      if (
        s &&
        Number.isFinite(s.remaining) &&
        Number.isFinite(s.duration) &&
        (s.deadline === null || Number.isFinite(s.deadline))
      )
        return s;
    } catch {}
    return { remaining: 0, deadline: null, duration: 90 };
  });
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (timer.deadline === null) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= timer.deadline!) {
        setTimer((v) => ({ ...v, deadline: null, remaining: 0 }));
      }
    }, 250);
    return () => clearInterval(t);
  }, [timer.deadline]);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(timer));
      setError("");
    } catch {
      setError("Timer could not be saved; workout records are unchanged.");
    }
  }, [key, timer]);
  const seconds =
    timer.deadline === null
      ? timer.remaining
      : Math.max(0, Math.ceil((timer.deadline - now) / 1000));
  return {
    seconds,
    running: timer.deadline !== null,
    duration: timer.duration,
    error,
    setDuration: (duration: number) => {
      if (Number.isInteger(duration) && duration >= 5 && duration <= 3600)
        setTimer((v) => ({ ...v, duration }));
    },
    start: () => {
      const n = Date.now();
      setNow(n);
      setTimer((v) => ({
        ...v,
        remaining: v.duration,
        deadline: n + v.duration * 1000,
      }));
    },
    pause: () =>
      setTimer((v) => ({ ...v, remaining: seconds, deadline: null })),
    resume: () => {
      const n = Date.now();
      setNow(n);
      setTimer((v) => ({ ...v, deadline: n + v.remaining * 1000 }));
    },
    skip: () => setTimer((v) => ({ ...v, deadline: null, remaining: 0 })),
  };
}
export function RestControls({
  timer,
}: {
  timer: ReturnType<typeof useRestTimer>;
}) {
  return (
    <section className="rest-controls">
      <h3>Rest timer</h3>
      <p>
        Runs by wall-clock time and resumes after reopening the app. It does not
        rely on background notifications.
      </p>
      <label className="field">
        <span>Rest duration (seconds)</span>
        <input
          type="number"
          min={5}
          max={3600}
          step={5}
          value={timer.duration}
          onChange={(e) => timer.setDuration(e.target.valueAsNumber)}
        />
      </label>
      <div className="actions">
        {[60, 90, 120].map((s) => (
          <button
            className="button secondary"
            key={s}
            onClick={() => timer.setDuration(s)}
          >
            {s}s
          </button>
        ))}
        <button className="button" onClick={timer.start}>
          Start rest timer
        </button>
      </div>
      {timer.error && <p role="alert">{timer.error}</p>}
    </section>
  );
}
export function TimerStatus({
  timer,
}: {
  timer: ReturnType<typeof useRestTimer>;
}) {
  return timer.seconds || timer.running ? (
    <div className="rest-status" role="status">
      <strong>
        Rest {Math.floor(timer.seconds / 60)}:
        {String(timer.seconds % 60).padStart(2, "0")}
      </strong>
      <button
        className="text-button"
        onClick={timer.running ? timer.pause : timer.resume}
      >
        {timer.running ? "Pause timer" : "Resume timer"}
      </button>
      <button className="text-button" onClick={timer.skip}>
        Skip timer
      </button>
    </div>
  ) : null;
}
export function PlateCalculator() {
  const [total, setTotal] = useState(60),
    [bar, setBar] = useState(20),
    [available, setAvailable] = useState([25, 20, 15, 10, 5, 2.5, 1.25]);
  let result: ReturnType<typeof platePairs> | undefined,
    error = "";
  try {
    result = platePairs(total, bar, available);
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <>
      <p>
        Enter the total barbell load. Plates below are shown for each side, not
        both sides combined.
      </p>
      <div className="form-grid">
        <label className="field">
          <span>Total weight (kg)</span>
          <input
            type="number"
            min={0}
            max={2000}
            step="any"
            value={Number.isFinite(total) ? total : ""}
            onChange={(e) => setTotal(e.target.valueAsNumber)}
          />
        </label>
        <label className="field">
          <span>Bar weight (kg)</span>
          <input
            type="number"
            min={0}
            max={100}
            step="any"
            value={Number.isFinite(bar) ? bar : ""}
            onChange={(e) => setBar(e.target.valueAsNumber)}
          />
        </label>
      </div>
      <fieldset>
        <legend>Available plates (kg)</legend>
        <div className="category-options">
          {[25, 20, 15, 10, 5, 2.5, 1.25].map((p) => (
            <label key={p}>
              <input
                type="checkbox"
                checked={available.includes(p)}
                onChange={(e) =>
                  setAvailable(
                    e.target.checked
                      ? [...available, p]
                      : available.filter((v) => v !== p),
                  )
                }
              />
              {p}
            </label>
          ))}
        </div>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      {result && (
        <section className="settings-note">
          <h3>Each side</h3>
          <p>
            {result.perSide.length
              ? result.perSide.map((p) => `${p} kg`).join(" + ")
              : result.unmatchedKg > 0
                ? "No available combination fits below the target."
                : "No plates needed at this load."}
          </p>
          {result.unmatchedKg > 0 && (
            <p role="status">
              Cannot load the exact target with these plates:{" "}
              {result.unmatchedKg} kg per side remains unmatched.
            </p>
          )}
        </section>
      )}
    </>
  );
}
