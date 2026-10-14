import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, fixtureImportsTable, pool } from "@workspace/db";
import type { FixtureInput } from "@workspace/api-zod";

// Run against the development proxy only:
// NODE_ENV=development pnpm --filter @workspace/scripts exec tsx ../artifacts/api-server/src/tests/fixture-pitches.ts
assert.equal(process.env.NODE_ENV, "development", "This test writes temporary fixtures and must run in development only.");
assert.ok(process.env.REPORT_EDITOR_KEY, "Editor access must be configured.");
const base = "http://localhost:80/api";
const sourceName = `Fixture pitch integration test ${randomUUID()}`;
const team = "Neston Nomads U9 Vikings";
const sourceUrl = "https://fulltime.thefa.com/fixtures.html";

async function request(path: string, method = "GET", body?: unknown, authorized = true) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(authorized ? { "x-report-editor-key": process.env.REPORT_EDITOR_KEY! } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() as { fixtures: FixtureInput[] } };
}

try {
  const original = await request("/fixtures?season=2026%2F27");
  assert.equal(original.status, 200);
  const row = `17/10/2026\t09:00\t${team}\tTest opponents\tLeague\t${sourceUrl}`;
  assert.equal((await request("/fixture-imports/preview", "POST", { text: row }, false)).status, 401);
  assert.equal((await request("/fixtures", "PUT", {}, false)).status, 401);
  const legacy = await request("/fixture-imports/preview", "POST", { text: row });
  assert.equal(legacy.status, 200);
  assert.equal(legacy.data.fixtures[0].pitchAddress, null);
  assert.equal(legacy.data.fixtures[0].status, "scheduled");
  const statusImport = await request("/fixture-imports/preview", "POST", {
    text: `Date,Time,Home team,Away team,Competition,URL,Status\n17/10/2026,09:00,${team},Test opponents,League,${sourceUrl},Postponed`,
  });
  assert.equal(statusImport.status, 200);
  assert.equal(statusImport.data.fixtures[0].status, "postponed");
  assert.equal((await request("/fixture-imports/preview", "POST", { text: `${row}\t\t\tcancelled` })).data.fixtures[0].status, "cancelled");
  assert.equal((await request("/fixture-imports/preview", "POST", { text: `${row}\t\t\tunknown` })).status, 400);
  const tab = await request("/fixture-imports/preview", "POST", { text: `${row}\tMain pitch\t Test Road, Neston, CH64 0AA ` });
  assert.equal(tab.status, 200);
  assert.equal(tab.data.fixtures[0].pitchLocation, "Main pitch");
  assert.equal(tab.data.fixtures[0].pitchAddress, "Test Road, Neston, CH64 0AA");
  const csv = await request("/fixture-imports/preview", "POST", {
    text: `Date,Time,Home team,Away team,Competition,URL,Pitch location,Pitch address\n17/10/2026,09:00,${team},Test opponents,League,${sourceUrl},Main pitch,"Test Road, Neston, CH64 0AA"`,
  });
  assert.equal(csv.status, 200);
  assert.equal(csv.data.fixtures[0].pitchAddress, tab.data.fixtures[0].pitchAddress);
  const payload = { season: "2026/27", sourceName, sourceUrl, fixtures: tab.data.fixtures };
  const saved = await request("/fixtures", "PUT", payload);
  assert.equal(saved.status, 200);
  assert.equal(saved.data.fixtures[0].pitchLocation, "Main pitch");
  const read = await request("/fixtures?season=2026%2F27");
  assert.equal(read.data.fixtures[0].pitchAddress, "Test Road, Neston, CH64 0AA");
  for (const status of ["postponed", "cancelled", "scheduled"] as const) {
    const updated = await request("/fixtures", "PUT", {
      ...payload, fixtures: [{ ...payload.fixtures[0], status }],
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.fixtures[0].status, status);
    const persisted = await request("/fixtures?season=2026%2F27");
    assert.equal(persisted.data.fixtures[0].status, status);
    assert.equal(persisted.data.fixtures[0].pitchAddress, "Test Road, Neston, CH64 0AA");
  }
  assert.equal((await request("/fixtures", "PUT", {
    ...payload, fixtures: [{ ...payload.fixtures[0], status: "unknown" }],
  })).status, 400);
  const cleared = await request("/fixtures", "PUT", {
    ...payload, fixtures: [{ ...payload.fixtures[0], pitchLocation: "   ", pitchAddress: "" }],
  });
  assert.equal(cleared.status, 200);
  assert.equal(cleared.data.fixtures[0].pitchLocation, null);
  const reread = await request("/fixtures?season=2026%2F27");
  assert.equal(reread.data.fixtures[0].pitchAddress, null);
  assert.equal((await request("/fixtures", "PUT", {
    ...payload, fixtures: [{ ...payload.fixtures[0], pitchAddress: "x".repeat(501) }],
  })).status, 400);
  // Old clients may omit both optional fields entirely.
  const { pitchAddress: _address, pitchLocation: _location, status: _status, ...oldFixture } = payload.fixtures[0];
  const oldSaved = await request("/fixtures", "PUT", { ...payload, fixtures: [oldFixture] });
  assert.equal(oldSaved.status, 200);
  assert.equal(oldSaved.data.fixtures[0].status, "scheduled");
  await db.delete(fixtureImportsTable).where(eq(fixtureImportsTable.sourceName, sourceName));
  assert.deepEqual((await request("/fixtures?season=2026%2F27")).data, original.data);
  console.log("PASS: protected imports, status parsing and validation, persisted status changes and restoration to scheduled, pitch details, legacy inputs, and original schedule restoration.");
} finally {
  await db.delete(fixtureImportsTable).where(eq(fixtureImportsTable.sourceName, sourceName));
  await pool.end();
}
