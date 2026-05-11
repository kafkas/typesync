---
'typesync-cli': minor
---

Add `generate-zod`, a new generator that emits Zod schemas from Typesync definitions with support for Zod v3 and v4 output.
Generated schemas include `.describe(...)` metadata, Firestore SDK target handling shared with `generate-ts`, optional `z.infer` type emission, and integration coverage for runtime validation.
