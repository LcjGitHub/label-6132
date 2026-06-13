import sys
sys.path.insert(0, r'f:\Lcj\0613\label-6132\backend')
from main import app

print('已注册的路由:')
for route in app.routes:
    print(f'  {route.methods} {route.path}')
