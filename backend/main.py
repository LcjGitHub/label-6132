"""老式霓虹灯招牌存档 API。"""

from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection, init_db
from models import NeonSign, NeonSignCreate, NeonSignUpdate

app = FastAPI(title="霓虹灯招牌存档 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4101", "http://127.0.0.1:4101"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """应用启动时初始化数据库。"""
    init_db()


def row_to_sign(row) -> NeonSign:
    """将数据库行转为 Pydantic 模型。"""
    return NeonSign(
        id=row["id"],
        shop_name=row["shop_name"],
        city=row["city"],
        address=row["address"],
        status=row["status"],
        estimated_era=row["estimated_era"],
    )


@app.get("/api/signs", response_model=list[NeonSign])
def list_signs(status: Optional[str] = None) -> list[NeonSign]:
    """获取招牌列表，可按状态筛选。"""
    conn = get_connection()
    try:
        if status:
            rows = conn.execute(
                "SELECT * FROM neon_signs WHERE status = ? ORDER BY id",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM neon_signs ORDER BY id"
            ).fetchall()
        return [row_to_sign(r) for r in rows]
    finally:
        conn.close()


@app.get("/api/signs/{sign_id}", response_model=NeonSign)
def get_sign(sign_id: int) -> NeonSign:
    """获取单条招牌。"""
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM neon_signs WHERE id = ?", (sign_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="招牌不存在")
        return row_to_sign(row)
    finally:
        conn.close()


@app.post("/api/signs", response_model=NeonSign, status_code=201)
def create_sign(body: NeonSignCreate) -> NeonSign:
    """新建招牌。"""
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO neon_signs (shop_name, city, address, status, estimated_era)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                body.shop_name,
                body.city,
                body.address,
                body.status,
                body.estimated_era,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM neon_signs WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return row_to_sign(row)
    finally:
        conn.close()


@app.put("/api/signs/{sign_id}", response_model=NeonSign)
def update_sign(sign_id: int, body: NeonSignUpdate) -> NeonSign:
    """更新招牌。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM neon_signs WHERE id = ?", (sign_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="招牌不存在")
        conn.execute(
            """
            UPDATE neon_signs
            SET shop_name = ?, city = ?, address = ?, status = ?, estimated_era = ?
            WHERE id = ?
            """,
            (
                body.shop_name,
                body.city,
                body.address,
                body.status,
                body.estimated_era,
                sign_id,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM neon_signs WHERE id = ?", (sign_id,)
        ).fetchone()
        return row_to_sign(row)
    finally:
        conn.close()


@app.delete("/api/signs/{sign_id}", status_code=204)
def delete_sign(sign_id: int) -> None:
    """删除招牌。"""
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM neon_signs WHERE id = ?", (sign_id,)
        ).fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="招牌不存在")
        conn.execute("DELETE FROM neon_signs WHERE id = ?", (sign_id,))
        conn.commit()
    finally:
        conn.close()
