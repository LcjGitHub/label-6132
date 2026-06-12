# 老式霓虹灯招牌存档

记录城市中霓虹灯招牌的 MVP 应用：列表浏览、状态筛选、新增/编辑/删除。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + shadcn/ui + Tailwind，TanStack Query + RHF + zod + axios，端口 **4101** |
| 后端 | FastAPI + SQLite（`./data/neon.db`），端口 **4000** |

## 项目结构

```
├── backend/          # FastAPI 后端
├── frontend/         # React 前端
├── data/             # SQLite 数据库（自动生成）
└── README.md
```

## 启动方式

### 1. 后端（一条命令）

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

后端运行于 http://localhost:4000，API 文档见 http://localhost:4000/docs。

首次启动会自动创建数据库并写入 5 条 seed 数据。

### 2. 前端

```bash
cd frontend
npm install
npm run dev
```

前端运行于 http://localhost:4101。

## 功能说明

- **列表页**：Card 网格展示招牌，顶部 Badge 可按状态（亮 / 灭 / 拆）筛选
- **表单页**：新建或编辑招牌，字段包括店名、城市、地址、状态、年代估计
- **CRUD**：完整的增删改查 API

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/signs` | 列表，可选 `?status=亮` |
| GET | `/api/signs/{id}` | 单条详情 |
| POST | `/api/signs` | 新建 |
| PUT | `/api/signs/{id}` | 更新 |
| DELETE | `/api/signs/{id}` | 删除 |
