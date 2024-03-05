from pydantic import BaseModel
from typing import Any

class Project(BaseModel):
    id: str
    name: str
    completed: bool
    order: int
    createdBy: str
    topic: Any
    owner: Any
