import urllib.request
import json
import sqlite3
from pathlib import Path

print("=" * 60)
print("验证拍摄者档案系统修复")
print("=" * 60)

def test_endpoint(url, method='GET', data=None):
    try:
        if data:
            req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method=method)
            req.add_header('Content-Type', 'application/json')
        else:
            req = urllib.request.Request(url, method=method)
        r = urllib.request.urlopen(req)
        result = json.loads(r.read())
        return r.status, result, None
    except urllib.error.HTTPError as e:
        try:
            error_detail = json.loads(e.read())
        except:
            error_detail = str(e)
        return e.code, None, error_detail
    except Exception as e:
        return 0, None, str(e)

print("\n1. 验证张伟的联系电话已恢复为预置值")
DB_PATH = Path(__file__).parent / "data" / "workorders.db"
conn = sqlite3.connect(DB_PATH)
result = conn.execute("SELECT name, phone FROM photographers WHERE name = ?", ("张伟",)).fetchone()
conn.close()
if result and result[1] == "13800138001":
    print(f"   ✅ 张伟的联系电话正确: {result[1]}")
else:
    print(f"   ❌ 张伟的联系电话错误: {result[1] if result else '未找到'}")

print("\n2. 验证后端联系电话校验 - 非法号码拦截")

test_cases = [
    {"name": "电话为空", "data": {"name": "测试1", "phone": "", "city": "上海"}, "expect_fail": True},
    {"name": "电话为空格", "data": {"name": "测试2", "phone": "   ", "city": "上海"}, "expect_fail": True},
    {"name": "电话不足11位", "data": {"name": "测试3", "phone": "1380013800", "city": "上海"}, "expect_fail": True},
    {"name": "电话超过11位", "data": {"name": "测试4", "phone": "138001380012", "city": "上海"}, "expect_fail": True},
    {"name": "电话包含字母", "data": {"name": "测试5", "phone": "1380013800a", "city": "上海"}, "expect_fail": True},
    {"name": "电话包含特殊字符", "data": {"name": "测试6", "phone": "138-0013-8001", "city": "上海"}, "expect_fail": True},
    {"name": "合法11位数字", "data": {"name": "测试7", "phone": "13900139000", "city": "深圳"}, "expect_fail": False},
]

for test in test_cases:
    status, result, error = test_endpoint(
        'http://localhost:4000/api/photographers',
        'POST',
        test["data"]
    )
    
    if test["expect_fail"]:
        if status == 422 or status == 400:
            print(f"   ✅ {test['name']}: 正确拦截 (状态码: {status})")
        else:
            print(f"   ❌ {test['name']}: 未正确拦截 (状态码: {status})")
    else:
        if status == 201:
            print(f"   ✅ {test['name']}: 创建成功 (状态码: {status})")
            test_id = result["id"]
            test_endpoint(f'http://localhost:4000/api/photographers/{test_id}', 'DELETE')
        else:
            print(f"   ❌ {test['name']}: 创建失败 (状态码: {status}, 错误: {error})")

print("\n3. 验证更新时的联系电话校验")

# 先创建一个合法的拍摄者
status, result, error = test_endpoint(
    'http://localhost:4000/api/photographers',
    'POST',
    {"name": "测试更新", "phone": "13600136000", "city": "广州"}
)

if status == 201:
    test_id = result["id"]
    
    # 尝试更新为非法号码
    status, result, error = test_endpoint(
        f'http://localhost:4000/api/photographers/{test_id}',
        'PUT',
        {"name": "测试更新", "phone": "12345", "city": "广州"}
    )
    
    if status == 422 or status == 400:
        print(f"   ✅ 更新时非法号码正确拦截 (状态码: {status})")
    else:
        print(f"   ❌ 更新时非法号码未拦截 (状态码: {status})")
    
    # 清理测试数据
    test_endpoint(f'http://localhost:4000/api/photographers/{test_id}', 'DELETE')

print("\n4. 验证拍摄者列表数据")
status, result, error = test_endpoint('http://localhost:4000/api/photographers')
if status == 200 and result:
    print(f"   ✅ 成功获取 {len(result)} 名拍摄者")
    for p in result:
        print(f"      - {p['name']}: {p['phone']} ({p['city']})")
else:
    print(f"   ❌ 获取列表失败: {error}")

print("\n" + "=" * 60)
print("修复验证完成")
print("=" * 60)
