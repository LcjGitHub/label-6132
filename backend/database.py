"""SQLite 数据库连接与初始化。"""

import sqlite3
from pathlib import Path
from typing import Literal

SignStatus = Literal["亮", "灭", "拆"]

DB_PATH = Path(__file__).parent.parent / "data" / "workorders.db"

SIGN_SEED_DATA = [
    {"city": "上海", "shop_name": "和平饭店", "status": "亮", "location": "南京东路", "era_estimate": "1920s-1930s", "remark": "墨绿色玻璃管，约建于1929年，字体遒劲有力，入夜与外滩万国建筑群交相辉映，为外滩地标性霓虹之一。"},
    {"city": "上海", "shop_name": "老广茶楼", "status": "亮", "location": "淮海路", "era_estimate": "1960s-1980s", "remark": "暖黄色霓虹勾勒繁体楷书'老广茶楼'四字，两侧对称配以梅兰竹菊图案，岭南风情浓郁。"},
    {"city": "上海", "shop_name": "红星电影院", "status": "灭", "location": "四川北路", "era_estimate": "1970s-1990s", "remark": "红色五角星造型配'红星'二字，影院停业后招牌保留但电源已切断，灯管仍完整。"},
    {"city": "上海", "shop_name": "锦江饭店", "status": "亮", "location": "茂名南路", "era_estimate": "1950s-1980s", "remark": "金字招牌配白色霓虹边框，楼顶大型'锦'字单字霓虹，在茂名南路上空清晰可见。"},
    {"city": "上海", "shop_name": "霓虹酒吧", "status": "灭", "location": "衡山路", "era_estimate": "2000s-2010s", "remark": "曾是衡山路酒吧街标志性招牌，全彩LED柔性霓虹灯，随酒吧停业已断电多年。"},
    {"city": "上海", "shop_name": "上海大世界", "status": "亮", "location": "西藏南路", "era_estimate": "1980s至今", "remark": "修缮后恢复的复古霓虹，红黄蓝三色玻璃管组成'大世界'三字，配以传统云纹装饰。"},
    {"city": "上海", "shop_name": "百乐门舞厅", "status": "拆", "location": "愚园路", "era_estimate": "1930s", "remark": "原址拆除，招牌原件收藏于上海历史博物馆，红色'百乐门'三字为三十年代原物。"},
    {"city": "上海", "shop_name": "南京理发店", "status": "亮", "location": "南京西路", "era_estimate": "1950s-1980s", "remark": "蓝白相间霓虹旋转柱标志仍在运转，配以'南京理发'四字白色灯管，老店气派犹存。"},
    {"city": "北京", "shop_name": "全聚德烤鸭店", "status": "亮", "location": "前门大街", "era_estimate": "1980s至今", "remark": "金色'全聚德'三字配红色霓虹边框，门楼高悬，与前门箭楼遥相呼应，为前门地标。"},
    {"city": "北京", "shop_name": "东来顺饭庄", "status": "亮", "location": "王府井", "era_estimate": "1980s-2000s", "remark": "绿色字体配白色霓虹描边，古朴匾额风格，王府井步行街入口处醒目可见。"},
    {"city": "北京", "shop_name": "瑞蚨祥绸布店", "status": "灭", "location": "大栅栏", "era_estimate": "1990s", "remark": "老字号匾额式招牌，蓝色霓虹于九十年代加装，近年因文物保护已断电。"},
    {"city": "北京", "shop_name": "内联升鞋店", "status": "亮", "location": "前门", "era_estimate": "2000s至今", "remark": "匾额下方加装黄色霓虹灯带，传统与现代结合，夜晚金字熠熠生辉。"},
    {"city": "北京", "shop_name": "同仁堂药店", "status": "亮", "location": "崇文门", "era_estimate": "1970s-1990s", "remark": "黑底金字匾额配红色霓虹轮廓，'同仁堂'三字在崇文门路口极为醒目。"},
    {"city": "北京", "shop_name": "六必居酱园", "status": "拆", "location": "粮食店街", "era_estimate": "1950s-1970s", "remark": "老店原址改建，旧招牌已移入博物馆，黄色六必居三字为五六十年代款式。"},
    {"city": "北京", "shop_name": "荣宝斋", "status": "亮", "location": "琉璃厂", "era_estimate": "1990s至今", "remark": "文房老字号，淡雅白色霓虹勾勒匾额边框，不事张扬而韵味悠长，与琉璃厂文化街契合。"},
    {"city": "广州", "shop_name": "陶陶居酒家", "status": "亮", "location": "北京路", "era_estimate": "1980s-2000s", "remark": "岭南骑楼建筑上高悬的金色大字，红色霓虹描边，配以茶楼传统满洲窗图案灯饰。"},
    {"city": "广州", "shop_name": "莲香楼", "status": "亮", "location": "上下九", "era_estimate": "1990s-2010s", "remark": "粉紫色霓虹'莲香楼'三字，配以莲花造型灯饰，与上下九步行街骑楼群融为一体。"},
    {"city": "广州", "shop_name": "广州酒家", "status": "灭", "location": "文昌南路", "era_estimate": "2000s至今", "remark": "文昌南路老店装修期间招牌临时断电，预计翻新后重新点亮，原招牌为橙色霓虹。"},
    {"city": "广州", "shop_name": "南信双皮奶", "status": "亮", "location": "第十甫路", "era_estimate": "2010s至今", "remark": "奶白色霓虹配绿色文字，店名旁有小碗双皮奶造型灯，童趣盎然。"},
    {"city": "广州", "shop_name": "皇上皇腊味", "status": "拆", "location": "北京路", "era_estimate": "1980s-2000s", "remark": "北京路步行街上旧址重建，原红色'皇上皇'招牌已拆除，新址在附近重新装修。"},
    {"city": "深圳", "shop_name": "华强北电子城", "status": "亮", "location": "华强北路", "era_estimate": "2010s至今", "remark": "巨型LED全彩屏招牌，可动态变换图案和文字，为华强北商业街标志性景观。"},
    {"city": "深圳", "shop_name": "东门老街", "status": "亮", "location": "解放路", "era_estimate": "2000s至今", "remark": "复古风格霓虹牌坊，红蓝绿三色玻璃管组合，重现深圳老街八十年代繁盛景象。"},
    {"city": "深圳", "shop_name": "国贸大厦", "status": "灭", "location": "人民南路", "era_estimate": "1980s-1990s", "remark": "深圳地标'国贸'二字霓虹，大厦外墙维护时临时关闭，蓝色大字曾是深圳天际线标志。"},
    {"city": "深圳", "shop_name": "地王大厦", "status": "亮", "location": "深南东路", "era_estimate": "1990s至今", "remark": "楼顶金色'地王大厦'立体字，配白色霓虹轮廓，深南大道远眺清晰可见。"},
    {"city": "成都", "shop_name": "龙抄手餐厅", "status": "亮", "location": "春熙路", "era_estimate": "1990s-2010s", "remark": "红色'龙'字造型霓虹，配以春熙路现代商业街区氛围，传统小吃与现代都市并存。"},
    {"city": "成都", "shop_name": "钟水饺", "status": "亮", "location": "总府街", "era_estimate": "2000s至今", "remark": "木质匾额配暖黄霓虹灯带，与周围火锅店招牌相映成趣，总府街美食地标之一。"},
    {"city": "成都", "shop_name": "麻婆豆腐", "status": "灭", "location": "青羊宫", "era_estimate": "1980s-2000s", "remark": "青羊宫附近老店搬迁，旧招牌拆除中，原红色麻辣风格霓虹灯令人印象深刻。"},
    {"city": "成都", "shop_name": "赖汤圆", "status": "亮", "location": "总府路", "era_estimate": "2010s至今", "remark": "白色汤圆造型灯配店名，汤圆造型灯在夜晚缓缓旋转，设计巧妙，吸引游客驻足。"},
    {"city": "成都", "shop_name": "夫妻肺片", "status": "拆", "location": "红星路", "era_estimate": "1980s-1990s", "remark": "红星路改造工程中旧店拆除，招牌原件由餐饮博物馆收藏，原红黑配色极具川菜特色。"},
    {"city": "成都", "shop_name": "担担面", "status": "亮", "location": "太升南路", "era_estimate": "2000s-2020s", "remark": "面馆门口小型担担面人物造型霓虹灯，老成都挑担小贩形象栩栩如生，市井味十足。"},
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

STORY_SEED_DATA = [
    {
        "title": "和平饭店：外滩边的霓虹传奇",
        "content": "夜幕降临，外滩的灯火次第亮起。和平饭店楼顶的墨绿色霓虹灯牌，在1929年便已矗立于此。它见证了上海滩近百年的风云变幻，从民国时期的十里洋场，到新中国成立后的繁华盛景，再到改革开放后焕然一新的金融中心。老上海人常说，只要和平饭店的灯还亮着，这座城市的脉搏就不会停止跳动。",
        "shop_name": "和平饭店",
        "publish_date": "2026-06-10",
    },
    {
        "title": "百乐门舞厅的最后一盏灯",
        "content": "百乐门舞厅，曾被誉为'远东第一乐府'。上世纪三四十年代，这里的红色霓虹招牌每晚照亮整条愚园路，爵士乐声中，名流绅士与旗袍淑女翩翩起舞。然而岁月流转，舞厅几经易主，最终在城市更新的浪潮中画上句号。那盏标志性的霓虹灯被收藏进博物馆，成为一代人永不褪色的记忆。",
        "shop_name": "百乐门舞厅",
        "publish_date": "2026-06-08",
    },
    {
        "title": "红星电影院：光影中的童年",
        "content": "上世纪80年代，每个周末的傍晚，四川北路上'红星'二字的霓虹灯总会准时亮起。5毛钱一张电影票，一包奶油瓜子，就能度过一个梦幻般的夜晚。影院门口，孩子们在霓虹灯下追逐嬉戏，大人们讨论着刚刚散场的剧情。如今影院已不复往昔，但每当路过这里，那两个红字似乎还在眼前闪烁，提醒着我们那些纯粹而美好的时光。",
        "shop_name": "红星电影院",
        "publish_date": "2026-06-05",
    },
]

NEON_MATERIAL_SEED_DATA = [
    {"name": "钠灯玻璃管", "common_colors": "暖黄、橙黄", "applicable_era": "1950s-1980s"},
    {"name": "氖气直管", "common_colors": "红、橙红", "applicable_era": "1920s-1970s"},
    {"name": "荧光粉涂层管", "common_colors": "蓝、绿、粉、白", "applicable_era": "1960s-1990s"},
    {"name": "氩气汞管", "common_colors": "蓝、紫", "applicable_era": "1930s-1960s"},
    {"name": "柔性霓虹灯带", "common_colors": "全彩可变", "applicable_era": "2000s至今"},
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
                location TEXT NOT NULL,
                era_estimate TEXT,
                remark TEXT
            )
            """
        )
        remark_exists = conn.execute(
            "SELECT COUNT(*) FROM pragma_table_info('neon_signs') WHERE name = 'remark'"
        ).fetchone()[0]
        if remark_exists == 0:
            conn.execute("ALTER TABLE neon_signs ADD COLUMN remark TEXT")
        era_exists = conn.execute(
            "SELECT COUNT(*) FROM pragma_table_info('neon_signs') WHERE name = 'era_estimate'"
        ).fetchone()[0]
        if era_exists == 0:
            conn.execute("ALTER TABLE neon_signs ADD COLUMN era_estimate TEXT")
        sign_count = conn.execute("SELECT COUNT(*) FROM neon_signs").fetchone()[0]
        if sign_count == 0:
            for row in SIGN_SEED_DATA:
                conn.execute(
                    """
                    INSERT INTO neon_signs (city, shop_name, status, location, era_estimate, remark)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        row["city"],
                        row["shop_name"],
                        row["status"],
                        row["location"],
                        row.get("era_estimate"),
                        row.get("remark"),
                    ),
                )
        else:
            seed_lookup: dict[tuple[str, str], dict[str, str]] = {
                (r["city"], r["shop_name"]): {
                    "remark": r.get("remark") or "",
                    "era_estimate": r.get("era_estimate") or "",
                }
                for r in SIGN_SEED_DATA
            }
            empty_rows = conn.execute(
                "SELECT id, city, shop_name FROM neon_signs WHERE (remark IS NULL OR remark = '') OR (era_estimate IS NULL OR era_estimate = '')"
            ).fetchall()
            for row in empty_rows:
                key = (row["city"], row["shop_name"])
                if key in seed_lookup:
                    patch = seed_lookup[key]
                    conn.execute(
                        "UPDATE neon_signs SET remark = ?, era_estimate = ? WHERE id = ?",
                        (patch["remark"], patch["era_estimate"], row["id"]),
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

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS stories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                shop_name TEXT NOT NULL,
                publish_date TEXT NOT NULL
            )
            """
        )
        story_count = conn.execute("SELECT COUNT(*) FROM stories").fetchone()[0]
        if story_count == 0:
            for row in STORY_SEED_DATA:
                conn.execute(
                    """
                    INSERT INTO stories (title, content, shop_name, publish_date)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        row["title"],
                        row["content"],
                        row["shop_name"],
                        row["publish_date"],
                    ),
                )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS neon_materials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                common_colors TEXT NOT NULL,
                applicable_era TEXT NOT NULL
            )
            """
        )
        material_count = conn.execute("SELECT COUNT(*) FROM neon_materials").fetchone()[0]
        if material_count == 0:
            for row in NEON_MATERIAL_SEED_DATA:
                conn.execute(
                    """
                    INSERT INTO neon_materials (name, common_colors, applicable_era)
                    VALUES (?, ?, ?)
                    """,
                    (
                        row["name"],
                        row["common_colors"],
                        row["applicable_era"],
                    ),
                )
        conn.commit()
    finally:
        conn.close()
