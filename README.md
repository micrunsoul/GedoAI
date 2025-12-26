# GEDO.AI（智动）

> 记忆沉淀 · 目标拆解 · 行动落地 · 进度反馈

GEDO.AI 是一个基于「个人长期记忆系统」和「AI 智能规划引擎」的全链路效率工具，帮助职场人、学生、创业者解决「目标模糊、记忆零散、执行低效」三大痛点。

## 核心功能

- **智忆库**：智能记忆捕捉、结构化提取、语义检索
- **智引**：SMART 目标拆解、生命之花平衡、动态调整
- **今日行动**：任务打卡、进度追踪、AI 调整建议
- **生命之树**：可视化人生全景，技能为根、目标为果

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16, React 19, Tailwind CSS, Framer Motion |
| 后端 | Node.js 20, Hono.js |
| 数据库 | PostgreSQL 16 + pgvector |
| AI | Ollama (Qwen2.5), BGE-M3, DeepSeek API |
| 部署 | Vercel (前端), Railway (后端) |

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/your-org/GedoAI.git
cd GedoAI

# 2. 启动数据库
docker-compose up -d

# 3. 启动后端
cd services/backend-api && npm install && npm run dev

# 4. 启动前端（新终端）
cd GedoAIWeb && npm install && npm run dev

# 5. 访问 http://localhost:3000
```

## 项目结构

```
GedoAI/
├── GedoAIWeb/              # Next.js 前端
│   ├── app/                # App Router 页面
│   │   ├── app/            # 应用内页面（需登录）
│   │   ├── auth/           # 认证页面
│   │   └── components/     # UI 组件
│   └── lib/                # 工具库
├── services/
│   ├── backend-api/        # 后端 API 服务
│   │   ├── db/             # 数据库 Schema
│   │   └── src/            # 源码
│   ├── mcp-server/         # MCP 工具服务器
│   └── agent/              # AI Agent 模块
├── docs/                   # 文档
│   ├── TECHNICAL_ARCHITECTURE.md
│   └── DEPLOYMENT.md
└── scripts/                # 部署脚本
```

## 文档

- [技术架构](docs/TECHNICAL_ARCHITECTURE.md)
- [部署指南](docs/DEPLOYMENT.md)

## License

MIT

---

# GEDO.AI (智动)

> 以"个人长期记忆系统"为基础，"AI智能规划引擎"为核心的全链路效率工具

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![pgvector](https://img.shields.io/badge/pgvector-0.7-green)](https://github.com/pgvector/pgvector)

---

## 🎯 产品定位

解决"**目标模糊、记忆零散、执行低效**"三大痛点，为职场人、学生、创业者提供"**记忆沉淀 → 目标拆解 → 行动落地 → 进度反馈**"的全链路效率工具。

### 核心价值

| 痛点 | 解决方案 |
|------|----------|
| 目标模糊 | AI 澄清 + SMART 拆解 + 生命之花平衡 |
| 记忆零散 | 智忆库 + 结构化存储 + 语义检索 + 场景化召回 |
| 执行低效 | 今日任务 + 智能打卡 + 原因分析 + 动态调整 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                          用户层                                      │
│   Web (PC + Mobile)  │  MCP Client (Claude/IDE)  │  Agent API       │
└───────────────────────────────────────┬─────────────────────────────┘
                                        │
┌───────────────────────────────────────┼─────────────────────────────┐
│                        接入层          │                              │
│   Backend API (Hono.js)    ◄──────────┼──────►  MCP Server           │
└───────────────────────────────────────┼─────────────────────────────┘
                                        │
┌───────────────────────────────────────┼─────────────────────────────┐
│                        智能层          │                              │
│   PlannerAgent  │  RecallAgent  │  AnalysisAgent                     │
│                        │                                             │
│   LLM: Qwen2.5 / DeepSeek / OpenAI                                   │
│   Embed: BGE-M3 (1024d)  │  Rerank: BGE-Reranker-v2-M3              │
└───────────────────────────────────────┼─────────────────────────────┘
                                        │
┌───────────────────────────────────────┼─────────────────────────────┐
│                        数据层          │                              │
│   PostgreSQL + pgvector (结构化 + 向量混合存储)                       │
│   Row Level Security (用户数据隔离)                                   │
│   Object Storage (语音/图片)                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 项目结构

```
GedoAI/
├── GedoAIWeb/                    # Next.js 前端应用
│   └── app/
│       ├── (marketing)/          # 营销落地页
│       ├── app/                  # 产品区路由
│       │   ├── tree/             # 生命之树主视图
│       │   ├── memory/           # 智忆库
│       │   ├── goals/            # 目标管理
│       │   ├── today/            # 今日任务
│       │   ├── insights/         # 复盘洞察
│       │   └── settings/         # 设置
│       └── components/           # 组件库
│           ├── life-tree/        # 生命之树 SVG
│           ├── memory/           # 记忆组件
│           ├── planner/          # 规划组件
│           └── execution/        # 执行组件
│
├── services/
│   ├── backend-api/              # 后端 API 服务
│   │   ├── db/
│   │   │   ├── schema.sql        # 数据库设计
│   │   │   └── README.md
│   │   └── src/
│   │       ├── server.mjs        # API 入口
│   │       ├── routes/           # 路由定义
│   │       ├── services/         # 业务逻辑
│   │       └── llm/              # LLM Provider
│   │
│   ├── mcp-server/               # MCP 工具服务
│   │   └── src/
│   │       ├── server.mjs        # MCP 入口
│   │       └── tools.mjs         # 工具定义
│   │
│   └── agent/                    # AI Agent
│       └── src/
│           ├── PlannerAgent.mjs  # 规划代理
│           └── RecallAgent.mjs   # 召回代理
│
└── docs/
    └── TECHNICAL_ARCHITECTURE.md # 技术文档
```

---

## 🚀 快速开始

### 环境要求

- Node.js 20+
- PostgreSQL 16+ with pgvector
- Ollama (可选，本地 LLM)

### 1. 安装依赖

```bash
# 前端
cd GedoAIWeb
npm install

# 后端
cd ../services/backend-api
npm install

# MCP Server
cd ../mcp-server
npm install
```

### 2. 配置数据库

```bash
# 创建数据库
createdb gedoai

# 启用 pgvector 扩展
psql gedoai -c "CREATE EXTENSION IF NOT EXISTS vector;"

# 初始化 schema
psql gedoai -f services/backend-api/db/schema.sql
```

### 3. 配置环境变量

```bash
# services/backend-api/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/gedoai
JWT_SECRET=your-secret
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```

### 4. 启动服务

```bash
# 终端 1: 启动后端
cd services/backend-api
npm run dev

# 终端 2: 启动前端
cd GedoAIWeb
npm run dev

# 终端 3: 启动 MCP (可选)
cd services/mcp-server
npm run dev
```

### 5. 访问应用

- 前端: http://localhost:3000
- API: http://localhost:8787
- MCP: http://localhost:8788

---

## 🧠 核心功能

### 1. 智忆库 (Memory Center)

- **主动记录**: 文本/语音/图片三种输入方式
- **自动提取**: LLM 提取人物、技能、情绪、结论等结构化信息
- **混合检索**: SQL 结构化查询 + pgvector 向量检索 + Rerank 精排
- **场景召回**: 创建目标时自动关联相关经验和能力

### 2. 智引 (AI Planner)

- **目标澄清**: 多轮对话 + 选项式回答，降低决策成本
- **SMART 拆解**: 自动生成具体、可衡量、可实现的目标
- **层级分解**: 长期愿景 → 里程碑 → 月/周/日任务
- **生命之花**: 8 维度平衡检查，避免生活失衡

### 3. 执行与反馈

- **今日任务**: 按能量/优先级排序的每日行动清单
- **智能打卡**: 完成/未完成 + 原因记录 + 心情反馈
- **动态调整**: 根据原因自动建议拆分/顺延/缩减
- **复盘沉淀**: 周/月复盘，洞察生成，经验写回记忆

### 4. 生命之树 (LifeTree)

- **可视化隐喻**: 技能为根、任务为叶、目标为花果
- **交互式探索**: 点击节点查看详情，支持筛选和聚焦
- **进度反馈**: 完成状态映射为树的生长状态

---

## 🔧 技术栈

| 层次 | 技术选型 |
|------|----------|
| **前端** | Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion |
| **后端** | Hono.js, Node.js 20, JWT |
| **数据库** | PostgreSQL 16 + pgvector (结构化 + 向量) |
| **AI/ML** | Qwen2.5 (LLM), BGE-M3 (Embed), BGE-Reranker (Rerank) |
| **部署** | Ollama (本地), Vercel (前端), Railway (后端) |

---

## 📚 文档

- [技术架构文档](./docs/TECHNICAL_ARCHITECTURE.md) - 完整的系统设计
- [数据库设计](./services/backend-api/db/README.md) - Schema 说明
- [MCP Server](./services/mcp-server/README.md) - 工具接口文档
- [Agent](./services/agent/README.md) - AI Agent 使用指南

---

## 🗺️ 路线图

### MVP (当前)
- [x] 生命之树可视化
- [x] 智忆库基础功能
- [x] 目标创建向导
- [x] 今日任务与打卡
- [x] 复盘洞察页面
- [x] MCP Server
- [x] 基础 Agent

### v1.1
- [ ] 语音输入 (Whisper)
- [ ] 图片 OCR
- [ ] 真实 LLM 集成
- [ ] 生产数据库部署

### v1.2
- [ ] 移动端优化
- [ ] 推送通知
- [ ] 数据导出

### v2.0
- [ ] iOS/Android 原生应用
- [ ] 团队协作
- [ ] 高级分析

---

## 📄 许可证

MIT License

---

<p align="center">
  <b>GEDO.AI</b> - 让每一次成长都有迹可循
</p>



