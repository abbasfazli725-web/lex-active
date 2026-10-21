import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Users,
  Plus,
  MessageCircle,
  ShieldCheck,
  Heart,
  Repeat2,
} from "lucide-react";
import { useAuth } from "./Auth";
import { projectUrl } from "./client";
import { id, volume } from "../model";
import type { State, Routine, Workout } from "../model";
type Profile = {
  id: string;
  username: string | null;
  display_name: string;
  bio: string;
};
type Request = {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: string;
};
type Exchange = {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: string;
  routine_snapshot: Routine;
  initial_message: string;
  created_at: string;
};
type Post = {
  id: string;
  owner_id: string;
  kind: string;
  snapshot: Workout;
  created_at: string;
};
type Relationship = {
  id: string;
  requester_id: string;
  recipient_id: string;
  tier: string;
  status: string;
};
type Grant = { owner_id: string; viewer_id: string; category: string };
export type SocialFocus = {
  pane: "Friends" | "Feed" | "Exchange" | "Messages";
  id?: string;
};
function checked<T>(r: {
  data: unknown;
  error: { message: string } | null;
}): T {
  if (r.error) throw Error(r.error.message);
  return r.data as T;
}
const sharing = [
  ["training_history", "Detailed training history"],
  ["food_diary", "Full food diary"],
  ["body_metrics", "Body measurements"],
  ["progress_photos", "Private progress photos"],
  ["wellness", "Wellness entries"],
  ["personal_notes", "Personal notes"],
  ["sleep", "Sleep records"],
];
export default function Social({
  state,
  onUpdate,
  onStart,
  onAccount,
  flush,
  focus,
}: {
  state: State;
  onUpdate: (s: State) => boolean;
  onStart: (r: Routine) => void;
  onAccount: () => void;
  flush: () => Promise<void>;
  focus?: SocialFocus;
}) {
  const { client, user } = useAuth();
  const [pane, setPane] = useState<SocialFocus["pane"]>(
      focus?.pane ?? "Friends",
    ),
    [requests, setRequests] = useState<Request[]>([]),
    [friends, setFriends] = useState<string[]>([]),
    [profiles, setProfiles] = useState<Record<string, Profile>>({}),
    [posts, setPosts] = useState<Post[]>([]),
    [exchanges, setExchanges] = useState<Exchange[]>([]),
    [relationships, setRelationships] = useState<Relationship[]>([]),
    [grants, setGrants] = useState<Grant[]>([]),
    [blocked, setBlocked] = useState<
      { blocked_id: string; blocked_label: string }[]
    >([]),
    [results, setResults] = useState<Record<string, Workout>>({}),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(false),
    [search, setSearch] = useState(""),
    [found, setFound] = useState<Profile[]>([]),
    [conversation, setConversation] = useState<string | undefined>(
      focus?.pane === "Messages" ? focus.id : undefined,
    ),
    [sharingFor, setSharingFor] = useState("");
  useEffect(() => {
    if (focus) {
      setPane(focus.pane);
      if (focus.pane === "Messages") setConversation(focus.id);
    }
  }, [focus?.pane, focus?.id]);
  const refresh = useCallback(async () => {
    if (!client || !user) return;
    setLoading(true);
    try {
      const data = await Promise.all([
        client
          .from("friend_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
        client.from("friendships").select("*"),
        client
          .from("feed_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30),
        client
          .from("workout_exchanges")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        client.from("exchange_results").select("*").limit(100),
        client.from("relationships").select("*").limit(100),
        client.from("sharing_permissions").select("*"),
        client.from("blocks").select("blocked_id,blocked_label"),
      ]);
      const req = checked<Request[]>(data[0]),
        pairs = checked<{ user_a: string; user_b: string }[]>(data[1]),
        feed = checked<Post[]>(data[2]),
        exchange = checked<Exchange[]>(data[3]),
        returned = checked<
          { exchange_id: string; workout_snapshot: Workout }[]
        >(data[4]);
      const ids = [
        ...new Set([
          user.id,
          ...pairs.flatMap((p) => [p.user_a, p.user_b]),
          ...req.flatMap((r) => [r.sender_id, r.recipient_id]),
          ...feed.map((p) => p.owner_id),
          ...exchange.flatMap((e) => [e.sender_id, e.recipient_id]),
        ]),
      ];
      const people = checked<Profile[]>(
        await client
          .from("profiles")
          .select("id,username,display_name,bio")
          .in("id", ids),
      );
      setProfiles(Object.fromEntries(people.map((p) => [p.id, p])));
      setRequests(req);
      setFriends(
        pairs.map((p) => (p.user_a === user.id ? p.user_b : p.user_a)),
      );
      setPosts(feed);
      setExchanges(exchange);
      setResults(
        Object.fromEntries(
          returned.map((r) => [r.exchange_id, r.workout_snapshot]),
        ),
      );
      setRelationships(checked<Relationship[]>(data[5]));
      setGrants(checked<Grant[]>(data[6]));
      setBlocked(checked(data[7]));
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Social records could not load.",
      );
    } finally {
      setLoading(false);
    }
  }, [client, user?.id]);
  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 15000);
    return () => clearInterval(t);
  }, [refresh]);
  const name = (uid: string) =>
    uid === user?.id
      ? "You"
      : profiles[uid]?.username
        ? `@${profiles[uid].username}`
        : (profiles[uid]?.display_name ?? "Profile unavailable");
  const action = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      await refresh();
      window.dispatchEvent(new Event("lex-notifications-changed"));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The action could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  };
  if (!client || !user)
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">BETTER, TOGETHER</p>
            <h1>Your circle. Your space.</h1>
            <p>Private connections inside LEX ACTIVE.</p>
          </div>
        </div>
        <section className="card">
          <Users className="accent" />
          <h2>Connect with your people</h2>
          <p>
            {client
              ? "Sign in to find friends, exchange workouts, react and chat inside LEX ACTIVE."
              : "Cloud accounts need to be configured on this deployment before connections can work. Your on-device logging remains available."}
          </p>
          <button className="button" onClick={onAccount}>
            {client ? "Sign in" : "Account information"}
          </button>
        </section>
      </>
    );
  const rpc = async (fn: string, args: Record<string, unknown>) =>
    checked(await client.rpc(fn, args));
  async function chat(target: string) {
    const pair = [user!.id, target].sort();
    let existing = checked<{ id: string } | null>(
      await client!
        .from("conversations")
        .select("id")
        .eq("user_a", pair[0])
        .eq("user_b", pair[1])
        .maybeSingle(),
    );
    if (!existing) {
      const r = await client!
        .from("conversations")
        .insert({ user_a: pair[0], user_b: pair[1] })
        .select("id")
        .single();
      if (r.error?.code === "23505")
        existing = checked(
          await client!
            .from("conversations")
            .select("id")
            .eq("user_a", pair[0])
            .eq("user_b", pair[1])
            .single(),
        );
      else existing = checked(r);
    }
    setConversation(existing!.id);
    setPane("Messages");
  }
  function saveReceived(r: Routine) {
    const copy = {
      ...structuredClone(r),
      id: id(),
      name: r.name,
      exercises: r.exercises.map((e) => ({
        ...e,
        id: id(),
        sets: e.sets.map((s) => ({ ...s, id: id(), done: false })),
      })),
    };
    if (onUpdate({ ...state, routines: [...state.routines, copy] }))
      setMessage(
        "Routine saved to your account on this device and queued for sync.",
      );
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">BETTER, TOGETHER</p>
          <h1>Your circle. Your space.</h1>
          <p>Friends only. Always inside LEX ACTIVE.</p>
        </div>
        <button className="text-button" onClick={() => void refresh()}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <div className="chips" role="tablist" aria-label="Social sections">
        {(["Friends", "Feed", "Exchange", "Messages"] as const).map((p) => (
          <button
            role="tab"
            aria-selected={pane === p}
            key={p}
            className={pane === p ? "selected" : ""}
            onClick={() => setPane(p)}
          >
            {p}
          </button>
        ))}
      </div>
      {pane === "Friends" && (
        <>
          <section className="card">
            <h2>Find a friend</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void action(async () => {
                  const q = search.trim().replace(/^@/, "");
                  if (!/^[A-Za-z0-9_]{2,24}$/.test(q))
                    throw Error(
                      "Enter at least two username letters, numbers or underscores.",
                    );
                  setFound(
                    checked<Profile[]>(
                      await client
                        .from("profiles")
                        .select("id,username,display_name,bio")
                        .ilike("username", q.replaceAll("_", "\\_") + "%")
                        .neq("id", user.id)
                        .limit(15),
                    ),
                  );
                });
              }}
            >
              <label className="field">
                <span>Search usernames</span>
                <input
                  required
                  value={search}
                  maxLength={25}
                  placeholder="@username"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <button className="button secondary" disabled={busy}>
                Search
              </button>
            </form>
            {found.map((p) => (
              <div className="social-row" key={p.id}>
                <div>
                  <strong>@{p.username}</strong>
                  <p>{p.display_name}</p>
                </div>
                <button
                  className="button secondary"
                  disabled={
                    busy ||
                    friends.includes(p.id) ||
                    requests.some(
                      (r) =>
                        r.status === "pending" &&
                        [r.sender_id, r.recipient_id].includes(p.id),
                    )
                  }
                  onClick={() =>
                    void action(async () => {
                      checked(
                        await client
                          .from("friend_requests")
                          .insert({ sender_id: user.id, recipient_id: p.id }),
                      );
                      setMessage("Friend request sent.");
                    })
                  }
                >
                  {friends.includes(p.id) ? "Already friends" : "Add friend"}
                </button>
              </div>
            ))}
          </section>
          <section className="card history">
            <h2>Friend requests</h2>
            {!requests.some((r) => r.status === "pending") && (
              <p>No pending requests.</p>
            )}
            {requests
              .filter((r) => r.status === "pending")
              .map((r) => (
                <div className="social-row" key={r.id}>
                  <span>
                    {name(
                      r.sender_id === user.id ? r.recipient_id : r.sender_id,
                    )}
                  </span>
                  <div className="actions">
                    {r.recipient_id === user.id ? (
                      <>
                        <button
                          className="button"
                          disabled={busy}
                          onClick={() =>
                            void action(() =>
                              rpc("respond_friend_request", {
                                request_id: r.id,
                                accept: true,
                              }),
                            )
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="button secondary"
                          disabled={busy}
                          onClick={() =>
                            void action(() =>
                              rpc("respond_friend_request", {
                                request_id: r.id,
                                accept: false,
                              }),
                            )
                          }
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() =>
                          void action(() =>
                            rpc("cancel_friend_request", { request_id: r.id }),
                          )
                        }
                      >
                        Cancel request
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </section>
          <section className="card history">
            <h2>Your friends · {friends.length}</h2>
            {blocked.length > 0 && (
              <details>
                <summary>Blocked people · {blocked.length}</summary>
                {blocked.map((b) => (
                  <div className="social-row" key={b.blocked_id}>
                    <span>{b.blocked_label}</span>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          checked(
                            await client
                              .from("blocks")
                              .delete()
                              .eq("owner_id", user.id)
                              .eq("blocked_id", b.blocked_id),
                          );
                          setMessage(
                            "Unblocked. Friendship and sensitive permissions were not restored.",
                          );
                        })
                      }
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </details>
            )}
            {!friends.length && <p>Your accepted friends will appear here.</p>}
            {friends.map((friend) => (
              <div className="friend-card" key={friend}>
                <h3>{name(friend)}</h3>
                <p>{profiles[friend]?.bio}</p>
                <div className="actions">
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => void action(() => chat(friend))}
                  >
                    <MessageCircle size={16} /> Message
                  </button>
                  <button
                    className="text-button"
                    onClick={() =>
                      setSharingFor(sharingFor === friend ? "" : friend)
                    }
                  >
                    <ShieldCheck size={16} /> Sharing & relationship
                  </button>
                  <button
                    className="text-button danger"
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          "Remove this friend? Sharing permissions will be revoked.",
                        )
                      )
                        void action(async () => {
                          const pair = [user.id, friend].sort();
                          checked(
                            await client
                              .from("friendships")
                              .delete()
                              .eq("user_a", pair[0])
                              .eq("user_b", pair[1]),
                          );
                        });
                    }}
                  >
                    Remove
                  </button>
                  <button
                    className="text-button danger"
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          "Block this person? Friendship and sharing permissions will be revoked.",
                        )
                      )
                        void action(async () => {
                          checked(
                            await client.from("blocks").insert({
                              owner_id: user.id,
                              blocked_id: friend,
                              blocked_label: name(friend),
                            }),
                          );
                          setFound([]);
                        });
                    }}
                  >
                    Block
                  </button>
                </div>
                {sharingFor === friend && (
                  <div className="sharing-panel">
                    <p>
                      No sensitive data is shared automatically. Each switch
                      below grants this friend access to that category; you can
                      revoke it at any time.
                    </p>
                    {sharing.map(([category, label]) => (
                      <label key={category}>
                        <input
                          type="checkbox"
                          disabled={busy}
                          checked={grants.some(
                            (g) =>
                              g.owner_id === user.id &&
                              g.viewer_id === friend &&
                              g.category === category,
                          )}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            void action(async () => {
                              if (enabled)
                                checked(
                                  await client
                                    .from("sharing_permissions")
                                    .insert({
                                      owner_id: user.id,
                                      viewer_id: friend,
                                      category,
                                    }),
                                );
                              else
                                checked(
                                  await client
                                    .from("sharing_permissions")
                                    .delete()
                                    .eq("owner_id", user.id)
                                    .eq("viewer_id", friend)
                                    .eq("category", category),
                                );
                            });
                          }}
                        />
                        {label}
                      </label>
                    ))}
                    <p className="footnote">
                      Nutrition-summary and water permissions reserve access for
                      their future summary endpoints; they do not unlock your
                      food diary or all wellness entries.
                    </p>
                    <div className="actions">
                      {["close_friend", "partner"].map((tier) => (
                        <button
                          className="button secondary"
                          key={tier}
                          disabled={busy}
                          onClick={() =>
                            void action(async () => {
                              checked(
                                await client.from("relationships").insert({
                                  requester_id: user.id,
                                  recipient_id: friend,
                                  tier,
                                }),
                              );
                              setMessage(
                                "Relationship request sent. This grants no additional data access.",
                              );
                            })
                          }
                        >
                          Request{" "}
                          {tier === "partner" ? "partner" : "close friend"}
                        </button>
                      ))}
                    </div>
                    {relationships
                      .filter(
                        (r) =>
                          [r.requester_id, r.recipient_id].includes(friend) &&
                          r.status !== "revoked",
                      )
                      .map((r) => (
                        <div className="social-row" key={r.id}>
                          <span>
                            {r.tier.replace("_", " ")} · {r.status}
                          </span>
                          {r.status === "pending" &&
                          r.recipient_id === user.id ? (
                            <button
                              className="button secondary"
                              onClick={() =>
                                void action(() =>
                                  rpc("respond_relationship", {
                                    request_id: r.id,
                                    accept: true,
                                  }),
                                )
                              }
                            >
                              Accept relationship
                            </button>
                          ) : null}
                          <button
                            className="text-button danger"
                            onClick={() =>
                              void action(() =>
                                rpc("revoke_relationship", {
                                  request_id: r.id,
                                }),
                              )
                            }
                          >
                            Revoke
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        </>
      )}
      {pane === "Feed" && (
        <>
          <section className="card">
            <h2>Share a workout inside LEX ACTIVE</h2>
            <p>
              Sharing publishes exercise names, weights and reps to accepted
              friends. Body measurements, food entries and personal notes are
              excluded.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void action(async () => {
                  await flush();
                  await rpc("publish_workout", {
                    session_id: String(f.get("workout")),
                  });
                  setMessage("Shared with accepted friends inside LEX ACTIVE.");
                });
              }}
            >
              <label className="field">
                <span>Completed workout or exercise</span>
                <select name="workout" required>
                  {state.workouts.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.date} · {w.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button"
                disabled={busy || !state.workouts.length}
              >
                Share with friends
              </button>
            </form>
          </section>
          {!posts.length && (
            <section className="card history">
              <p>No shared friend activity yet.</p>
            </section>
          )}
          {posts.map((post) => (
            <section className="card history" key={post.id}>
              <div className="section-heading">
                <h3>{name(post.owner_id)}</h3>
                <small>{new Date(post.created_at).toLocaleDateString()}</small>
              </div>
              <h2>{post.snapshot.name}</h2>
              <Performance workout={post.snapshot} />
              <div className="actions">
                {["❤️", "🔥", "💪", "👏", "🏆", "😂"].map((reaction) => (
                  <button
                    className="reaction"
                    aria-label={`React ${reaction}`}
                    disabled={busy}
                    key={reaction}
                    onClick={() =>
                      void action(async () => {
                        const exists = checked<{ reaction: string } | null>(
                          await client
                            .from("reactions")
                            .select("reaction")
                            .eq("post_id", post.id)
                            .eq("actor_id", user.id)
                            .maybeSingle(),
                        );
                        if (exists)
                          checked(
                            await client
                              .from("reactions")
                              .delete()
                              .eq("post_id", post.id)
                              .eq("actor_id", user.id),
                          );
                        if (exists?.reaction !== reaction)
                          checked(
                            await client.from("reactions").insert({
                              post_id: post.id,
                              actor_id: user.id,
                              reaction,
                            }),
                          );
                      })
                    }
                  >
                    {reaction}
                  </button>
                ))}
                {post.owner_id === user.id && (
                  <button
                    className="text-button danger"
                    onClick={() => {
                      if (
                        confirm(
                          "Remove this shared post? Your private workout stays saved.",
                        )
                      )
                        void action(async () => {
                          checked(
                            await client
                              .from("feed_posts")
                              .delete()
                              .eq("id", post.id),
                          );
                        });
                    }}
                  >
                    Make private · remove post
                  </button>
                )}
              </div>
              <Comments client={client} userId={user.id} postId={post.id} />
            </section>
          ))}
        </>
      )}
      {pane === "Exchange" && (
        <>
          <section className="card">
            <h2>Send a workout</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                void action(async () => {
                  await flush();
                  await rpc("send_workout_exchange", {
                    routine_id: String(f.get("routine")),
                    target: String(f.get("friend")),
                    message: String(f.get("message")),
                  });
                  setMessage(
                    "Workout sent. The recipient can train in their own time.",
                  );
                });
              }}
            >
              <label className="field">
                <span>Saved exercise group</span>
                <select name="routine" required>
                  {state.routines.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Friend</span>
                <select name="friend" required>
                  {friends.map((f) => (
                    <option key={f} value={f}>
                      {name(f)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Personal message</span>
                <input name="message" maxLength={2000} />
              </label>
              <button
                className="button"
                disabled={busy || !friends.length || !state.routines.length}
              >
                Send workout
              </button>
            </form>
            {(!friends.length || !state.routines.length) && (
              <p className="footnote">
                Save an exercise group and connect with a friend first.
              </p>
            )}
          </section>
          {!exchanges.length && <p>No Workout Exchanges yet.</p>}
          {exchanges.map((ex) => (
            <section className="card history" key={ex.id}>
              <p className="eyebrow">
                {ex.status} · {name(ex.sender_id)} → {name(ex.recipient_id)}
              </p>
              <h2>{ex.routine_snapshot.name}</h2>
              <p>{ex.initial_message}</p>
              <details open={focus?.id === ex.id}>
                <summary>Routine, results & conversation</summary>
                <h3>Sent routine targets</h3>
                {ex.routine_snapshot.exercises.map((e) => (
                  <p key={e.id}>
                    {e.name}:{" "}
                    {e.sets
                      .map((s) => `${s.weight} kg × ${s.reps}`)
                      .join(" · ")}
                  </p>
                ))}
                <div className="actions">
                  {ex.recipient_id === user.id && ex.status === "pending" && (
                    <>
                      <button
                        className="button"
                        disabled={busy}
                        onClick={() =>
                          void action(() =>
                            rpc("respond_workout_exchange", {
                              exchange_id: ex.id,
                              accept: true,
                            }),
                          )
                        }
                      >
                        Accept workout
                      </button>
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() =>
                          void action(() =>
                            rpc("respond_workout_exchange", {
                              exchange_id: ex.id,
                              accept: false,
                            }),
                          )
                        }
                      >
                        Decline workout
                      </button>
                    </>
                  )}
                  <button
                    className="button secondary"
                    onClick={() => saveReceived(ex.routine_snapshot)}
                  >
                    Save routine
                  </button>
                  {ex.status === "accepted" && ex.recipient_id === user.id && (
                    <button
                      className="button"
                      onClick={() =>
                        onStart({ ...ex.routine_snapshot, id: id() })
                      }
                    >
                      Start this workout
                    </button>
                  )}
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        await flush();
                        const target =
                          ex.sender_id === user.id
                            ? ex.recipient_id
                            : ex.sender_id;
                        const temp = {
                          ...ex.routine_snapshot,
                          id: id(),
                          name: `${ex.routine_snapshot.name} · rematch`,
                        };
                        if (
                          !onUpdate({
                            ...state,
                            routines: [...state.routines, temp],
                          })
                        )
                          throw Error("Save failed");
                        setMessage(
                          "Rematch routine saved. Choose it above to send a new exchange.",
                        );
                      })
                    }
                  >
                    Prepare rematch
                  </button>
                </div>
                {ex.status === "accepted" && ex.recipient_id === user.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      void action(async () => {
                        await flush();
                        await rpc("return_exchange_results", {
                          exchange_id: ex.id,
                          session_id: String(f.get("result")),
                        });
                      });
                    }}
                  >
                    <label className="field">
                      <span>Your completed results</span>
                      <select name="result" required>
                        {state.workouts.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.date} · {w.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="button secondary"
                      disabled={busy || !state.workouts.length}
                    >
                      Return my results
                    </button>
                  </form>
                )}
                {results[ex.id] && (
                  <>
                    <h3>Returned actual results</h3>
                    <Performance workout={results[ex.id]} />
                    <p className="footnote">
                      Routine targets and actual results are labelled
                      separately. No body measurements or unsupported
                      relative-strength scores are shown.
                    </p>
                  </>
                )}
                <Chat
                  client={client}
                  userId={user.id}
                  table="exchange_messages"
                  foreignKey="exchange_id"
                  resourceId={ex.id}
                />
              </details>
            </section>
          ))}
        </>
      )}
      {pane === "Messages" && (
        <section className="card">
          <h2>Messages</h2>
          <div className="chips">
            {friends.map((f) => (
              <button
                key={f}
                disabled={busy}
                onClick={() => void action(() => chat(f))}
              >
                {name(f)}
              </button>
            ))}
          </div>
          {conversation ? (
            <Chat
              client={client}
              userId={user.id}
              table="messages"
              foreignKey="conversation_id"
              resourceId={conversation}
            />
          ) : (
            <p>Choose a friend to open your private conversation.</p>
          )}
        </section>
      )}
    </>
  );
}
function Performance({ workout }: { workout: Workout }) {
  return (
    <div className="performance">
      <p>{volume(workout).toLocaleString()} kg × reps total volume</p>
      {workout.exercises.map((e) => (
        <div key={e.id}>
          <strong>{e.name}</strong>
          <p>
            {e.sets
              .filter((s) => s.done)
              .map((s) => `${s.weight} kg × ${s.reps}`)
              .join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
}
function Chat({
  client,
  userId,
  table,
  foreignKey,
  resourceId,
}: {
  client: SupabaseClient;
  userId: string;
  table: "messages" | "exchange_messages";
  foreignKey: "conversation_id" | "exchange_id";
  resourceId: string;
}) {
  const [rows, setRows] = useState<
      { id: string; sender_id: string; body: string; created_at: string }[]
    >([]),
    [body, setBody] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [live, setLive] = useState(false);
  const refresh = useCallback(async () => {
    const r = await client
      .from(table)
      .select("id,sender_id,body,created_at")
      .eq(foreignKey, resourceId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (r.error) setError(r.error.message);
    else setRows(r.data.reverse());
  }, [client, table, foreignKey, resourceId]);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    const hosted = projectUrl?.startsWith("https:");
    const channel = hosted
      ? client
          .channel(`${table}:${resourceId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table,
              filter: `${foreignKey}=eq.${resourceId}`,
            },
            () => void refresh(),
          )
          .subscribe((status) => setLive(status === "SUBSCRIBED"))
      : null;
    return () => {
      clearInterval(timer);
      if (channel) void client.removeChannel(channel);
    };
  }, [refresh, client, table, foreignKey, resourceId]);
  return (
    <div className="chat">
      <p className="footnote">
        {live
          ? "Live updates connected"
          : "Refreshes automatically every 15 seconds"}
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="chat-history" aria-live="polite">
        {!rows.length && <p>No messages yet.</p>}
        {rows.map((r) => (
          <article
            key={r.id}
            className={r.sender_id === userId ? "own-message" : ""}
          >
            <p>{r.body}</p>
            <small>
              {r.sender_id === userId ? "You" : "Friend"} ·{" "}
              {new Date(r.created_at).toLocaleString()}
            </small>
          </article>
        ))}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!body.trim()) return;
          setBusy(true);
          const { error } = await client.from(table).insert({
            [foreignKey]: resourceId,
            sender_id: userId,
            body: body.trim(),
          });
          setBusy(false);
          if (error) setError(error.message);
          else {
            setBody("");
            setError("");
            void refresh();
          }
        }}
      >
        <label className="field">
          <span>Message</span>
          <textarea
            required
            maxLength={4000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <button className="button secondary" disabled={busy || !body.trim()}>
          Send message
        </button>
      </form>
    </div>
  );
}
function Comments({
  client,
  userId,
  postId,
}: {
  client: SupabaseClient;
  userId: string;
  postId: string;
}) {
  const [rows, setRows] = useState<
      { id: string; actor_id: string; body: string }[]
    >([]),
    [reactions, setReactions] = useState<{ reaction: string }[]>([]),
    [error, setError] = useState("");
  async function refresh() {
    const [a, b] = await Promise.all([
      client
        .from("comments")
        .select("id,actor_id,body")
        .eq("post_id", postId)
        .order("created_at")
        .limit(50),
      client.from("reactions").select("reaction").eq("post_id", postId),
    ]);
    if (a.error || b.error) setError((a.error || b.error)!.message);
    else {
      setRows(a.data);
      setReactions(b.data);
    }
  }
  useEffect(() => {
    void refresh();
  }, [client, postId]);
  return (
    <details
      onToggle={(e) => {
        if (e.currentTarget.open) void refresh();
      }}
    >
      <summary>
        {reactions.length} reactions · {rows.length} comments
      </summary>
      {error && <p role="alert">{error}</p>}
      {rows.map((r) => (
        <div className="data-point" key={r.id}>
          <p>
            {r.actor_id === userId ? "You" : "Member"}: {r.body}
          </p>
          {r.actor_id === userId && (
            <button
              className="text-button danger"
              onClick={async () => {
                const { error } = await client
                  .from("comments")
                  .delete()
                  .eq("id", r.id);
                if (error) setError(error.message);
                else void refresh();
              }}
            >
              Delete comment
            </button>
          )}
        </div>
      ))}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const body = String(new FormData(form).get("comment")).trim();
          if (!body) return;
          const { error } = await client
            .from("comments")
            .insert({ post_id: postId, actor_id: userId, body });
          if (error) setError(error.message);
          else {
            form.reset();
            void refresh();
          }
        }}
      >
        <label className="field">
          <span>Comment</span>
          <input name="comment" required maxLength={2000} />
        </label>
        <button className="button secondary">Add comment</button>
      </form>
    </details>
  );
}
