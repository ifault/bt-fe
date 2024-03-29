from fastapi import APIRouter, Request

from models import Tasks
from pydantic_models import ITask
from utils.device_manager import add_device_to_avalible_list
from utils.service import task_to_dict

task_router = APIRouter()


@task_router.put("/task")
async def update_task(task: ITask, request: Request):
    item = await Tasks.filter(uuid=task.uuid).first()
    await Tasks.filter(uuid=task.uuid).update(status="完成任务")
    await add_device_to_avalible_list(request.app.state.redis, task.device_id, item.content)
    return {"success": "ok"}


@task_router.get("/tasks")
async def get_tasks():
    tasks = await Tasks.filter(soft_deleted=False).all()
    task_dicts = [task_to_dict(task) for task in tasks]
    return task_dicts


@task_router.delete("/tasks")
async def delete_tasks():
    await Tasks.filter(soft_deleted=False).update(soft_deleted=True)
    return {"success": "任务删除成功"}
