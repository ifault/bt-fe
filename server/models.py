from pydantic import BaseModel
from tortoise import fields
from tortoise.models import Model


class Login(BaseModel):
    token: str

class AccountRequest(BaseModel):
    id: str
    username: str
    password: str
    idcard: str
    date: str
    status: str = "0"
    category: str = ""


class IAccount(BaseModel):
    username: str
    password: str


class ITicket(BaseModel):
    category: str
    zhifubao: str = ""
    card: str
    date: str
    count: int
    uuid: str


class Tickets(Model):
    id = fields.IntField(pk=True)
    uuid = fields.CharField(max_length=36, unique=True, index=True)
    category = fields.CharField(max_length=255)
    zhifubao = fields.CharField(max_length=255)
    card = fields.CharField(max_length=255)
    date = fields.CharField(max_length=255)
    count = fields.IntField()

    class Meta:
        table = "tickets"

class IDeleteTicket(BaseModel):
    uuid: str


class IUpdate(BaseModel):
    ticket_id: str = ""
    device_id: str = ""
    status: str = ""


if __name__ == '__main__':
    pass