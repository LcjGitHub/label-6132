# 霓虹灯维修工单管理

前后端分离的霓虹灯维修工单管理小模块：列表管理系统，支持工单增删改查，按维修状态筛选。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + shadcn/ui + Tailwind，TanStack Query + RHF + zod + axios，端口 **4101** |
| 后端 | FastAPI + SQLite（`./data/workorders.db`），端口 **4000** |

## 项目结构

```
├── backend/          # FastAPI 后端
│   ├── main.py           # API 入口，路由定义
│   ├── models.py         # Pydantic 模型
│   ├── database.py     # SQLite 数据库 & 预置数据
│   ├── run.py            # 启动脚本
│   └── requirements.txt
├── frontend/         # React 前端
│   └── src/
│       ├── api/          # API 调用封装
│       ├── components/ # UI 组件
│       ├── lib/            # 工具 & 校验 schema
│       ├── pages/      # 页面组件
│       └── types/      # TypeScript 类型
├── data/             # SQLite 数据库（自动生成）
└── README.md
```

## 启动方式

### 1. 后端（一条命令启动）

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

后端运行于 http://localhost:4000，API 文档见 http://localhost:4000/docs。

首次启动会自动创建数据库并写入 **5 条** 示例工单数据。

### 2. 前端（一条命令启动）

```bash
cd frontend
npm install
npm run dev
```

前端运行于 http://localhost:4101。

## 功能说明

- **列表页**：表格展示工单，支持按维修状态（待处理 / 进行中 / 已完成）筛选，每行支持编辑和删除操作
- **表单页**：新建或编辑工单，字段包括：
  - 关联店名
  - 故障描述（多行文本）
  - 维修状态（下拉选择）
  - 登记日期（日期选择器，默认今天）
- **CRUD**：完整的增删改查 API

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders` | 列表，可选 `?status=待处理` |
| GET | `/api/orders/{id}` | 单条详情 |
| POST | `/api/orders` | 新建 |
| PUT | `/api/orders/{id}` | 更新 |
| DELETE | `/api/orders/{id}` | 删除 |

## 工单字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键自增 |
| shop_name | string | 关联店名 |
| fault_description | string | 故障描述 |
| status | enum | 维修状态：待处理 / 进行中 / 已完成 |
| registration_date | date | 登记日期（YYYY-MM-DD）|
