---
"typesync-cli": minor
---

**Breaking:** The Swift renderer now emits `@DocumentID var id: String?` and `import FirebaseFirestore` for every `model: document` declaration, so callers can round-trip generated structs through Firestore's `Codable` SDK without threading the document ID separately. Alias structs are unaffected.

Existing consumers should expect:

- The synthesized memberwise initializer of every document struct gains `id: String? = nil` as its first parameter; positional callers (rare) need to update.
- Generated files now carry an `import FirebaseFirestore` line — projects must link `FirebaseFirestore` (or the legacy `FirebaseFirestoreSwift` for Firebase iOS SDK ≤10.x).
- Decoding via `data(as: T.self)` now populates the `id` property from the snapshot's documentID; code that asserted on the absence of an `id` field will see the new value.
- Under Swift 6 strict concurrency, the `@DocumentID` wrapper blocks automatic `Sendable` inference; users hitting this can declare their own `extension MyDoc: @unchecked Sendable {}`.
- Any user-defined `extension MyDoc { var id: ... }` collides with the new property and must be removed.
