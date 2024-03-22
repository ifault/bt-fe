import asyncio
from fastapi import APIRouter
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect

from shared import connections
from utils.device_manager import add_device_to_avalible_list, get_manager_pool

socket_router = APIRouter()
heartbeat_interval = 10
socket_enabled = False


@socket_router.websocket("/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    if not socket_enabled:
        print("websocket is not enabled")
        await websocket.close(reason="websocket is not enabled")
        return
    await websocket.accept()
    connections[device_id] = websocket
    await add_device_to_avalible_list(device_id, f"设备({device_id})已连接")
    try:
        while True:
            try:
                message = await websocket.receive_text()
                if message == "close":
                    print("get closed from client")
                    break
                connections[device_id] = websocket
                await websocket.send_text("pong")
                await asyncio.sleep(heartbeat_interval)
            except WebSocketDisconnect as e:
                print(e)
    except Exception as e:
        print(f"发生了错误 {e.__traceback__}")
        connections.pop(device_id)


@socket_router.websocket("/admin/manager")
async def websocket_endpoint(websocket: WebSocket):
    if not socket_enabled:
        print("websocket is not enabled")
        await websocket.close(reason="websocket is not enabled")
        return
    await websocket.accept()
    redis = await get_manager_pool()
    try:
        while True:
            _, message = await redis.blpop('notify_queue')
            await websocket.send_text(message)
    except Exception as e:
        print(f"manager发生了错误 {e}")


def toggle_socket():
    global socket_enabled
    socket_enabled = not socket_enabled
    return socket_enabled


def get_socketd_status():
    return socket_enabled
