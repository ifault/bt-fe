from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
import aioredis

# 定义 JWT Token 验证相关配置
JWT_SECRET = "your-secret-key"
ALGORITHM = "HS256"

# 定义 API 路由
router = APIRouter()


class IAccount(BaseModel):
    username: str
    password: str


async def redis_db():
    # 假设这里是你的 redis_db 实现
    redis_uri = "redis://localhost"
    redis = await aioredis.create_redis_pool(redis_uri)
    return redis


# JWT Token 验证函数
async def verify_token(token: str = Depends(HTTPBearer())) -> str:
    try:
        payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/accounts")
async def store_accounts(accounts: List[IAccount], db=Depends(redis_db), token: str = Depends(verify_token)):
    # 在这里添加需要验证的逻辑和操作
    # 只有验证通过的 token 才能访问该路由，否则会返回 401 错误
    if token:
        # 执行存储账户的操作
        serialized_accounts = [account.dict() for account in accounts]
        await db.lpush("db:accounts", *[json.dumps(account) for account in serialized_accounts])
        print("accounts stored")
        return {"message": "Accounts stored successfully"}
