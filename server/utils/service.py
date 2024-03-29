import base64
import json
import os
import zlib
from datetime import datetime
from time import sleep
import asyncio
import aioredis
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader

from models import Tasks
from shared import connections

env = Environment(loader=FileSystemLoader("scripts"))
load_dotenv()


def ticket_to_dict(ticket):
    return {
        "uuid": ticket.uuid,
        "category": ticket.category,
        "zhifubao": ticket.zhifubao,
        "card": ticket.card,
        "date": ticket.date,
        "count": ticket.count
    }


def account_to_dict(account):
    return {
        "uuid": account.uuid,
        "username": account.username,
        "password": account.password
    }


def task_to_dict(task):
    return {
        "device": task.device,
        "category": task.category,
        "content": task.content,
        "status": task.status,
        "created_at": task.created_at
    }


def ticket_to_content(ticket):
    return f"{ticket.category} | {ticket.zhifubao} | {ticket.card} | {ticket.date} | {ticket.count} 张"


def account_to_content(account):
    return f"登录账号 | {account.username} | {account.password}"


async def subscribe_tasks(redis):
    try:
        while True:
            _, queue = await redis.blpop('task_queue')
            if queue:
                await handle_tasks(redis, json.loads(queue))
            await asyncio.sleep(1)
    except aioredis.exceptions.RedisError as e:
        print(f"Redis Error: {e}")
    except Exception as e:
        print(f"Error: {e}")


def switch_case(argument, arg):
    switcher = {
        '登录账号': handle_login,
        '一日票': handle_ticket_01,
        '早享卡': handle_ticket_02
    }
    func = switcher.get(argument, lambda: 'Invalid case')
    return func(arg)


async def handle_login(data):
    j2 = env.get_template(f"登录.j2")
    return j2.render(uuid=data['uuid'],
                     device_id=data['device'],
                     username=data['username'],
                     password=data['password'],
                     contact=os.getenv("PHONE"))


async def handle_ticket_01(data):
    j2 = env.get_template(f"一日票.j2")
    return j2.render(uuid=data['uuid'],
                     device=data['device'],
                     card=data['card'],
                     date=datetime.strptime(data['date'], "%Y-%m-%d").day,
                     count=data['count'],
                     zhifubao=data['zhifubao'],
                     contact=os.getenv("PHONE"))


async def handle_ticket_02(data):
    j2 = env.get_template(f"早享卡.j2")
    return j2.render(uuid=data['uuid'],
                     device=data['device'],
                     card=data['card'],
                     date=datetime.strptime(data['date'], "%Y-%m-%d").day,
                     count=data['count'],
                     zhifubao=data['zhifubao'],
                     contact=os.getenv("PHONE"))


async def handle_tasks(redis, message):
    device = await redis.spop('device_queue')
    if device:
        task = {}
        message['device'] = device
        uuid = message['uuid']
        print(f"GO here {message['category']}")
        await Tasks.filter(uuid=uuid).update(status="正在执行脚本", device=device)
        task['script'] = await switch_case(message['category'], message)
        result = json.dumps(task)
        print(result.encode().decode('unicode_escape'))
        result = base64.b64encode(result.encode("utf-8")).decode("utf-8")
        result = zlib.compress(result.encode(), level=9)
        await connections[device].send_text(result)
