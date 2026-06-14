"""霓虹灯维修工单管理 API。"""

from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from models import (
    WorkOrder, WorkOrderCreate, WorkOrderUpdate,
    CitySignStats, SignStatsResponse,
    Photographer, PhotographerCreate, PhotographerUpdate,
    Story, StoryCreate, StoryUpdate,
    NeonMaterial, NeonMaterialCreate, NeonMaterialUpdate,
    NeonSign, NeonSignCreate, NeonSignUpdate,
    SignListResponse, SignStatusCounts,
)
from data_access import orders_dal, signs_dal, photographers_dal, stories_dal, materials_dal

app = FastAPI(title="霓虹灯维修工单管理 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4101", "http://127.0.0.1:4101", "http://localhost:4102", "http://127.0.0.1:4102", "http://localhost:4103", "http://127.0.0.1:4103", "http://localhost:4104", "http://127.0.0.1:4104"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """应用启动时初始化数据库。"""
    init_db()


@app.get("/api/orders", response_model=list[WorkOrder])
def list_orders(status: Optional[str] = None) -> list[WorkOrder]:
    """获取工单列表，可按维修状态筛选。"""
    return orders_dal.list_orders(status=status)


@app.get("/api/orders/{order_id}", response_model=WorkOrder)
def get_order(order_id: int) -> WorkOrder:
    """获取单条工单。"""
    order = orders_dal.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="工单不存在")
    return order


@app.post("/api/orders", response_model=WorkOrder, status_code=201)
def create_order(body: WorkOrderCreate) -> WorkOrder:
    """新建工单。"""
    return orders_dal.create_order(body)


@app.put("/api/orders/{order_id}", response_model=WorkOrder)
def update_order(order_id: int, body: WorkOrderUpdate) -> WorkOrder:
    """更新工单。"""
    order = orders_dal.update_order(order_id, body)
    if not order:
        raise HTTPException(status_code=404, detail="工单不存在")
    return order


@app.delete("/api/orders/{order_id}", status_code=204)
def delete_order(order_id: int) -> None:
    """删除工单。"""
    deleted = orders_dal.delete_order(order_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="工单不存在")


@app.get("/api/signs/stats", response_model=SignStatsResponse)
def get_sign_stats(city: Optional[str] = None) -> SignStatsResponse:
    """获取招牌统计数据，可按城市筛选。"""
    return signs_dal.get_sign_stats(city=city)


@app.get("/api/signs", response_model=SignListResponse)
def list_signs(status: Optional[str] = None, city: Optional[str] = None, keyword: Optional[str] = None) -> SignListResponse:
    """获取招牌列表，可按状态、城市和店名关键词筛选，附带当前筛选条件下的状态统计。"""
    return signs_dal.list_signs(status=status, city=city, keyword=keyword)


@app.get("/api/signs/{sign_id}", response_model=NeonSign)
def get_sign(sign_id: int) -> NeonSign:
    """获取单条招牌。"""
    sign = signs_dal.get_sign(sign_id)
    if not sign:
        raise HTTPException(status_code=404, detail="招牌不存在")
    return sign


@app.post("/api/signs", response_model=NeonSign, status_code=201)
def create_sign(body: NeonSignCreate) -> NeonSign:
    """新建招牌。"""
    return signs_dal.create_sign(body)


@app.put("/api/signs/{sign_id}", response_model=NeonSign)
def update_sign(sign_id: int, body: NeonSignUpdate) -> NeonSign:
    """更新招牌。"""
    sign = signs_dal.update_sign(sign_id, body)
    if not sign:
        raise HTTPException(status_code=404, detail="招牌不存在")
    return sign


@app.delete("/api/signs/{sign_id}", status_code=204)
def delete_sign(sign_id: int) -> None:
    """删除招牌。"""
    deleted = signs_dal.delete_sign(sign_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="招牌不存在")


@app.get("/api/photographers", response_model=list[Photographer])
def list_photographers(city: Optional[str] = None) -> list[Photographer]:
    """获取拍摄者列表，可按城市筛选。"""
    return photographers_dal.list_photographers(city=city)


@app.get("/api/photographers/{photographer_id}", response_model=Photographer)
def get_photographer(photographer_id: int) -> Photographer:
    """获取单条拍摄者。"""
    photographer = photographers_dal.get_photographer(photographer_id)
    if not photographer:
        raise HTTPException(status_code=404, detail="拍摄者不存在")
    return photographer


@app.post("/api/photographers", response_model=Photographer, status_code=201)
def create_photographer(body: PhotographerCreate) -> Photographer:
    """新建拍摄者。"""
    return photographers_dal.create_photographer(body)


@app.put("/api/photographers/{photographer_id}", response_model=Photographer)
def update_photographer(photographer_id: int, body: PhotographerUpdate) -> Photographer:
    """更新拍摄者。"""
    photographer = photographers_dal.update_photographer(photographer_id, body)
    if not photographer:
        raise HTTPException(status_code=404, detail="拍摄者不存在")
    return photographer


@app.delete("/api/photographers/{photographer_id}", status_code=204)
def delete_photographer(photographer_id: int) -> None:
    """删除拍摄者。"""
    deleted = photographers_dal.delete_photographer(photographer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="拍摄者不存在")


@app.get("/api/stories", response_model=list[Story])
def list_stories() -> list[Story]:
    """获取故事列表，按发布日期倒序排列。"""
    return stories_dal.list_stories()


@app.get("/api/stories/{story_id}", response_model=Story)
def get_story(story_id: int) -> Story:
    """获取单条故事。"""
    story = stories_dal.get_story(story_id)
    if not story:
        raise HTTPException(status_code=404, detail="故事不存在")
    return story


@app.post("/api/stories", response_model=Story, status_code=201)
def create_story(body: StoryCreate) -> Story:
    """新建故事。"""
    return stories_dal.create_story(body)


@app.put("/api/stories/{story_id}", response_model=Story)
def update_story(story_id: int, body: StoryUpdate) -> Story:
    """更新故事。"""
    story = stories_dal.update_story(story_id, body)
    if not story:
        raise HTTPException(status_code=404, detail="故事不存在")
    return story


@app.delete("/api/stories/{story_id}", status_code=204)
def delete_story(story_id: int) -> None:
    """删除故事。"""
    deleted = stories_dal.delete_story(story_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="故事不存在")


@app.get("/api/materials", response_model=list[NeonMaterial])
def list_materials() -> list[NeonMaterial]:
    """获取材质列表，按编号排序。"""
    return materials_dal.list_materials()


@app.get("/api/materials/{material_id}", response_model=NeonMaterial)
def get_material(material_id: int) -> NeonMaterial:
    """获取单条材质。"""
    material = materials_dal.get_material(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="材质不存在")
    return material


@app.post("/api/materials", response_model=NeonMaterial, status_code=201)
def create_material(body: NeonMaterialCreate) -> NeonMaterial:
    """新建材质。"""
    return materials_dal.create_material(body)


@app.put("/api/materials/{material_id}", response_model=NeonMaterial)
def update_material(material_id: int, body: NeonMaterialUpdate) -> NeonMaterial:
    """更新材质。"""
    material = materials_dal.update_material(material_id, body)
    if not material:
        raise HTTPException(status_code=404, detail="材质不存在")
    return material


@app.delete("/api/materials/{material_id}", status_code=204)
def delete_material(material_id: int) -> None:
    """删除材质。"""
    deleted = materials_dal.delete_material(material_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="材质不存在")
