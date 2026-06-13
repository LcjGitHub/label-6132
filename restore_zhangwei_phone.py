import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "workorders.db"

conn = sqlite3.connect(DB_PATH)
try:
    conn.execute(
        "UPDATE photographers SET phone = ? WHERE name = ?",
        ("13800138001", "张伟")
    )
    conn.commit()
    result = conn.execute(
        "SELECT name, phone FROM photographers WHERE name = ?",
        ("张伟",)
    ).fetchone()
    print(f"张伟的联系电话已恢复为: {result[1]}")
finally:
    conn.close()
