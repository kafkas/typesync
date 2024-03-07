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
    location: tuple[int, int]
    address: Address
    favorite_numbers: typing.List[int]
    pets: typing.List[Pet]
    bio: typing.Union[None, str]
    area_code: typing.Literal[34]
