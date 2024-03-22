import asyncio
from fastapi import APIRouter, Request
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect

from shared import connections
from utils.device_manager import add_device_to_avalible_list

socket_router = APIRouter()
heartbeat_interval = 10
socket_enabled = True


@socket_router.websocket("/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    if not socket_enabled:
        print("websocket is not enabled")
        await websocket.close(reason="websocket is not enabled")
        return
    await websocket.accept()
    connections[device_id] = websocket
    await add_device_to_avalible_list(websocket.app.state.redis, device_id, f"设备({device_id})已连接")
    try:
        while True:
            try:
                await websocket.receive_text()
                connections[device_id] = websocket
                await websocket.send_text("pong")
                await asyncio.sleep(heartbeat_interval)
            except WebSocketDisconnect as e:
                print(f"设备({device_id})断开了连接")
    except Exception as e:
        print(f"发生了错误")


@socket_router.websocket("/admin/manager")
async def websocket_endpoint(websocket: WebSocket):
    if not socket_enabled:
        print("websocket is not enabled")
        await websocket.close(reason="websocket is not enabled")
        return
    await websocket.accept()
    try:
        while True:
            _, message = await websocket.app.state.redis.blpop('notify_queue')
            await websocket.send_text(message)
    except WebSocketDisconnect:
        print("manager断开了连接")
    except Exception as e:
        print(f"manager发生了错误 {e}")
        await websocket.close()


def toggle_socket():
    global socket_enabled
    socket_enabled = not socket_enabled
    return socket_enabled


def get_socketd_status():
    return socket_enabled
