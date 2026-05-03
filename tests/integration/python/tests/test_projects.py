"""Round-trip tests for the `projects` fixture."""

from __future__ import annotations

import json
import uuid
from pathlib import Path

import pytest
from google.cloud import firestore


def _load_sample(fixtures_root: Path, name: str) -> dict:
    return json.loads((fixtures_root / "samples" / "projects" / f"{name}.json").read_text())


@pytest.fixture
def projects_module(import_generated_module):
    return import_generated_module("projects")


def test_project_round_trips_via_firestore_emulator(
    projects_module,
    fixtures_root: Path,
    firestore_client: firestore.Client,
    isolated_collection: firestore.CollectionReference,
) -> None:
    Project = projects_module.Project

    sample = _load_sample(fixtures_root, "typesync")
    project_in = Project.model_validate(sample)

    doc_ref = isolated_collection.document(uuid.uuid4().hex)
    doc_ref.set(project_in.model_dump())

    snapshot = doc_ref.get()
    assert snapshot.exists, "expected the written document to be readable"

    project_out = Project.model_validate(snapshot.to_dict())
    assert project_out == project_in
    assert project_out.id == sample["id"]
    assert project_out.display_name == sample["display_name"]
