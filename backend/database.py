"""SQLite 数据库连接与初始化。"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "neon.db"

SEED_DATA = [
    {
        "shop_name": "红星电影院",
        "city": "上海",
        "address": "淮海中路 500 号",
        "status": "亮",
        "estimated_era": "1980年代",
    },
    {
        "shop_name": "和平饭店",
        "city": "上海",
        "address": "南京东路 20 号",
        "status": "灭",
        "estimated_era": "1930年代",
    },
    {
        "shop_name": "老广茶楼",
        "city": "广州",
        "address": "上下九步行街 88 号",
        "status": "亮",
        "estimated_era": "1960年代",
    },
    {
        "shop_name": "锦江饭店",
        "city": "成都",
        "address": "人民南路 80 号",
        "status": "拆",
        "estimated_era": "1950年代",
    },
    {
        "shop_name": "霓虹酒吧",
        "city": "香港",
        "address": "兰桂坊 12 号",
        "status": "灭",
        "estimated_era": "1990年代",
    },
]


def get_connection() -> sqlite3.Connection:
    """获取 SQLite 连接，启用行字典访问。"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """创建表并在空库时写入 seed 数据。"""
    conn = get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS neon_signs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shop_name TEXT NOT NULL,
                city TEXT NOT NULL,
                address TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('亮', '灭', '拆')),
                estimated_era TEXT NOT NULL
            )
            """
        )
        count = conn.execute("SELECT COUNT(*) FROM neon_signs").fetchone()[0]
        if count == 0:
            for row in SEED_DATA:
                conn.execute(
                    """
                    INSERT INTO neon_signs (shop_name, city, address, status, estimated_era)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        row["shop_name"],
                        row["city"],
                        row["address"],
                        row["status"],
                        row["estimated_era"],
                    ),
                )
        conn.commit()
    finally:
        conn.close()
