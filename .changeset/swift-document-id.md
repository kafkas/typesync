---
"typesync-cli": minor
---

The Swift renderer now emits `@DocumentID var id: String?` and an `import FirebaseFirestore` for every `model: document` declaration, so callers can round-trip generated structs through Firestore's `Codable` SDK without threading the document ID separately. Alias structs are unaffected.
