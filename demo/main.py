import aioredis
from fastapi import FastAPI, Depends

app = FastAPI()


async def get_pool():
    return await aioredis.from_url(
        "redis://localhost/0", db=0, encoding="utf-8", decode_responses=True
    )


@app.get("/")
async def get(redis=Depends(get_pool)):
    print(redis)
    return {"message": "Hello World"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
