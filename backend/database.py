"""SQLite 数据库连接与初始化。"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "data" / "workorders.db"

SEED_DATA = [
    {
        "shop_name": "红星电影院",
        "fault_description": "入口处'红星'二字不亮，变压器异响",
        "status": "待处理",
        "registration_date": "2026-06-01",
    },
    {
        "shop_name": "和平饭店",
        "fault_description": "西侧墙面霓虹灯部分灯管闪烁，需更换镇流器",
        "status": "进行中",
        "registration_date": "2026-06-05",
    },
    {
        "shop_name": "老广茶楼",
        "fault_description": "招牌整体不亮，疑似主电源线路故障",
        "status": "已完成",
        "registration_date": "2026-06-02",
    },
    {
        "shop_name": "锦江饭店",
        "fault_description": "楼顶'锦'字中间三根管脱落，已报修等待配件",
        "status": "待处理",
        "registration_date": "2026-06-08",
    },
    {
        "shop_name": "霓虹酒吧",
        "fault_description": "吧台背景灯颜色偏色，蓝色灯管老化需整套更换",
        "status": "进行中",
        "registration_date": "2026-06-10",
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
            CREATE TABLE IF NOT EXISTS work_orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shop_name TEXT NOT NULL,
                fault_description TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('待处理', '进行中', '已完成')),
                registration_date TEXT NOT NULL
            )
            """
        )
        count = conn.execute("SELECT COUNT(*) FROM work_orders").fetchone()[0]
        if count == 0:
            for row in SEED_DATA:
                conn.execute(
                    """
                    INSERT INTO work_orders (shop_name, fault_description, status, registration_date)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        row["shop_name"],
                        row["fault_description"],
                        row["status"],
                        row["registration_date"],
                    ),
                )
        conn.commit()
    finally:
        conn.close()
