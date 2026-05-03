# Python integration suite

Integration tests for `typesync generate-py`, exercising the generated
Pydantic models against the **real** `google-cloud-firestore` client talking
to the Firestore emulator.

## Running

From the repo root:

```bash
yarn test:integration:python
```

That script:

1. Generates Pydantic models from each schema under
   `tests/integration/_fixtures/schemas/` into
   `tests/integration/python/generated/<scenario>.py`.
2. Boots the Firestore emulator via `firebase emulators:exec`.
3. Runs `poetry run pytest` against the generated models.

## Running by hand

```bash
# 1. Install Python deps once.
cd tests/integration/python
poetry install

# 2. Generate models from a fixture (from repo root).
yarn tsx src/cli/index.tsx generate-py \
  --definition tests/integration/_fixtures/schemas/users.yml \
  --target firebase-admin@6 \
  --outFile tests/integration/python/generated/users.py

# 3. Run the suite under an emulator.
yarn firebase emulators:exec --project demo-integration --only firestore \
  'cd tests/integration/python && poetry run pytest'
```
