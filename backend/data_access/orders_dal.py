from datetime import date
from typing import Optional

from database import get_connection
from models import WorkOrder, WorkOrderCreate, WorkOrderUpdate


def row_to_order(row) -> WorkOrder:
    return WorkOrder(
        id=row["id"],
        shop_name=row["shop_name"],
        fault_description=row["fault_description"],
        status=row["status"],
        registration_date=date.fromisoformat(row["registration_date"]),
    )


def list_orders(status: Optional[str] = None) -> list[WorkOrder]:
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


def get_order(order_id: int) -> Optional[WorkOrder]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM work_orders WHERE id = ?", (order_id,)
        ).fetchone()
        if not row:
            return None
        return row_to_order(row)
    finally:
        conn.close()


def create_order(body: WorkOrderCreate) -> WorkOrder:
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


def update_order(order_id: int, body: WorkOrderUpdate) -> Optional[WorkOrder]:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM work_orders WHERE id = ?", (order_id,)
        ).fetchone()
        if not existing:
            return None
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


def delete_order(order_id: int) -> bool:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM work_orders WHERE id = ?", (order_id,)
        ).fetchone()
        if not existing:
            return False
        conn.execute("DELETE FROM work_orders WHERE id = ?", (order_id,))
        conn.commit()
        return True
    finally:
        conn.close()
