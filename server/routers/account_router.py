from typing import List

from fastapi import APIRouter
from models import Accounts
from pydantic_models import IAccount
from utils.service import account_to_dict

account_router = APIRouter()


@account_router.get("/accounts")
async def get_accounts():
    accounts = await Accounts.all()
    account_dicts = [account_to_dict(account) for account in accounts]
    return account_dicts


@account_router.post("/accounts")
async def store_accounts(accounts: List[IAccount]):
    account_objects = [
        Accounts(uuid=account.uuid, username=account.username, password=account.password)
        for account in accounts
    ]
    await Accounts.bulk_create(account_objects, on_conflict=("username",), update_fields=["password"])


@account_router.delete("/accounts")
async def delete_accounts():
    await Accounts.all().delete()
