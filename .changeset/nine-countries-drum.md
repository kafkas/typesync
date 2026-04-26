---
'typesync-cli': minor
---

Add runtime Firestore data validation with `typesync validate-data`.

This introduces a new `validate-data` CLI command and `typesync.validateData()` API for validating live Firestore documents against Zod validators generated from Typesync schema definitions. The command supports targeted validation with repeatable `--model` flags, explicit full-schema validation with `--all-models`, Firebase Admin credentials, emulator/project overrides, scan limits, JSON output, progress reporting, and full report files.

Also adds a shared schema-to-Zod runtime builder that will support future Zod code generation.
