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

# Model Definitions

Username = str

class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class Address(pydantic.BaseModel):
    street: str
    city: str
    zip_code: str

class Cat(pydantic.BaseModel):
    type: typing.Literal["cat"]
    name: str
    lives_left: int

class Dog(pydantic.BaseModel):
    type: typing.Literal["dog"]
    name: str
    breed: str

Pet = typing.Union[Cat, Dog]

class UserProfile(pydantic.BaseModel):
    username: Username
    age: int
    is_active: bool
    role: UserRole
    created_at: typing.Union[datetime.datetime, TypeSyncUndefined] = UNDEFINED
    location: tuple[int, int]
    address: Address
    favorite_numbers: typing.List[int]
    pets: typing.List[Pet]
    bio: typing.Union[None, str]
    area_code: typing.Literal[34]

    def __setattr__(self, name: str, value: typing.Any) -> None:
        super().__setattr__(name, value)

    def model_dump(self, **kwargs) -> typing.Dict[str, typing.Any]:
        model_dict = super().model_dump(**kwargs)
        return model_dict

    class Config:
        use_enum_values = True
