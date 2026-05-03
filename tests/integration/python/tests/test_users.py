"""Round-trip tests for the `users` fixture."""

from __future__ import annotations

import json
import uuid
from pathlib import Path

import pytest
from google.cloud import firestore


def _load_sample(fixtures_root: Path, name: str) -> dict:
    sample_path = fixtures_root / "samples" / "users" / f"{name}.json"
    return json.loads(sample_path.read_text())


@pytest.fixture
def users_module(import_generated_module):
    return import_generated_module("users")


def test_pydantic_round_trip_via_firestore_emulator(
    users_module,
    fixtures_root: Path,
    firestore_client: firestore.Client,
    isolated_collection: firestore.CollectionReference,
) -> None:
    """A document validated by the generated Pydantic class survives a write
    + read round-trip through the emulator without losing equality."""

    User = users_module.User

    sample = _load_sample(fixtures_root, "john")
    user_in = User.model_validate(sample)
    payload = user_in.model_dump()

    doc_ref = isolated_collection.document(uuid.uuid4().hex)
    doc_ref.set(payload)

    snapshot = doc_ref.get()
    assert snapshot.exists, "expected the written document to be readable"

    user_out = User.model_validate(snapshot.to_dict())

    assert user_out == user_in
    assert user_out.username == sample["username"]
    # The generator emits `Config: use_enum_values = True`, so after validation
    # `role` holds the raw string value rather than the enum member.
    assert user_out.role == sample["role"]


def test_user_role_serializes_as_string(users_module) -> None:
    """The generated Python enum should serialize to its string value, which
    is what Firestore stores and what the schema enum members declare."""

    User = users_module.User
    UserRole = users_module.UserRole

    user = User.model_validate(
        {"username": "anyone", "role": "admin", "created_at": "2024-01-15T12:34:56.789Z"}
    )
    payload = user.model_dump()

    assert payload["role"] == UserRole.Admin.value == "admin"
