/**
 * GEDO.AI MCP Server
 * 
 * 实现 Model Context Protocol，将 GEDO.AI 的核心能力暴露为工具
 * 供 Claude Desktop、IDE 插件、其他 Agent 平台调用
 * 
 * 所有工具调用都通过 Backend API 实现，保证鉴权和数据一致性
 */

import { createServer } from 'http';
import { TOOLS, TOOL_NAMES } from './tools.mjs';

const PORT = process.env.MCP_PORT || 8788;
const API_BASE = process.env.API_BASE_URL || 'http://localhost:8787';

// 存储会话的 token
const sessions = new Map();

/**
 * 调用 Backend API
 */
async function callBackendAPI(path, method, body, token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return response.json();
}

/**
 * 执行工具调用
 */
async function executeTool(toolName, args, sessionId) {
  const token = sessions.get(sessionId);
  
  // 根据工具名称路由到对应的 API
  switch (toolName) {
    // 记忆工具
    case 'memory.create':
      return callBackendAPI('/v1/memory/capture', 'POST', {
        type: args.type,
        content_raw: args.content,
        user_tags: args.tags || [],
        reminder_date: args.reminderDate,
      }, token);
      
    case 'memory.search':
      return callBackendAPI('/v1/memory/search', 'POST', {
        query: args.query,
        type: args.type,
        tags: args.tags,
        limit: args.limit || 10,
      }, token);
      
    case 'memory.recall_context':
      return callBackendAPI('/v1/memory/recall', 'POST', {
        context: args.context,
        goal_title: args.goalTitle,
        days_ahead: args.daysAhead || 7,
      }, token);
      
    // 目标工具
    case 'goal.create':
      return callBackendAPI('/v1/planner/generate', 'POST', {
        prompt: args.prompt,
        dimension: args.dimension,
        timeframe: args.timeframe,
      }, token);
      
    case 'goal.list':
      const params = new URLSearchParams();
      if (args.status) params.set('status', args.status);
      if (args.dimension) params.set('dimension', args.dimension);
      return callBackendAPI(`/v1/goals?${params}`, 'GET', null, token);
      
    case 'goal.update_progress':
      return callBackendAPI(`/v1/goals/${args.goalId}`, 'PATCH', {
        progress: args.progress,
        status: args.status,
      }, token);
      
    // 任务工具
    case 'task.list_today':
      return callBackendAPI('/v1/tasks/today', 'GET', null, token);
      
    case 'task.checkin':
      return callBackendAPI('/v1/execution/checkin', 'POST', {
        task_id: args.taskId,
        status: args.status,
        reason_code: args.reasonCode,
        reason_note: args.reasonNote,
        actual_duration: args.actualDuration,
      }, token);
      
    case 'task.create':
      return callBackendAPI('/v1/tasks', 'POST', {
        title: args.title,
        goal_id: args.goalId,
        scheduled_date: args.scheduledDate,
        estimated_duration: args.estimatedDuration,
        energy_level: args.energyLevel || 'medium',
        priority: args.priority || 3,
      }, token);
      
    // 计划调整
    case 'plan.adjust':
      return callBackendAPI('/v1/planner/adjust', 'POST', {
        goal_id: args.goalId,
        signal: args.signal,
      }, token);
      
    // 生命之树
    case 'lifetree.snapshot':
      return callBackendAPI('/v1/lifetree/snapshot', 'GET', null, token);
      
    case 'lifetree.balance_check':
      return callBackendAPI('/v1/lifetree/balance', 'GET', null, token);
      
    default:
      return { error: 'unknown_tool', detail: `Tool ${toolName} not found` };
  }
}

/**
 * 处理 MCP 请求
 */
async function handleMCPRequest(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Id');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const sessionId = req.headers['x-session-id'] || 'default';
  
  // 健康检查
  if (url.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'gedo-mcp-server' }));
    return;
  }
  
  // 设置会话 token
  if (url.pathname === '/session/auth' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { token } = JSON.parse(body);
    sessions.set(sessionId, token);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }
  
  // 列出可用工具
  if (url.pathname === '/tools' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      tools: TOOL_NAMES.map(name => ({
        name: TOOLS[name].name,
        description: TOOLS[name].description,
        inputSchema: TOOLS[name].inputSchema,
      })),
    }));
    return;
  }
  
  // 执行工具
  if (url.pathname === '/tools/call' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    
    try {
      const { name, arguments: args } = JSON.parse(body);
      
      if (!TOOL_NAMES.includes(name)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'tool_not_found', detail: `Tool ${name} not found` }));
        return;
      }
      
      const result = await executeTool(name, args || {}, sessionId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'execution_error', detail: error.message }));
    }
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
}

// 启动服务器
const server = createServer(handleMCPRequest);
server.listen(PORT, () => {
  console.log(`[mcp-server] listening on http://localhost:${PORT}`);
  console.log(`[mcp-server] ${TOOL_NAMES.length} tools available`);
});








