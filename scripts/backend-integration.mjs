import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { localEnv } from "./local-env.mjs";
const env = localEnv(),
  url = "http://127.0.0.1:54321";
const make = () =>
  createClient(url, env.LOCAL_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const admin = createClient(url, env.LOCAL_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const users = [];
let a, b, c, au, bu, cu;
const ok = (r) => {
  assert.equal(r.error, null, r.error?.message);
  return r.data;
};
const write = async (
  client,
  uid,
  kind,
  payload,
  revision = 0,
  op = randomUUID(),
  recordId = payload.id,
) =>
  ok(
    await client.rpc("sync_write", {
      p_account_id: uid,
      p_kind: kind,
      p_record_id: recordId,
      p_payload: payload,
      p_expected_revision: revision,
      p_operation_id: op,
    }),
  );
const workout = (name = "Bench press") => ({
  id: randomUUID(),
  name: "Logged exercise",
  date: "2026-10-21",
  kind: "exercise",
  exercises: [
    {
      id: randomUUID(),
      name,
      sets: [{ id: randomUUID(), weight: 40, reps: 8, done: true }],
    },
  ],
});
const meal = () => ({
  id: randomUUID(),
  date: "2026-10-21",
  name: "Tofu meal",
  meal: "Lunch",
  calories: 450,
  protein: 25,
  carbs: 50,
  fat: 15,
});
before(async () => {
  for (let i = 0; i < 3; i++) {
    const client = make(),
      r = await client.auth.signUp({
        email: `lex-test-${randomUUID()}@example.test`,
        password: randomUUID() + "Aa1!",
      });
    ok(r);
    assert.ok(r.data.session, "Local Auth must issue a real verified session");
    users.push({ client, user: r.data.user });
  }
  [{ client: a, user: au }, { client: b, user: bu }, { client: c, user: cu }] =
    users;
});
after(async () => {
  for (const { client, user } of users) {
    const uploaded = await admin.storage.from("progress-photos").list(user.id);
    if (uploaded.data?.length)
      await admin.storage
        .from("progress-photos")
        .remove(
          uploaded.data.filter((f) => f.id).map((f) => `${user.id}/${f.name}`),
        );
    await admin.auth.admin.deleteUser(user.id);
    await client.auth.signOut({ scope: "local" });
  }
});
test("real Auth sessions, profiles and case-insensitive usernames", async () => {
  assert.equal(ok(await a.auth.getUser()).user.id, au.id);
  const username = "lex_" + randomUUID().slice(0, 8);
  ok(
    await a
      .from("profiles")
      .update({ username, display_name: "Local test account" })
      .eq("id", au.id),
  );
  const duplicate = await b
    .from("profiles")
    .update({ username: username.toUpperCase() })
    .eq("id", bu.id);
  assert.equal(duplicate.error?.code, "23505");
  const impersonate = await a
    .from("profiles")
    .update({ id: bu.id })
    .eq("id", au.id);
  assert.ok(impersonate.error);
});
test("normalised writes, idempotent retry, stale-write conflict and tombstone", async () => {
  const w = workout(),
    op = randomUUID();
  assert.equal((await write(a, au.id, "workout", w, 0, op)).revision, 1);
  assert.equal((await write(a, au.id, "workout", w, 0, op)).revision, 1);
  assert.equal(
    ok(await a.from("workout_sets").select("*").eq("owner_id", au.id)).length,
    1,
  );
  assert.equal(
    (await write(a, au.id, "workout", { ...w, name: "Stale" }, 0)).status,
    "conflict",
  );
  assert.equal(ok(await b.from("workout_sessions").select("*")).length, 0);
  const spoof = await b.rpc("sync_write", {
    p_account_id: au.id,
    p_kind: "workout",
    p_record_id: w.id,
    p_payload: w,
    p_expected_revision: 0,
    p_operation_id: randomUUID(),
  });
  assert.equal(spoof.error?.code, "42501");
  assert.equal(
    (await write(a, au.id, "workout", null, 1, randomUUID(), w.id)).revision,
    2,
  );
  const catalog = ok(await a.rpc("sync_catalog", { p_account_id: au.id }));
  assert.equal(catalog.find((r) => r.recordId === w.id).payload, null);
  assert.ok((await b.rpc("sync_catalog", { p_account_id: au.id })).error);
});
test("friend consent, sensitive data, messages, exchange, blocking and revocation", async (t) => {
  const w = workout(),
    food = meal();
  await write(a, au.id, "workout", w);
  await write(a, au.id, "food", food);
  const r = ok(
    await a
      .from("friend_requests")
      .insert({ sender_id: au.id, recipient_id: bu.id })
      .select()
      .single(),
  );
  assert.ok(
    (await c.rpc("respond_friend_request", { request_id: r.id, accept: true }))
      .error,
  );
  ok(await b.rpc("respond_friend_request", { request_id: r.id, accept: true }));
  await t.test(
    "friendship does not reveal food diaries or body measurements",
    async () => {
      ok(
        await a.from("measurements").insert({
          owner_id: au.id,
          id: randomUUID(),
          date: "2026-10-21",
          measurement: "weight",
          value: 65,
          unit: "kg",
        }),
      );
      assert.deepEqual(ok(await b.from("food_entries").select("*")), []);
      assert.deepEqual(ok(await b.from("measurements").select("*")), []);
      assert.deepEqual(ok(await c.from("workout_sessions").select("*")), []);
    },
  );
  await t.test(
    "granular sharing is revocable and protects identity fields",
    async () => {
      ok(
        await a.from("sharing_permissions").insert({
          owner_id: au.id,
          viewer_id: bu.id,
          category: "training_history",
        }),
      );
      assert.equal(ok(await b.from("workout_sessions").select("*")).length, 1);
      assert.deepEqual(ok(await b.from("food_entries").select("*")), []);
      ok(await a.from("sharing_permissions").delete().eq("viewer_id", bu.id));
      assert.deepEqual(ok(await b.from("workout_sessions").select("*")), []);
    },
  );
  const pair = [au.id, bu.id].sort();
  const conversation = ok(
    await a
      .from("conversations")
      .insert({ user_a: pair[0], user_b: pair[1] })
      .select()
      .single(),
  );
  const message = ok(
    await a
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: au.id,
        body: "Test message",
      })
      .select()
      .single(),
  );
  await t.test(
    "only authorised conversation participants can read or send",
    async () => {
      assert.equal(ok(await b.from("messages").select("*")).length, 1);
      assert.deepEqual(ok(await c.from("messages").select("*")), []);
      assert.ok(
        (
          await c.from("messages").insert({
            conversation_id: conversation.id,
            sender_id: cu.id,
            body: "Not allowed",
          })
        ).error,
      );
    },
  );
  const routine = {
    id: randomUUID(),
    name: "Exchange test",
    categories: [],
    exercises: w.exercises.map((e) => ({
      ...e,
      id: randomUUID(),
      sets: e.sets.map((s) => ({ ...s, id: randomUUID(), done: false })),
    })),
  };
  await write(a, au.id, "routine", routine);
  const exchangeId = ok(
    await a.rpc("send_workout_exchange", {
      routine_id: routine.id,
      target: bu.id,
      message: "Try this",
    }),
  );
  await t.test(
    "exchange snapshots are private and only the recipient can respond/return owned results",
    async () => {
      assert.deepEqual(ok(await c.from("workout_exchanges").select("*")), []);
      assert.ok(
        (
          await a.rpc("respond_workout_exchange", {
            exchange_id: exchangeId,
            accept: true,
          })
        ).error,
      );
      ok(
        await b.rpc("respond_workout_exchange", {
          exchange_id: exchangeId,
          accept: true,
        }),
      );
      assert.ok(
        (
          await b.rpc("return_exchange_results", {
            exchange_id: exchangeId,
            session_id: w.id,
          })
        ).error,
      );
      const own = workout();
      await write(b, bu.id, "workout", own);
      ok(
        await b.rpc("return_exchange_results", {
          exchange_id: exchangeId,
          session_id: own.id,
        }),
      );
      const result = ok(
        await a
          .from("exchange_results")
          .select("*")
          .eq("exchange_id", exchangeId),
      );
      assert.equal(result.length, 1);
      assert.ok(!JSON.stringify(result).includes("measurement"));
      assert.deepEqual(ok(await c.from("exchange_results").select("*")), []);
    },
  );
  await t.test(
    "private photo storage is not readable by friends without permission",
    async () => {
      const path = `${au.id}/privacy-test.png`;
      ok(
        await a.storage
          .from("progress-photos")
          .upload(path, new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), {
            contentType: "image/png",
          }),
      );
      assert.ok(
        (await b.storage.from("progress-photos").createSignedUrl(path, 60))
          .error,
      );
      assert.ok(
        (
          await c.storage
            .from("progress-photos")
            .upload(path, new Uint8Array([1]), { contentType: "image/png" })
        ).error,
      );
    },
  );
  await t.test(
    "blocking revokes existing messages, exchanges, feed and permissions",
    async () => {
      ok(await a.rpc("publish_workout", { session_id: w.id }));
      assert.equal(ok(await b.from("feed_posts").select("*")).length, 1);
      ok(
        await a.from("sharing_permissions").insert({
          owner_id: au.id,
          viewer_id: bu.id,
          category: "training_history",
        }),
      );
      ok(await a.from("blocks").insert({ owner_id: au.id, blocked_id: bu.id }));
      assert.deepEqual(
        ok(await b.from("messages").select("*").eq("id", message.id)),
        [],
      );
      assert.deepEqual(ok(await b.from("workout_exchanges").select("*")), []);
      assert.deepEqual(ok(await b.from("exchange_results").select("*")), []);
      assert.deepEqual(ok(await b.from("feed_posts").select("*")), []);
      assert.deepEqual(
        ok(await b.from("workout_sessions").select("*").eq("owner_id", au.id)),
        [],
      );
      assert.deepEqual(
        ok(
          await a
            .from("sharing_permissions")
            .select("*")
            .eq("viewer_id", bu.id),
        ),
        [],
      );
    },
  );
});

test("account deletion verifies identity and confirmation, removes owned files and cascades records", async () => {
  const client = make(),
    email = `lex-delete-${randomUUID()}@example.test`;
  const signup = await client.auth.signUp({
    email,
    password: randomUUID() + "Aa1!",
  });
  ok(signup);
  const doomed = signup.data.user;
  const endpoint = "http://127.0.0.1:54321/functions/v1/delete-account";
  assert.equal(
    (
      await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      })
    ).status,
    401,
  );
  const token = signup.data.session.access_token,
    headers = {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    };
  assert.equal(
    (
      await fetch(endpoint, {
        method: "POST",
        headers: { ...headers, origin: "https://unrelated.example" },
        body: '{"confirmation":"DELETE"}',
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(endpoint, {
        method: "POST",
        headers,
        body: '{"confirmation":"no"}',
      })
    ).status,
    400,
  );
  await write(client, doomed.id, "food", meal());
  ok(
    await client.storage
      .from("progress-photos")
      .upload(
        `${doomed.id}/delete-test.png`,
        new Uint8Array([137, 80, 78, 71]),
        { contentType: "image/png" },
      ),
  );
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ confirmation: "DELETE", userId: au.id }),
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).deleted, true);
  assert.ok((await admin.auth.admin.getUserById(doomed.id)).error);
  assert.equal(
    ok(await admin.storage.from("progress-photos").list(doomed.id)).length,
    0,
  );
  assert.ok((await admin.auth.admin.getUserById(au.id)).data.user);
});

test("complete account JSON export is scoped to the caller and contains no auth secrets", async () => {
  const data = ok(await a.rpc("export_account_data", { p_account_id: au.id }));
  assert.equal(data.profile.id, au.id);
  assert.ok(data.measurements.every((m) => m.owner_id === au.id));
  assert.ok(!JSON.stringify(data).includes("encrypted_password"));
  assert.ok(
    (await b.rpc("export_account_data", { p_account_id: au.id })).error,
  );
});

test("shared health photos are re-authorised per request and cannot bypass revocation using signed links", async () => {
  ok(await a.from("blocks").delete().eq("blocked_id", bu.id));
  const request = ok(
    await a
      .from("friend_requests")
      .insert({ sender_id: au.id, recipient_id: bu.id })
      .select()
      .single(),
  );
  ok(
    await b.rpc("respond_friend_request", {
      request_id: request.id,
      accept: true,
    }),
  );
  assert.deepEqual(
    ok(await a.from("sharing_permissions").select("*").eq("viewer_id", bu.id)),
    [],
  );
  const path = `${au.id}/revocation-test.png`;
  ok(
    await a.storage
      .from("progress-photos")
      .upload(path, new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), {
        contentType: "image/png",
      }),
  );
  ok(
    await a
      .from("sharing_permissions")
      .insert({
        owner_id: au.id,
        viewer_id: bu.id,
        category: "progress_photos",
      }),
  );
  const token = (await b.auth.getSession()).data.session.access_token;
  const requestPhoto = () =>
    fetch("http://127.0.0.1:54321/functions/v1/private-media", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ path }),
    });
  assert.equal((await requestPhoto()).status, 200);
  assert.ok(
    (await b.storage.from("progress-photos").createSignedUrl(path, 600)).error,
  );
  ok(
    await a
      .from("sharing_permissions")
      .delete()
      .eq("viewer_id", bu.id)
      .eq("category", "progress_photos"),
  );
  assert.equal((await requestPhoto()).status, 403);
  ok(
    await a
      .from("sharing_permissions")
      .insert({
        owner_id: au.id,
        viewer_id: bu.id,
        category: "progress_photos",
      }),
  );
  ok(await a.from("blocks").insert({ owner_id: au.id, blocked_id: bu.id }));
  assert.equal((await requestPhoto()).status, 403);
});
