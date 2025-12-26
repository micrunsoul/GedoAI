# GEDO.AI 部署指南

## 目录

1. [本地开发环境](#本地开发环境)
2. [前端部署 (Vercel)](#前端部署-vercel)
3. [后端部署 (Railway)](#后端部署-railway)
4. [数据库配置](#数据库配置)
5. [LLM 配置](#llm-配置)
6. [对象存储配置](#对象存储配置)

---

## 本地开发环境

### 前置要求

- Node.js 20.x LTS
- npm 10.x
- Docker (用于 PostgreSQL)
- Ollama (可选，用于本地 LLM)

### 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/your-org/GedoAI.git
cd GedoAI

# 2. 启动 PostgreSQL
docker-compose up -d

# 3. 安装后端依赖并启动
cd services/backend-api
npm install
npm run dev

# 4. 新开终端，安装前端依赖并启动
cd GedoAIWeb
npm install
npm run dev

# 5. 访问 http://localhost:3000
```

### 可选：启用 LLM

```bash
# 安装 Ollama 并下载模型
chmod +x scripts/setup-ollama.sh
./scripts/setup-ollama.sh
```

---

## 前端部署 (Vercel)

### 步骤 1: 连接仓库

1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 导入 GitHub 仓库
4. 选择 `GedoAIWeb` 目录作为根目录

### 步骤 2: 配置环境变量

在 Vercel 项目设置中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-api.railway.app` | 后端 API 地址 |

### 步骤 3: 部署

- Vercel 会自动检测 Next.js 项目并构建
- 构建命令：`npm run build`
- 输出目录：`.next`

### 自定义域名

1. 进入项目 Settings → Domains
2. 添加自定义域名（如 `gedo.ai`）
3. 按提示配置 DNS 记录

---

## 后端部署 (Railway)

### 步骤 1: 创建项目

1. 登录 [Railway](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择仓库，设置根目录为 `services/backend-api`

### 步骤 2: 添加 PostgreSQL

1. 在项目中点击 "+ New"
2. 选择 "Database" → "PostgreSQL"
3. Railway 会自动注入 `DATABASE_URL` 环境变量

### 步骤 3: 配置环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PORT` | `8787` | 服务端口 |
| `JWT_SECRET` | `<随机字符串>` | JWT 签名密钥 |
| `CORS_ORIGIN` | `https://gedo.ai` | 前端域名 |
| `USE_POSTGRES` | `true` | 启用 PostgreSQL |
| `ENABLE_LLM` | `true` | 启用 LLM |
| `LLM_PROVIDER` | `deepseek` | LLM 供应商 |
| `DEEPSEEK_API_KEY` | `<API Key>` | DeepSeek API 密钥 |

### 步骤 4: 初始化数据库

```bash
# 连接到 Railway PostgreSQL
railway connect postgres

# 执行 schema
\i services/backend-api/db/schema.sql
```

或使用 Railway 的 SQL 编辑器直接粘贴执行 `schema.sql`。

---

## 数据库配置

### 开发环境 (Docker)

```bash
# 启动
docker-compose up -d

# 停止
docker-compose down

# 查看日志
docker-compose logs -f postgres

# 连接数据库
psql postgresql://gedo:gedo_dev_password@localhost:5432/gedoai
```

### 生产环境选项

| 服务商 | 特点 | 价格 |
|--------|------|------|
| **Railway PostgreSQL** | 与后端同平台，简单 | $5/月起 |
| **Supabase** | 内置 pgvector，Auth | 免费 500MB |
| **Neon** | Serverless，自动扩缩 | 免费 0.5GB |

### pgvector 索引优化

```sql
-- 创建 IVFFlat 索引加速向量检索
CREATE INDEX IF NOT EXISTS idx_memories_embedding_ivfflat 
ON memories 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 分析表以更新统计信息
ANALYZE memories;
```

---

## LLM 配置

### 方案对比

| 方案 | 成本 | 延迟 | 推荐场景 |
|------|------|------|----------|
| **Ollama (本地)** | 免费 | 低 | 开发/测试 |
| **DeepSeek API** | $0.14/M | 中 | 生产推荐 |
| **OpenAI API** | $0.15/M | 低 | 高质量需求 |

### DeepSeek 配置（推荐生产）

1. 注册 [DeepSeek](https://platform.deepseek.com)
2. 获取 API Key
3. 设置环境变量：

```env
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-xxx
```

### Ollama 本地部署

```bash
# 安装
brew install ollama  # macOS
# 或 curl -fsSL https://ollama.com/install.sh | sh  # Linux

# 下载模型
ollama pull qwen2.5:7b-instruct
ollama pull bge-m3

# 启动服务
ollama serve
```

---

## 对象存储配置

### Cloudflare R2

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 创建 R2 Bucket
3. 生成 API Token
4. 配置环境变量：

```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=gedoai-uploads
```

### 上传 API 端点

后端会自动提供 `/v1/upload` 端点（Phase 4 实现）。

---

## 健康检查

### 后端健康检查

```bash
curl https://your-api.railway.app/
# 返回: GEDO.AI backend-api ok
```

### 数据库健康检查

```bash
curl https://your-api.railway.app/v1/health
# 返回: { "ok": true, "db": "connected", "llm": "available" }
```

---

## 常见问题

### Q: 前端无法连接后端 API

1. 检查 `NEXT_PUBLIC_API_BASE_URL` 是否正确
2. 检查后端 `CORS_ORIGIN` 是否包含前端域名
3. 确保后端服务正在运行

### Q: LLM 返回空结果

1. 检查 `ENABLE_LLM` 是否为 `true`
2. 检查 API Key 是否有效
3. 查看后端日志排查错误

### Q: 向量检索很慢

1. 确保创建了 IVFFlat 索引
2. 运行 `ANALYZE memories` 更新统计信息
3. 考虑增加 `lists` 参数（如 200）

---

## 部署清单

- [ ] PostgreSQL 数据库已创建
- [ ] schema.sql 已执行
- [ ] 后端环境变量已配置
- [ ] 前端环境变量已配置
- [ ] 域名 DNS 已配置
- [ ] SSL 证书已启用
- [ ] LLM API Key 已配置
- [ ] 健康检查通过

