import { lazy, Suspense, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Home,
  Dumbbell,
  Utensils,
  ChartNoAxesCombined,
  Users,
  Plus,
  ArrowUpRight,
  Bell,
  Settings,
  X,
  Trash2,
  Check,
  ChevronRight,
  ShieldCheck,
  Heart,
  Repeat2,
  Download,
  Flower2,
} from "lucide-react";
const ProgressChart = lazy(() => import("./ProgressChart"));
import {
  initial,
  load,
  persist,
  id,
  today,
  volume,
  completedSets,
  totals,
  fromRoutine,
  KEY,
  localDate,
} from "./model";
import type { State, Workout, Routine, Theme } from "./model";
const tabs = [
  { name: "Home", icon: Home },
  { name: "Train", icon: Dumbbell },
  { name: "Nutrition", icon: Utensils },
  { name: "Progress", icon: ChartNoAxesCombined },
  { name: "Social", icon: Users },
] as const;
type Tab = (typeof tabs)[number]["name"];
const categories = [
  "Upper Body",
  "Lower Body",
  "Glutes",
  "Legs",
  "Arms",
  "Push",
  "Pull",
  "Full Body",
  "Cardio",
  "Custom",
];
const exercises = [
  "Barbell squat",
  "Bench press",
  "Deadlift",
  "Hip thrust",
  "Romanian deadlift",
  "Lat pulldown",
  "Seated row",
  "Shoulder press",
  "Bicep curl",
  "Tricep extension",
  "Leg press",
  "Lateral raise",
  "Push-up",
  "Lunge",
];
function Button({
  children,
  onClick,
  secondary = false,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={secondary ? "button secondary" : "button"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty">
      <Flower2 size={30} />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    const prev = document.activeElement as HTMLElement;
    const el = document.querySelector<HTMLDialogElement>("dialog");
    el?.showModal();
    return () => {
      document.removeEventListener("keydown", handler);
      prev?.focus();
    };
  }, []);
  return (
    <dialog
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dialog-title">
        <h2>{title}</h2>
        <button aria-label="Close" className="icon-button" onClick={onClose}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function App() {
  const [boot] = useState(() => {
    try {
      return { data: load(), error: "" };
    } catch (e) {
      return { data: structuredClone(initial), error: String(e) };
    }
  });
  const [data, setData] = useState<State>(boot.data),
    [error, setError] = useState(boot.error),
    [tab, setTab] = useState<Tab>("Home"),
    [modal, setModal] = useState(""),
    [notice, setNotice] = useState(""),
    [filter, setFilter] = useState("All"),
    [query, setQuery] = useState(""),
    [exerciseQuery, setExerciseQuery] = useState(""),
    [detail, setDetail] = useState<Workout | null>(null),
    [diaryDate, setDiaryDate] = useState(today()),
    [metric, setMetric] = useState("Volume"),
    [range, setRange] = useState("30"),
    [selectedExercise, setSelectedExercise] = useState("");
  const [deviceDark, setDeviceDark] = useState(
    matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const fn = () => setDeviceDark(media.matches);
    media.addEventListener("change", fn);
    return () => media.removeEventListener("change", fn);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme =
      data.theme === "Device"
        ? deviceDark
          ? "Midnight"
          : "Classic"
        : data.theme;
  }, [data.theme, deviceDark]);
  function update(next: State) {
    if (boot.error) {
      setError(boot.error);
      return false;
    }
    try {
      const stored = load();
      if (JSON.stringify(stored) !== JSON.stringify(data)) {
        setData(stored);
        setError(
          "Records changed in another tab. The latest saved version is now loaded; please repeat your last action.",
        );
        return false;
      }
      persist(next);
      setData(next);
      setError("");
      return true;
    } catch {
      setError(
        "Could not save: device storage is unavailable, full or invalid. Your previous saved records have not been replaced. Export a backup and check browser storage before retrying.",
      );
      return false;
    }
  }
  function exportData() {
    const raw = boot.error
      ? localStorage.getItem(KEY)
      : JSON.stringify(data, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([raw || ""], { type: "application/json" }),
    );
    a.download = `lex-active-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function start(r?: Routine) {
    if (data.active) {
      setTab("Train");
      return;
    }
    if (
      update({
        ...data,
        active: r
          ? fromRoutine(r)
          : { id: id(), name: "My workout", date: today(), exercises: [] },
      })
    )
      setTab("Train");
  }
  function active(w: Workout) {
    update({ ...data, active: w });
  }
  function addExercise(name: string) {
    if (!data.active || !name.trim()) return;
    active({
      ...data.active,
      exercises: [
        ...data.active.exercises,
        {
          id: id(),
          name: name.trim(),
          sets: [{ id: id(), weight: 0, reps: 10, done: false }],
        },
      ],
    });
    setModal("");
    setExerciseQuery("");
  }
  function finish() {
    if (!data.active || !completedSets(data.active)) {
      setNotice("Complete at least one set before finishing.");
      return;
    }
    const w = {
      ...data.active,
      exercises: data.active.exercises
        .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) }))
        .filter((e) => e.sets.length),
    };
    if (update({ ...data, workouts: [...data.workouts, w], active: null })) {
      setNotice("Workout saved on this device. Nicely done.");
      setDetail(w);
    }
  }
  function saveRoutine(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data.active?.exercises.length) return;
    const f = new FormData(e.currentTarget);
    const r: Routine = {
      id: id(),
      name: String(f.get("name")).trim(),
      categories: f.getAll("category").map(String),
      exercises: structuredClone(data.active.exercises),
    };
    if (!r.name) return;
    if (update({ ...data, routines: [...data.routines, r] })) {
      setModal("");
      setNotice("Routine saved. Your active workout is still open.");
    }
  }
  const todaysFoods = data.foods.filter((f) => f.date === today()),
    macros = totals(todaysFoods),
    recent = [...data.workouts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  const week = data.workouts.filter((w) => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return w.date >= localDate(d);
  });
  const diary = data.foods.filter((f) => f.date === diaryDate),
    dayTotals = totals(diary);
  const names = [
    ...new Set(data.workouts.flatMap((w) => w.exercises.map((e) => e.name))),
  ];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - Number(range) + 1);
  const dates = [
    ...new Set(
      metric === "Calories"
        ? data.foods.map((f) => f.date)
        : data.workouts
            .filter(
              (w) =>
                metric !== "Strength" ||
                w.exercises.some(
                  (e) => e.name === (selectedExercise || names[0]),
                ),
            )
            .map((w) => w.date),
    ),
  ]
    .filter((d) => range === "All" || d >= localDate(cutoff))
    .sort();
  const chart = dates.map((date) => ({
    date,
    value:
      metric === "Calories"
        ? totals(data.foods.filter((f) => f.date === date)).calories
        : metric === "Strength"
          ? Math.max(
              ...data.workouts
                .filter((w) => w.date === date)
                .flatMap((w) =>
                  w.exercises
                    .filter((e) => e.name === (selectedExercise || names[0]))
                    .flatMap((e) =>
                      e.sets.filter((s) => s.done).map((s) => s.weight),
                    ),
                ),
            )
          : data.workouts
              .filter((w) => w.date === date)
              .reduce((n, w) => n + volume(w), 0),
  }));
  return (
    <div className="app-shell">
      <aside className="desktop-rail">
        <div className="brand">
          LEX<span>ACTIVE</span>
        </div>
        <p className="eyebrow">YOUR EVERYDAY, ELEVATED</p>
        <nav aria-label="Desktop navigation">
          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              aria-current={tab === name ? "page" : undefined}
              onClick={() => setTab(name)}
            >
              <Icon size={20} />
              {name}
            </button>
          ))}
        </nav>
        <div className="rail-note">
          <ShieldCheck size={21} />
          <p>
            A little stronger.
            <br />A little more you.
          </p>
          <small>Saved privately on this device.</small>
        </div>
      </aside>
      <div className="main-shell">
        <header>
          <a
            className="mobile-brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setTab("Home");
            }}
          >
            LEX <b>ACTIVE</b>
          </a>
          <span className="desktop-header">YOUR SPACE TO GROW</span>
          <div className="header-actions">
            <span className="saved">
              <i /> On-device storage
            </span>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setModal("notifications")}
            >
              <Bell size={20} />
            </button>
            <button
              className="avatar"
              aria-label="Profile and settings"
              onClick={() => setModal("settings")}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>
        <main>
          {error && (
            <div role="alert" className="alert">
              {error}
              <button onClick={exportData}>Export stored data</button>
            </div>
          )}
          {notice && (
            <div role="status" className="notice">
              {notice}
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {tab === "Home" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <h1>
                    Make time for <em>you.</em>
                  </h1>
                  <p>Your pace. Your progress. Your everyday.</p>
                </div>
                <Button secondary onClick={() => setModal("quick")}>
                  <Plus size={18} /> Quick log
                </Button>
              </div>
              <section className="hero">
                <div className="hero-copy">
                  <span className="pill">A LITTLE STRONGER, EVERY DAY</span>
                  <h2>
                    Your next chapter
                    <br />
                    starts with a rep.
                  </h2>
                  <p>
                    Show up for yourself.
                    <br />
                    We’ll keep track of the rest.
                  </p>
                  <Button onClick={() => start()}>
                    {data.active ? "Resume workout" : "Start a workout"}
                    <ArrowUpRight size={18} />
                  </Button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orb orb-one" />
                  <div className="orb orb-two" />
                  <Dumbbell className="hero-dumbbell" />
                  <div className="art-caption">MOVE WITH INTENTION</div>
                </div>
              </section>
              <div className="section-heading">
                <h2>Your day, at a glance</h2>
                <span>Small steps add up.</span>
              </div>
              <div className="stats-grid">
                <button className="stat" onClick={() => setTab("Train")}>
                  <span>
                    <Dumbbell size={18} /> Training this week
                  </span>
                  <strong>
                    {week.length}
                    <small> workouts</small>
                  </strong>
                  <p>
                    {week.length
                      ? "Every session counts."
                      : "Your next session starts here."}
                  </p>
                </button>
                <button className="stat" onClick={() => setTab("Nutrition")}>
                  <span>
                    <Utensils size={18} /> Today’s nutrition
                  </span>
                  <strong>
                    {macros.calories.toLocaleString()}
                    <small> kcal logged</small>
                  </strong>
                  <p>
                    {todaysFoods.length
                      ? `${macros.protein}g protein · ${todaysFoods.length} entries`
                      : "Add your first meal of the day."}
                  </p>
                </button>
                <button className="stat" onClick={() => setTab("Progress")}>
                  <span>
                    <ChartNoAxesCombined size={18} /> Lifetime training
                  </span>
                  <strong>
                    {data.workouts.reduce((n, w) => n + completedSets(w), 0)}
                    <small> sets</small>
                  </strong>
                  <p>Built one real rep at a time.</p>
                </button>
              </div>
              <div className="home-bottom">
                <section className="card">
                  <div className="section-heading">
                    <h2>Recent movement</h2>
                    <button
                      className="text-button"
                      onClick={() => setTab("Train")}
                    >
                      View history <ChevronRight size={16} />
                    </button>
                  </div>
                  {recent.length ? (
                    recent.map((w) => (
                      <WorkoutRow
                        key={w.id}
                        workout={w}
                        onClick={() => setDetail(w)}
                      />
                    ))
                  ) : (
                    <Empty title="A fresh start">
                      Your finished workouts will appear here. Let’s make the
                      first one yours.
                    </Empty>
                  )}
                </section>
                <section className="card intention">
                  <Flower2 size={32} />
                  <p className="eyebrow">A MOMENT FOR YOU</p>
                  <h2>
                    Consistency feels
                    <br />
                    different every day.
                  </h2>
                  <p>
                    A full session or a few good sets.
                    <br />
                    It all starts with showing up.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => setTab("Train")}
                  >
                    Find your rhythm <ArrowUpRight size={17} />
                  </button>
                </section>
              </div>
            </>
          )}
          {tab === "Train" && (
            <>
              <PageTitle
                kicker="BUILD YOUR STRONG"
                title="Your training."
                text="A space for every rep, routine and little win."
              />
              {data.active ? (
                <section className="card workout-editor">
                  <div className="section-heading">
                    <h2>In progress</h2>
                    <span className="pill">Autosaved on device</span>
                  </div>
                  <Field label="Workout name">
                    <input
                      maxLength={80}
                      value={data.active.name}
                      onChange={(e) =>
                        active({ ...data.active!, name: e.target.value })
                      }
                    />
                  </Field>
                  {data.active.exercises.map((ex, ei) => (
                    <div className="exercise" key={ex.id}>
                      <div className="section-heading">
                        <h3>{ex.name}</h3>
                        <button
                          className="icon-button"
                          aria-label={`Remove ${ex.name}`}
                          onClick={() =>
                            active({
                              ...data.active!,
                              exercises: data.active!.exercises.filter(
                                (e) => e.id !== ex.id,
                              ),
                            })
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="set-row set-head">
                        <span>SET</span>
                        <span>KG</span>
                        <span>REPS</span>
                        <span>DONE</span>
                        <span />
                      </div>
                      {ex.sets.map((s, si) => (
                        <div className="set-row" key={s.id}>
                          <span>{si + 1}</span>
                          {(["weight", "reps"] as const).map((key) => (
                            <input
                              key={key}
                              aria-label={`${ex.name} set ${si + 1} ${key}`}
                              type="number"
                              min={key === "reps" ? 1 : 0}
                              max={key === "reps" ? 1000 : 2000}
                              step={key === "reps" ? 1 : 0.5}
                              value={s[key]}
                              onChange={(e) => {
                                const value = e.target.valueAsNumber;
                                if (
                                  !Number.isFinite(value) ||
                                  value < (key === "reps" ? 1 : 0) ||
                                  value > (key === "reps" ? 1000 : 2000) ||
                                  (key === "reps" && !Number.isInteger(value))
                                )
                                  return;
                                active({
                                  ...data.active!,
                                  exercises: data.active!.exercises.map(
                                    (v, i) =>
                                      i === ei
                                        ? {
                                            ...v,
                                            sets: v.sets.map((t, j) =>
                                              j === si
                                                ? { ...t, [key]: value }
                                                : t,
                                            ),
                                          }
                                        : v,
                                  ),
                                });
                              }}
                            />
                          ))}
                          <button
                            className={`complete ${s.done ? "checked" : ""}`}
                            aria-label={`Complete ${ex.name} set ${si + 1}`}
                            aria-pressed={s.done}
                            onClick={() =>
                              active({
                                ...data.active!,
                                exercises: data.active!.exercises.map((v, i) =>
                                  i === ei
                                    ? {
                                        ...v,
                                        sets: v.sets.map((t, j) =>
                                          j === si
                                            ? { ...t, done: !t.done }
                                            : t,
                                        ),
                                      }
                                    : v,
                                ),
                              })
                            }
                          >
                            <Check size={18} />
                          </button>
                          <button
                            className="icon-button"
                            aria-label={`Delete ${ex.name} set ${si + 1}`}
                            onClick={() =>
                              active({
                                ...data.active!,
                                exercises: data.active!.exercises.map((v, i) =>
                                  i === ei
                                    ? {
                                        ...v,
                                        sets: v.sets.filter(
                                          (t) => t.id !== s.id,
                                        ),
                                      }
                                    : v,
                                ),
                              })
                            }
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        className="text-button"
                        onClick={() =>
                          active({
                            ...data.active!,
                            exercises: data.active!.exercises.map((v, i) =>
                              i === ei
                                ? {
                                    ...v,
                                    sets: [
                                      ...v.sets,
                                      {
                                        id: id(),
                                        weight: v.sets.at(-1)?.weight || 0,
                                        reps: v.sets.at(-1)?.reps || 10,
                                        done: false,
                                      },
                                    ],
                                  }
                                : v,
                            ),
                          })
                        }
                      >
                        <Plus size={16} /> Add set
                      </button>
                    </div>
                  ))}
                  <div className="actions">
                    <Button secondary onClick={() => setModal("exercise")}>
                      <Plus size={17} /> Add exercise
                    </Button>
                    <Button
                      secondary
                      disabled={!data.active.exercises.length}
                      onClick={() => setModal("routine")}
                    >
                      Save as routine
                    </Button>
                    <Button onClick={finish}>
                      Finish workout <Check size={17} />
                    </Button>
                    <button
                      className="text-button danger"
                      onClick={() => {
                        if (confirm("Discard this unfinished workout?"))
                          update({ ...data, active: null });
                      }}
                    >
                      Discard
                    </button>
                  </div>
                </section>
              ) : (
                <section className="card start-card">
                  <div>
                    <h2>Ready when you are.</h2>
                    <p>Start fresh, or pick a routine below.</p>
                  </div>
                  <Button onClick={() => start()}>
                    <Plus size={18} /> Start workout
                  </Button>
                </section>
              )}
              <div className="section-heading">
                <h2>Your routines</h2>
                <span>{data.routines.length} saved</span>
              </div>
              <input
                aria-label="Search routines"
                placeholder="Search your routines…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="chips">
                {["All", ...categories].map((c) => (
                  <button
                    key={c}
                    className={filter === c ? "selected" : ""}
                    onClick={() => setFilter(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="routine-grid">
                {data.routines
                  .filter(
                    (r) =>
                      (filter === "All" || r.categories.includes(filter)) &&
                      r.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((r) => (
                    <section className="card" key={r.id}>
                      <Dumbbell className="accent" />
                      <h3>{r.name}</h3>
                      <p>{r.categories.join(" · ") || "Uncategorised"}</p>
                      <p>{r.exercises.length} exercises</p>
                      <div className="actions">
                        <Button secondary onClick={() => start(r)}>
                          {data.active ? "Resume workout" : "Start routine"}
                        </Button>
                        <button
                          className="icon-button"
                          aria-label={`Duplicate ${r.name}`}
                          onClick={() =>
                            update({
                              ...data,
                              routines: [
                                ...data.routines,
                                {
                                  ...structuredClone(r),
                                  id: id(),
                                  name: `${r.name} (copy)`,
                                },
                              ],
                            })
                          }
                        >
                          <Repeat2 size={18} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Delete routine ${r.name}`}
                          onClick={() => {
                            if (confirm(`Delete routine “${r.name}”?`))
                              update({
                                ...data,
                                routines: data.routines.filter(
                                  (v) => v.id !== r.id,
                                ),
                              });
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </section>
                  ))}
              </div>
              {!data.routines.length && (
                <section className="card">
                  <Empty title="Your favourites, all in one place">
                    Add exercises to a workout, then choose “Save as routine” to
                    build your own training library.
                  </Empty>
                </section>
              )}
              <section className="card history">
                <h2>Workout history</h2>
                {data.workouts.length ? (
                  [...data.workouts]
                    .reverse()
                    .map((w) => (
                      <WorkoutRow
                        key={w.id}
                        workout={w}
                        onClick={() => setDetail(w)}
                      />
                    ))
                ) : (
                  <p>
                    No finished workouts yet. Your history starts with your
                    first session.
                  </p>
                )}
              </section>
            </>
          )}
          {tab === "Nutrition" && (
            <>
              <PageTitle
                kicker="NOURISH YOUR EVERYDAY"
                title="Good food. Your way."
                text="A simple, private diary. Only the values you enter."
              />
              <div className="section-heading">
                <Field label="Diary date">
                  <input
                    type="date"
                    required
                    value={diaryDate}
                    onChange={(e) => {
                      if (e.target.value) setDiaryDate(e.target.value);
                    }}
                  />
                </Field>
                <Button onClick={() => setModal("food")}>
                  <Plus size={18} /> Log food
                </Button>
              </div>
              <div className="macro-grid">
                {(["calories", "protein", "carbs", "fat"] as const).map((m) => (
                  <div className="card macro" key={m}>
                    <span>{m}</span>
                    <strong>
                      {dayTotals[m].toLocaleString()}
                      <small>{m === "calories" ? "kcal" : "g"}</small>
                    </strong>
                  </div>
                ))}
              </div>
              <section className="card">
                <div className="section-heading">
                  <h2>Food diary</h2>
                  <span>{diary.length} entries</span>
                </div>
                {diary.length ? (
                  diary.map((f) => (
                    <div className="food-row" key={f.id}>
                      <div>
                        <span className="eyebrow">{f.meal}</span>
                        <h3>{f.name}</h3>
                        <p>
                          {f.protein}g protein · {f.carbs}g carbs · {f.fat}g fat
                        </p>
                      </div>
                      <strong>{f.calories} kcal</strong>
                      <button
                        aria-label={`Delete ${f.name}`}
                        className="icon-button"
                        onClick={() => {
                          if (confirm(`Delete “${f.name}” from your diary?`))
                            update({
                              ...data,
                              foods: data.foods.filter((v) => v.id !== f.id),
                            });
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))
                ) : (
                  <Empty title="Room for something nourishing">
                    Log a meal or snack using nutrition information from its
                    label or a trusted source.
                  </Empty>
                )}
              </section>
              <p className="footnote">
                <ShieldCheck size={16} /> Your diary stays on this device. Food
                databases and cloud sync are not connected.
              </p>
            </>
          )}
          {tab === "Progress" && (
            <>
              <PageTitle
                kicker="EVERY LITTLE WIN"
                title="Look how far you go."
                text="Your actual training and nutrition. Nothing made up."
              />
              <section className="card">
                <div className="section-heading">
                  <h2>Your progress</h2>
                  <select
                    aria-label="Chart period"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                  >
                    {[
                      ["7", "7 days"],
                      ["30", "30 days"],
                      ["90", "90 days"],
                      ["365", "Year"],
                      ["All", "All time"],
                    ].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="chips">
                  {["Volume", "Strength", "Calories"].map((m) => (
                    <button
                      key={m}
                      className={metric === m ? "selected" : ""}
                      onClick={() => setMetric(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {metric === "Strength" && names.length > 0 && (
                  <Field label="Exercise">
                    <select
                      value={selectedExercise || names[0]}
                      onChange={(e) => setSelectedExercise(e.target.value)}
                    >
                      {names.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <p>
                  {metric === "Volume"
                    ? "Completed training volume (kg × reps)"
                    : metric === "Strength"
                      ? "Heaviest completed set (kg)"
                      : "Calories logged (kcal)"}{" "}
                  · {chart.length} recorded days
                </p>
                {chart.length ? (
                  <div className="chart">
                    <Suspense fallback={<p>Loading chart…</p>}>
                      <ProgressChart chart={chart} metric={metric} />
                    </Suspense>
                    <details>
                      <summary>View recorded data</summary>
                      {chart.map((p) => (
                        <div className="data-point" key={p.date}>
                          {p.date}
                          <strong>{p.value.toLocaleString()}</strong>
                        </div>
                      ))}
                    </details>
                  </div>
                ) : (
                  <Empty title="Progress begins with a record">
                    Log a workout or meal to see your story take shape.
                  </Empty>
                )}
                <p className="footnote">
                  Only logged days appear. Missing entries are not zero;
                  nutrition totals may represent partial days. Tap a point to
                  inspect it.
                </p>
              </section>
              <section className="card history">
                <h2>Your personal bests</h2>
                <p>
                  Heaviest completed set for each exercise. Bodyweight sets show
                  0 kg added load.
                </p>
                {names.length ? (
                  names.map((n) => {
                    const sets = data.workouts.flatMap((w) =>
                      w.exercises
                        .filter((e) => e.name === n)
                        .flatMap((e) => e.sets.filter((s) => s.done)),
                    );
                    const best = sets.sort(
                      (a, b) => b.weight - a.weight || b.reps - a.reps,
                    )[0];
                    return (
                      best && (
                        <div className="data-point" key={n}>
                          <span>{n}</span>
                          <strong>
                            {best.weight} kg × {best.reps}
                          </strong>
                        </div>
                      )
                    );
                  })
                ) : (
                  <p>
                    Your first completed sets will establish your starting
                    point.
                  </p>
                )}
              </section>
            </>
          )}
          {tab === "Social" && (
            <>
              <PageTitle
                kicker="BETTER, TOGETHER"
                title="Your circle. Your space."
                text="Connection that stays inside LEX ACTIVE."
              />
              <section className="social-banner">
                <Users size={38} />
                <span className="pill">PREVIEW · NOT YET AVAILABLE</span>
                <h2>
                  A little encouragement.
                  <br />A lot of possibility.
                </h2>
                <p>
                  Train your way, cheer on your friends, and share the wins that
                  matter to you.
                </p>
              </section>
              <div className="routine-grid">
                {[
                  {
                    icon: Heart,
                    title: "Friends & your feed",
                    text: "Search usernames, connect with friends, and react or comment on their shared activity.",
                  },
                  {
                    icon: Repeat2,
                    title: "Workout Exchange",
                    text: "Send a routine, try it in your own time, and return results with messages and comparisons.",
                  },
                  {
                    icon: ChartNoAxesCombined,
                    title: "Friends-only rankings",
                    text: "Personal progress and friendly encouragement. No public or global leaderboards.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Your sharing, your choice",
                    text: "Close-friend and partner permissions will be explicit, granular and revocable.",
                  },
                ].map(({ icon: Icon, title, text }) => (
                  <section className="card" key={title}>
                    <Icon className="accent" />
                    <p className="eyebrow">PLANNED FEATURE</p>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </section>
                ))}
              </div>
              <p className="footnote">
                No accounts, friend connections or messages exist yet. Reports,
                achievements and workout summaries will only be shareable with
                friends inside LEX ACTIVE. No external social posting or social
                login.
              </p>
            </>
          )}
          <footer>
            LEX ACTIVE <span>Made for your everyday.</span>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Main navigation">
        {tabs.map(({ name, icon: Icon }) => (
          <button
            key={name}
            aria-current={tab === name ? "page" : undefined}
            onClick={() => {
              setTab(name);
              window.scrollTo(0, 0);
            }}
          >
            <Icon size={21} />
            <span>{name}</span>
          </button>
        ))}
      </nav>
      {modal === "settings" && (
        <Dialog title="Your space" onClose={() => setModal("")}>
          <p>Make yourself at home.</p>
          <Field label="Appearance">
            <select
              value={data.theme}
              onChange={(e) =>
                update({ ...data, theme: e.target.value as Theme })
              }
            >
              {["Blush", "Classic", "Midnight", "Device"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <section className="settings-note">
            <ShieldCheck />
            <h3>Saved on this device</h3>
            <p>
              No account or cloud sync is connected. Clearing browser data
              removes your records. Export backups regularly. Data is not
              encrypted on this device; use a trusted personal device.
            </p>
          </section>
          <Button secondary onClick={exportData}>
            <Download size={18} /> Export private data backup
          </Button>
          <p className="footnote">
            A private JSON backup, not a social post. Backup import is not yet
            available.
          </p>
        </Dialog>
      )}
      {modal === "notifications" && (
        <Dialog title="Notifications" onClose={() => setModal("")}>
          <Empty title="A quieter kind of connection">
            Preview: in-app notifications will arrive with accounts, friends and
            Workout Exchange. Notifications are not connected yet.
          </Empty>
        </Dialog>
      )}
      {modal === "quick" && (
        <Dialog title="Quick log" onClose={() => setModal("")}>
          <div className="quick-actions">
            <Button
              onClick={() => {
                setModal("");
                start();
              }}
            >
              <Dumbbell size={18} />{" "}
              {data.active ? "Resume workout" : "Start workout"}
            </Button>
            <Button
              secondary
              onClick={() => {
                setTab("Nutrition");
                setModal("food");
              }}
            >
              <Utensils size={18} /> Log food
            </Button>
          </div>
          <p className="footnote">
            Water, body weight and cardio logging are planned for a later
            milestone.
          </p>
        </Dialog>
      )}
      {modal === "exercise" && (
        <Dialog title="Add an exercise" onClose={() => setModal("")}>
          <Field label="Search or enter a custom exercise">
            <input
              autoFocus
              value={exerciseQuery}
              onChange={(e) => setExerciseQuery(e.target.value)}
              placeholder="e.g. Hip thrust"
              maxLength={100}
            />
          </Field>
          <div className="exercise-list">
            {exercises
              .filter((n) =>
                n.toLowerCase().includes(exerciseQuery.toLowerCase()),
              )
              .map((n) => (
                <button key={n} onClick={() => addExercise(n)}>
                  {n}
                  <Plus size={18} />
                </button>
              ))}
          </div>
          {exerciseQuery.trim() &&
            !exercises.some(
              (n) => n.toLowerCase() === exerciseQuery.trim().toLowerCase(),
            ) && (
              <Button onClick={() => addExercise(exerciseQuery)}>
                Add “{exerciseQuery.trim()}”
              </Button>
            )}
        </Dialog>
      )}
      {modal === "routine" && (
        <Dialog title="Save your routine" onClose={() => setModal("")}>
          <form onSubmit={saveRoutine}>
            <Field label="Routine name">
              <input
                name="name"
                defaultValue={data.active?.name}
                required
                maxLength={80}
              />
            </Field>
            <fieldset>
              <legend>Training categories</legend>
              <div className="category-options">
                {categories.map((c) => (
                  <label key={c}>
                    <input type="checkbox" name="category" value={c} />
                    {c}
                  </label>
                ))}
              </div>
            </fieldset>
            <p>
              Includes all current exercises and sets. Completion marks reset
              when starting a routine.
            </p>
            <Button type="submit">Save routine</Button>
          </form>
        </Dialog>
      )}
      {modal === "food" && (
        <Dialog title="Log food" onClose={() => setModal("")}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const food = {
                id: id(),
                date: diaryDate,
                name: String(f.get("name")).trim(),
                meal: String(f.get("meal")),
                calories: Number(f.get("calories")),
                protein: Number(f.get("protein")),
                carbs: Number(f.get("carbs")),
                fat: Number(f.get("fat")),
              };
              if (
                !food.name ||
                [food.calories, food.protein, food.carbs, food.fat].some(
                  (n) => !Number.isFinite(n) || n < 0,
                )
              )
                return;
              if (update({ ...data, foods: [...data.foods, food] }))
                setModal("");
            }}
          >
            <Field label="Food or meal name">
              <input
                name="name"
                required
                maxLength={100}
                placeholder="e.g. Tofu rice bowl"
              />
            </Field>
            <Field label="Meal">
              <select name="meal">
                {["Breakfast", "Lunch", "Dinner", "Snack"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <p>
              Enter totals for the portion you ate. No values are estimated.
            </p>
            <div className="form-grid">
              {[
                ["calories", "Calories (kcal)"],
                ["protein", "Protein (g)"],
                ["carbs", "Carbohydrates (g)"],
                ["fat", "Fat (g)"],
              ].map(([name, label]) => (
                <Field key={name} label={label}>
                  <input
                    name={name}
                    required
                    type="number"
                    min="0"
                    max="100000"
                    step="0.1"
                    inputMode="decimal"
                  />
                </Field>
              ))}
            </div>
            <Button type="submit">Save food</Button>
          </form>
        </Dialog>
      )}
      {detail && (
        <Dialog
          title={detail.name || "Workout"}
          onClose={() => setDetail(null)}
        >
          <p>
            {detail.date} · {completedSets(detail)} sets ·{" "}
            {volume(detail).toLocaleString()} kg volume
          </p>
          {detail.exercises.map((e) => (
            <section className="history-exercise" key={e.id}>
              <h3>{e.name}</h3>
              {e.sets.map((s, i) => (
                <p key={s.id}>
                  Set {i + 1}{" "}
                  <strong>
                    {s.weight} kg × {s.reps} reps
                  </strong>
                </p>
              ))}
            </section>
          ))}
          <Button
            secondary
            onClick={() => {
              if (
                confirm("Delete this completed workout? This cannot be undone.")
              ) {
                if (
                  update({
                    ...data,
                    workouts: data.workouts.filter((w) => w.id !== detail.id),
                  })
                )
                  setDetail(null);
              }
            }}
          >
            <Trash2 size={17} /> Delete workout
          </Button>
        </Dialog>
      )}
    </div>
  );
}
function PageTitle({
  kicker,
  title,
  text,
}: {
  kicker: string;
  title: string;
  text: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </div>
  );
}
function WorkoutRow({
  workout: w,
  onClick,
}: {
  workout: Workout;
  onClick: () => void;
}) {
  return (
    <button className="workout-row" onClick={onClick}>
      <span className="workout-icon">
        <Dumbbell size={21} />
      </span>
      <span>
        <strong>{w.name || "Workout"}</strong>
        <small>
          {w.date} · {completedSets(w)} sets · {volume(w).toLocaleString()} kg
        </small>
      </span>
      <ChevronRight size={18} />
    </button>
  );
}
