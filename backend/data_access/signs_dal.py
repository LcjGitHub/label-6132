from typing import Optional

from database import get_connection
from models import NeonSign, NeonSignCreate, NeonSignUpdate, CitySignStats, SignStatsResponse, SignStatusCounts, SignListResponse


def row_to_sign(row) -> NeonSign:
    return NeonSign(
        id=row["id"],
        city=row["city"],
        shop_name=row["shop_name"],
        status=row["status"],
        location=row["location"],
        era_estimate=row["era_estimate"],
        remark=row["remark"],
    )


def get_sign_stats(city: Optional[str] = None) -> SignStatsResponse:
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


def list_signs(status: Optional[str] = None, city: Optional[str] = None, keyword: Optional[str] = None) -> SignListResponse:
    conn = get_connection()
    try:
        where_clause = "WHERE 1=1"
        params: list = []
        if status:
            where_clause += " AND status = ?"
            params.append(status)
        if city:
            where_clause += " AND city = ?"
            params.append(city)
        if keyword:
            where_clause += " AND shop_name LIKE ?"
            params.append(f"%{keyword}%")

        list_query = f"SELECT * FROM neon_signs {where_clause} ORDER BY city, id"
        rows = conn.execute(list_query, params).fetchall()
        items = [row_to_sign(r) for r in rows]

        stats_query = f"""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = '亮' THEN 1 ELSE 0 END) as on_count,
            SUM(CASE WHEN status = '灭' THEN 1 ELSE 0 END) as off_count,
            SUM(CASE WHEN status = '拆' THEN 1 ELSE 0 END) as removed_count
        FROM neon_signs
        {where_clause}
        """
        stats_row = conn.execute(stats_query, params).fetchone()
        stats = SignStatusCounts(
            total=stats_row["total"] or 0,
            on_count=stats_row["on_count"] or 0,
            off_count=stats_row["off_count"] or 0,
            removed_count=stats_row["removed_count"] or 0,
        )

        return SignListResponse(items=items, stats=stats)
    finally:
        conn.close()


def get_sign(sign_id: int) -> Optional[NeonSign]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM neon_signs WHERE id = ?", (sign_id,)
        ).fetchone()
        if not row:
            return None
        return row_to_sign(row)
    finally:
        conn.close()


def create_sign(body: NeonSignCreate) -> NeonSign:
    conn = get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO neon_signs (city, shop_name, status, location, era_estimate, remark)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                body.city,
                body.shop_name,
                body.status,
                body.location,
                body.era_estimate,
                body.remark,
            ),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM neon_signs WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return row_to_sign(row)
    finally:
        conn.close()


def update_sign(sign_id: int, body: NeonSignUpdate) -> Optional[NeonSign]:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM neon_signs WHERE id = ?", (sign_id,)
        ).fetchone()
        if not existing:
            return None
        conn.execute(
            """
            UPDATE neon_signs
            SET city = ?, shop_name = ?, status = ?, location = ?, era_estimate = ?, remark = ?
            WHERE id = ?
            """,
            (
                body.city,
                body.shop_name,
                body.status,
                body.location,
                body.era_estimate,
                body.remark,
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


def delete_sign(sign_id: int) -> bool:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM neon_signs WHERE id = ?", (sign_id,)
        ).fetchone()
        if not existing:
            return False
        conn.execute("DELETE FROM neon_signs WHERE id = ?", (sign_id,))
        conn.commit()
        return True
    finally:
        conn.close()
