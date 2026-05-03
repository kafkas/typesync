# TypeScript integration suite

Integration tests for `typesync generate-ts`, exercising generated TypeScript
types against the **real** `firebase-admin` SDK talking to the Firestore
emulator.

The TypeScript generator emits **type-only** declarations, so the integration
suite gets value from two sources:

1. **`tsc --noEmit`** — verifies the generated types compile cleanly under the
   suite's strict tsconfig.
2. **vitest + emulator** — verifies the generated types actually match the
   wire shape produced by the Firestore admin SDK by performing a round-trip
   through the emulator.

## Running

From the repo root:

```bash
yarn test:integration:typescript
```

That script:

1. Generates TypeScript types from each schema under
   `tests/integration/_fixtures/schemas/` into
   `tests/integration/typescript/generated/<scenario>.ts`.
2. Runs `tsc --noEmit` against the suite's tsconfig (compile-time check).
3. Boots the Firestore emulator via `firebase emulators:exec`.
4. Runs `vitest` against the runtime round-trip tests (runtime check).
