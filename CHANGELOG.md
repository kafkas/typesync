# Changelog

## 0.15.0

### Minor Changes

- af90af1: Switch to the MIT license
- d0c4a18: Swift: auto-emit `@DocumentID var id: String?` on every generated document-model struct, plus two new schema-level overrides for the Swift generator.

  - The Firebase iOS SDK populates `@DocumentID` properties from the document path (and excludes them from the encoded body), so generated structs are now drop-in usable with `getDocument(as:)` / `setData(from:)` without manual edits.
  - New per-document-model option `swift.documentIdProperty.name` lets you rename the auto-generated `@DocumentID` property (default: `id`). Set this when your document body already has a field whose Firestore key is `id`, since the Firebase iOS SDK refuses to decode a document where the `@DocumentID` property name matches a body wire key.
  - New per-field option `swift.name` lets you rename a body property in the generated Swift output without changing its Firestore wire key. Useful for dodging Swift keywords or for ergonomics. The renderer routes the original Firestore key through a generated `CodingKeys` enum.
  - The Swift generator now throws when (a) a document model has a body field whose Firestore key matches the `@DocumentID` property name (rename one or the other via the options above), or (b) two body fields resolve to the same Swift property name. Both errors include the offending field names and a concrete remediation.

  This is a behavior change for Swift consumers: every generated document struct gains an `id: String?` property and an `import FirebaseFirestore` statement. Schemas with a body-side `id` field on a document model must opt in to a non-`id` `@DocumentID` property name via `swift: { documentIdProperty: { name: 'documentId' } }` (or similar) on the document model to keep generating successfully.

  The new options are structured as per-platform blocks (`swift: { ... }`) so future generators (Python, TypeScript, etc.) can layer in their own field-level and model-level overrides without further breaking changes.

## 0.14.0

### Minor Changes

- 4df7daa: Add runtime Firestore data validation with `typesync validate-data`.

  This introduces a new `validate-data` CLI command and `typesync.validateData()` API for validating live Firestore documents against Zod validators generated from Typesync schema definitions. The command supports targeted validation with repeatable `--model` flags, explicit full-schema validation with `--all-models`, Firebase Admin credentials, emulator/project overrides, scan limits, JSON output, progress reporting, and full report files.

  Also adds a shared schema-to-Zod runtime builder that will support future Zod code generation.

## 0.13.0

### Minor Changes

- 5233021: Implemented `firebase@11` target
- 5168a0e: Implemented `react-native-firebase@20` and `react-native-firebase@19` targets.

## 0.12.0

### Minor Changes

- 321e107: Added `firebase-admin@13` target
- 3807a68: Added `firebase-admin@10` target

## 0.11.0

### Minor Changes

- 0c3dd5a: Added support for react-native-firebase@21 target

## 0.10.0

### Minor Changes

- fc5f901: [BREAKING] `double` types now compile to `number` in Security Rules type validators
- 7502c83: [BREAKING] Renamed the `validatorNamePattern` option for the `generate-rules` command to `typeValidatorNamePattern`.
- 7502c83: [BREAKING] Renamed the `validatorParamName` option for the `generate-rules` command to `typeValidatorParamName`.

### Patch Changes

- 5a612cc: Changed the indentation for "and" predicates in Security Rules output.

## 0.9.0

### Minor Changes

- 9cd5312: Implemented the Mermaid graph generator. The `generate-graph` command will now generate a Mermaid graph for a given schema and inject it into the specified Markdown file.
- 9cd5312: [BREAKING] Document models are now required to have a `path` field.

## 0.8.0

### Minor Changes

- 2f7c904: Implemented the `objectTypeFormat` config option for TypeScript.
- bc61fd4: JSON definition files can now include a `$schema` key. This key will be ignored since it's used to load the JSON schema.
- ad6c602: Added an `any` type to the spec.

## 0.7.0

### Minor Changes

- 0706e1c: Implemented the `undefinedSentinelName` config option for Python.
- 85476ec: Implemented a change to expose factory methods for schema and schema types.
- 6a4f0bc: [BREAKING] Dropped support for mixed enums. Enum members must be either string or int.
- bf3418f: Implemented `generateRepresentation()` in the programmatic API.

### Patch Changes

- 0effd25: The `debug` key in `ValidateOptions` key is now optional.
- 441728a: The `startMarker` and `endMarker` options are now required to be distinct non-empty strings.
- 441728a: Improved the check that searches for markers in Rules file.
- fb2d7ba: Optional discriminant fields are now disallowed.

## 0.6.3

### Patch Changes

- ea55bee: Implemented a change that exposes the programmatic API as CommonJS.

## 0.6.2

### Patch Changes

- 3f39f7e: Fixed a bug where the process would exit with code 0 for failed commands. Exit code will now be 1 for errors.

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
