"""霓虹灯维修工单管理 API。"""

from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, init_db
from models import WorkOrder, WorkOrderCreate, WorkOrderUpdate, CitySignStats, SignStatsResponse, Photographer, PhotographerCreate, PhotographerUpdate, Story, StoryCreate, StoryUpdate, NeonMaterial, NeonMaterialCreate, NeonMaterialUpdate, NeonSign

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


def row_to_order(row) -> WorkOrder:
    """将数据库行转为 Pydantic 模型。"""
    return WorkOrder(
        id=row["id"],
        shop_name=row["shop_name"],
        fault_description=row["fault_description"],
        status=row["status"],
        registration_date=date.fromisoformat(row["registration_date"]),
    )


@app.get("/api/orders", response_model=list[WorkOrder])
def list_orders(status: Optional[str] = None) -> list[WorkOrder]:
    """获取工单列表，可按维修状态筛选。"""
    conn = get_connection()
    try:
        if status:
            rows = conn.execute(
                "SELECT * FROM work_orders WHERE status = ? ORDER BY id",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM work_orders ORDER BY id"
            ).fetchall()
        return [row_to_order(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/orders/{order_id}", response_model=WorkOrder)
def get_order(order_id: int) -> WorkOrder:
    """获取单条工单。"""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM work_orders WHERE id = ?", (order_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="工单不存在")
        return row_to_order(row)
    finally:
        conn.close()


@app.post("/api/orders", response_model=WorkOrder, status_code=201)
def create_order(body: WorkOrderCreate) -> WorkOrder:
    """新建工单。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO work_orders (shop_name, fault_description, status, registration_date)
            VALUES (?, ?, ?, ?)
            """,
            (
                body.shop_name,
                body.fault_description,
                body.status,
                body.registration_date.isoformat(),
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM work_orders WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return row_to_order(row)
    finally:
        conn.close()


@app.put("/api/orders/{order_id}", response_model=WorkOrder)
def update_order(order_id: int, body: WorkOrderUpdate) -> WorkOrder:
    """更新工单。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM work_orders WHERE id = ?", (order_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="工单不存在")
        conn.execute(
            """
            UPDATE work_orders
            SET shop_name = ?, fault_description = ?, status = ?, registration_date = ?
            WHERE id = ?
            """,
            (
                body.shop_name,
                body.fault_description,
                body.status,
                body.registration_date.isoformat(),
                order_id,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM work_orders WHERE id = ?", (order_id,)
        ).fetchone()
        return row_to_order(row)
    finally:
        conn.close()


@app.delete("/api/orders/{order_id}", status_code=204)
def delete_order(order_id: int) -> None:
    """删除工单。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM work_orders WHERE id = ?", (order_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="工单不存在")
        conn.execute("DELETE FROM work_orders WHERE id = ?", (order_id,))
        conn.commit()
    finally:
        conn.close()


@app.get("/api/signs/stats", response_model=SignStatsResponse)
def get_sign_stats(city: Optional[str] = None) -> SignStatsResponse:
    """获取招牌统计数据，可按城市筛选。"""
    conn = get_connection()
    try:
        city_rows = conn.execute(
            "SELECT DISTINCT city FROM neon_signs ORDER BY city"
        ).fetchall()
        cities = [row["city"] for row in city_rows]

        if city:
            rows = conn.execute(
                """
                SELECT
                    city,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = '亮' THEN 1 ELSE 0 END) as on_count,
                    SUM(CASE WHEN status = '灭' THEN 1 ELSE 0 END) as off_count,
                    SUM(CASE WHEN status = '拆' THEN 1 ELSE 0 END) as removed_count
                FROM neon_signs
                WHERE city = ?
                GROUP BY city
                ORDER BY city
                """,
                (city,),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT
                    city,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = '亮' THEN 1 ELSE 0 END) as on_count,
                    SUM(CASE WHEN status = '灭' THEN 1 ELSE 0 END) as off_count,
                    SUM(CASE WHEN status = '拆' THEN 1 ELSE 0 END) as removed_count
                FROM neon_signs
                GROUP BY city
                ORDER BY city
                """
            ).fetchall()

        stats = [
            CitySignStats(
                city=row["city"],
                total=row["total"],
                on_count=row["on_count"],
                off_count=row["off_count"],
                removed_count=row["removed_count"],
            )
            for row in rows
        ]

        return SignStatsResponse(cities=cities, stats=stats)
    finally:
        conn.close()


def row_to_sign(row) -> NeonSign:
    """将数据库行转为招牌 Pydantic 模型。"""
    return NeonSign(
        id=row["id"],
        city=row["city"],
        shop_name=row["shop_name"],
        status=row["status"],
        location=row["location"],
    )


@app.get("/api/signs", response_model=list[NeonSign])
def list_signs(status: Optional[str] = None, city: Optional[str] = None, keyword: Optional[str] = None) -> list[NeonSign]:
    """获取招牌列表，可按状态、城市和店名关键词筛选。"""
    conn = get_connection()
    try:
        query = "SELECT * FROM neon_signs WHERE 1=1"
        params: list = []
        if status:
            query += " AND status = ?"
            params.append(status)
        if city:
            query += " AND city = ?"
            params.append(city)
        if keyword:
            query += " AND shop_name LIKE ?"
            params.append(f"%{keyword}%")
        query += " ORDER BY city, id"
        rows = conn.execute(query, params).fetchall()
        return [row_to_sign(r) for r in rows]
    finally:
        conn.close()


def row_to_photographer(row) -> Photographer:
    """将数据库行转为拍摄者 Pydantic 模型。"""
    return Photographer(
        id=row["id"],
        name=row["name"],
        phone=row["phone"],
        city=row["city"],
    )


@app.get("/api/photographers", response_model=list[Photographer])
def list_photographers(city: Optional[str] = None) -> list[Photographer]:
    """获取拍摄者列表，可按城市筛选。"""
    conn = get_connection()
    try:
        if city:
            rows = conn.execute(
                "SELECT * FROM photographers WHERE city = ? ORDER BY id",
                (city,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM photographers ORDER BY id"
            ).fetchall()
        return [row_to_photographer(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/photographers/{photographer_id}", response_model=Photographer)
def get_photographer(photographer_id: int) -> Photographer:
    """获取单条拍摄者。"""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM photographers WHERE id = ?", (photographer_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="拍摄者不存在")
        return row_to_photographer(row)
    finally:
        conn.close()


@app.post("/api/photographers", response_model=Photographer, status_code=201)
def create_photographer(body: PhotographerCreate) -> Photographer:
    """新建拍摄者。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO photographers (name, phone, city)
            VALUES (?, ?, ?)
            """,
            (body.name, body.phone, body.city),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM photographers WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return row_to_photographer(row)
    finally:
        conn.close()


@app.put("/api/photographers/{photographer_id}", response_model=Photographer)
def update_photographer(photographer_id: int, body: PhotographerUpdate) -> Photographer:
    """更新拍摄者。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM photographers WHERE id = ?", (photographer_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="拍摄者不存在")
        conn.execute(
            """
            UPDATE photographers
            SET name = ?, phone = ?, city = ?
            WHERE id = ?
            """,
            (body.name, body.phone, body.city, photographer_id),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM photographers WHERE id = ?", (photographer_id,)
        ).fetchone()
        return row_to_photographer(row)
    finally:
        conn.close()


@app.delete("/api/photographers/{photographer_id}", status_code=204)
def delete_photographer(photographer_id: int) -> None:
    """删除拍摄者。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM photographers WHERE id = ?", (photographer_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="拍摄者不存在")
        conn.execute("DELETE FROM photographers WHERE id = ?", (photographer_id,))
        conn.commit()
    finally:
        conn.close()


def row_to_story(row) -> Story:
    """将数据库行转为故事 Pydantic 模型。"""
    return Story(
        id=row["id"],
        title=row["title"],
        content=row["content"],
        shop_name=row["shop_name"],
        publish_date=date.fromisoformat(row["publish_date"]),
    )


@app.get("/api/stories", response_model=list[Story])
def list_stories() -> list[Story]:
    """获取故事列表，按发布日期倒序排列。"""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM stories ORDER BY publish_date DESC, id DESC"
        ).fetchall()
        return [row_to_story(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/stories/{story_id}", response_model=Story)
def get_story(story_id: int) -> Story:
    """获取单条故事。"""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM stories WHERE id = ?", (story_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="故事不存在")
        return row_to_story(row)
    finally:
        conn.close()


@app.post("/api/stories", response_model=Story, status_code=201)
def create_story(body: StoryCreate) -> Story:
    """新建故事。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO stories (title, content, shop_name, publish_date)
            VALUES (?, ?, ?, ?)
            """,
            (
                body.title,
                body.content,
                body.shop_name,
                body.publish_date.isoformat(),
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM stories WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return row_to_story(row)
    finally:
        conn.close()


@app.put("/api/stories/{story_id}", response_model=Story)
def update_story(story_id: int, body: StoryUpdate) -> Story:
    """更新故事。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM stories WHERE id = ?", (story_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="故事不存在")
        conn.execute(
            """
            UPDATE stories
            SET title = ?, content = ?, shop_name = ?, publish_date = ?
            WHERE id = ?
            """,
            (
                body.title,
                body.content,
                body.shop_name,
                body.publish_date.isoformat(),
                story_id,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM stories WHERE id = ?", (story_id,)
        ).fetchone()
        return row_to_story(row)
    finally:
        conn.close()


@app.delete("/api/stories/{story_id}", status_code=204)
def delete_story(story_id: int) -> None:
    """删除故事。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM stories WHERE id = ?", (story_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="故事不存在")
        conn.execute("DELETE FROM stories WHERE id = ?", (story_id,))
        conn.commit()
    finally:
        conn.close()


def row_to_material(row) -> NeonMaterial:
    return NeonMaterial(
        id=row["id"],
        name=row["name"],
        common_colors=row["common_colors"],
        applicable_era=row["applicable_era"],
    )


@app.get("/api/materials", response_model=list[NeonMaterial])
def list_materials() -> list[NeonMaterial]:
    """获取材质列表，按编号排序。"""
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM neon_materials ORDER BY id"
        ).fetchall()
        return [row_to_material(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/materials/{material_id}", response_model=NeonMaterial)
def get_material(material_id: int) -> NeonMaterial:
    """获取单条材质。"""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM neon_materials WHERE id = ?", (material_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="材质不存在")
        return row_to_material(row)
    finally:
        conn.close()


@app.post("/api/materials", response_model=NeonMaterial, status_code=201)
def create_material(body: NeonMaterialCreate) -> NeonMaterial:
    """新建材质。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO neon_materials (name, common_colors, applicable_era)
            VALUES (?, ?, ?)
            """,
            (body.name, body.common_colors, body.applicable_era),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM neon_materials WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return row_to_material(row)
    finally:
        conn.close()


@app.put("/api/materials/{material_id}", response_model=NeonMaterial)
def update_material(material_id: int, body: NeonMaterialUpdate) -> NeonMaterial:
    """更新材质。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM neon_materials WHERE id = ?", (material_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="材质不存在")
        conn.execute(
            """
            UPDATE neon_materials
            SET name = ?, common_colors = ?, applicable_era = ?
            WHERE id = ?
            """,
            (body.name, body.common_colors, body.applicable_era, material_id),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM neon_materials WHERE id = ?", (material_id,)
        ).fetchone()
        return row_to_material(row)
    finally:
        conn.close()


@app.delete("/api/materials/{material_id}", status_code=204)
def delete_material(material_id: int) -> None:
    """删除材质。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM neon_materials WHERE id = ?", (material_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="材质不存在")
        conn.execute("DELETE FROM neon_materials WHERE id = ?", (material_id,))
        conn.commit()
    finally:
        conn.close()
