import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise import Tortoise
from settings import TORTOISE_ORM
from routers.login_router import login_router
from routers.task_router import task_router
from routers.account_router import account_router
from routers.ticket_router import ticket_router
from routers.socket_router import socket_router
from routers.device_router import device_router
from utils.device_manager import get_pool
from pydantic_models import IAccount, ITicket
from utils.service import subscribe_tasks
from typing import List
from models import Tasks, TicketHistory
from utils.service import ticket_to_content, account_to_content
import asyncio
import json
app = FastAPI()


@app.on_event("startup")
async def startup_event():
    await Tortoise.init(config=TORTOISE_ORM)
    await Tortoise.generate_schemas()
    redis = await get_pool()
    app.state.redis = redis
    asyncio.create_task(subscribe_tasks(redis))


@app.on_event("shutdown")
async def shutdown_event():
    await Tortoise.close_connections()
    await app.state.redis.delete('device_queue')
    app.state.redis.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(socket_router, prefix="/ws")
app.include_router(login_router, prefix="/api")
app.include_router(task_router, prefix="/api")
app.include_router(account_router, prefix="/api")
app.include_router(ticket_router, prefix="/api")
app.include_router(device_router, prefix="/api")


@app.post("/api/prepare")
async def prepare(accounts: List[IAccount]):
    for account in accounts:
        await Tasks.create(category=account.category,
                           uuid=account.uuid,
                           content=account_to_content(account))
        await app.state.redis.publish("tasks", json.dumps(account.dict()))
    return {"success": "任务创建成功"}


@app.post("/api/book")
async def start_tasks(tickets: List[ITicket]):
    for ticket in tickets:
        await Tasks.create(category=ticket.category,
                           uuid=ticket.uuid,
                           content=ticket_to_content(ticket))
        await app.state.redis.publish("tasks", json.dumps(ticket.dict()))
    ticket_objects = [
        TicketHistory(uuid=ticket.uuid,
                      category=ticket.category,
                      zhifubao=ticket.zhifubao,
                      card=ticket.card,
                      date=ticket.date,
                      count=ticket.count,
                      status="任务开始")
        for ticket in tickets
    ]
    await TicketHistory.bulk_create(ticket_objects)
    return {"success": "任务创建成功"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.getenv("HOST"), port=8000)
