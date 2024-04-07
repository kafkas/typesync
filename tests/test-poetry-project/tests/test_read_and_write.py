import subprocess
import signal
from pathlib import Path
import time
from typing import Generator
import os
import uuid
import pytest
from google.cloud import firestore
import test_poetry_project

FIRESTORE_EMULATOR_HOST = "localhost"
FIRESTORE_EMULATOR_PORT = "8080"

PACKAGE_ROOT = Path(test_poetry_project.__file__).parent
PROJECT_ROOT = PACKAGE_ROOT.parent
TYPESYNC_MODEL_IN_PATH = PACKAGE_ROOT / "models.yml"
TYPESYNC_OUTPUT_DIR_PATH = PACKAGE_ROOT


@pytest.fixture
def generated_typesync_python_schema_file() -> Generator[Path, None, None]:
    model_output_path = TYPESYNC_OUTPUT_DIR_PATH / "models.py"
    subprocess.run(
        [
            "npx",
            "typesync",
            "generate",
            "--platform",
            "py:firebase-admin:6",
            "--pathToDefinition",
            TYPESYNC_MODEL_IN_PATH.absolute().as_posix(),
            "--pathToOutputDir",
            TYPESYNC_OUTPUT_DIR_PATH.absolute().as_posix(),
        ],
        check=True,
    )
    yield model_output_path
    model_output_path.unlink()


@pytest.fixture
def input_json_paths() -> list[Path]:
    return [PACKAGE_ROOT / "sample.json"]


@pytest.fixture(scope="session")
def firestore_emulator() -> Generator[subprocess.Popen, None, None]:
    FIRESTORE_EMULATOR_HOST_PORT = (
        f"{FIRESTORE_EMULATOR_HOST}:{FIRESTORE_EMULATOR_PORT}"
    )
    firestore_process = subprocess.Popen(
        [
            "gcloud",
            "emulators",
            "firestore",
            "start",
            "--host-port",
            FIRESTORE_EMULATOR_HOST_PORT,
        ]
    )
    os.environ["FIRESTORE_EMULATOR_HOST"] = FIRESTORE_EMULATOR_HOST_PORT
    time.sleep(2)  # Wait until ready
    yield firestore_process
    os.killpg(firestore_process.pid, signal.SIGINT)


@pytest.fixture(scope="module")
def firestore_client():
    client = firestore.Client()
    yield client


def test_firestore_read_and_write(
    generated_typesync_python_schema_file: Path,
    firestore_emulator: subprocess.Popen,
    firestore_client: firestore.Client,
    input_json_paths: list[Path],
):
    from test_poetry_project.models import User

    for input_json_path in input_json_paths:
        user_validated_from_file = User.model_validate_json(input_json_path.read_text())
        user_dict_validated_from_file = user_validated_from_file.model_dump()

        collection_name = str(uuid.uuid1())
        doc_id = str(uuid.uuid1())

        firestore_client.collection(collection_name).document(doc_id).set(
            user_dict_validated_from_file
        )
        user_dict_read_from_firestore = (
            firestore_client.collection(collection_name)
            .document(doc_id)
            .get()
            .to_dict()
        )
        user_validated_from_firestore = User.model_validate(
            user_dict_read_from_firestore
        )

        assert (
            user_dict_read_from_firestore == user_dict_validated_from_file
        ), f"The JSON dict read and validated from Firestore must equal to that read and validated from the input file {input_json_path.as_posix()}!"
        assert (
            user_validated_from_firestore == user_validated_from_file
        ), f"The in memory obj read and validated from Firestore must equal to that read and validated from the input file {input_json_path.as_posix()}!"
