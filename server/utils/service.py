import json
import os

from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
from .redis_client import get_pool, get_device
import base64
env = Environment(loader=FileSystemLoader("scripts"))
load_dotenv()


async def get_all_devices(is_dict=True):
    db = await get_device()
    keys = await db.keys('*')
    devices = []
    for key in keys:
        device_value = await db.get(key)
        device_ = {
            'device_id': key,
            'status': device_value
        }
        devices.append(device_)
    return {"devices": devices} if is_dict else devices


async def update_device_status(device_id, status):
    db = await get_device()
    await db.set(device_id, status)


async def register_device(device_id):
    db = await get_device()
    await db.setnx(device_id, "等待")
    await db.expire(device_id, 10)


async def handle_devices(websocket, device_id):
    pool = await get_pool()
    device = await get_device()
    device_queue = await pool.lpop(f"queue:device:{device_id}")
    ticket_queue = await pool.lpop(f"queue:ticket")
    if device_queue:
        reigester_account = await pool.lpop(f"queue:account")
        if reigester_account:
            await device.set(device_id, "准备登录账户")
            template = env.get_template(f"01.j2")
            account = json.loads(reigester_account)
            script = template.render(id="0",
                                     device_id=device_id,
                                     username=account['username'],
                                     password=account['password'],
                                     server_url=os.getenv("API_SERVER_URL"))
            send_text = json.dumps({"script": script, "type": "login"})
            await websocket.send_text(base64.b64encode(send_text.encode()).decode())
    elif ticket_queue:
        book_device = await pool.lpop(f"queue:book:{device_id}")
        if book_device:
            await device.set(device_id, "准备订票")
            ticket = json.loads(ticket_queue)
            category = ticket['category']
            template = ""
            if category == '早享卡':
                template = env.get_template(f"02.j2")
            elif category == '一日票':
                template = env.get_template(f"03.j2")
            script = template.render(id=ticket['uuid'],
                                     device_id=device_id,
                                     count=ticket['count'],
                                     card=ticket['card'],
                                     date=ticket['date'],
                                     phone=os.getenv("PHONE"),
                                     zhifubao=ticket['zhifubao'],
                                     server_url=os.getenv("API_SERVER_URL"))
            print(script)
            send_text = json.dumps({"script": script, "type": category})
            await websocket.send_text(base64.b64encode(send_text.encode()).decode())

    await websocket.send_text("")
