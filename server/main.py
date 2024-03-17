import json
import os
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer as OAuth
from fastapi import Depends, FastAPI, HTTPException, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from tortoise import Tortoise
from models import Orders
from utils import register_redis, get_all_devices,handle_devices
from models import TaskRequest, DeviceFreezeRequest, DevicesCapture, Login
import base64
import jwt


app = FastAPI()

register_redis(app)
oauth2_scheme=OAuth(tokenUrl="/api/login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    print(websocket.client.host)
    redis = app.redis
    accounts = app.redis_accounts
    try:
        while True:
            message = await websocket.receive_text()
            response = ""
            if device_id == "manager":
                resposne = await get_all_devices(redis, accounts)
                response = json.dumps(resposne)
            else:
                await handle_devices(websocket, redis, accounts, device_id) 
            if message != "ping":
                pass
            await websocket.send_text(response)
    except jwt.exceptions.InvalidTokenError:
        await websocket.close()
    except Exception as e:
        await websocket.close()


@app.post("/api/reset")
async def reset():
    redis = app.redis
    accounts = app.redis_accounts
    await redis.flushall()
    await accounts.flushall()
    return {"success": "重置成功"}


async def create_table_if_not_exists():
    try:
        await Tortoise.init(
            db_url=os.getenv("DATABASE_URL"),
            modules={'models': ['models']}
        )
        await Tortoise.generate_schemas()
    except Exception as e:
        pass


@app.on_event("startup")
async def srartup_event():
    await create_table_if_not_exists()


@app.post("/api/capture")
async def freeze(device: DevicesCapture):
    await Orders.create(image=device.image)

@app.post("/api/freeze")
async def freeze(device: DeviceFreezeRequest):
    print("freeze function called")
    redis = app.redis
    accounts = app.redis_accounts
    await redis.set(device.device_id, "闲置中")

    acc = json.loads(await accounts.get(device.id))
    acc['status'] = "2"
    await accounts.set(device.id, json.dumps(acc))

    await redis.lpush(f"queue:{device.device_id}", device.device_id)
    return {"success": "释放成功"}


@app.post("/api/prepare")
async def start(task: TaskRequest):
    redis = app.redis
    accounts = app.redis_accounts
    pool = await get_all_devices(redis, accounts)
    for device in pool['devices']:
        await redis.lpush(f"queue:{device['device_id']}", device['device_id'])

    for account in task.accounts:
        acc = account.model_dump()
        acc['category'] = task.type
        await accounts.setnx(account.id, json.dumps(acc))
        await redis.lpush("queue:task", json.dumps(acc))

    return {"success": "任务创建成功"}


@app.post("/api/login")
def login(login: Login):
    if login.token == os.getenv("TOKEN"):
        expires_in = datetime.now() + timedelta(days=7)
        token = jwt.encode({"sub": login.token, "exp": expires_in}, os.getenv("SECRET_KEY"), algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")


@app.post("/api/verify")
def verify(token: str = Depends(oauth2_scheme)):
    try:
       print(token)
       payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
       return {"token": token, "payload": payload}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="192.168.3.194", port=8000)