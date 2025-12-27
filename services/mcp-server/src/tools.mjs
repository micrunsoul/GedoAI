/**
 * GEDO.AI MCP 工具定义
 * 
 * 这些工具会暴露给 MCP 客户端（如 Claude Desktop、IDE 插件等）使用
 * 所有工具都通过 Backend API 实现，保证鉴权和数据一致性
 */

export const TOOLS = {
  // ===== 记忆相关工具 =====
  
  'memory.create': {
    name: 'memory.create',
    description: '创建一条新记忆。用于记录重要信息、个人特质、关键事件或日期提醒。',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['important_info', 'personal_trait', 'key_event', 'date_reminder'],
          description: '记忆类型：重要信息、个人特质、关键事件、日期提醒',
        },
        content: {
          type: 'string',
          description: '记忆内容',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: '用户自定义标签',
        },
        reminderDate: {
          type: 'string',
          format: 'date',
          description: '提醒日期（仅 date_reminder 类型需要）',
        },
      },
      required: ['type', 'content'],
    },
  },

  'memory.search': {
    name: 'memory.search',
    description: '语义搜索用户的记忆库。可以用自然语言查询，也可以按标签/类型筛选。',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索查询（支持自然语言）',
        },
        type: {
          type: 'string',
          enum: ['important_info', 'personal_trait', 'key_event', 'date_reminder'],
          description: '按类型筛选',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: '按标签筛选',
        },
        limit: {
          type: 'number',
          default: 10,
          description: '返回结果数量上限',
        },
      },
      required: ['query'],
    },
  },

  'memory.recall_context': {
    name: 'memory.recall_context',
    description: '根据当前场景（如正在制定目标、临近重要日期）召回相关记忆。',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          enum: ['goal_creation', 'upcoming_dates', 'skill_evidence', 'reflection'],
          description: '召回场景',
        },
        goalTitle: {
          type: 'string',
          description: '目标标题（goal_creation 场景需要）',
        },
        daysAhead: {
          type: 'number',
          default: 7,
          description: '提前天数（upcoming_dates 场景）',
        },
      },
      required: ['context'],
    },
  },

  // ===== 目标相关工具 =====

  'goal.create': {
    name: 'goal.create',
    description: '从自然语言描述创建目标。AI 会自动进行 SMART 分析和任务拆解。',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: '目标描述（自然语言）',
        },
        dimension: {
          type: 'string',
          enum: ['health', 'career', 'family', 'finance', 'growth', 'social', 'hobby', 'self_realization'],
          description: '生命之花维度',
        },
        timeframe: {
          type: 'string',
          enum: ['1month', '3months', '6months', '1year', '3years'],
          description: '目标时间范围',
        },
      },
      required: ['prompt'],
    },
  },

  'goal.list': {
    name: 'goal.list',
    description: '获取用户的目标列表。可按状态、维度筛选。',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
          description: '目标状态',
        },
        dimension: {
          type: 'string',
          enum: ['health', 'career', 'family', 'finance', 'growth', 'social', 'hobby', 'self_realization'],
          description: '生命之花维度',
        },
      },
    },
  },

  'goal.update_progress': {
    name: 'goal.update_progress',
    description: '更新目标进度或状态。',
    inputSchema: {
      type: 'object',
      properties: {
        goalId: {
          type: 'string',
          description: '目标 ID',
        },
        progress: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: '进度百分比',
        },
        status: {
          type: 'string',
          enum: ['active', 'paused', 'completed', 'cancelled'],
          description: '目标状态',
        },
      },
      required: ['goalId'],
    },
  },

  // ===== 任务相关工具 =====

  'task.list_today': {
    name: 'task.list_today',
    description: '获取今日任务列表。',
    inputSchema: {
      type: 'object',
      properties: {
        includeCompleted: {
          type: 'boolean',
          default: true,
          description: '是否包含已完成任务',
        },
      },
    },
  },

  'task.checkin': {
    name: 'task.checkin',
    description: '为任务打卡。记录完成状态、原因、实际时长等。',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: '任务 ID',
        },
        status: {
          type: 'string',
          enum: ['completed', 'not_completed', 'partial'],
          description: '完成状态',
        },
        reasonCode: {
          type: 'string',
          enum: ['time_insufficient', 'energy_low', 'priority_changed', 'external_interrupt', 'forgot', 'other'],
          description: '未完成原因代码',
        },
        reasonNote: {
          type: 'string',
          description: '原因备注',
        },
        actualDuration: {
          type: 'number',
          description: '实际花费时间（分钟）',
        },
      },
      required: ['taskId', 'status'],
    },
  },

  'task.create': {
    name: 'task.create',
    description: '创建新任务。可关联到目标。',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: '任务标题',
        },
        goalId: {
          type: 'string',
          description: '关联的目标 ID',
        },
        scheduledDate: {
          type: 'string',
          format: 'date',
          description: '计划日期',
        },
        estimatedDuration: {
          type: 'number',
          description: '预计时长（分钟）',
        },
        energyLevel: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: '能量等级',
        },
        priority: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: '优先级（1-5）',
        },
      },
      required: ['title'],
    },
  },

  // ===== 计划调整工具 =====

  'plan.adjust': {
    name: 'plan.adjust',
    description: '根据信号（打卡反馈、外部事件）调整计划。',
    inputSchema: {
      type: 'object',
      properties: {
        goalId: {
          type: 'string',
          description: '目标 ID',
        },
        signal: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['checkin_failed', 'external_event', 'manual'],
              description: '信号类型',
            },
            taskId: {
              type: 'string',
              description: '相关任务 ID',
            },
            reason: {
              type: 'string',
              description: '调整原因',
            },
          },
          required: ['type'],
        },
      },
      required: ['goalId', 'signal'],
    },
  },

  // ===== 生命之树工具 =====

  'lifetree.snapshot': {
    name: 'lifetree.snapshot',
    description: '获取生命之树快照数据，包括技能、活跃目标、今日任务等。',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  'lifetree.balance_check': {
    name: 'lifetree.balance_check',
    description: '检查生命之花 8 维度的平衡情况，返回改进建议。',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
};

// 工具名称列表
export const TOOL_NAMES = Object.keys(TOOLS);








