from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer as OAuth
from fastapi.middleware.cors import CORSMiddleware
import jwt
import os

from pydantic import BaseModel
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "TEST"

oauth2_scheme=OAuth(tokenUrl="/api/login")


class Login(BaseModel):
    token: str


@app.post("/api/login")
def login(login: Login):
    if login.token == os.getenv("TOKEN"):
        expires_in = datetime.now() + timedelta(days=7)
        token = jwt.encode({"sub": login.token, "exp": expires_in}, os.getenv("SECRET_KEY"), algorithm="HS256")
        return {"access_token": token, "token_type": "bearer"}
    else:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
@app.post("/api/verify")
def verify(token: str = Depends(oauth2_scheme)):
    try:
       payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
       return {"token": token, "payload": payload}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="192.168.3.194", port=8000)