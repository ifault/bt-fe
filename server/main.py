import json
import os
import jwt
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from tortoise import Tortoise
from utils.service import register_device, handle_devices, get_all_devices, update_device_status
from jwt.exceptions import InvalidTokenError
from api import router
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await websocket.accept()
    try:
        if device_id == "manager":
            token = await websocket.receive_text()
            jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        while True:
            await websocket.receive_text()
            if device_id == "manager":
                response = await get_all_devices(True)
                response = json.dumps(response)
                await websocket.send_text(response)
            else:
                await register_device(device_id)
                await handle_devices(websocket, device_id)

    except InvalidTokenError:
        print("Invalid token")
        await websocket.send_text("401")
    except Exception as e:
        print("Other exception occurred")
        print(e)


@app.on_event("startup")
async def srartup_event():
    try:
        await Tortoise.init(
            db_url=os.getenv("DATABASE_URL"),
            modules={'models': ['models']}
        )
        await Tortoise.generate_schemas()
    except Exception as e:
        pass


@app.on_event("shutdown")
async def shutdown_event():
    await Tortoise.close_connections()


app.include_router(router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.getenv("HOST"), port=8000)
