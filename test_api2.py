import urllib.request
import json

def test_endpoint(url, method='GET', data=None):
    try:
        if data:
            req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method=method)
            req.add_header('Content-Type', 'application/json')
        else:
            req = urllib.request.Request(url, method=method)
        r = urllib.request.urlopen(req, timeout=5)
        result = json.loads(r.read())
        print(f'{method} {url} - {r.status}')
        return result
    except Exception as e:
        print(f'{method} {url} - 错误: {e}')
        return None

print('=== 使用 127.0.0.1 测试 ===')
print('\n--- 测试 docs ---')
try:
    r = urllib.request.urlopen('http://127.0.0.1:4000/docs', timeout=5)
    print(f'状态: {r.status}')
except Exception as e:
    print(f'错误: {e}')

print('\n--- 测试拍摄者列表 ---')
photographers = test_endpoint('http://127.0.0.1:4000/api/photographers')
if photographers:
    print(f'拍摄者数量: {len(photographers)}')
    for p in photographers:
        print(f'  - ID:{p["id"]} {p["name"]} ({p["city"]}) {p["phone"]}')

print('\n--- 测试工单列表 ---')
orders = test_endpoint('http://127.0.0.1:4000/api/orders')
if orders:
    print(f'工单数量: {len(orders)}')
