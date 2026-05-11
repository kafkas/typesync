# Zod integration suite

Integration tests for `typesync generate-zod`. Verifies that the generated Zod schemas:

1. **Compile cleanly** under both Zod v3 and v4 with strict TypeScript (`tsc --noEmit`).
2. **Parse the right wire shapes** in pure-Zod tests (no emulator) — both positive and negative cases for primitives,
   enums, lists, records, nested objects, optionals, additional fields, simple unions, and discriminated unions.
3. **Round-trip through the Firestore emulator** when the underlying types involve Firestore-native values
   (`Timestamp`, `Bytes`/`Buffer`). Each generated schema is exercised against the same emulator-backed document the
   `generate-ts` integration suite uses, so we know the schema accepts the actual wire output of the SDK rather than
   what we *think* the wire shape is.

## Layout

```
tests/integration/zod/
  _fixtures/schemas/        Zod-only fixtures (e.g. discriminated unions) that
                            other generators don't have round-trip coverage for.
  generated/
    v3/<fixture>.ts         Schemas emitted with --variant v3 (admin SDK).
    v4/<fixture>.ts         Schemas emitted with --variant v4 (admin SDK).
    v4-web/<fixture>.ts     Schemas emitted with --variant v4 (firebase web SDK).
                            Only emitted for the `secrets` fixture today.
  tests/
    *.v3.test.ts            Pure-Zod parsing tests for the v3 outputs.
    *.v4.test.ts            Pure-Zod parsing tests for the v4 outputs.
    *.admin.test.ts         Firestore emulator round-trips parsed with the
                            firebase-admin v4 schemas.
    *.web.test.ts           Same, for the firebase web SDK v4 schemas.
```

The shared fixtures (`_fixtures/schemas/users.yml`, `projects.yml`, `secrets.yml` at the parent level) are pulled in
automatically alongside the zod-only fixtures.

## How v3 and v4 coexist in one Node project

Zod v3 and Zod v4 are incompatible at the import level. To exercise both in one place we install them as separate
aliased packages (`zod-v3`, `zod-v4`) at the repo root, and the integration orchestrator
(`scripts/integration-test.ts`) rewrites every `from 'zod'` in the generated files to either `from 'zod-v3'` or
`from 'zod-v4'` depending on the subdir. The generated files thus look like:

```ts
// generated/v3/users.ts
import { z } from 'zod-v3'; // ← rewritten by the orchestrator
// ...

// generated/v4/users.ts
import { z } from 'zod-v4'; // ← rewritten by the orchestrator
// ...
```

The post-processing is integration-only — every other consumer (`yarn build`, the published CLI, etc.) emits the
canonical `from 'zod'` form.

## Running

From the repo root:

```bash
yarn test:integration:zod
```

That script:

1. Generates v3, v4, and v4-web Zod schemas for each fixture under
   `tests/integration/_fixtures/schemas/` and `tests/integration/zod/_fixtures/schemas/`.
2. Rewrites the `zod` import in each generated file to its versioned alias.
3. Runs `tsc --noEmit` against the suite's tsconfig.
4. Boots the Firestore emulator via `firebase emulators:exec`.
5. Runs `vitest` against every test under `tests/`.
