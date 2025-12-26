#!/usr/bin/env node

/**
 * 数据迁移脚本：JSON 文件存储 -> PostgreSQL
 * 
 * 用法：node scripts/migrate-json-to-postgres.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

// 配置
const JSON_STORE_PATH = path.join(__dirname, '../services/backend-api/data/store.json');
const DB_CONFIG = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'gedoai',
  user: process.env.POSTGRES_USER || 'gedo',
  password: process.env.POSTGRES_PASSWORD || 'gedo_dev_password',
};

async function migrate() {
  console.log('🚀 开始数据迁移：JSON -> PostgreSQL');
  console.log('=====================================\n');

  // 1. 读取 JSON 数据
  if (!fs.existsSync(JSON_STORE_PATH)) {
    console.log('⚠️  JSON 存储文件不存在，跳过迁移');
    return;
  }

  const jsonData = JSON.parse(fs.readFileSync(JSON_STORE_PATH, 'utf8'));
  console.log(`📊 发现数据：`);
  console.log(`   - 用户：${jsonData.users?.length || 0}`);
  console.log(`   - 记忆：${jsonData.memoryItems?.length || 0}`);
  console.log(`   - 目标：${jsonData.goals?.length || 0}`);
  console.log(`   - 任务：${jsonData.tasks?.length || 0}`);
  console.log(`   - 调整：${jsonData.adjustments?.length || 0}\n`);

  // 2. 连接 PostgreSQL
  const pool = new Pool(DB_CONFIG);
  console.log('🔌 连接 PostgreSQL...');

  try {
    await pool.query('SELECT 1');
    console.log('✅ 数据库连接成功\n');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.log('\n请确保：');
    console.log('   1. Docker 容器正在运行：docker-compose up -d');
    console.log('   2. 或手动启动 PostgreSQL 并执行 schema.sql');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 3. 迁移用户
    console.log('👤 迁移用户...');
    for (const user of jsonData.users || []) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, created_at) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.email, user.password_hash, user.created_at]
      );
    }
    console.log(`   ✅ ${jsonData.users?.length || 0} 个用户迁移完成`);

    // 4. 迁移记忆
    console.log('🧠 迁移记忆...');
    for (const memory of jsonData.memoryItems || []) {
      await client.query(
        `INSERT INTO memories (
          id, user_id, type, content_raw, content_struct, 
          source, system_tags, user_tags, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING`,
        [
          memory.id,
          memory.user_id,
          memory.type || 'important_info',
          memory.content_raw,
          JSON.stringify(memory.content_struct || {}),
          memory.source || 'text',
          memory.system_tags || [],
          memory.tags || [],
          memory.created_at,
        ]
      );
    }
    console.log(`   ✅ ${jsonData.memoryItems?.length || 0} 条记忆迁移完成`);

    // 5. 迁移目标
    console.log('🎯 迁移目标...');
    for (const goal of jsonData.goals || []) {
      await client.query(
        `INSERT INTO goals (
          id, user_id, title, description, life_wheel_dimension,
          status, progress, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING`,
        [
          goal.id,
          goal.user_id,
          goal.title,
          goal.description || '',
          goal.life_wheel_dimension || 'growth',
          goal.status || 'draft',
          goal.progress || 0,
          goal.created_at,
          goal.updated_at || goal.created_at,
        ]
      );
    }
    console.log(`   ✅ ${jsonData.goals?.length || 0} 个目标迁移完成`);

    // 6. 迁移任务
    console.log('✅ 迁移任务...');
    for (const task of jsonData.tasks || []) {
      await client.query(
        `INSERT INTO tasks (
          id, user_id, title, status, scheduled_date, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING`,
        [
          task.id,
          task.user_id,
          task.title,
          task.status === 'done' ? 'completed' : (task.status || 'todo'),
          task.due_date,
          task.created_at,
        ]
      );
    }
    console.log(`   ✅ ${jsonData.tasks?.length || 0} 个任务迁移完成`);

    // 7. 迁移调整记录
    console.log('🔄 迁移调整记录...');
    for (const adj of jsonData.adjustments || []) {
      await client.query(
        `INSERT INTO adjustments (
          id, user_id, adjustment_type, suggestion, meta, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING`,
        [
          adj.id,
          adj.user_id,
          adj.type || 'reschedule',
          adj.detail?.suggestion || '',
          JSON.stringify(adj.detail || {}),
          adj.created_at,
        ]
      );
    }
    console.log(`   ✅ ${jsonData.adjustments?.length || 0} 条调整记录迁移完成`);

    await client.query('COMMIT');

    console.log('\n=====================================');
    console.log('🎉 数据迁移完成！');
    console.log('\n下一步：');
    console.log('   1. 设置环境变量 USE_POSTGRES=true');
    console.log('   2. 重启后端服务');
    console.log('   3. 可选：备份并删除 JSON 文件');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ 迁移失败:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 执行迁移
migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});

