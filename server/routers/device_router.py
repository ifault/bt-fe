from fastapi import APIRouter,Request

from routers.socket_router import toggle_socket, get_socketd_status
from shared import connections
from utils.device_manager import add_device_to_avalible_list, clean

device_router = APIRouter()


@device_router.get("/devices")
async def get_devices():
    enbaled = get_socketd_status()
    return {"devices": [{"device_id": device_id, "status": "已连接"} for device_id in connections.keys()],
            "enabled": enbaled}


@device_router.put("/devices")
async def enable_websocket():
    websocket_enabled = toggle_socket()
    return {"enabled": websocket_enabled}


@device_router.delete("/devices")
async def reset_devices(request: Request):
    await clean(request.app.state.redis)
    for device in connections.keys():
        await add_device_to_avalible_list(device, f"设备{device}已重新连接")
    return {"success": "ok"}
