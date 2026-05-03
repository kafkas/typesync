# Integration tests

End-to-end tests that exercise typesync's generated code against the **real**
Firebase SDK for each target platform, talking to the **Firestore emulator**.

These complement the unit and snapshot tests in `src/**/__tests__/` (which
verify the generator output as text) by verifying that:

1. Generated source compiles in its native toolchain (`tsc`, `swift build`,
   Python type-checking via Pydantic).
2. Typed values can be encoded to a Firestore-compatible representation.
3. Reading those values back from the Firestore emulator deserializes into the
   same typed value.

## Layout

```
tests/integration/
  _fixtures/
    schemas/        Shared *.yml typesync schemas, one per scenario.
    samples/        Golden JSON fixtures that match the schemas above.
  python/           Python integration suite (Poetry + pytest + firebase-admin).
  swift/            Swift integration suite (SwiftPM + XCTest + Firebase iOS SDK).
  typescript/       TypeScript integration suite (vitest + tsc + firebase-admin).
```

The schemas under `_fixtures/schemas/` are the **single source of truth** for
the data shapes exercised across every platform. Each per-platform suite
generates code from those schemas and runs the same conceptual assertions
against them.

## Running locally

Each platform's suite has its own runner but the orchestration is uniform:
every suite is wrapped in `firebase emulators:exec`, which boots a Firestore
emulator on port `8080` (defined in `firebase.json`) for the duration of the
run and tears it down after.

```bash
yarn test:integration            # all platforms, sequentially
yarn test:integration:python     # Python only
yarn test:integration:swift      # Swift only
yarn test:integration:typescript # TypeScript only
```

Each suite assumes:

- the Firestore emulator is reachable at `localhost:8080`
  (`FIRESTORE_EMULATOR_HOST=localhost:8080`);
- the project ID is `demo-integration` (no real GCP project is touched).

When run via the `yarn test:integration:*` scripts, both assumptions are set
up automatically by `firebase emulators:exec`.

## Adding a scenario

1. Add a `*.yml` schema under `_fixtures/schemas/`.
2. Add one or more matching `*.json` samples under `_fixtures/samples/<scenario>/`.
3. In each per-platform suite, add a test that:
   - asks the suite's generation step to emit code from the new schema,
   - decodes the sample(s) into the generated types,
   - round-trips them through the emulator,
   - asserts equality.

When a new generator-level feature lands (e.g. `@DocumentID` on Swift document
models), add a scenario here first to lock in the contract before
implementing it.

## Per-platform requirements

| Platform   | Required toolchain                                 |
| ---------- | -------------------------------------------------- |
| Python     | Python 3.10+, [Poetry](https://python-poetry.org/) |
| Swift      | macOS, Swift 5.9+, Xcode command line tools        |
| TypeScript | Node 20+, the root project's `yarn install`        |

`firebase-tools` (already a devDependency at the repo root) is required for
all suites because it provides the emulator.
