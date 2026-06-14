from typing import Optional

from database import get_connection
from models import Photographer, PhotographerCreate, PhotographerUpdate


def row_to_photographer(row) -> Photographer:
    return Photographer(
        id=row["id"],
        name=row["name"],
        phone=row["phone"],
        city=row["city"],
    )


def list_photographers(city: Optional[str] = None) -> list[Photographer]:
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


def get_photographer(photographer_id: int) -> Optional[Photographer]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM photographers WHERE id = ?", (photographer_id,)
        ).fetchone()
        if not row:
            return None
        return row_to_photographer(row)
    finally:
        conn.close()


def create_photographer(body: PhotographerCreate) -> Photographer:
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


def update_photographer(photographer_id: int, body: PhotographerUpdate) -> Optional[Photographer]:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM photographers WHERE id = ?", (photographer_id,)
        ).fetchone()
        if not existing:
            return None
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


def delete_photographer(photographer_id: int) -> bool:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM photographers WHERE id = ?", (photographer_id,)
        ).fetchone()
        if not existing:
            return False
        conn.execute("DELETE FROM photographers WHERE id = ?", (photographer_id,))
        conn.commit()
        return True
    finally:
        conn.close()
