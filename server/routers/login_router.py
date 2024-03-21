import json
from datetime import datetime, timedelta
from typing import List
from aioredis import Redis
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer as OAuth
import os
import jwt
from models import TicketHistory, Tasks
from pydantic_models import ITicket, Login, IAccount
from utils.device_manager import get_pool
from utils.service import ticket_to_content, task_to_dict, account_to_content

login_router = APIRouter()
oauth2_scheme = OAuth(tokenUrl="/api/login")


@login_router.post("/verify")
def verify(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        return {"token": token, "payload": payload}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")


@login_router.post("/login")
def login(form: Login):
    if form.token == os.getenv("TOKEN"):
        expires_in = datetime.now() + timedelta(days=7)
        token = jwt.encode({"sub": form.token, "exp": expires_in}, os.getenv("SECRET_KEY"), algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")
