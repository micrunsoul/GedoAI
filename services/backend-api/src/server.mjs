import http from 'node:http';
import { URL } from 'node:url';

import { hashPassword, signJwt, verifyJwt, verifyPassword } from './lib/crypto.mjs';
import { Store } from './lib/store.mjs';
import * as PlannerService from './services/planner.service.mjs';

const store = Store();

// 是否启用 LLM（可通过环境变量控制）
const ENABLE_LLM = process.env.ENABLE_LLM !== 'false';

const PORT = Number(process.env.PORT || 8787);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

function sendJson(res, status, data, extraHeaders = {}) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

function sendText(res, status, text, extraHeaders = {}) {
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    ...extraHeaders,
  });
  res.end(text);
}

function corsHeaders() {
  return {
    'access-control-allow-origin': CORS_ORIGIN,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-allow-credentials': 'true',
  };
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return { __parse_error: true };
  }
}

function getBearerToken(req) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/.exec(h);
  return m ? m[1] : null;
}

function requireUser(req, res) {
  const token = getBearerToken(req);
  if (!token) {
    sendJson(res, 401, { error: 'unauthorized' }, corsHeaders());
    return null;
  }
  const v = verifyJwt(token, JWT_SECRET);
  if (!v.ok) {
    sendJson(res, 401, { error: 'unauthorized', detail: v.error }, corsHeaders());
    return null;
  }
  const user = store.getUserById(v.payload.sub);
  if (!user) {
    sendJson(res, 401, { error: 'unauthorized' }, corsHeaders());
    return null;
  }
  return user;
}

function sanitizeUser(u) {
  return { id: u.id, email: u.email, created_at: u.created_at };
}

async function buildClarifyQuestions(prompt, userId) {
  // 启用 LLM 时使用 AI 生成问题
  if (ENABLE_LLM) {
    try {
      const userMemories = store.searchMemory(userId, '').slice(0, 5);
      return await PlannerService.generateClarifyQuestions(prompt, userMemories);
    } catch (error) {
      console.error('[API] LLM clarify error:', error);
      // 降级到规则
    }
  }
  
  // 规则化占位
  const p = String(prompt || '').toLowerCase();
  const questions = [];
  if (p.includes('cpa')) {
    questions.push({
      id: 'cpa_priority',
      prompt: '你的 CPA 备考优先级是？',
      options: [
        { value: 'acct_audit', label: '会计 + 审计' },
        { value: 'tax_law', label: '税法 + 经济法' },
      ],
    });
    questions.push({
      id: 'daily_time',
      prompt: '你每天可用于学习的时间大约多久？（小时）',
      options: [
        { value: '1', label: '1 小时' },
        { value: '2', label: '2 小时' },
        { value: '3', label: '3 小时' },
      ],
    });
    return questions;
  }

  questions.push({
    id: 'timebound',
    prompt: '这个目标的期望截止时间是？',
    options: [
      { value: '1m', label: '1 个月' },
      { value: '3m', label: '3 个月' },
      { value: '6m', label: '6 个月' },
      { value: '1y', label: '1 年' },
    ],
  });
  questions.push({
    id: 'weekly_hours',
    prompt: '你每周可投入的总时间（小时）大概是？',
    options: [
      { value: '3', label: '3 小时' },
      { value: '6', label: '6 小时' },
      { value: '10', label: '10 小时' },
    ],
  });
  return questions;
}

async function buildPlanTasks(prompt, answers, userId) {
  const title = String(prompt || '').trim() || '未命名目标';
  
  // 启用 LLM 时使用 AI 生成 SMART 计划
  if (ENABLE_LLM) {
    try {
      const userMemories = store.searchMemory(userId, '').slice(0, 5);
      const plan = await PlannerService.generateSmartPlan(prompt, answers, userMemories);
      
      return {
        goal: {
          title: plan.goal.title || title,
          description: plan.goal.description,
          life_wheel_dimension: plan.goal.life_wheel_dimension,
          specific: plan.goal.specific,
          measurable: plan.goal.measurable,
          achievable: plan.goal.achievable,
          relevant: plan.goal.relevant,
          time_bound: plan.goal.time_bound,
          created_at: new Date().toISOString(),
          meta: { answers: answers || {}, milestones: plan.milestones },
        },
        tasks: plan.tasks.map(t => ({
          title: t.title,
          estimated_duration: t.estimated_duration,
          energy_level: t.energy_level,
        })),
      };
    } catch (error) {
      console.error('[API] LLM plan error:', error);
      // 降级到规则
    }
  }
  
  // 规则化占位
  const goal = {
    title,
    created_at: new Date().toISOString(),
    meta: { answers: answers || {} },
  };

  const tasks = [
    { title: `拆解目标：${title}（定义里程碑）` },
    { title: `收集资料：为「${title}」准备资源清单` },
    { title: `执行第一步：完成 1 个最小行动` },
  ];
  return { goal, tasks };
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = u.pathname;
  const method = (req.method || 'GET').toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  // health
  if (method === 'GET' && pathname === '/') {
    sendText(res, 200, 'GEDO.AI backend-api ok', corsHeaders());
    return;
  }

  // Auth
  if (method === 'POST' && pathname === '/v1/auth/signup') {
    const body = await readJsonBody(req);
    if (!body || body.__parse_error) return sendJson(res, 400, { error: 'bad_json' }, corsHeaders());
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || !password || password.length < 6) return sendJson(res, 400, { error: 'invalid_input' }, corsHeaders());
    if (store.getUserByEmail(email)) return sendJson(res, 409, { error: 'email_taken' }, corsHeaders());

    const password_hash = hashPassword(password);
    const user = store.createUser({ email, password_hash });
    const token = signJwt({ sub: user.id }, JWT_SECRET);
    return sendJson(res, 200, { token, user: sanitizeUser(user) }, corsHeaders());
  }

  if (method === 'POST' && pathname === '/v1/auth/login') {
    const body = await readJsonBody(req);
    if (!body || body.__parse_error) return sendJson(res, 400, { error: 'bad_json' }, corsHeaders());
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const user = store.getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) return sendJson(res, 401, { error: 'bad_credentials' }, corsHeaders());
    const token = signJwt({ sub: user.id }, JWT_SECRET);
    return sendJson(res, 200, { token, user: sanitizeUser(user) }, corsHeaders());
  }

  if (method === 'GET' && pathname === '/v1/me') {
    const user = requireUser(req, res);
    if (!user) return;
    return sendJson(res, 200, sanitizeUser(user), corsHeaders());
  }

  // Memory
  if (method === 'POST' && pathname === '/v1/memory/capture') {
    const user = requireUser(req, res);
    if (!user) return;
    const body = await readJsonBody(req);
    if (!body || body.__parse_error) return sendJson(res, 400, { error: 'bad_json' }, corsHeaders());

    const type = String(body.type || '');
    const content_raw = String(body.content_raw || '').trim();
    const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
    const source = String(body.source || 'text');
    if (!type || !content_raw) return sendJson(res, 400, { error: 'invalid_input' }, corsHeaders());

    // MVP：结构化抽取占位（后续接 LLM）
    const content_struct = { summary: content_raw.slice(0, 80) };
    const item = store.createMemoryItem(user.id, { type, content_raw, tags, source, content_struct });
    return sendJson(res, 200, item, corsHeaders());
  }

  if (method === 'GET' && pathname === '/v1/memory/search') {
    const user = requireUser(req, res);
    if (!user) return;
    const q = u.searchParams.get('q') || '';
    const items = store.searchMemory(user.id, q);
    return sendJson(res, 200, { items }, corsHeaders());
  }

  // Planner
  if (method === 'POST' && pathname === '/v1/planner/clarify') {
    const user = requireUser(req, res);
    if (!user) return;
    const body = await readJsonBody(req);
    if (!body || body.__parse_error) return sendJson(res, 400, { error: 'bad_json' }, corsHeaders());
    const prompt = String(body.prompt || '').trim();
    if (!prompt) return sendJson(res, 400, { error: 'invalid_input' }, corsHeaders());
    const questions = await buildClarifyQuestions(prompt, user.id);
    return sendJson(res, 200, { questions }, corsHeaders());
  }

  if (method === 'POST' && pathname === '/v1/planner/generate') {
    const user = requireUser(req, res);
    if (!user) return;
    const body = await readJsonBody(req);
    if (!body || body.__parse_error) return sendJson(res, 400, { error: 'bad_json' }, corsHeaders());
    const prompt = String(body.prompt || '').trim();
    const answers = body.answers || {};
    if (!prompt) return sendJson(res, 400, { error: 'invalid_input' }, corsHeaders());

    const { goal, tasks: taskDrafts } = await buildPlanTasks(prompt, answers, user.id);
    
    // 创建目标
    const createdGoal = store.createGoal(user.id, {
      title: goal.title,
      description: goal.description,
      life_wheel_dimension: goal.life_wheel_dimension || 'growth',
    });
    
    // 检查生命之花平衡
    let balanceCheck = null;
    if (ENABLE_LLM && goal.life_wheel_dimension) {
      const existingGoals = store.listGoals(user.id);
      balanceCheck = await PlannerService.checkLifeWheelBalance(
        existingGoals,
        goal.life_wheel_dimension
      );
    }
    
    // 创建任务
    const tasks = store.createTasks(user.id, taskDrafts);
    
    return sendJson(res, 200, { goal: createdGoal, tasks, balanceCheck }, corsHeaders());
  }

  // Execution
  if (method === 'GET' && pathname === '/v1/tasks/today') {
    const user = requireUser(req, res);
    if (!user) return;
    const items = store.listTodayTasks(user.id);
    return sendJson(res, 200, { items }, corsHeaders());
  }

  const checkinMatch = /^\/v1\/tasks\/([^/]+)\/checkin$/.exec(pathname);
  if (method === 'POST' && checkinMatch) {
    const user = requireUser(req, res);
    if (!user) return;
    const taskId = checkinMatch[1];
    const body = await readJsonBody(req);
    if (!body || body.__parse_error) return sendJson(res, 400, { error: 'bad_json' }, corsHeaders());
    const status = body.status === 'done' ? 'done' : 'skipped';
    const reason_code = String(body.reason_code || '');
    const note = String(body.note || '');

    const task = store.updateTaskStatus(user.id, taskId, status);
    if (!task) return sendJson(res, 404, { error: 'not_found' }, corsHeaders());

    // 动态调整建议
    const adjustments = [];
    if (status === 'skipped' && reason_code) {
      // 使用 LLM 生成调整建议
      if (ENABLE_LLM) {
        try {
          const suggestion = await PlannerService.generateAdjustmentSuggestion(
            task,
            reason_code,
            note
          );
          adjustments.push({
            id: `adj_${Date.now()}`,
            type: suggestion.adjustment_type,
            suggestion: suggestion.suggestion,
            new_tasks: suggestion.new_tasks,
            encouragement: suggestion.encouragement,
          });
        } catch (error) {
          console.error('[API] LLM adjustment error:', error);
        }
      }
      
      // 保存调整记录
      store.createAdjustment(user.id, adjustments[0]?.type || 'reschedule_hint', { taskId, reason_code, note });
    }
    return sendJson(res, 200, { task, adjustments }, corsHeaders());
  }

  // Tree
  if (method === 'GET' && pathname === '/v1/tree/snapshot') {
    const user = requireUser(req, res);
    if (!user) return;
    const snapshot = store.getTreeSnapshot(user.id);
    return sendJson(res, 200, snapshot, corsHeaders());
  }

  // Goals
  if (method === 'GET' && pathname === '/v1/goals') {
    const user = requireUser(req, res);
    if (!user) return;
    const items = store.listGoals(user.id);
    return sendJson(res, 200, { items }, corsHeaders());
  }

  if (method === 'POST' && pathname === '/v1/goals') {
    const user = requireUser(req, res);
    if (!user) return;
    const body = await readJsonBody(req);
    if (!body || body.__parse_error) return sendJson(res, 400, { error: 'bad_json' }, corsHeaders());
    const title = String(body.title || '').trim();
    if (!title) return sendJson(res, 400, { error: 'invalid_input' }, corsHeaders());
    const goal = store.createGoal(user.id, {
      title,
      description: body.description,
      life_wheel_dimension: body.life_wheel_dimension,
    });
    return sendJson(res, 200, goal, corsHeaders());
  }

  const goalStatusMatch = /^\/v1\/goals\/([^/]+)\/status$/.exec(pathname);
  if (method === 'PATCH' && goalStatusMatch) {
    const user = requireUser(req, res);
    if (!user) return;
    const goalId = goalStatusMatch[1];
    const body = await readJsonBody(req);
    if (!body || body.__parse_error) return sendJson(res, 400, { error: 'bad_json' }, corsHeaders());
    const status = String(body.status || '');
    if (!['draft', 'active', 'completed', 'paused', 'abandoned'].includes(status)) {
      return sendJson(res, 400, { error: 'invalid_status' }, corsHeaders());
    }
    const goal = store.updateGoalStatus(user.id, goalId, status);
    if (!goal) return sendJson(res, 404, { error: 'not_found' }, corsHeaders());
    return sendJson(res, 200, goal, corsHeaders());
  }

  const goalDeleteMatch = /^\/v1\/goals\/([^/]+)$/.exec(pathname);
  if (method === 'DELETE' && goalDeleteMatch) {
    const user = requireUser(req, res);
    if (!user) return;
    const goalId = goalDeleteMatch[1];
    const deleted = store.deleteGoal(user.id, goalId);
    if (!deleted) return sendJson(res, 404, { error: 'not_found' }, corsHeaders());
    return sendJson(res, 200, { success: true }, corsHeaders());
  }

  return sendJson(res, 404, { error: 'not_found' }, corsHeaders());
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend-api] listening on http://localhost:${PORT}`);
});







