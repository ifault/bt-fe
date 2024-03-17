import json
import os
import base64
import aioredis
from fastapi import FastAPI
from datetime import datetime
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
env = Environment(loader=FileSystemLoader("scripts"))
load_dotenv()


def register_redis(app: FastAPI):
    async def redis_pool():
        redis = await aioredis.from_url(
            url=os.getenv('REDIS_URL'), db=1, encoding="utf-8", decode_responses=True
        )
        return redis

    async def redis_accounts():
        redis = await aioredis.from_url(
            url=os.getenv('REDIS_URL'), db=2, encoding="utf-8", decode_responses=True
        )
        return redis

    async def redis_order():
        redis = await aioredis.from_url(
            url=os.getenv('REDIS_URL'), db=3, encoding="utf-8", decode_responses=True
        )
        return redis


    @app.on_event("startup")
    async def srartup_event():
        app.redis = await redis_pool()
        app.redis_accounts = await redis_accounts()
        app.redis_order = await redis_order()

    @app.on_event("shutdown")
    async def shutdown_event():
        await app.redis.close()
        await app.redis_accounts.close()
        await app.redis_order.close()

async def get_all_devices(redis, accounts):
    keys = await redis.keys('*')
    account_keys = await accounts.keys('*')
    devices = []
    list = []
    for key in keys:
        if not key.startswith("queue"):
            status = await redis.get(key)
            if status:
                device = {
                    'device_id': key,
                    'status': status
                }
                devices.append(device)
    for key in account_keys:
        value = await accounts.get(key)
        list.append(json.loads(value))
    return {"devices": devices, "tasks": list}


async def handle_devices(websocket, redis, accounts, device_id):
    result = await redis.lpop(f"queue:{device_id}")
    if result:
        await redis.set(device_id, "准备接受脚本")
        task = await redis.lpop(f"queue:task")
        if task:
            task_json = json.loads(task)
            task_json['status'] = "1"
            template = env.get_template(f"{task_json['category']}.j2")
            await redis.set(device_id, f"工作中| {task_json['username']},{task_json['password']},{task_json['idcard']},{task_json['date']}")
            await accounts.set(task_json['id'], json.dumps(task_json))
            script = template.render(id=task_json['id'],
                                        device_id=device_id,
                                        idcard=task_json['idcard'],
                                        contact=os.getenv("PHONE"),
                                        day=datetime.strptime(task_json['date'], "%Y-%m-%d").day)
            json_response = json.dumps({
                "id": task_json['id'],
                "script": script
            })
            json_response = base64.b64encode(json_response.encode("utf-8")).decode("utf-8")
            await websocket.send_text(json_response)
    else:
        await redis.setnx(device_id, "闲置中")
    await redis.expire(device_id, 10)