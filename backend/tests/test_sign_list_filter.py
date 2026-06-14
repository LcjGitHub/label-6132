import os
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import database

TEST_DATA = [
    {"city": "上海", "shop_name": "光明饭店", "status": "亮", "location": "南京路", "era_estimate": "1950s", "remark": "测试亮灯"},
    {"city": "上海", "shop_name": "光辉茶楼", "status": "灭", "location": "淮海路", "era_estimate": "1960s", "remark": "测试灭灯"},
    {"city": "上海", "shop_name": "星光影院", "status": "拆", "location": "四川路", "era_estimate": "1970s", "remark": "测试拆除"},
    {"city": "北京", "shop_name": "光明书店", "status": "亮", "location": "王府井", "era_estimate": "1980s", "remark": "测试亮灯"},
    {"city": "北京", "shop_name": "万达商场", "status": "灭", "location": "前门", "era_estimate": "1990s", "remark": "测试灭灯"},
    {"city": "北京", "shop_name": "顺天饭庄", "status": "拆", "location": "大栅栏", "era_estimate": "2000s", "remark": "测试拆除"},
    {"city": "广州", "shop_name": "光明酒家", "status": "亮", "location": "北京路", "era_estimate": "2010s", "remark": "测试亮灯"},
    {"city": "广州", "shop_name": "南信甜品", "status": "灭", "location": "上下九", "era_estimate": "2020s", "remark": "测试灭灯"},
    {"city": "广州", "shop_name": "恒大杂货", "status": "拆", "location": "中山路", "era_estimate": "1990s", "remark": "测试拆除"},
    {"city": "深圳", "shop_name": "华强电子", "status": "亮", "location": "华强北", "era_estimate": "2010s", "remark": "测试亮灯"},
]


def _insert_test_data(conn):
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
    for row in TEST_DATA:
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
                row["era_estimate"],
                row["remark"],
            ),
        )
    conn.commit()


@pytest.fixture(scope="module")
def client():
    original_db_path = database.DB_PATH
    temp_fd, temp_path = tempfile.mkstemp(suffix=".db")
    os.close(temp_fd)
    database.DB_PATH = Path(temp_path)

    conn = database.get_connection()
    _insert_test_data(conn)
    conn.close()

    from main import app

    with TestClient(app) as c:
        yield c

    database.DB_PATH = original_db_path
    Path(temp_path).unlink(missing_ok=True)


def _get(client, params=None):
    r = client.get("/api/signs", params=params)
    assert r.status_code == 200
    return r.json()


def _assert_stats_consistent(body):
    items = body["items"]
    stats = body["stats"]
    on = sum(1 for s in items if s["status"] == "亮")
    off = sum(1 for s in items if s["status"] == "灭")
    removed = sum(1 for s in items if s["status"] == "拆")
    assert stats["total"] == len(items), (
        f"stats.total={stats['total']} != len(items)={len(items)}"
    )
    assert stats["on_count"] == on, (
        f"stats.on_count={stats['on_count']} != actual on={on}"
    )
    assert stats["off_count"] == off, (
        f"stats.off_count={stats['off_count']} != actual off={off}"
    )
    assert stats["removed_count"] == removed, (
        f"stats.removed_count={stats['removed_count']} != actual removed={removed}"
    )


class TestNoFilter:
    def test_returns_all_signs(self, client):
        body = _get(client)
        assert len(body["items"]) == len(TEST_DATA)

    def test_all_items_valid(self, client):
        body = _get(client)
        for item in body["items"]:
            assert item["status"] in ("亮", "灭", "拆")
            assert item["city"] in {"上海", "北京", "广州", "深圳"}
            assert "shop_name" in item

    def test_stats_match_full_dataset(self, client):
        body = _get(client)
        _assert_stats_consistent(body)
        assert body["stats"]["total"] == 10
        assert body["stats"]["on_count"] == 4
        assert body["stats"]["off_count"] == 3
        assert body["stats"]["removed_count"] == 3


class TestFilterByStatusOn:
    def test_count_and_content(self, client):
        body = _get(client, {"status": "亮"})
        items = body["items"]
        assert len(items) == 4
        for item in items:
            assert item["status"] == "亮"

    def test_stats(self, client):
        body = _get(client, {"status": "亮"})
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 4
        assert body["stats"]["off_count"] == 0
        assert body["stats"]["removed_count"] == 0

    def test_returned_shop_names(self, client):
        body = _get(client, {"status": "亮"})
        names = {item["shop_name"] for item in body["items"]}
        assert names == {"光明饭店", "光明书店", "光明酒家", "华强电子"}


class TestFilterByStatusOff:
    def test_count_and_content(self, client):
        body = _get(client, {"status": "灭"})
        items = body["items"]
        assert len(items) == 3
        for item in items:
            assert item["status"] == "灭"

    def test_stats(self, client):
        body = _get(client, {"status": "灭"})
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 0
        assert body["stats"]["off_count"] == 3
        assert body["stats"]["removed_count"] == 0

    def test_returned_shop_names(self, client):
        body = _get(client, {"status": "灭"})
        names = {item["shop_name"] for item in body["items"]}
        assert names == {"光辉茶楼", "万达商场", "南信甜品"}


class TestFilterByStatusRemoved:
    def test_count_and_content(self, client):
        body = _get(client, {"status": "拆"})
        items = body["items"]
        assert len(items) == 3
        for item in items:
            assert item["status"] == "拆"

    def test_stats(self, client):
        body = _get(client, {"status": "拆"})
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 0
        assert body["stats"]["off_count"] == 0
        assert body["stats"]["removed_count"] == 3

    def test_returned_shop_names(self, client):
        body = _get(client, {"status": "拆"})
        names = {item["shop_name"] for item in body["items"]}
        assert names == {"星光影院", "顺天饭庄", "恒大杂货"}


class TestFilterByCity:
    def test_filter_shanghai(self, client):
        body = _get(client, {"city": "上海"})
        items = body["items"]
        assert len(items) == 3
        for item in items:
            assert item["city"] == "上海"
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 1
        assert body["stats"]["off_count"] == 1
        assert body["stats"]["removed_count"] == 1

    def test_filter_beijing(self, client):
        body = _get(client, {"city": "北京"})
        items = body["items"]
        assert len(items) == 3
        for item in items:
            assert item["city"] == "北京"
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 1
        assert body["stats"]["off_count"] == 1
        assert body["stats"]["removed_count"] == 1

    def test_filter_guangzhou(self, client):
        body = _get(client, {"city": "广州"})
        items = body["items"]
        assert len(items) == 3
        for item in items:
            assert item["city"] == "广州"
        _assert_stats_consistent(body)

    def test_filter_shenzhen_single(self, client):
        body = _get(client, {"city": "深圳"})
        items = body["items"]
        assert len(items) == 1
        assert items[0]["shop_name"] == "华强电子"
        assert items[0]["status"] == "亮"
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 1
        assert body["stats"]["off_count"] == 0
        assert body["stats"]["removed_count"] == 0

    def test_filter_nonexistent_city(self, client):
        body = _get(client, {"city": "杭州"})
        assert len(body["items"]) == 0
        _assert_stats_consistent(body)
        assert body["stats"]["total"] == 0
        assert body["stats"]["on_count"] == 0
        assert body["stats"]["off_count"] == 0
        assert body["stats"]["removed_count"] == 0


class TestFilterByKeyword:
    def test_keyword_guangming(self, client):
        body = _get(client, {"keyword": "光明"})
        items = body["items"]
        assert len(items) == 3
        for item in items:
            assert "光明" in item["shop_name"]
        names = {item["shop_name"] for item in items}
        assert names == {"光明饭店", "光明书店", "光明酒家"}
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 3
        assert body["stats"]["off_count"] == 0
        assert body["stats"]["removed_count"] == 0

    def test_keyword_guang_broader(self, client):
        body = _get(client, {"keyword": "光"})
        items = body["items"]
        assert len(items) == 5
        for item in items:
            assert "光" in item["shop_name"]
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 3
        assert body["stats"]["off_count"] == 1
        assert body["stats"]["removed_count"] == 1

    def test_keyword_huaqiang(self, client):
        body = _get(client, {"keyword": "华强"})
        items = body["items"]
        assert len(items) == 1
        assert items[0]["shop_name"] == "华强电子"
        _assert_stats_consistent(body)

    def test_keyword_nonexistent(self, client):
        body = _get(client, {"keyword": "不存在的店名"})
        assert len(body["items"]) == 0
        _assert_stats_consistent(body)
        assert body["stats"]["total"] == 0

    def test_keyword_partial_match(self, client):
        body = _get(client, {"keyword": "饭"})
        items = body["items"]
        assert len(items) == 2
        for item in items:
            assert "饭" in item["shop_name"]
        names = {item["shop_name"] for item in items}
        assert names == {"光明饭店", "顺天饭庄"}
        _assert_stats_consistent(body)


class TestCombinedFilters:
    def test_status_and_city(self, client):
        body = _get(client, {"status": "亮", "city": "上海"})
        items = body["items"]
        assert len(items) == 1
        assert items[0]["shop_name"] == "光明饭店"
        assert items[0]["status"] == "亮"
        assert items[0]["city"] == "上海"
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 1
        assert body["stats"]["off_count"] == 0
        assert body["stats"]["removed_count"] == 0

    def test_status_off_and_city_beijing(self, client):
        body = _get(client, {"status": "灭", "city": "北京"})
        items = body["items"]
        assert len(items) == 1
        assert items[0]["shop_name"] == "万达商场"
        _assert_stats_consistent(body)
        assert body["stats"]["off_count"] == 1

    def test_status_removed_and_city_guangzhou(self, client):
        body = _get(client, {"status": "拆", "city": "广州"})
        items = body["items"]
        assert len(items) == 1
        assert items[0]["shop_name"] == "恒大杂货"
        _assert_stats_consistent(body)
        assert body["stats"]["removed_count"] == 1

    def test_city_and_keyword(self, client):
        body = _get(client, {"city": "上海", "keyword": "光明"})
        items = body["items"]
        assert len(items) == 1
        assert items[0]["shop_name"] == "光明饭店"
        assert items[0]["city"] == "上海"
        _assert_stats_consistent(body)

    def test_status_and_keyword(self, client):
        body = _get(client, {"status": "亮", "keyword": "光明"})
        items = body["items"]
        assert len(items) == 3
        for item in items:
            assert item["status"] == "亮"
            assert "光明" in item["shop_name"]
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 3

    def test_status_and_keyword_no_match(self, client):
        body = _get(client, {"status": "灭", "keyword": "光明"})
        assert len(body["items"]) == 0
        _assert_stats_consistent(body)
        assert body["stats"]["total"] == 0
        assert body["stats"]["on_count"] == 0
        assert body["stats"]["off_count"] == 0
        assert body["stats"]["removed_count"] == 0

    def test_all_three_filters(self, client):
        body = _get(client, {"status": "亮", "city": "上海", "keyword": "光明"})
        items = body["items"]
        assert len(items) == 1
        assert items[0]["shop_name"] == "光明饭店"
        assert items[0]["status"] == "亮"
        assert items[0]["city"] == "上海"
        _assert_stats_consistent(body)
        assert body["stats"]["total"] == 1
        assert body["stats"]["on_count"] == 1

    def test_all_three_no_match(self, client):
        body = _get(client, {"status": "拆", "city": "深圳", "keyword": "光明"})
        assert len(body["items"]) == 0
        _assert_stats_consistent(body)
        assert body["stats"]["total"] == 0

    def test_status_and_nonexistent_city(self, client):
        body = _get(client, {"status": "亮", "city": "杭州"})
        assert len(body["items"]) == 0
        _assert_stats_consistent(body)

    def test_keyword_and_nonexistent_city(self, client):
        body = _get(client, {"keyword": "光明", "city": "成都"})
        assert len(body["items"]) == 0
        _assert_stats_consistent(body)

    def test_city_shanghai_and_keyword_guang(self, client):
        body = _get(client, {"city": "上海", "keyword": "光"})
        items = body["items"]
        assert len(items) == 3
        for item in items:
            assert item["city"] == "上海"
            assert "光" in item["shop_name"]
        names = {item["shop_name"] for item in items}
        assert names == {"光明饭店", "光辉茶楼", "星光影院"}
        _assert_stats_consistent(body)
        assert body["stats"]["on_count"] == 1
        assert body["stats"]["off_count"] == 1
        assert body["stats"]["removed_count"] == 1
