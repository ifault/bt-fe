async def clean(redis):
    await redis.delete("device_queue")


async def add_device_to_avalible_list(redis, device_id: str, message: str):
    await redis.sadd("device_queue", device_id)
    await redis.expire("device_queue", 60 * 30)
    await redis.lpush("notify_queue", message)
    await redis.expire("notify_queue", 60 * 10)