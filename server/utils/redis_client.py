import aioredis


async def get_pool():
    return await aioredis.from_url(
        "redis://localhost/0", encoding="utf-8", decode_responses=True
    )


async def get_device():
    return await aioredis.from_url(
        "redis://localhost/1", encoding="utf-8", decode_responses=True
    )


async def get_db():
    return await aioredis.from_url(
        "redis://localhost/2", encoding="utf-8", decode_responses=True
    )