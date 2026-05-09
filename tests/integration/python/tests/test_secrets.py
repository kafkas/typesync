"""Round-trip tests for the `secrets` fixture.

Verifies that the `bytes` primitive emitted by the Python generator
(`bytes` / `typing.List[bytes]`) round-trips correctly through the
Firestore emulator using the official `google-cloud-firestore` client,
which is what `firebase-admin` uses underneath. The Firestore Python
client maps Python `bytes` directly to the protobuf `bytes_value` and
decodes them back into Python `bytes` on read.
"""

from __future__ import annotations

import base64
import json
import uuid
from pathlib import Path

import pytest
from google.cloud import firestore


def _load_sample(fixtures_root: Path, name: str) -> dict:
    return json.loads((fixtures_root / "samples" / "secrets" / f"{name}.json").read_text())


@pytest.fixture
def secrets_module(import_generated_module):
    return import_generated_module("secrets")


def test_secret_round_trips_bytes_via_firestore_emulator(
    secrets_module,
    fixtures_root: Path,
    firestore_client: firestore.Client,
    isolated_collection: firestore.CollectionReference,
) -> None:
    """A document with multiple `bytes` fields (including a list of bytes)
    survives a Pydantic-validate -> emulator-write -> emulator-read ->
    Pydantic-validate cycle byte-for-byte."""

    Secret = secrets_module.Secret

    sample = _load_sample(fixtures_root, "api-key")
    payload = base64.b64decode(sample["payload_base64"])
    checksum = base64.b64decode(sample["checksum_base64"])
    shards = [base64.b64decode(s) for s in sample["shards_base64"]]

    # Sanity-check the fixture itself: a buggy generator that aliased
    # every bytes field to the same value would still pass otherwise.
    assert len(payload) > 0
    assert len(checksum) == 32
    assert payload != checksum
    assert len(shards) == 3

    secret_in = Secret.model_validate(
        {
            "label": sample["label"],
            "payload": payload,
            "checksum": checksum,
            "shards": shards,
            "created_at": sample["created_at"],
        }
    )

    # The generator emits Pydantic types that store bytes verbatim; check
    # that nothing has been auto-coerced (e.g. to a base64 string) before
    # we even reach Firestore.
    assert isinstance(secret_in.payload, bytes)
    assert isinstance(secret_in.checksum, bytes)
    assert all(isinstance(s, bytes) for s in secret_in.shards)
    assert secret_in.payload == payload
    assert secret_in.checksum == checksum

    doc_ref = isolated_collection.document(uuid.uuid4().hex)
    doc_ref.set(secret_in.model_dump())

    snapshot = doc_ref.get()
    assert snapshot.exists, "expected the written document to be readable"

    raw = snapshot.to_dict()
    # Wire-level expectations: the Firestore Python client returns bytes
    # as plain `bytes` for both top-level fields and entries nested
    # inside a list.
    assert isinstance(raw["payload"], bytes)
    assert isinstance(raw["checksum"], bytes)
    assert isinstance(raw["shards"], list)
    assert all(isinstance(s, bytes) for s in raw["shards"])

    # Re-validate through the generated Pydantic model to confirm the
    # generated schema round-trips without rejecting plain `bytes`.
    secret_out = Secret.model_validate(raw)
    assert secret_out.label == sample["label"]
    assert secret_out.payload == payload
    assert secret_out.checksum == checksum
    assert secret_out.shards == shards


def test_secret_rejects_non_bytes_payload(secrets_module) -> None:
    """The generated Pydantic class should reject obvious type mismatches
    on the bytes-typed fields (e.g. a dict where bytes are expected).
    Pydantic accepts `str` as input for `bytes` (encoding it as UTF-8),
    so we use a non-string non-bytes value to make the rejection
    unambiguous."""

    Secret = secrets_module.Secret

    with pytest.raises(Exception):
        Secret.model_validate(
            {
                "label": "x",
                "payload": {"not": "bytes"},
                "checksum": b"\x00",
                "shards": [],
                "created_at": "2024-01-01T00:00:00.000Z",
            }
        )
