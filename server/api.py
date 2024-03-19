import json
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, FastAPI
from fastapi.security import OAuth2PasswordBearer as OAuth
import os
import jwt
from tortoise.contrib.pydantic import pydantic_model_creator

from models import Login, IAccount, ITicket, IUpdate, IDeleteTicket, Tickets
from server.utils.service import get_all_devices
from utils.redis_client import get_db, get_device, get_pool
router = APIRouter()
oauth2_scheme = OAuth(tokenUrl="/api/login")


@router.post("/verify")
def verify(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        return {"token": token, "payload": payload}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/login")
def login(form: Login):
    if form.token == os.getenv("TOKEN"):
        expires_in = datetime.now() + timedelta(days=7)
        token = jwt.encode({"sub": form.token, "exp": expires_in}, os.getenv("SECRET_KEY"), algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")


@router.post("/prepare")
async def start():
    db = await get_db()
    pool = await get_pool()
    accounts = await db.lrange("db:accounts", 0, -1)
    for account in accounts:
        await pool.lpush(f"queue:account", account)
    devices = await get_all_devices(False)
    for device in devices:
        await pool.lpush(f"queue:device:{device['device_id']}", device['device_id'])
    return {"success": "任务创建成功"}


@router.post("/book")
async def book():
    device = await get_device()
    pool = await get_pool()
    db = await get_db()
    tickets = await db.lrange("db:tickets", 0, -1)
    keys = await device.keys('*')
    for key in keys:
        print(f"queue:book:{key}")
        await pool.lpush(f"queue:book:{key}", key)
    for ticket in tickets:
        await pool.lpush(f"queue:ticket", ticket)
    return {"success": "任务创建成功"}


@router.post("/reset")
async def reset():
    device = await get_device()
    pool = await get_pool()
    device_keys = await device.keys('*')
    pool_keys = await pool.keys('*')
    if device_keys:
        await device.delete(*device_keys)
    if pool_keys:
        await pool.delete(*pool_keys)


@router.post("/accounts")
async def store_accounts(accounts: List[IAccount]):
    db = await get_db()
    if len(accounts) > 0:
        if await db.exists("db:accounts"):
            await db.delete("db:accounts")
        serialized_accounts = [account.dict() for account in accounts]
        await db.lpush("db:accounts", *[json.dumps(account) for account in serialized_accounts])
        print("accounts stored")
    else:
        await db.delete("db:accounts")


@router.get("/info")
async def get_info(db=Depends(get_db)):
    serialized_accounts = await db.lrange("db:accounts", 0, -1)
    accounts = []
    for serialized_account in serialized_accounts:
        account_data = json.loads(serialized_account)
        account = IAccount(**account_data)
        accounts.append(account)

    serialized_tickets = await db.lrange("db:tickets", 0, -1)
    tickets = []
    for serialized_ticket in serialized_tickets:
        ticket_data = json.loads(serialized_ticket)
        ticket = ITicket(**ticket_data)
        tickets.append(ticket)

    return {"accounts": accounts, "tickets": tickets}


@router.post("/update")
async def update(data: IUpdate):
    db = await get_db()
    device = await get_device()
    if data.ticket_id == "0":
        await device.set(data.device_id, data.status)
    else:
        pass


@router.post("/tickets")
async def store_tickets(tickets: List[ITicket]):
    creator = pydantic_model_creator(Tickets)
    objs = [creator(**ticket.model_dump()) for ticket in tickets]
    await Tickets.bulk_create(objs)


@router.post("/tickets/delete")
async def store_tickets(ticket: IDeleteTicket):
    db = await get_db()
    list_key = 'db:tickets'
    filtered_data = []
    if await db.exists(list_key):
        all_elements = await db.lrange(list_key, 0, -1)
        for element in all_elements:
            data = json.loads(element)
            if data.get('uuid') != ticket.uuid:
                filtered_data.append(json.dumps(data))
        await db.delete(list_key)
        await db.rpush(list_key, *filtered_data)
