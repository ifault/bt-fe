import aioredis


async def get_pool() -> aioredis.Redis:
    return await aioredis.from_url(
        "redis://localhost", encoding="utf-8", decode_responses=True
    )


async def get_manager_pool() -> aioredis.Redis:
    return await aioredis.from_url(
        "redis://localhost/1", encoding="utf-8", decode_responses=True
    )


async def add_device_to_avalible_list(device_id: str, message: str, clean: bool = False):
    redis = await get_pool()
    manager = await get_manager_pool()
    if clean:
        await redis.delete("device_queue")
    await redis.sadd("device_queue", device_id)
    await redis.expire("device_queue", 60 * 30)
    await manager.lpush("notify_queue", message)
    await manager.expire("notify_queue", 60 * 10)
