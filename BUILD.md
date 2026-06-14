# 霓虹灯维修工单管理系统 — 构建说明

## 项目结构

```
├── backend/           FastAPI 后端服务
│   ├── data_access/   数据访问层
│   ├── tests/         接口自动化测试
│   ├── main.py        应用入口与路由
│   ├── models.py      数据模型
│   ├── database.py    数据库初始化
│   └── requirements.txt
├── frontend/          React + Vite 前端
│   ├── src/           源代码
│   └── package.json
└── .github/workflows/ci.yml   CI 流水线配置
```

## 本地开发环境搭建

### 后端

```bash
cd backend
pip install -r requirements.txt
python run.py
```

服务默认运行在 `http://localhost:4000`，API 文档访问 `/docs`。

### 前端

```bash
cd frontend
npm install
npm run dev
```

前端开发服务器运行在 `http://localhost:4101`。

## 后端接口自动化测试

```bash
cd backend
python -m pytest tests/ -v
```

测试使用 FastAPI TestClient，无需启动服务器即可运行，自动使用独立的测试数据库。

## 前端构建检查

```bash
cd frontend
npm ci
npm run build
```

构建产物输出到 `frontend/dist/`。

## 持续集成（CI）

代码推送到远程仓库时，GitHub Actions 流水线自动执行：

1. **后端任务**：安装依赖 → 运行接口自动化测试
2. **前端任务**：安装依赖 → 构建检查

测试或构建失败时流水线标记为失败，日志中输出中文错误摘要。

## 后端测试依赖说明

| 包名      | 用途                          |
| --------- | ----------------------------- |
| httpx     | FastAPI TestClient 的底层依赖 |
| pytest    | 测试框架                      |
