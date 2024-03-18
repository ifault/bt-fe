from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader
from .redis_client import get_db, get_pool, get_device

env = Environment(loader=FileSystemLoader("scripts"))
load_dotenv()


async def get_all_devices(is_dict=True):
    print(11)
    db = await get_db()
    print(22)
    keys = await db.keys('*')
    print(33)
    devices = []
    for key in keys:
        device_value = await db.get(key)
        device_ = {
            'device_id': key,
            'status': device_value
        }
        devices.append(device_)
    print("==============")
    return {"devices": devices} if is_dict else devices


async def update_device_status(device_id, status):
    db = await get_db()
    await db.set(device_id, status)


async def register_device(device_id):
    db = await get_db()
    await db.setnx(device_id, "等待")
    await db.expire(device_id, 10)


async def handle_devices(websocket, device_id):
    pool = await get_pool()
    device = await get_device()
    device_queue = await pool.lpop(f"queue:device:{device_id}")
    ticket = await pool.lpop(f"queue:ticket")
    if device_queue:
        reigester_account = await pool.lpop(f"queue:account")
        if reigester_account:
            await device.set(device_id, "准备登录账户")
            await websocket.send_text(reigester_account)
    elif ticket:
        book_device = await pool.lpop(f"queue:book:{device_id}")
        if book_device:
            print("book_ticket")
            await device.set(device_id, "准备订票")
            await websocket.send_text(ticket)

    await websocket.send_text("")
