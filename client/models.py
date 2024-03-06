import typing
import datetime
import enum
import pydantic

Username = str

class UserRole(enum.Enum):
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"


class UserProfile(pydantic.BaseModel):
    username: Username
    age: int
    role: UserRole
    created_at: datetime.datetime
    address: Address
    bio: typing.Union[None, str]
    area_code: typing.Literal[34]
