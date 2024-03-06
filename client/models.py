import typing
import pydantic

class Project(pydantic.BaseModel):
    id: str
    name: str
    completed: bool
    order: int
    createdBy: str
    topic: typing.Union[None, str]
    owner: typing.Any
