"""SQLite 数据库连接与初始化。"""

import sqlite3
from pathlib import Path
from typing import Literal

SignStatus = Literal["亮", "灭", "拆"]

DB_PATH = Path(__file__).parent.parent / "data" / "workorders.db"

SIGN_SEED_DATA = [
    {"city": "上海", "shop_name": "和平饭店", "status": "亮", "location": "南京东路"},
    {"city": "上海", "shop_name": "老广茶楼", "status": "亮", "location": "淮海路"},
    {"city": "上海", "shop_name": "红星电影院", "status": "灭", "location": "四川北路"},
    {"city": "上海", "shop_name": "锦江饭店", "status": "亮", "location": "茂名南路"},
    {"city": "上海", "shop_name": "霓虹酒吧", "status": "灭", "location": "衡山路"},
    {"city": "上海", "shop_name": "上海大世界", "status": "亮", "location": "西藏南路"},
    {"city": "上海", "shop_name": "百乐门舞厅", "status": "拆", "location": "愚园路"},
    {"city": "上海", "shop_name": "南京理发店", "status": "亮", "location": "南京西路"},
    {"city": "北京", "shop_name": "全聚德烤鸭店", "status": "亮", "location": "前门大街"},
    {"city": "北京", "shop_name": "东来顺饭庄", "status": "亮", "location": "王府井"},
    {"city": "北京", "shop_name": "瑞蚨祥绸布店", "status": "灭", "location": "大栅栏"},
    {"city": "北京", "shop_name": "内联升鞋店", "status": "亮", "location": "前门"},
    {"city": "北京", "shop_name": "同仁堂药店", "status": "亮", "location": "崇文门"},
    {"city": "北京", "shop_name": "六必居酱园", "status": "拆", "location": "粮食店街"},
    {"city": "北京", "shop_name": "荣宝斋", "status": "亮", "location": "琉璃厂"},
    {"city": "广州", "shop_name": "陶陶居酒家", "status": "亮", "location": "北京路"},
    {"city": "广州", "shop_name": "莲香楼", "status": "亮", "location": "上下九"},
    {"city": "广州", "shop_name": "广州酒家", "status": "灭", "location": "文昌南路"},
    {"city": "广州", "shop_name": "南信双皮奶", "status": "亮", "location": "第十甫路"},
    {"city": "广州", "shop_name": "皇上皇腊味", "status": "拆", "location": "北京路"},
    {"city": "深圳", "shop_name": "华强北电子城", "status": "亮", "location": "华强北路"},
    {"city": "深圳", "shop_name": "东门老街", "status": "亮", "location": "解放路"},
    {"city": "深圳", "shop_name": "国贸大厦", "status": "灭", "location": "人民南路"},
    {"city": "深圳", "shop_name": "地王大厦", "status": "亮", "location": "深南东路"},
    {"city": "成都", "shop_name": "龙抄手餐厅", "status": "亮", "location": "春熙路"},
    {"city": "成都", "shop_name": "钟水饺", "status": "亮", "location": "总府街"},
    {"city": "成都", "shop_name": "麻婆豆腐", "status": "灭", "location": "青羊宫"},
    {"city": "成都", "shop_name": "赖汤圆", "status": "亮", "location": "总府路"},
    {"city": "成都", "shop_name": "夫妻肺片", "status": "拆", "location": "红星路"},
    {"city": "成都", "shop_name": "担担面", "status": "亮", "location": "太升南路"},
]

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

PHOTOGRAPHER_SEED_DATA = [
    {"name": "张伟", "phone": "13800138001", "city": "上海"},
    {"name": "李娜", "phone": "13900139002", "city": "北京"},
    {"name": "王强", "phone": "13700137003", "city": "广州"},
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

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS neon_signs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL,
                shop_name TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('亮', '灭', '拆')),
                location TEXT NOT NULL
            )
            """
        )
        sign_count = conn.execute("SELECT COUNT(*) FROM neon_signs").fetchone()[0]
        if sign_count == 0:
            for row in SIGN_SEED_DATA:
                conn.execute(
                    """
                    INSERT INTO neon_signs (city, shop_name, status, location)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        row["city"],
                        row["shop_name"],
                        row["status"],
                        row["location"],
                    ),
                )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS photographers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                city TEXT NOT NULL
            )
            """
        )
        photographer_count = conn.execute("SELECT COUNT(*) FROM photographers").fetchone()[0]
        if photographer_count == 0:
            for row in PHOTOGRAPHER_SEED_DATA:
                conn.execute(
                    """
                    INSERT INTO photographers (name, phone, city)
                    VALUES (?, ?, ?)
                    """,
                    (
                        row["name"],
                        row["phone"],
                        row["city"],
                    ),
                )
        conn.commit()
    finally:
        conn.close()
