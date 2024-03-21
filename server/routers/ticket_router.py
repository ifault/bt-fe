from typing import List

from fastapi import APIRouter

from models import Tickets
from pydantic_models import IDeleteTicket, ITicket
from utils.service import ticket_to_dict

ticket_router = APIRouter()


@ticket_router.post("/tickets")
async def store_tickets(tickets: List[ITicket]):
    ticket_objects = [
        Tickets(uuid=ticket.uuid, category=ticket.category, zhifubao=ticket.zhifubao,
                card=ticket.card, date=ticket.date, count=ticket.count)
        for ticket in tickets
    ]
    await Tickets.bulk_create(ticket_objects)


@ticket_router.delete("/tickets")
async def delete_tickets(ticket: IDeleteTicket):
    await Tickets.filter(uuid=ticket.uuid).delete()


@ticket_router.get("/tickets")
async def get_tickets():
    tickets = await Tickets.all()
    ticket_dicts = [ticket_to_dict(ticket) for ticket in tickets]
    return ticket_dicts


@ticket_router.put("/tickets")
async def update_tickets(tickets: ITicket):
    await Tickets.filter(uuid=tickets.uuid).update(
        category=tickets.category, zhifubao=tickets.zhifubao, card=tickets.card,
        date=tickets.date, count=tickets.count
    )