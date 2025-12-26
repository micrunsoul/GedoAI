import fs from 'node:fs';
import path from 'node:path';
import { nowIso, randomId } from './crypto.mjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(
        {
          users: [],
          memoryItems: [],
          goals: [],
          tasks: [],
          adjustments: [],
        },
        null,
        2
      ),
      'utf8'
    );
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export function Store() {
  return {
    getUserByEmail(email) {
      const s = readStore();
      return s.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
    },
    getUserById(userId) {
      const s = readStore();
      return s.users.find((u) => u.id === userId) || null;
    },
    createUser({ email, password_hash }) {
      const s = readStore();
      const user = { id: randomId(), email, password_hash, created_at: nowIso() };
      s.users.push(user);
      writeStore(s);
      return user;
    },
    createMemoryItem(userId, { type, content_raw, tags = [], source = 'text', content_struct = {} }) {
      const s = readStore();
      const item = {
        id: randomId(),
        user_id: userId,
        type,
        content_raw,
        content_struct,
        tags,
        source,
        created_at: nowIso(),
      };
      s.memoryItems.push(item);
      writeStore(s);
      return item;
    },
    searchMemory(userId, q) {
      const s = readStore();
      const query = (q || '').toLowerCase().trim();
      const items = s.memoryItems.filter((m) => m.user_id === userId);
      if (!query) return items.slice(-50).reverse();
      return items
        .filter((m) => (m.content_raw || '').toLowerCase().includes(query) || (m.tags || []).some((t) => t.includes(query)))
        .slice(-50)
        .reverse();
    },
    createTasks(userId, tasks) {
      const s = readStore();
      const created = tasks.map((t) => ({
        id: randomId(),
        user_id: userId,
        title: t.title,
        status: 'todo',
        due_date: t.due_date || null,
        created_at: nowIso(),
      }));
      s.tasks.push(...created);
      writeStore(s);
      return created;
    },
    listTodayTasks(userId) {
      const s = readStore();
      // MVP：先返回最近的 20 条 todo（后续用 due_date/日程模型）
      return s.tasks.filter((t) => t.user_id === userId).slice(-20).reverse();
    },
    updateTaskStatus(userId, taskId, status) {
      const s = readStore();
      const task = s.tasks.find((t) => t.user_id === userId && t.id === taskId);
      if (!task) return null;
      task.status = status;
      writeStore(s);
      return task;
    },
    createAdjustment(userId, type, detail = {}) {
      const s = readStore();
      const adj = { id: randomId(), user_id: userId, type, detail, created_at: nowIso() };
      s.adjustments.push(adj);
      writeStore(s);
      return adj;
    },
    getTreeSnapshot(userId) {
      const s = readStore();
      const memoryItems = s.memoryItems.filter((m) => m.user_id === userId);
      const tasks = s.tasks.filter((t) => t.user_id === userId).slice(-20).reverse();
      const goals = s.goals.filter((g) => g.user_id === userId);

      // MVP：非常轻量的"根系/技能"抽取占位（后续改为 LLM 抽取 + 向量召回）
      const roots = memoryItems.slice(-10).reverse().map((m) => ({
        id: m.id,
        label: m.type,
        content: m.content_raw.slice(0, 60),
        tags: m.tags,
      }));
      const skills = [];
      const skillSet = new Set();
      for (const m of memoryItems) {
        for (const tag of m.tags || []) {
          if (tag.startsWith('skill:')) skillSet.add(tag.replace(/^skill:/, ''));
        }
      }
      for (const sk of Array.from(skillSet).slice(0, 12)) {
        skills.push({ id: `skill:${sk}`, label: sk });
      }

      const branches = []; // 规划/执行完成后补齐

      return { roots, skills, branches, goals, tasks };
    },

    // Goals CRUD
    createGoal(userId, { title, description, life_wheel_dimension }) {
      const s = readStore();
      const goal = {
        id: randomId(),
        user_id: userId,
        title,
        description: description || '',
        life_wheel_dimension: life_wheel_dimension || 'growth',
        status: 'draft',
        progress: 0,
        created_at: nowIso(),
        updated_at: nowIso(),
      };
      s.goals.push(goal);
      writeStore(s);
      return goal;
    },
    listGoals(userId) {
      const s = readStore();
      return s.goals.filter((g) => g.user_id === userId);
    },
    updateGoalStatus(userId, goalId, status) {
      const s = readStore();
      const goal = s.goals.find((g) => g.user_id === userId && g.id === goalId);
      if (!goal) return null;
      goal.status = status;
      goal.progress = status === 'completed' ? 100 : goal.progress;
      goal.updated_at = nowIso();
      writeStore(s);
      return goal;
    },
    deleteGoal(userId, goalId) {
      const s = readStore();
      const index = s.goals.findIndex((g) => g.user_id === userId && g.id === goalId);
      if (index === -1) return false;
      s.goals.splice(index, 1);
      writeStore(s);
      return true;
    },
  };
}







