import aioredis


async def get_pool() -> aioredis.Redis:
    return await aioredis.from_url(
        "redis://localhost", encoding="utf-8", decode_responses=True
    )


async def get_manager_pool() -> aioredis.Redis:
    return await aioredis.from_url(
        "redis://localhost/1", encoding="utf-8", decode_responses=True
    )


async def socket_enabled():
    redis = await get_pool()
    return await redis.get("socket_enabled") == "true"


async def toggle_value(key):
    redis = await get_pool()
    current_value = await redis.get(key)
    boolean_value = current_value == b'True'
    toggled_value = not boolean_value
    await redis.set(key, str(toggled_value))
    return toggled_value


async def clean():
    redis = await get_pool()
    await redis.delete("device_queue")


async def add_device_to_avalible_list(device_id: str, message: str):
    redis = await get_pool()
    manager = await get_manager_pool()
    await redis.sadd("device_queue", device_id)
    await redis.expire("device_queue", 60 * 30)
    await manager.lpush("notify_queue", message)
    await manager.expire("notify_queue", 60 * 10)
