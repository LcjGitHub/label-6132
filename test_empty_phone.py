import urllib.request
import json

url = 'http://localhost:4000/api/photographers'
data = {'name': 'test', 'phone': '', 'city': 'test'}
req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='POST')
req.add_header('Content-Type', 'application/json')
try:
    r = urllib.request.urlopen(req)
    print(f'Status: {r.status}')
    print(r.read().decode())
except urllib.error.HTTPError as e:
    print(f'Status: {e.code}')
    print(e.read().decode())
