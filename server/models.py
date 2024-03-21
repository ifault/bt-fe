from datetime import datetime
from tortoise import fields
from tortoise.models import Model


class Accounts(Model):
    uuid = fields.CharField(max_length=36, index=True)
    username = fields.CharField(max_length=255, unique=True, index=True)
    password = fields.CharField(max_length=255)


class Tickets(Model):
    id = fields.IntField(pk=True)
    uuid = fields.CharField(max_length=36, unique=True, index=True)
    category = fields.CharField(max_length=255)
    zhifubao = fields.CharField(max_length=255)
    card = fields.CharField(max_length=255)
    date = fields.CharField(max_length=255)
    count = fields.IntField()


class Tasks(Model):
    id = fields.IntField(pk=True)
    device = fields.CharField(max_length=255, index=True, null=True)
    uuid = fields.CharField(max_length=36, index=True)
    category = fields.CharField(max_length=255)
    content = fields.TextField()
    status = fields.CharField(max_length=255, null=True, default="等待可用设备")
    created_at = fields.DatetimeField(default=datetime.now)
    soft_deleted = fields.BooleanField(default=False)


class TicketHistory(Model):
    id = fields.IntField(pk=True)
    uuid = fields.CharField(max_length=36, index=True)
    category = fields.CharField(max_length=255)
    zhifubao = fields.CharField(max_length=255)
    card = fields.CharField(max_length=255)
    date = fields.CharField(max_length=255)
    count = fields.IntField()
    status = fields.CharField(max_length=255, null=True, default="")
    created_at = fields.DatetimeField(default=datetime.now)
