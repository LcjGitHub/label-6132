from datetime import date
from typing import Optional

from database import get_connection
from models import Story, StoryCreate, StoryUpdate


def row_to_story(row) -> Story:
    return Story(
        id=row["id"],
        title=row["title"],
        content=row["content"],
        shop_name=row["shop_name"],
        publish_date=date.fromisoformat(row["publish_date"]),
    )


def list_stories() -> list[Story]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM stories ORDER BY publish_date DESC, id DESC"
        ).fetchall()
        return [row_to_story(r) for r in rows]
    finally:
        conn.close()


def get_story(story_id: int) -> Optional[Story]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM stories WHERE id = ?", (story_id,)
        ).fetchone()
        if not row:
            return None
        return row_to_story(row)
    finally:
        conn.close()


def create_story(body: StoryCreate) -> Story:
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


def update_story(story_id: int, body: StoryUpdate) -> Optional[Story]:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM stories WHERE id = ?", (story_id,)
        ).fetchone()
        if not existing:
            return None
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


def delete_story(story_id: int) -> bool:
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM stories WHERE id = ?", (story_id,)
        ).fetchone()
        if not existing:
            return False
        conn.execute("DELETE FROM stories WHERE id = ?", (story_id,))
        conn.commit()
        return True
    finally:
        conn.close()
