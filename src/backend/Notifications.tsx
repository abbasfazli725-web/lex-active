import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
export type Notification = {
  id: string;
  kind: string;
  resource_id: string | null;
  created_at: string;
  read_at: string | null;
};
export function useNotificationCount() {
  const { client, user } = useAuth();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!client || !user) {
      setCount(0);
      return;
    }
    let live = true;
    const refresh = () =>
      void client
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id)
        .is("read_at", null)
        .then(({ count, error }) => {
          if (live && !error) setCount(count ?? 0);
        });
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("lex-notifications-changed", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      live = false;
      clearInterval(timer);
      window.removeEventListener("lex-notifications-changed", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [client, user?.id]);
  return count;
}
const label: Record<string, string> = {
  friend_request: "Friend request",
  friend_accepted: "Friend request accepted",
  message: "New message",
  exchange_invitation: "Workout Exchange invitation",
  exchange_results: "Workout results returned",
  exchange_message: "Workout Exchange message",
  reaction: "Reaction to your activity",
  comment: "Comment on your activity",
};
export default function Notifications({
  onOpen,
  onAccount,
}: {
  onOpen: (n: Notification) => void;
  onAccount: () => void;
}) {
  const { client, user } = useAuth();
  const [rows, setRows] = useState<Notification[]>([]),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    if (!client || !user) return;
    const { data, error } = await client
      .from("notifications")
      .select("id,kind,resource_id,created_at,read_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setError(error.message);
    else setRows(data);
  }, [client, user?.id]);
  useEffect(() => {
    void refresh();
    const t = setInterval(() => void refresh(), 30000);
    return () => clearInterval(t);
  }, [refresh]);
  if (!user || !client)
    return (
      <>
        <p>Sign in to receive notifications inside LEX ACTIVE.</p>
        <button className="button" onClick={onAccount}>
          Account
        </button>
      </>
    );
  async function read(ids?: string[]) {
    let q = client!
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("owner_id", user!.id);
    if (ids) q = q.in("id", ids);
    else q = q.is("read_at", null);
    const { error } = await q;
    if (error) setError(error.message);
    else {
      window.dispatchEvent(new Event("lex-notifications-changed"));
      void refresh();
    }
  }
  return (
    <div>
      {error && <p role="alert">{error}</p>}
      <button className="text-button" onClick={() => void read()}>
        Mark all as read
      </button>
      {!rows.length && <p>No notifications yet.</p>}
      {rows.map((n) => (
        <button
          className={`notification-row ${n.read_at ? "" : "unread"}`}
          key={n.id}
          onClick={() => {
            void read([n.id]);
            onOpen(n);
          }}
        >
          <strong>{label[n.kind] ?? "Account activity"}</strong>
          <small>{new Date(n.created_at).toLocaleString()}</small>
        </button>
      ))}
    </div>
  );
}
