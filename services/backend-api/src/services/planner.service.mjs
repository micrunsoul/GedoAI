/**
 * Planner Service - AI 智能规划引擎
 * 
 * 功能：
 * - 目标澄清问题生成
 * - SMART 原则目标拆解
 * - 任务自动生成
 * - 生命之花平衡检查
 */

import { createLLMProvider } from '../llm/provider.mjs';

const llm = createLLMProvider();

// 生命之花 8 维度
const LIFE_WHEEL_DIMENSIONS = [
  { key: 'health', label: '健康', desc: '身体健康、运动、睡眠' },
  { key: 'career', label: '事业', desc: '工作、职业发展、专业技能' },
  { key: 'family', label: '家庭', desc: '家人关系、陪伴、责任' },
  { key: 'finance', label: '财务', desc: '收入、储蓄、投资' },
  { key: 'growth', label: '成长', desc: '学习、阅读、自我提升' },
  { key: 'social', label: '社交', desc: '朋友、人脉、社交活动' },
  { key: 'hobby', label: '兴趣', desc: '爱好、娱乐、创造' },
  { key: 'self_realization', label: '自我实现', desc: '价值观、人生意义、梦想' },
];

/**
 * 生成目标澄清问题
 * @param {string} prompt - 用户输入的目标描述
 * @param {Object} userMemories - 用户相关记忆（用于个性化）
 * @returns {Promise<Array<{id: string, prompt: string, options: Array<{value: string, label: string}>}>>}
 */
export async function generateClarifyQuestions(prompt, userMemories = []) {
  const systemPrompt = `你是一个专业的目标规划助手。用户提出了一个目标，你需要通过几个关键问题来帮助澄清目标细节。

要求：
1. 生成 2-4 个关键问题，每个问题带有 3-4 个选项
2. 问题应该帮助明确：时间期限、可投入资源、当前基础、成功标准
3. 选项要简洁明了，便于用户快速选择
4. 如果用户记忆中有相关信息，可以参考（如历史技能、作息习惯）

返回 JSON 格式：
{
  "questions": [
    {
      "id": "unique_id",
      "prompt": "问题内容",
      "options": [
        { "value": "option_value", "label": "选项显示文本" }
      ]
    }
  ]
}`;

  const userPrompt = `用户目标：${prompt}

${userMemories.length > 0 ? `用户相关记忆：\n${userMemories.map(m => `- ${m.content_raw}`).join('\n')}` : ''}

请生成澄清问题（JSON格式）：`;

  try {
    const response = await llm.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.7, json: true });

    const parsed = JSON.parse(response.content);
    return parsed.questions || [];
  } catch (error) {
    console.error('[PlannerService] generateClarifyQuestions error:', error);
    // 降级：返回通用问题
    return [
      {
        id: 'timebound',
        prompt: '这个目标的期望完成时间是？',
        options: [
          { value: '1m', label: '1 个月' },
          { value: '3m', label: '3 个月' },
          { value: '6m', label: '6 个月' },
          { value: '1y', label: '1 年' },
        ],
      },
      {
        id: 'weekly_hours',
        prompt: '你每周可投入的时间大约是？',
        options: [
          { value: '3', label: '3 小时' },
          { value: '6', label: '6 小时' },
          { value: '10', label: '10 小时' },
          { value: '20', label: '20 小时以上' },
        ],
      },
    ];
  }
}

/**
 * SMART 原则目标拆解 + 任务生成
 * @param {string} prompt - 用户目标描述
 * @param {Object} answers - 澄清问题的答案
 * @param {Object} userMemories - 用户相关记忆
 * @returns {Promise<{goal: Object, tasks: Array}>}
 */
export async function generateSmartPlan(prompt, answers = {}, userMemories = []) {
  const systemPrompt = `你是一个专业的目标规划师，精通 SMART 原则。根据用户的目标和补充信息，生成：
1. 符合 SMART 原则的目标定义
2. 分层任务计划（里程碑 → 周任务）

SMART 原则：
- Specific（具体）：目标清晰明确
- Measurable（可衡量）：有量化指标
- Achievable（可达成）：结合用户实际情况
- Relevant（相关性）：与用户价值观/长期目标一致
- Time-bound（时限性）：有明确的时间节点

返回 JSON 格式：
{
  "goal": {
    "title": "精炼的目标标题",
    "description": "详细描述",
    "specific": "具体化说明",
    "measurable": "可衡量指标",
    "achievable": "可行性分析",
    "relevant": "相关性说明",
    "time_bound": "时间期限",
    "life_wheel_dimension": "对应的生命之花维度（health/career/family/finance/growth/social/hobby/self_realization）"
  },
  "milestones": [
    {
      "title": "里程碑名称",
      "deadline": "截止日期（YYYY-MM-DD）",
      "tasks": [
        {
          "title": "具体任务",
          "estimated_duration": 30,
          "energy_level": "high/medium/low",
          "suggested_schedule": "建议执行时段描述"
        }
      ]
    }
  ]
}`;

  const userPrompt = `用户目标：${prompt}

用户补充信息：
${Object.entries(answers).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

${userMemories.length > 0 ? `用户相关记忆/技能：\n${userMemories.map(m => `- ${m.content_raw || m.label}`).join('\n')}` : ''}

请生成 SMART 目标和任务计划（JSON格式）：`;

  try {
    const response = await llm.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.5, json: true, maxTokens: 4096 });

    const parsed = JSON.parse(response.content);
    
    // 扁平化任务列表
    const tasks = [];
    for (const milestone of parsed.milestones || []) {
      for (const task of milestone.tasks || []) {
        tasks.push({
          title: task.title,
          milestone: milestone.title,
          deadline: milestone.deadline,
          estimated_duration: task.estimated_duration || 30,
          energy_level: task.energy_level || 'medium',
        });
      }
    }

    return {
      goal: parsed.goal || { title: prompt },
      milestones: parsed.milestones || [],
      tasks,
    };
  } catch (error) {
    console.error('[PlannerService] generateSmartPlan error:', error);
    // 降级：返回基础计划
    return {
      goal: {
        title: prompt,
        description: '',
        life_wheel_dimension: 'growth',
      },
      milestones: [],
      tasks: [
        { title: `拆解目标：${prompt}`, estimated_duration: 30, energy_level: 'medium' },
        { title: `收集资料：为「${prompt}」准备资源清单`, estimated_duration: 30, energy_level: 'low' },
        { title: `执行第一步：完成 1 个最小行动`, estimated_duration: 30, energy_level: 'high' },
      ],
    };
  }
}

/**
 * 动态调整建议
 * @param {Object} task - 未完成的任务
 * @param {string} reasonCode - 原因代码
 * @param {string} reasonNote - 原因说明
 * @returns {Promise<Object>} 调整建议
 */
export async function generateAdjustmentSuggestion(task, reasonCode, reasonNote = '') {
  const systemPrompt = `你是一个目标管理助手。用户有一个任务未能完成，你需要分析原因并给出调整建议。

可能的调整类型：
1. split_task - 拆分任务为更小的步骤
2. reschedule - 顺延到更合适的时间
3. change_time - 调整执行时段（如从晚上改到早上）
4. reduce_scope - 降低任务范围/难度
5. delegate - 建议寻求帮助或委托
6. drop - 建议放弃（如果持续无法完成）

返回 JSON 格式：
{
  "adjustment_type": "调整类型",
  "suggestion": "具体建议说明",
  "new_tasks": [
    { "title": "新任务（如果是拆分）", "estimated_duration": 15 }
  ],
  "encouragement": "鼓励性的话"
}`;

  const reasonLabels = {
    no_time: '时间不够',
    too_tired: '太累了',
    forgot: '忘记了',
    too_hard: '任务太难',
    no_motivation: '缺乏动力',
    external_block: '外部阻碍',
    other: '其他原因',
  };

  const userPrompt = `任务：${task.title}
预计时长：${task.estimated_duration || 30} 分钟
未完成原因：${reasonLabels[reasonCode] || reasonCode}
${reasonNote ? `补充说明：${reasonNote}` : ''}

请给出调整建议（JSON格式）：`;

  try {
    const response = await llm.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.6, json: true });

    return JSON.parse(response.content);
  } catch (error) {
    console.error('[PlannerService] generateAdjustmentSuggestion error:', error);
    // 降级：基于规则的简单建议
    const suggestions = {
      no_time: { adjustment_type: 'split_task', suggestion: '建议将任务拆分为 2-3 个 15 分钟的小任务' },
      too_tired: { adjustment_type: 'change_time', suggestion: '建议调整到精力充沛的时段执行' },
      forgot: { adjustment_type: 'reschedule', suggestion: '建议设置提醒，顺延到明天' },
      too_hard: { adjustment_type: 'reduce_scope', suggestion: '建议降低任务难度，从最简单的部分开始' },
      no_motivation: { adjustment_type: 'split_task', suggestion: '建议先完成一个 5 分钟的"启动任务"' },
    };
    return suggestions[reasonCode] || { adjustment_type: 'reschedule', suggestion: '建议顺延到明天' };
  }
}

/**
 * 生命之花平衡检查
 * @param {Array} goals - 用户的目标列表
 * @param {string} newGoalDimension - 新目标的维度
 * @returns {Promise<Object>} 平衡建议
 */
export async function checkLifeWheelBalance(goals, newGoalDimension) {
  // 统计各维度目标数量
  const dimensionCounts = {};
  LIFE_WHEEL_DIMENSIONS.forEach(d => {
    dimensionCounts[d.key] = 0;
  });
  
  for (const goal of goals) {
    const dim = goal.life_wheel_dimension || 'growth';
    if (dimensionCounts[dim] !== undefined) {
      dimensionCounts[dim]++;
    }
  }

  // 添加新目标后的分布
  dimensionCounts[newGoalDimension] = (dimensionCounts[newGoalDimension] || 0) + 1;

  // 计算最高和最低
  const counts = Object.values(dimensionCounts);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const avgWithNew = counts.reduce((a, b) => a + b, 0) / counts.length;

  // 找出被忽略的维度
  const neglectedDimensions = LIFE_WHEEL_DIMENSIONS
    .filter(d => dimensionCounts[d.key] === 0)
    .map(d => d.label);

  // 找出过度关注的维度
  const overFocusedDimensions = LIFE_WHEEL_DIMENSIONS
    .filter(d => dimensionCounts[d.key] >= avgWithNew * 2)
    .map(d => d.label);

  const isBalanced = max - min <= 2 && neglectedDimensions.length <= 2;

  let suggestion = '';
  if (!isBalanced) {
    if (neglectedDimensions.length > 0) {
      suggestion = `建议关注「${neglectedDimensions.slice(0, 2).join('」和「')}」维度，保持生活平衡。`;
    }
    if (overFocusedDimensions.length > 0) {
      suggestion += ` 「${overFocusedDimensions.join('」「')}」维度目标较多，注意避免过度投入。`;
    }
  }

  return {
    isBalanced,
    distribution: dimensionCounts,
    neglectedDimensions,
    overFocusedDimensions,
    suggestion: suggestion || '目标分布较为均衡，继续保持！',
    newDimensionLabel: LIFE_WHEEL_DIMENSIONS.find(d => d.key === newGoalDimension)?.label || newGoalDimension,
  };
}

/**
 * 数字人对话响应生成
 * @param {string} message - 用户消息
 * @param {Object} context - 对话上下文（记忆、目标、任务等）
 * @returns {Promise<{reply: string, mood: string, functionCall?: Object, quickActions?: Array}>}
 */
export async function generateChatResponse(message, context = {}) {
  const systemPrompt = `你是用户的数字分身「智伴」，既是他们的镜像，也是成长伙伴。

## 用户当前状态
- 今日任务：已完成 ${context.todayCompleted || 0}/${context.todayTotal || 0}
- 连续打卡：${context.streakDays || 0} 天
${context.activeGoals?.length > 0 ? `- 进行中目标：${context.activeGoals.map(g => g.title).join('、')}` : ''}

${context.recentMemories?.length > 0 ? `## 最近记忆\n${context.recentMemories.map(m => `- ${m.summary}`).join('\n')}` : ''}

## 你的能力
你可以通过 function call 帮用户：
1. capture_memory - 记录想法/经历到智忆
2. create_goal - 创建新目标
3. complete_task - 打卡完成任务
4. search_memory - 搜索历史记忆

## 交互原则
1. 语气亲切温暖，像老朋友
2. 主动关联用户的记忆和目标，体现"懂你"
3. 适时给予鼓励和建议，但不说教
4. 回复简洁，通常 2-4 句话即可
5. 如果用户想记录/规划/打卡，返回对应的 function_call

返回 JSON 格式：
{
  "reply": "回复内容",
  "mood": "你此刻的情绪(happy/excited/thinking/encouraging/neutral)",
  "function_call": {
    "name": "函数名（可选）",
    "arguments": { "参数": "值" }
  },
  "quick_actions": [
    { "id": "action_id", "label": "按钮文字", "type": "confirm/cancel" }
  ]
}`;

  const userPrompt = `用户说：${message}

请用 JSON 格式回复：`;

  try {
    const response = await llm.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.7, json: true, maxTokens: 1024 });

    const parsed = JSON.parse(response.content);
    
    return {
      reply: parsed.reply || '',
      mood: parsed.mood || 'neutral',
      functionCall: parsed.function_call,
      quickActions: parsed.quick_actions,
    };
  } catch (error) {
    console.error('[PlannerService] generateChatResponse error:', error);
    // 返回 null 让调用方使用本地规则
    return null;
  }
}

export default {
  generateClarifyQuestions,
  generateSmartPlan,
  generateAdjustmentSuggestion,
  checkLifeWheelBalance,
  generateChatResponse,
};


