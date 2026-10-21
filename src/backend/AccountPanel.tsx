import { useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { callbackUrl } from "./client";
export default function AccountPanel() {
  const {
    client,
    user,
    storageKey,
    error: connectionError,
    recovery,
    clearRecovery,
  } = useAuth();
  const [mode, setMode] = useState<
      "login" | "register" | "recover" | "password"
    >(recovery ? "password" : "login"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const [profile, setProfile] = useState({
    username: "",
    display_name: "",
    bio: "",
  });
  useEffect(() => {
    if (!client || !user) return;
    let live = true;
    client
      .from("profiles")
      .select("username,display_name,bio")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!live) return;
        if (error)
          setError(
            "Profile unavailable. Check that database migrations have been applied.",
          );
        else
          setProfile({
            username: data.username ?? "",
            display_name: data.display_name,
            bio: data.bio,
          });
      });
    return () => {
      live = false;
    };
  }, [client, user]);
  if (!client)
    return (
      <section className="settings-note">
        <h3>Cloud accounts are not enabled yet</h3>
        <p>
          You can keep logging privately on this device. The owner needs to
          configure this deployment’s Supabase environment variables.
        </p>
        {connectionError && <p role="alert">{connectionError}</p>}
      </section>
    );
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || ""),
      password = String(f.get("password") || "");
    try {
      if (mode === "register") {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callbackUrl() },
        });
        if (error) throw error;
        setMessage(
          data.session
            ? "Your account is ready."
            : "Check your email to verify your address before signing in.",
        );
      }
      if (mode === "login") {
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage(
          "Signed in. Device records stay separate until you choose to import them.",
        );
      }
      if (mode === "recover") {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: callbackUrl(),
        });
        if (error) throw error;
        setMessage(
          "If an account exists, a recovery email will arrive. Open it on this device.",
        );
      }
      if (mode === "password") {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        clearRecovery();
        setMode("login");
        setMessage("Password updated.");
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Account request failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="account-panel">
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
      {user && mode !== "password" ? (
        <>
          <h3>Your account</h3>
          <p>{user.email}</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const { error } = await client
                .from("profiles")
                .update({
                  ...profile,
                  username: profile.username.trim().toLowerCase() || null,
                })
                .eq("id", user.id);
              setBusy(false);
              if (error)
                setError(
                  error.code === "23505"
                    ? "That username is already taken."
                    : error.message,
                );
              else setMessage("Profile saved.");
            }}
          >
            <label className="field">
              <span>Username</span>
              <input
                pattern="[A-Za-z0-9_]{3,24}"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Display name</span>
              <input
                required
                maxLength={80}
                value={profile.display_name}
                onChange={(e) =>
                  setProfile({ ...profile, display_name: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Bio</span>
              <textarea
                maxLength={300}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </label>
            <button className="button secondary" disabled={busy}>
              Save profile
            </button>
          </form>
          <div className="actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const { error } = await client.auth.signOut({ scope: "local" });
                setBusy(false);
                if (error) setError(error.message);
              }}
            >
              Sign out on this device
            </button>
            <button className="text-button" onClick={() => setMode("password")}>
              Change password
            </button>
          </div>
          <p className="footnote">
            Signing out hides this account’s records. Your separate device-only
            records remain unchanged.
          </p>
          <button
            className="button secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const { data, error } = await client.rpc(
                  "export_account_data",
                  { p_account_id: user.id },
                );
                if (error) throw error;
                const a = document.createElement("a");
                a.href = URL.createObjectURL(
                  new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  }),
                );
                a.download = "lex-active-account-export.json";
                a.click();
                setTimeout(() => URL.revokeObjectURL(a.href), 1000);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Export failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Export cloud data (JSON, no image files)
          </button>
          <details className="delete-account">
            <summary>Delete account permanently</summary>
            <p>
              This deletes the account, cloud records and uploaded files. Export
              a backup first. Unsynced account changes on this device will also
              be removed; separate device-only records stay intact.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  String(new FormData(e.currentTarget).get("confirmation")) !==
                  "DELETE"
                )
                  return;
                if (
                  !confirm(
                    "Permanently delete your account and its cloud data? This cannot be undone.",
                  )
                )
                  return;
                setBusy(true);
                setError("");
                try {
                  const { data, error } = await client.functions.invoke(
                    "delete-account",
                    { body: { confirmation: "DELETE" } },
                  );
                  if (error || !data?.deleted)
                    throw Error(
                      "Account deletion could not finish. Your device records have been preserved.",
                    );
                  await client.auth.signOut({ scope: "local" });
                  localStorage.removeItem(storageKey);
                  indexedDB.deleteDatabase(`lex-active-sync:${storageKey}`);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Deletion failed.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="field">
                <span>Type DELETE to confirm</span>
                <input
                  name="confirmation"
                  required
                  pattern="DELETE"
                  autoComplete="off"
                />
              </label>
              <button className="button secondary danger" disabled={busy}>
                Delete my account
              </button>
            </form>
          </details>
        </>
      ) : (
        <>
          <div className="chips">
            {(["login", "register", "recover"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                  setMessage("");
                }}
                className={mode === m ? "selected" : ""}
              >
                {m === "login"
                  ? "Sign in"
                  : m === "register"
                    ? "Create account"
                    : "Reset password"}
              </button>
            ))}
          </div>
          <form onSubmit={submit}>
            {mode !== "password" && (
              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </label>
            )}
            {mode !== "recover" && (
              <label className="field">
                <span>{mode === "password" ? "New password" : "Password"}</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </label>
            )}
            <button className="button" disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "login"
                  ? "Sign in"
                  : mode === "register"
                    ? "Create account"
                    : mode === "password"
                      ? "Update password"
                      : "Send recovery email"}
            </button>
          </form>
          <p className="footnote">
            Your device-only records are not uploaded automatically. You’ll
            choose whether to import them after signing in.
          </p>
        </>
      )}
    </div>
  );
}
