---
"typesync-cli": patch
---

Reorganize the integration test suite. The previous one-off Python project at
`tests/test-poetry-project/` is replaced with a unified `tests/integration/`
layout that shares schema fixtures across Python, Swift and TypeScript suites,
each running their generated output against the official Firebase SDK and the
Firestore emulator. CI now runs all three suites on every PR.

This is internal-only; no public API or generator output changes.
