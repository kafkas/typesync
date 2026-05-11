import { Timestamp } from 'firebase-admin/firestore';
import { describe, expect, it } from 'vitest';

import * as v3Admin from '../generated/v3/secrets.js';
import * as v4Web from '../generated/v4-web/secrets.js';
import * as v4Admin from '../generated/v4/secrets.js';

// Pure-Zod parsing tests for the `secrets` fixture (which exercises
// the `bytes` primitive). The bytes representation differs per target:
//
//   * firebase-admin: Node `Buffer` (z.instanceof(Buffer))
//   * firebase web SDK: firestore.Bytes (z.instanceof(firestore.Bytes))
//
// We exercise all three combinations the orchestrator emits today:
//   v3 admin, v4 admin, v4 web.

const ts = new Timestamp(1_700_000_000, 0);

const adminInput = () => ({
  label: 'API key',
  payload: Buffer.from([0x01, 0x02, 0x03]),
  checksum: Buffer.from(new Uint8Array(32)),
  shards: [Buffer.from([0xff]), Buffer.from([0xfe])],
  created_at: ts,
});

describe.each([
  { name: 'v3 admin', mod: v3Admin },
  { name: 'v4 admin', mod: v4Admin },
])('secrets admin ($name)', ({ mod }) => {
  it('accepts a Secret built from Buffer values', () => {
    expect(mod.SecretSchema.safeParse(adminInput()).success).toBe(true);
  });
  it('rejects a Secret whose payload is a base64 string instead of bytes', () => {
    expect(mod.SecretSchema.safeParse({ ...adminInput(), payload: 'AQID' }).success).toBe(false);
  });
  it('rejects a Secret whose `shards` list contains a non-Buffer entry', () => {
    expect(mod.SecretSchema.safeParse({ ...adminInput(), shards: [Buffer.from([1]), 'not bytes'] }).success).toBe(
      false
    );
  });
  it('accepts an empty `shards` list', () => {
    expect(mod.SecretSchema.safeParse({ ...adminInput(), shards: [] }).success).toBe(true);
  });
});

describe('secrets web (v4)', () => {
  it('rejects Buffer-typed bytes against the firestore.Bytes-bound schema', () => {
    // The web schema expects firestore.Bytes (an entirely different class
    // from Buffer), so passing a Buffer should fail at parse time. We don't
    // construct a `firestore.Bytes` instance here because it requires
    // initializing the Firebase web SDK; the dedicated emulator round-trip
    // in `secrets.web.test.ts` covers the positive path.
    expect(v4Web.SecretSchema.safeParse(adminInput()).success).toBe(false);
  });
});
