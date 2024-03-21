from pydantic import BaseModel


class IDeleteTicket(BaseModel):
    uuid: str


class IUpdate(BaseModel):
    ticket_id: str = ""
    device_id: str = ""
    status: str = ""


class Login(BaseModel):
    token: str


class AccountRequest(BaseModel):
    id: str
    username: str
    password: str
    idcard: str
    date: str
    status: str = "0"
    category: str = ""


class IAccount(BaseModel):
    category: str = "登录账号"
    uuid: str
    username: str
    password: str


class ITicket(BaseModel):
    category: str
    zhifubao: str
    card: str
    date: str
    count: int
    uuid: str


class ITask(BaseModel):
    uuid: str
    device_id: str
