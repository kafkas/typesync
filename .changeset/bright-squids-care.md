---
'typesync-cli': minor
---

Add full Firestore `bytes` support across Typesync.

- support `bytes` in schema definitions, schema conversion, validation, and Zod generation
- generate the correct platform-specific bytes types for TypeScript, Python, Swift, and Firestore Rules
- add emulator-backed integration coverage for TypeScript, Python, and Swift bytes round-trips
