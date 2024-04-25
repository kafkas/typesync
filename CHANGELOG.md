# Changelog

## 0.4.0

### Minor Changes

- 97071de: Extra attributes for Pydantic classes in Python output are now disallowed by default.
- 97071de: Implemented the `additionalFields` config that allows arbitrary fields on object types

## 0.3.0

### Minor Changes

- ca6c95f: Implemented the Swift generator and the 'swift:firebase:10' platform
- 90752a3: Implemented `unknown` type

## 0.2.1

### Patch Changes

- 54faaaa: Enums with duplicate member values or labels are now disallowed
- 54faaaa: Enums with 0 members are now disallowed
- 9925007: Fixed a bug where a simple union definition with an extra 'discriminant' key was parsed without errors
