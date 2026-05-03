# Swift integration suite

Integration tests for `typesync generate-swift`, exercising generated Swift
structs against the **real** Firebase iOS SDK (`firebase-ios-sdk`) talking to
the Firestore emulator.

## Running

From the repo root:

```bash
yarn test:integration:swift
```

That script:

1. Generates Swift source from each schema under
   `tests/integration/_fixtures/schemas/` into
   `tests/integration/swift/Sources/TypesyncIntegration/Generated/<scenario>.swift`.
2. Boots the Firestore emulator via `firebase emulators:exec`.
3. Runs `swift test` against the generated source.

## Toolchain requirements

- macOS (the suite has not been validated on Linux SwiftPM).
- Swift 5.9+ (Xcode 15 / `xcode-select --install`).
- `firebase-tools` (already a devDependency at the repo root).

## Notes

- The package depends on `firebase-ios-sdk` 10.29.0+. From 10.17 on,
  `@DocumentID` and the rest of the Codable extensions live directly in the
  `FirebaseFirestore` module, so we never need `FirebaseFirestoreSwift`.
- The first run pulls down the Firebase Apple SDK via SwiftPM, which can
  take a few minutes. Subsequent runs are fast.
- Tests connect to `localhost:8080` via `FIRESTORE_EMULATOR_HOST` and use the
  project ID `demo-integration` — no real GCP project is touched.
