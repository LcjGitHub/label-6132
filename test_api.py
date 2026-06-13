import urllib.request
import json

try:
    r = urllib.request.urlopen('http://localhost:4000/api/photographers')
    data = json.loads(r.read())
    print('拍摄者数量:', len(data))
    for p in data:
        print(f'  - {p["name"]} ({p["city"]})')
except Exception as e:
    print('错误:', e)
