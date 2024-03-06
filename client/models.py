from pydantic import BaseModel
from typing import Any, Union

class Project(BaseModel):
    id: str
    name: str
    completed: bool
    order: int
    createdBy: str
    topic: Union[None, str]
    owner: Any
