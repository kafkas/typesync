import typing
import datetime
import enum
import pydantic

class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class UserProfile(pydantic.BaseModel):
    username: str
    age: int
    role: typing.Any
    created_at: datetime.datetime
    address: typing.Any
    bio: typing.Union[None, str]
    area_code: typing.Literal[34]
