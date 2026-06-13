import urllib.request
import json

def test_endpoint(url, method='GET', data=None):
    try:
        if data:
            req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method=method)
            req.add_header('Content-Type', 'application/json')
        else:
            req = urllib.request.Request(url, method=method)
        r = urllib.request.urlopen(req)
        result = json.loads(r.read())
        print(f'{method} {url} - {r.status}')
        return result
    except Exception as e:
        print(f'{method} {url} - 错误: {e}')
        return None

print('=== 测试根路径 ===')
try:
    r = urllib.request.urlopen('http://localhost:4000/')
    print(f'状态: {r.status}')
    print(r.read().decode()[:500])
except Exception as e:
    print(f'错误: {e}')

print('\n=== 测试拍摄者列表 ===')
photographers = test_endpoint('http://localhost:4000/api/photographers')
if photographers:
    print(f'拍摄者数量: {len(photographers)}')
    for p in photographers:
        print(f'  - {p["name"]} ({p["city"]}) {p["phone"]}')

print('\n=== 测试创建拍摄者 ===')
new_p = test_endpoint('http://localhost:4000/api/photographers', 'POST', 
    {'name': '测试员', 'phone': '13800000000', 'city': '深圳'})
if new_p:
    print(f'创建成功: {new_p}')
    new_id = new_p['id']
    
    print('\n=== 测试获取单条拍摄者 ===')
    test_endpoint(f'http://localhost:4000/api/photographers/{new_id}')
    
    print('\n=== 测试更新拍摄者 ===')
    test_endpoint(f'http://localhost:4000/api/photographers/{new_id}', 'PUT',
        {'name': '测试员已更新', 'phone': '13900000000', 'city': '成都'})
    
    print('\n=== 测试删除拍摄者 ===')
    try:
        req = urllib.request.Request(f'http://localhost:4000/api/photographers/{new_id}', method='DELETE')
        r = urllib.request.urlopen(req)
        print(f'DELETE - {r.status}')
    except Exception as e:
        print(f'DELETE - 错误: {e}')
