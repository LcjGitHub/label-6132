import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from database import init_db, DB_PATH

DB_PATH_TEST = DB_PATH.parent / "test_workorders.db"


@pytest.fixture(scope="session")
def client():
    import database
    original_db_path = database.DB_PATH
    database.DB_PATH = DB_PATH_TEST
    init_db()

    from main import app
    with TestClient(app) as c:
        yield c

    database.DB_PATH = original_db_path
    if DB_PATH_TEST.exists():
        DB_PATH_TEST.unlink()


class TestWorkOrders:
    def test_list_orders(self, client):
        r = client.get("/api/orders")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_create_order(self, client):
        payload = {
            "shop_name": "测试店铺",
            "fault_description": "测试故障",
            "status": "待处理",
            "registration_date": "2026-06-14",
        }
        r = client.post("/api/orders", json=payload)
        assert r.status_code == 201
        body = r.json()
        assert body["shop_name"] == "测试店铺"
        assert "id" in body

    def test_get_order(self, client):
        payload = {
            "shop_name": "获取测试",
            "fault_description": "获取故障",
            "status": "进行中",
            "registration_date": "2026-06-14",
        }
        created = client.post("/api/orders", json=payload).json()
        r = client.get(f"/api/orders/{created['id']}")
        assert r.status_code == 200
        assert r.json()["shop_name"] == "获取测试"

    def test_get_order_not_found(self, client):
        r = client.get("/api/orders/999999")
        assert r.status_code == 404

    def test_update_order(self, client):
        payload = {
            "shop_name": "更新前",
            "fault_description": "更新故障",
            "status": "待处理",
            "registration_date": "2026-06-14",
        }
        created = client.post("/api/orders", json=payload).json()
        updated_payload = {
            "shop_name": "更新后",
            "fault_description": "更新故障",
            "status": "已完成",
            "registration_date": "2026-06-14",
        }
        r = client.put(f"/api/orders/{created['id']}", json=updated_payload)
        assert r.status_code == 200
        assert r.json()["shop_name"] == "更新后"

    def test_delete_order(self, client):
        payload = {
            "shop_name": "删除测试",
            "fault_description": "删除故障",
            "status": "待处理",
            "registration_date": "2026-06-14",
        }
        created = client.post("/api/orders", json=payload).json()
        r = client.delete(f"/api/orders/{created['id']}")
        assert r.status_code == 204

    def test_list_orders_filter_status(self, client):
        r = client.get("/api/orders", params={"status": "待处理"})
        assert r.status_code == 200


class TestNeonSigns:
    def test_list_signs(self, client):
        r = client.get("/api/signs")
        assert r.status_code == 200
        body = r.json()
        assert "items" in body
        assert "stats" in body

    def test_create_sign(self, client):
        payload = {
            "city": "上海",
            "shop_name": "测试招牌",
            "status": "亮",
            "location": "南京路",
            "era_estimate": "1980s",
            "remark": "测试备注",
        }
        r = client.post("/api/signs", json=payload)
        assert r.status_code == 201
        body = r.json()
        assert body["shop_name"] == "测试招牌"

    def test_get_sign(self, client):
        payload = {
            "city": "北京",
            "shop_name": "获取招牌",
            "status": "灭",
            "location": "前门",
        }
        created = client.post("/api/signs", json=payload).json()
        r = client.get(f"/api/signs/{created['id']}")
        assert r.status_code == 200

    def test_get_sign_not_found(self, client):
        r = client.get("/api/signs/999999")
        assert r.status_code == 404

    def test_update_sign(self, client):
        payload = {
            "city": "广州",
            "shop_name": "更新招牌",
            "status": "亮",
            "location": "北京路",
        }
        created = client.post("/api/signs", json=payload).json()
        updated = {
            "city": "深圳",
            "shop_name": "已更新招牌",
            "status": "拆",
            "location": "华强北",
        }
        r = client.put(f"/api/signs/{created['id']}", json=updated)
        assert r.status_code == 200
        assert r.json()["city"] == "深圳"

    def test_delete_sign(self, client):
        payload = {
            "city": "成都",
            "shop_name": "删除招牌",
            "status": "亮",
            "location": "春熙路",
        }
        created = client.post("/api/signs", json=payload).json()
        r = client.delete(f"/api/signs/{created['id']}")
        assert r.status_code == 204

    def test_sign_stats(self, client):
        r = client.get("/api/signs/stats")
        assert r.status_code == 200
        body = r.json()
        assert "cities" in body
        assert "stats" in body

    def test_list_signs_filter(self, client):
        r = client.get("/api/signs", params={"city": "上海"})
        assert r.status_code == 200


class TestPhotographers:
    def test_list_photographers(self, client):
        r = client.get("/api/photographers")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_photographer(self, client):
        payload = {"name": "测试拍摄者", "phone": "13800001111", "city": "上海"}
        r = client.post("/api/photographers", json=payload)
        assert r.status_code == 201
        body = r.json()
        assert body["name"] == "测试拍摄者"

    def test_create_photographer_invalid_phone(self, client):
        payload = {"name": "无效手机", "phone": "123", "city": "上海"}
        r = client.post("/api/photographers", json=payload)
        assert r.status_code == 422

    def test_get_photographer(self, client):
        payload = {"name": "获取拍摄者", "phone": "13800002222", "city": "北京"}
        created = client.post("/api/photographers", json=payload).json()
        r = client.get(f"/api/photographers/{created['id']}")
        assert r.status_code == 200

    def test_update_photographer(self, client):
        payload = {"name": "更新前", "phone": "13800003333", "city": "广州"}
        created = client.post("/api/photographers", json=payload).json()
        updated = {"name": "更新后", "phone": "13800003334", "city": "深圳"}
        r = client.put(f"/api/photographers/{created['id']}", json=updated)
        assert r.status_code == 200
        assert r.json()["name"] == "更新后"

    def test_delete_photographer(self, client):
        payload = {"name": "删除拍摄者", "phone": "13800004444", "city": "成都"}
        created = client.post("/api/photographers", json=payload).json()
        r = client.delete(f"/api/photographers/{created['id']}")
        assert r.status_code == 204


class TestStories:
    def test_list_stories(self, client):
        r = client.get("/api/stories")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_story(self, client):
        payload = {
            "title": "测试故事",
            "content": "测试内容",
            "shop_name": "测试店",
            "publish_date": "2026-06-14",
        }
        r = client.post("/api/stories", json=payload)
        assert r.status_code == 201
        assert r.json()["title"] == "测试故事"

    def test_get_story(self, client):
        payload = {
            "title": "获取故事",
            "content": "获取内容",
            "shop_name": "获取店",
            "publish_date": "2026-06-14",
        }
        created = client.post("/api/stories", json=payload).json()
        r = client.get(f"/api/stories/{created['id']}")
        assert r.status_code == 200

    def test_update_story(self, client):
        payload = {
            "title": "更新前",
            "content": "更新内容",
            "shop_name": "更新店",
            "publish_date": "2026-06-14",
        }
        created = client.post("/api/stories", json=payload).json()
        updated = {
            "title": "更新后",
            "content": "新内容",
            "shop_name": "新店",
            "publish_date": "2026-06-15",
        }
        r = client.put(f"/api/stories/{created['id']}", json=updated)
        assert r.status_code == 200
        assert r.json()["title"] == "更新后"

    def test_delete_story(self, client):
        payload = {
            "title": "删除故事",
            "content": "删除内容",
            "shop_name": "删除店",
            "publish_date": "2026-06-14",
        }
        created = client.post("/api/stories", json=payload).json()
        r = client.delete(f"/api/stories/{created['id']}")
        assert r.status_code == 204


class TestMaterials:
    def test_list_materials(self, client):
        r = client.get("/api/materials")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_material(self, client):
        payload = {
            "name": "测试材质",
            "common_colors": "红、蓝",
            "applicable_era": "1990s",
        }
        r = client.post("/api/materials", json=payload)
        assert r.status_code == 201
        assert r.json()["name"] == "测试材质"

    def test_get_material(self, client):
        payload = {
            "name": "获取材质",
            "common_colors": "绿",
            "applicable_era": "2000s",
        }
        created = client.post("/api/materials", json=payload).json()
        r = client.get(f"/api/materials/{created['id']}")
        assert r.status_code == 200

    def test_update_material(self, client):
        payload = {
            "name": "更新前材质",
            "common_colors": "白",
            "applicable_era": "2010s",
        }
        created = client.post("/api/materials", json=payload).json()
        updated = {
            "name": "更新后材质",
            "common_colors": "黄",
            "applicable_era": "2020s",
        }
        r = client.put(f"/api/materials/{created['id']}", json=updated)
        assert r.status_code == 200
        assert r.json()["name"] == "更新后材质"

    def test_delete_material(self, client):
        payload = {
            "name": "删除材质",
            "common_colors": "紫",
            "applicable_era": "1980s",
        }
        created = client.post("/api/materials", json=payload).json()
        r = client.delete(f"/api/materials/{created['id']}")
        assert r.status_code == 204
