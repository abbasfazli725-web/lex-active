import { lazy, Suspense, useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import type { ReactNode } from "react";
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
  Pencil,
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
  newExercise,
  nutritionForDate,
  quickLogToWorkout,
  KEY,
  localDate,
} from "./model";
import type { State, Workout, Routine, Theme, Food } from "./model";
import { ExercisePicker, SetEditor, RoutineEditor } from "./TrainingEditor";
import QuickExercise, { exerciseDraft } from "./QuickExercise";
import FoodEditor from "./FoodEditor";
const tabs = [
  { name: "Home", icon: Home },
  { name: "Train", icon: Dumbbell },
  { name: "Nutrition", icon: Utensils },
  { name: "Progress", icon: ChartNoAxesCombined },
  { name: "Social", icon: Users },
] as const;
type Tab = (typeof tabs)[number]["name"];
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
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });
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
    [query, setQuery] = useState(""),
    [detail, setDetail] = useState<Workout | null>(null),
    [diaryDate, setDiaryDate] = useState(""),
    [metric, setMetric] = useState("Volume"),
    [range, setRange] = useState("30"),
    [selectedExercise, setSelectedExercise] = useState("");
  const [day, setDay] = useState(today());
  const [lastQuickName, setLastQuickName] = useState("");
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const diaryDay = diaryDate || day;
  useEffect(() => {
    const refreshDay = () => setDay(today());
    const refresh = () => {
      refreshDay();
      if (boot.error) return;
      try {
        setData(load());
      } catch {
        setError(
          "Saved data could not be refreshed. Export a backup before changing browser storage.",
        );
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY || e.key === null) refresh();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisible);
    const timer = setInterval(refreshDay, 30000);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(timer);
    };
  }, [boot.error]);
  function openQuick(name?: string) {
    if (
      name &&
      data.quickDraft?.name &&
      name !== data.quickDraft.name &&
      !confirm("Replace your unsaved exercise draft?")
    )
      return;
    const draft = name
      ? exerciseDraft(name, data.workouts)
      : (data.quickDraft ?? {
          id: id(),
          name: "",
          date: today(),
          sets: [{ id: id(), weight: "", reps: "" }],
        });
    if (update({ ...data, quickDraft: draft })) setModal("quickExercise");
  }
  function saveQuick() {
    if (!data.quickDraft) return;
    const w = quickLogToWorkout(data.quickDraft);
    if (!w) return;
    if (
      update({
        ...data,
        workouts: [...data.workouts.filter((v) => v.id !== w.id), w],
        quickDraft: null,
      })
    ) {
      setModal("");
      setLastQuickName(w.name);
      setNotice(
        `${w.name} saved · ${completedSets(w)} sets. You’re free to carry on.`,
      );
    }
  }
  function openFood(date = day, food?: Food) {
    setEditingFood(
      food ?? {
        id: id(),
        date,
        name: "",
        meal: "Snack",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    );
    setModal("food");
  }
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
          ? fromRoutine(r, data.workouts)
          : { id: id(), name: "My workout", date: today(), exercises: [] },
      })
    )
      setTab("Train");
  }
  function active(w: Workout) {
    update({ ...data, active: w });
  }
  function addExercise(name: string) {
    if (
      !data.active ||
      !name.trim() ||
      data.active.exercises.some(
        (e) => e.name.toLowerCase() === name.trim().toLowerCase(),
      )
    )
      return;
    active({
      ...data.active,
      exercises: [
        ...data.active.exercises,
        newExercise(name.trim(), data.workouts),
      ],
    });
  }
  function openRoutine(r?: Routine, fromWorkout = false) {
    if (
      (r || fromWorkout) &&
      data.routineDraft &&
      (!r || data.routineDraft.id !== r.id) &&
      !confirm("Replace your unfinished routine draft?")
    )
      return;
    const draft = r
      ? structuredClone(r)
      : fromWorkout && data.active
        ? {
            id: id(),
            name: data.active.name,
            categories: [],
            exercises: structuredClone(data.active.exercises),
          }
        : (data.routineDraft ?? {
            id: id(),
            name: "",
            categories: [],
            exercises: [],
          });
    if (update({ ...data, routineDraft: draft })) setModal("routineBuilder");
  }
  function saveRoutine(startAfter = false) {
    const draft = data.routineDraft;
    if (
      !draft?.name.trim() ||
      !draft.exercises.length ||
      (startAfter && data.active)
    )
      return;
    const routine = {
      ...draft,
      name: draft.name.trim(),
      exercises: draft.exercises.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s, done: false })),
      })),
    };
    const exists = data.routines.some((r) => r.id === routine.id);
    if (
      update({
        ...data,
        routines: exists
          ? data.routines.map((r) => (r.id === routine.id ? routine : r))
          : [...data.routines, routine],
        routineDraft: null,
        active: startAfter ? fromRoutine(routine, data.workouts) : data.active,
      })
    ) {
      setModal("");
      setNotice(
        startAfter
          ? "Ready to train. Adjust the numbers if needed, then tap ✓ after each set."
          : "Routine saved.",
      );
      if (startAfter) setTab("Train");
    }
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
  const todaysFoods = data.foods.filter((f) => f.date === day),
    macros = nutritionForDate(data.foods, day),
    recent = [...data.workouts]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);
  const week = data.workouts.filter((w) => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return w.date >= localDate(d);
  });
  const diary = data.foods.filter((f) => f.date === diaryDay),
    dayTotals = nutritionForDate(data.foods, diaryDay);
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
            <button
              className="icon-button"
              aria-label="Quick log exercise"
              onClick={() => openQuick()}
            >
              <Plus size={21} />
            </button>
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
          {needRefresh && (
            <div role="status" className="notice">
              <span>A new version is ready. Your saved records stay here.</span>
              <button
                className="text-button"
                onClick={() => void updateServiceWorker(true)}
              >
                Update app
              </button>
              <button
                className="icon-button"
                aria-label="Dismiss update"
                onClick={() => setNeedRefresh(false)}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {error && (
            <div role="alert" className="alert">
              {error}
              <button onClick={exportData}>Export stored data</button>
            </div>
          )}
          {notice && (
            <div role="status" className="notice">
              {notice}
              {lastQuickName && notice.startsWith(`${lastQuickName} saved`) && (
                <button
                  className="text-button"
                  onClick={() => openQuick(lastQuickName)}
                >
                  Log again
                </button>
              )}
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
                  <Button onClick={() => openQuick()}>
                    {data.quickDraft?.name
                      ? "Continue exercise log"
                      : "Log an exercise"}
                    <Plus size={18} />
                  </Button>
                  <button
                    className="text-button hero-workout"
                    onClick={() => start()}
                  >
                    {data.active ? "Resume workout" : "Start a workout"}
                    <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="hero-art" aria-hidden="true">
                  <div className="orb orb-one" />
                  <div className="orb orb-two" />
                  <Dumbbell className="hero-dumbbell" />
                  <div className="art-caption">MOVE WITH INTENTION</div>
                </div>
              </section>
              {(data.routines.length > 0 || recent.length > 0) && (
                <section
                  className="home-quick-start"
                  aria-label="Quick start training"
                >
                  <div className="section-heading">
                    <h2>Ready to go</h2>
                    <span>One tap to start</span>
                  </div>
                  <div className="quick-routines">
                    {data.routines.slice(0, 3).map((r) => (
                      <button key={r.id} onClick={() => start(r)}>
                        <Dumbbell size={19} />
                        <span>
                          <strong>
                            {data.active ? "Resume workout" : r.name}
                          </strong>
                          <small>{r.exercises.length} exercises</small>
                        </span>
                        <ArrowUpRight size={18} />
                      </button>
                    ))}
                    {!data.routines.length && recent.length > 0 && (
                      <button
                        onClick={() =>
                          recent[0].kind === "exercise"
                            ? openQuick(recent[0].name)
                            : start({ ...recent[0], categories: [] })
                        }
                      >
                        <Repeat2 size={19} />
                        <span>
                          <strong>
                            {data.active
                              ? "Resume workout"
                              : recent[0].kind === "exercise"
                                ? "Log exercise again"
                                : "Repeat last workout"}
                          </strong>
                          <small>{recent[0].name}</small>
                        </span>
                        <ArrowUpRight size={18} />
                      </button>
                    )}
                  </div>
                </section>
              )}
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
                    <small> training logs</small>
                  </strong>
                  <p>
                    {week.length
                      ? "Every session counts."
                      : "Log an exercise whenever you like."}
                  </p>
                </button>
                <button
                  className="stat"
                  onClick={() => {
                    setDiaryDate("");
                    setTab("Nutrition");
                  }}
                >
                  <span>
                    <Utensils size={18} /> Today’s nutrition
                  </span>
                  <strong>
                    {macros.calories.toLocaleString()}
                    <small> kcal logged</small>
                  </strong>
                  <p>
                    {todaysFoods.length
                      ? `${macros.protein}g protein · ${todaysFoods.length} entries today`
                      : data.foods.length
                        ? `Latest food dated ${[...data.foods].sort((a, b) => b.date.localeCompare(a.date))[0].date}. Check diary date.`
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
                title="Log it. Then live it."
                text="Log now. Add more whenever you like. Full workouts are optional."
              />
              <section className="card exercise-first">
                <div className="section-heading">
                  <div>
                    <h2>What did you train?</h2>
                    <p>Save an exercise now. Log another whenever you like.</p>
                  </div>
                  <Button onClick={() => openQuick()}>
                    <Plus size={18} /> Log exercise
                  </Button>
                </div>
                {data.quickDraft?.name && (
                  <button className="text-button" onClick={() => openQuick()}>
                    Continue unsaved {data.quickDraft.name} log{" "}
                    <ChevronRight size={16} />
                  </button>
                )}
                <div className="recent-exercises">
                  {[
                    ...new Set(
                      [...data.workouts]
                        .reverse()
                        .flatMap((w) => w.exercises.map((e) => e.name)),
                    ),
                  ]
                    .slice(0, 6)
                    .map((name) => (
                      <button key={name} onClick={() => openQuick(name)}>
                        <Dumbbell size={17} />
                        {name}
                        <Plus size={16} />
                      </button>
                    ))}
                </div>
              </section>
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
                  <p className="logging-hint">
                    Edit only what changes. Tap ✓ after each set—your results
                    save automatically.
                  </p>
                  <SetEditor
                    exercises={data.active.exercises}
                    history={data.workouts}
                    onChange={(exercises) =>
                      active({ ...data.active!, exercises })
                    }
                  />
                  <div className="actions workout-actions">
                    <Button secondary onClick={() => setModal("exercise")}>
                      <Plus size={17} /> Add exercise
                    </Button>
                    <Button
                      secondary
                      disabled={!data.active.exercises.length}
                      onClick={() => openRoutine(undefined, true)}
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
                    <h2>Prefer a full workout?</h2>
                    <p>Optional. You can leave it and come back at any time.</p>
                  </div>
                  <Button onClick={() => start()}>
                    <Plus size={18} /> Start workout
                  </Button>
                </section>
              )}
              <div className="section-heading">
                <h2>Saved exercise groups</h2>
                <Button secondary onClick={() => openRoutine()}>
                  <Plus size={17} />
                  {data.routineDraft ? "Continue routine" : "New routine"}
                </Button>
              </div>
              <input
                aria-label="Search saved exercise groups"
                placeholder="Search saved exercise groups…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="routine-grid">
                {data.routines
                  .filter((r) =>
                    r.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((r) => (
                    <section className="card" key={r.id}>
                      <Dumbbell className="accent" />
                      <h3>{r.name}</h3>

                      <p>{r.exercises.map((e) => e.name).join(" · ")}</p>
                      <span className="routine-meta">
                        {r.exercises.length} exercises ·{" "}
                        {r.exercises.reduce((n, e) => n + e.sets.length, 0)}{" "}
                        planned sets
                      </span>
                      <div className="actions">
                        <Button secondary onClick={() => start(r)}>
                          {data.active ? "Resume workout" : "Start routine"}
                        </Button>
                        <button
                          className="icon-button"
                          aria-label={`Edit routine ${r.name}`}
                          onClick={() => openRoutine(r)}
                        >
                          <Pencil size={18} />
                        </button>
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
                    Save exercises you often do together as an optional
                    shortcut. Or just log one exercise above.
                  </Empty>
                </section>
              )}
              <section className="card history">
                <h2>Exercise & workout history</h2>
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
                    No training logged yet. Save an exercise or a workout to
                    start your history.
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
                    value={diaryDay}
                    onChange={(e) => {
                      if (e.target.value)
                        setDiaryDate(
                          e.target.value === day ? "" : e.target.value,
                        );
                    }}
                  />
                </Field>
                <div className="actions">
                  <button
                    className="text-button"
                    onClick={() => setDiaryDate("")}
                  >
                    Today
                  </button>
                  <Button onClick={() => openFood(diaryDay)}>
                    <Plus size={18} /> Log food
                  </Button>
                </div>
              </div>
              <p className="footnote">
                {diaryDay === day ? "Today’s diary" : `Diary for ${diaryDay}`} ·
                Home shows {day}. Food date can be changed when adding or
                editing an entry.
              </p>
              {diary.length === 0 && data.foods.length > 0 && (
                <div className="chips" aria-label="Dates with food entries">
                  {[...new Set(data.foods.map((f) => f.date))]
                    .sort()
                    .reverse()
                    .slice(0, 7)
                    .map((date) => (
                      <button
                        key={date}
                        onClick={() => setDiaryDate(date === day ? "" : date)}
                      >
                        View {date}
                      </button>
                    ))}
                </div>
              )}
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
                        className="icon-button"
                        aria-label={`Edit ${f.name}`}
                        onClick={() => openFood(f.date, f)}
                      >
                        <Pencil size={17} />
                      </button>
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
            <Button onClick={() => openQuick()}>
              <Plus size={18} /> Log exercise
            </Button>
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
                openFood();
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
        <Dialog title="Add exercises" onClose={() => setModal("")}>
          <p>
            Tap to add several exercises. Previous results are filled in when
            available; otherwise you’ll get three editable planned sets.
          </p>
          <ExercisePicker
            selected={data.active?.exercises.map((e) => e.name) ?? []}
            history={data.workouts}
            onAdd={addExercise}
          />
          <div className="picker-done">
            <Button onClick={() => setModal("")}>
              Done adding
              {data.active?.exercises.length
                ? ` · ${data.active.exercises.length} exercises`
                : ""}
            </Button>
          </div>
        </Dialog>
      )}
      {modal === "routineBuilder" && data.routineDraft && (
        <Dialog
          title={
            data.routines.some((r) => r.id === data.routineDraft!.id)
              ? "Edit routine"
              : "Create a routine"
          }
          onClose={() => setModal("")}
        >
          <p className="draft-status">
            Draft saved on this device. You can close and come back.
          </p>
          <RoutineEditor
            draft={data.routineDraft}
            onChange={(routineDraft) => update({ ...data, routineDraft })}
            onSave={saveRoutine}
            history={data.workouts}
            canStart={!data.active}
            onDiscard={() => {
              if (
                confirm(
                  "Discard this routine draft? Your saved routines will stay unchanged.",
                ) &&
                update({ ...data, routineDraft: null })
              )
                setModal("");
            }}
          />
        </Dialog>
      )}
      {modal === "food" && editingFood && (
        <Dialog
          title={editingFood.name ? "Edit food" : "Log food"}
          onClose={() => setModal("")}
        >
          <FoodEditor
            key={editingFood.id}
            food={editingFood}
            onSave={(food) => {
              const exists = data.foods.some((f) => f.id === food.id);
              if (
                update({
                  ...data,
                  foods: exists
                    ? data.foods.map((f) => (f.id === food.id ? food : f))
                    : [...data.foods, food],
                })
              ) {
                setModal("");
                setNotice(
                  `${food.name} saved for ${food.date}${food.date === day ? " · today’s dashboard updated." : ". Switch the diary date to view this entry."}`,
                );
              }
            }}
          />
        </Dialog>
      )}
      {modal === "quickExercise" && data.quickDraft && (
        <Dialog title="Log an exercise" onClose={() => setModal("")}>
          <QuickExercise
            draft={data.quickDraft}
            onChange={(quickDraft) => update({ ...data, quickDraft })}
            onSave={saveQuick}
            history={data.workouts}
          />
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
            onClick={() => {
              start({ ...detail, categories: [] });
              setDetail(null);
            }}
          >
            <Repeat2 size={17} />
            {data.active ? "Resume workout" : "Repeat this workout"}
          </Button>
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
