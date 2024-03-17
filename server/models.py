import os

from pydantic import BaseModel
from typing import List
from tortoise import fields, Tortoise
from tortoise.models import Model


class Orders(Model):
    datetime = fields.DatetimeField(auto_now_add=True)
    image = fields.TextField()

    class Meta:
        table = "orders"


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


class TaskRequest(BaseModel):
    type: str
    accounts: List[AccountRequest] = []


class DeviceRequest(BaseModel):
    device_id: str


class DeviceFreezeRequest(BaseModel):
    id: str
    device_id: str


class DevicesCapture(BaseModel):
    image: str


if __name__ == '__main__':
    pass