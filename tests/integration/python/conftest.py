import importlib
import os
import sys
import uuid
from pathlib import Path
from typing import Any, Generator, Iterator

import pytest
from google.cloud import firestore

# Layout invariant:
#   <repo_root>/tests/integration/python/conftest.py
#   <repo_root>/tests/integration/_fixtures/...
PYTHON_SUITE_ROOT = Path(__file__).resolve().parent
INTEGRATION_ROOT = PYTHON_SUITE_ROOT.parent
FIXTURES_ROOT = INTEGRATION_ROOT / "_fixtures"
GENERATED_ROOT = PYTHON_SUITE_ROOT / "generated"


def _ensure_emulator_env() -> None:
    """Fail fast if the Firestore emulator isn't reachable.

    The `yarn test:integration:python` wrapper sets these via
    `firebase emulators:exec`; running pytest directly requires the user to
    set them themselves.
    """
    if not os.environ.get("FIRESTORE_EMULATOR_HOST"):
        raise RuntimeError(
            "FIRESTORE_EMULATOR_HOST is not set. Run via "
            "`yarn test:integration:python` or wrap pytest in "
            "`firebase emulators:exec --only firestore '...'`."
        )
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "demo-integration")


def _import_generated(module_name: str) -> Any:
    """Import a freshly-generated module from the suite's `generated/` dir.

    We add `generated/` to `sys.path` lazily and reload the module so a
    stale import from a previous test session doesn't shadow new output.
    """
    if str(GENERATED_ROOT) not in sys.path:
        sys.path.insert(0, str(GENERATED_ROOT))
    if module_name in sys.modules:
        return importlib.reload(sys.modules[module_name])
    return importlib.import_module(module_name)


@pytest.fixture(scope="session", autouse=True)
def _emulator_guard() -> None:
    _ensure_emulator_env()


@pytest.fixture(scope="session")
def firestore_client() -> Iterator[firestore.Client]:
    client = firestore.Client(project=os.environ["GOOGLE_CLOUD_PROJECT"])
    yield client


@pytest.fixture
def fixtures_root() -> Path:
    return FIXTURES_ROOT


@pytest.fixture
def import_generated_module():
    """Returns a callable: `import_generated_module("users")` -> module."""

    def _impl(module_name: str) -> Any:
        return _import_generated(module_name)

    return _impl


@pytest.fixture
def isolated_collection(firestore_client: firestore.Client) -> Generator[firestore.CollectionReference, None, None]:
    """A fresh, randomly-named collection per test.

    Avoids cross-test contamination without having to clear the emulator
    between tests.
    """
    name = f"test_{uuid.uuid4().hex}"
    yield firestore_client.collection(name)
