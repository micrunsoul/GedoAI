# GEDO.AI MCP Server

MCP (Model Context Protocol) Server，将 GEDO.AI 的核心能力暴露为工具，供各类 AI 客户端调用。

## 功能

### 可用工具（15个）

#### 记忆相关
- `memory.create` - 创建新记忆
- `memory.search` - 语义搜索记忆
- `memory.recall_context` - 场景化召回

#### 目标相关
- `goal.create` - 从自然语言创建目标
- `goal.list` - 获取目标列表
- `goal.update_progress` - 更新目标进度

#### 任务相关
- `task.list_today` - 获取今日任务
- `task.checkin` - 任务打卡
- `task.create` - 创建新任务

#### 计划调整
- `plan.adjust` - 根据信号调整计划

#### 生命之树
- `lifetree.snapshot` - 获取快照数据
- `lifetree.balance_check` - 检查维度平衡

## 启动

```bash
cd services/mcp-server
npm start
# 或开发模式
npm run dev
```

默认端口：8788

## API 端点

### 健康检查
```
GET /
```

### 列出工具
```
GET /tools
```

### 执行工具
```
POST /tools/call
Content-Type: application/json
X-Session-Id: your-session-id

{
  "name": "memory.create",
  "arguments": {
    "type": "important_info",
    "content": "测试记忆内容"
  }
}
```

### 设置会话认证
```
POST /session/auth
Content-Type: application/json
X-Session-Id: your-session-id

{
  "token": "your-jwt-token"
}
```

## 环境变量

- `MCP_PORT` - 服务端口（默认 8788）
- `API_BASE_URL` - Backend API 地址（默认 http://localhost:8787）

## 与 Claude Desktop 集成

在 Claude Desktop 的配置文件中添加：

```json
{
  "mcpServers": {
    "gedo": {
      "command": "node",
      "args": ["/path/to/services/mcp-server/src/server.mjs"],
      "env": {
        "API_BASE_URL": "http://localhost:8787"
      }
    }
  }
}
```






