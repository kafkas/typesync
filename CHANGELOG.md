# Changelog

## 0.6.1

### Patch Changes

- f76f431: Models are now sorted alphabetically in the schema.

## 0.6.0

### Minor Changes

- 339c4a7: [BREAKING] Renamed `platform` option to `target`.
- b82f2ae: [BREAKING] Changed platform names to remove the language prefix and change the last `:` to `@` (e.g. `ts:firebase:10` -> `firebase@10`)
- 7612def: Implemented a programmatic API which allows developers to import `typesync-cli` in their Node applications and generate types programmatically.
- d48bd06: [BREAKING] Split `generate` into `generate-ts`, `generate-swift` and `generate-py` commands.
- 59c4a29: Implemented the Security Rules generator. The `generate-rules` command will generate and inject type validators for a given definition into the specified Security Rules file.

### Patch Changes

- 79d2420: Improved `validate` command to capture more error types.

## 0.5.0

### Minor Changes

- f5cdb96: Changed the default `indentation` to 2.
- ac4beb4: Implemented `customPydanticBase` option that makes generated models extend from a custom Pydantic base class.

## 0.4.2

### Patch Changes

- f901a26: Fixed a bug where the Swift generator was ignoring the `indentation` parameter.

## 0.4.1

### Patch Changes

- 66c26bf: Fixed missing Swift doc comments.

## 0.4.0

### Minor Changes

- 97071de: Extra attributes for Pydantic classes in Python output are now disallowed by default.
- 97071de: Implemented the `additionalFields` config that allows arbitrary fields on object types.

## 0.3.0

### Minor Changes

- ca6c95f: Implemented the Swift generator and the 'swift:firebase:10' platform.
- 90752a3: Implemented `unknown` type.

## 0.2.1

### Patch Changes

- 54faaaa: Enums with duplicate member values or labels are now disallowed.
- 54faaaa: Enums with 0 members are now disallowed.
- 9925007: Fixed a bug where a simple union definition with an extra 'discriminant' key was parsed without errors.
