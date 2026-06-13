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
    except urllib.error.HTTPError as e:
        body = json.loads(e.read())
        print(f'{method} {url} - HTTP {e.code}: {body.get("detail", body)}')
        return None
    except Exception as e:
        print(f'{method} {url} - 错误: {e}')
        return None

print('=== 测试后端联系电话校验 ===')

print('\n--- 空号码 ---')
test_endpoint('http://localhost:4000/api/photographers', 'POST',
    {'name': '测试1', 'phone': '', 'city': '上海'})

print('\n--- 10位数字 ---')
test_endpoint('http://localhost:4000/api/photographers', 'POST',
    {'name': '测试2', 'phone': '1380013800', 'city': '上海'})

print('\n--- 12位数字 ---')
test_endpoint('http://localhost:4000/api/photographers', 'POST',
    {'name': '测试3', 'phone': '138001380012', 'city': '上海'})

print('\n--- 含字母 ---')
test_endpoint('http://localhost:4000/api/photographers', 'POST',
    {'name': '测试4', 'phone': '13800138abc', 'city': '上海'})

print('\n--- 正确11位数字 ---')
result = test_endpoint('http://localhost:4000/api/photographers', 'POST',
    {'name': '测试5', 'phone': '13800138005', 'city': '上海'})
if result:
    print(f'创建成功，id={result["id"]}')
    test_endpoint(f'http://localhost:4000/api/photographers/{result["id"]}', 'DELETE')

print('\n=== 所有校验测试完成 ===')
