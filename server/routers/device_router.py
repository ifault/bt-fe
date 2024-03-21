from fastapi import APIRouter

from shared import connections
from utils.device_manager import add_device_to_avalible_list

device_router = APIRouter()


@device_router.get("/devices")
async def get_devices():
    return [{"device_id": device_id, "status": "已连接"} for device_id in connections.keys()]


@device_router.delete("/devices")
async def reset_devices():
    for device in connections.keys():
        await add_device_to_avalible_list(device, f"设备{device}已重新连接", True)
    return {"success": "ok"}