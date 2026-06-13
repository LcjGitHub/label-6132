"""霓虹灯维修工单管理 API。"""

from datetime import date
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, init_db
from models import WorkOrder, WorkOrderCreate, WorkOrderUpdate, CitySignStats, SignStatsResponse

app = FastAPI(title="霓虹灯维修工单管理 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4101", "http://127.0.0.1:4101", "http://localhost:4103", "http://127.0.0.1:4103"],
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
