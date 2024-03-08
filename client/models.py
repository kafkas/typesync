from __future__ import annotations

import typing
import datetime
import enum
import pydantic

class TypeSyncUndefined:
    _instance = None

    def __init__(self):
        if TypeSyncUndefined._instance is not None:
            raise RuntimeError("TypeSyncUndefined instances cannot be created directly. Use UNDEFINED instead.")
        else:
            TypeSyncUndefined._instance = self

UNDEFINED = TypeSyncUndefined()

Username = str

class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"


class UserProfile(pydantic.BaseModel):
    username: Username
    age: int
    is_active: bool
    role: UserRole
    created_at: datetime.datetime
    location: tuple[int, int]
    address: Address
    favorite_numbers: typing.List[int]
    pets: typing.List[Pet]
    bio: typing.Union[None, str]
    area_code: typing.Literal[34]
