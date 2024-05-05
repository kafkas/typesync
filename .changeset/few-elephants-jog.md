---
"typesync-cli": patch
---

Fixed a bug where the process would exit with code 0 for failed commands. Exit code will now be 1 for errors.
