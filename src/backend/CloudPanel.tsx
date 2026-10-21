import { useState } from "react";
import { load, KEY } from "../model";
import type { State } from "../model";
import type { SyncStatus } from "./sync";
import { mergeDeviceRecords } from "./records";
export function CloudPanel({
  state,
  status,
  onChange,
  onSync,
  onResolve,
}: {
  state: State;
  status: SyncStatus;
  onChange: (s: State) => boolean;
  onSync: () => void;
  onResolve: (id: string, choice: "device" | "cloud") => void;
}) {
  const [error, setError] = useState(""),
    [message, setMessage] = useState("");
  return (
    <section className="cloud-panel">
      <h3>Cloud & device records</h3>
      <p>
        {status.state === "synced"
          ? "Account records are saved to cloud."
          : status.state === "syncing"
            ? "Checking cloud records…"
            : status.state === "offline"
              ? `Offline · ${status.pending} changes waiting on this device.`
              : status.state === "conflict"
                ? "Some records changed on another device. Choose which version to keep."
                : status.state === "error"
                  ? "Cloud sync needs attention. Your device records are still saved."
                  : `${status.pending} changes waiting to sync.`}
      </p>
      {status.error && <p role="alert">{status.error}</p>}
      <button className="button secondary" onClick={onSync}>
        Sync now
      </button>
      {status.conflicts.map((row) => (
        <div className="sync-conflict" key={row.id}>
          <h3>{row.kind} conflict</h3>
          <p>{row.recordId}</p>
          <div className="conflict-versions">
            <div>
              <h4>This device</h4>
              <pre>{JSON.stringify(row.payload, null, 2)}</pre>
            </div>
            <div>
              <h4>Cloud</h4>
              <pre>{JSON.stringify(row.conflict?.payload, null, 2)}</pre>
            </div>
          </div>
          <p>
            Choosing a version can replace or remove this record. The unchosen
            device version is retained in the local sync recovery archive.
          </p>
          <div className="actions">
            <button
              className="button secondary"
              onClick={() => {
                if (
                  confirm(
                    "Keep this device’s version and overwrite the cloud version of this record?",
                  )
                )
                  onResolve(row.id, "device");
              }}
            >
              Keep device version
            </button>
            <button
              className="button secondary"
              onClick={() => {
                if (
                  confirm(
                    "Use the cloud version instead of this device’s version of this record?",
                  )
                )
                  onResolve(row.id, "cloud");
              }}
            >
              Use cloud version
            </button>
          </div>
        </div>
      ))}
      <hr />
      <h3>Import existing device records</h3>
      <p>
        Device-only records remain separate from your account. Importing merges
        them by ID, keeps existing account versions, and leaves the device
        originals intact. This is never automatic.
      </p>
      <button
        className="button secondary"
        onClick={() => {
          setError("");
          setMessage("");
          try {
            const guest = load(KEY);
            if (
              !confirm(
                `Copy ${guest.workouts.length} training logs, ${guest.routines.length} routines and ${guest.foods.length} food entries into this account and queue them for cloud sync? Your original device records will remain.`,
              )
            )
              return;
            if (onChange(mergeDeviceRecords(state, guest)))
              setMessage(
                "Records copied into your account on this device. They remain queued until cloud acknowledgement.",
              );
          } catch {
            setError(
              "Device records could not be read. Export them before attempting recovery.",
            );
          }
        }}
      >
        Import device records into account
      </button>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
