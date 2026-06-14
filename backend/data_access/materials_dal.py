from typing import Optional

from database import get_connection
from models import NeonMaterial, NeonMaterialCreate, NeonMaterialUpdate


def row_to_material(row) -> NeonMaterial:
    return NeonMaterial(
        id=row["id"],
        name=row["name"],
        common_colors=row["common_colors"],
        applicable_era=row["applicable_era"],
    )


def list_materials() -> list[NeonMaterial]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM neon_materials ORDER BY id"
        ).fetchall()
        return [row_to_material(r) for r in rows]
    finally:
        conn.close()


def get_material(material_id: int) -> Optional[NeonMaterial]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM neon_materials WHERE id = ?", (material_id,)
        ).fetchone()
        if not row:
            return None
        return row_to_material(row)
    finally:
        conn.close()


def create_material(body: NeonMaterialCreate) -> NeonMaterial:
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


def update_material(material_id: int, body: NeonMaterialUpdate) -> Optional[NeonMaterial]:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM neon_materials WHERE id = ?", (material_id,)
        ).fetchone()
        if not existing:
            return None
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


def delete_material(material_id: int) -> bool:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM neon_materials WHERE id = ?", (material_id,)
        ).fetchone()
        if not existing:
            return False
        conn.execute("DELETE FROM neon_materials WHERE id = ?", (material_id,))
        conn.commit()
        return True
    finally:
        conn.close()
