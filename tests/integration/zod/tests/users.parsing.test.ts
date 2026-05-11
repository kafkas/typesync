import { Timestamp } from 'firebase-admin/firestore';
import { describe, expect, it } from 'vitest';

import * as v3 from '../generated/v3/users.js';
import * as v4 from '../generated/v4/users.js';

// Pure-Zod parsing tests for the shared `users` fixture (used by every
// generator's integration suite). Exercised against both the v3 and v4
// generated outputs to confirm that variant-specific surface differences
// (`z.object().strict()` vs `z.strictObject(...)`, `z.record(value)` vs
// `z.record(z.string(), value)`, …) do not change runtime semantics.

type Variant = 'v3' | 'v4';
const VARIANTS: Array<{ name: Variant; mod: typeof v3 | typeof v4 }> = [
  { name: 'v3', mod: v3 },
  { name: 'v4', mod: v4 },
];

const ts = new Timestamp(1_700_000_000, 0);

describe.each(VARIANTS)('users ($name)', ({ mod }) => {
  describe('UserRoleSchema', () => {
    it('accepts every defined role', () => {
      for (const role of ['owner', 'admin', 'member'] as const) {
        expect(mod.UserRoleSchema.safeParse(role).success).toBe(true);
      }
    });
    it('rejects unknown roles and non-strings', () => {
      expect(mod.UserRoleSchema.safeParse('visitor').success).toBe(false);
      expect(mod.UserRoleSchema.safeParse('').success).toBe(false);
      expect(mod.UserRoleSchema.safeParse(0).success).toBe(false);
    });
  });

  describe('UserSchema', () => {
    const baseInput = {
      username: 'alice',
      role: 'admin' as const,
      created_at: ts,
    };

    it('accepts a well-formed user document', () => {
      expect(mod.UserSchema.safeParse(baseInput).success).toBe(true);
    });

    it('rejects when a required field is missing', () => {
      expect(mod.UserSchema.safeParse({ username: 'alice', role: 'admin' }).success).toBe(false);
      expect(mod.UserSchema.safeParse({ username: 'alice', created_at: ts }).success).toBe(false);
    });

    it('rejects an extra field under strict semantics', () => {
      expect(mod.UserSchema.safeParse({ ...baseInput, extra: 'oops' }).success).toBe(false);
    });

    it('rejects a non-Timestamp `created_at`', () => {
      expect(mod.UserSchema.safeParse({ ...baseInput, created_at: '2024-01-01' }).success).toBe(false);
      expect(mod.UserSchema.safeParse({ ...baseInput, created_at: { seconds: 0, nanoseconds: 0 } }).success).toBe(
        false
      );
    });

    it('rejects a non-string username', () => {
      expect(mod.UserSchema.safeParse({ ...baseInput, username: 42 }).success).toBe(false);
    });
  });
});
