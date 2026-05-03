---
'typesync-cli': minor
---

Swift: auto-emit `@DocumentID var id: String?` on every generated document-model struct, plus two new schema-level overrides for the Swift generator.

- The Firebase iOS SDK populates `@DocumentID` properties from the document path (and excludes them from the encoded body), so generated structs are now drop-in usable with `getDocument(as:)` / `setData(from:)` without manual edits.
- New per-document-model option `swift.documentIdProperty.name` lets you rename the auto-generated `@DocumentID` property (default: `id`). Set this when your document body already has a field whose Firestore key is `id`, since the Firebase iOS SDK refuses to decode a document where the `@DocumentID` property name matches a body wire key.
- New per-field option `swift.name` lets you rename a body property in the generated Swift output without changing its Firestore wire key. Useful for dodging Swift keywords or for ergonomics. The renderer routes the original Firestore key through a generated `CodingKeys` enum.
- The Swift generator now throws when (a) a document model has a body field whose Firestore key matches the `@DocumentID` property name (rename one or the other via the options above), or (b) two body fields resolve to the same Swift property name. Both errors include the offending field names and a concrete remediation.

This is a behavior change for Swift consumers: every generated document struct gains an `id: String?` property and an `import FirebaseFirestore` statement. Schemas with a body-side `id` field on a document model must opt in to a non-`id` `@DocumentID` property name via `swift: { documentIdProperty: { name: 'documentId' } }` (or similar) on the document model to keep generating successfully.

The new options are structured as per-platform blocks (`swift: { ... }`) so future generators (Python, TypeScript, etc.) can layer in their own field-level and model-level overrides without further breaking changes.
