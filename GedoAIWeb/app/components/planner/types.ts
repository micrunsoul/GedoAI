// 智引数据类型

import { LifeWheelDimension } from '../life-tree/types';

export type GoalLevel = 'vision' | 'milestone' | 'phase';
export type GoalStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Goal {
  id: string;
  title: string;
  description?: string;
  
  // SMART 字段
  specific?: string;
  measurable?: string;
  achievable?: string;
  relevant?: string;
  timeBound?: string;
  
  level: GoalLevel;
  parentId?: string;
  lifeWheelDimension: LifeWheelDimension;
  status: GoalStatus;
  progress: number;
  
  startDate?: string;
  endDate?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ClarifyQuestion {
  id: string;
  question: string;
  options?: { id: string; label: string }[];
  type: 'text' | 'select' | 'multi-select' | 'number' | 'date';
  field: string; // 对应的目标字段
}

export interface ClarifySession {
  goalPrompt: string;
  questions: ClarifyQuestion[];
  answers: Record<string, string | string[]>;
  currentStep: number;
  relatedMemories?: Array<{
    id: string;
    content: string;
    relevance: string;
  }>;
}

export interface PlanNode {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  granularity: 'year' | 'quarter' | 'month' | 'week' | 'day';
  parentId?: string;
  sortOrder: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startDate?: string;
  endDate?: string;
}

export interface Task {
  id: string;
  goalId?: string;
  planNodeId?: string;
  title: string;
  description?: string;
  estimatedDuration?: number; // 分钟
  energyLevel: 'low' | 'medium' | 'high';
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'postponed';
  scheduledDate?: string;
  dueDate?: string;
  completedAt?: string;
}

// 目标层级标签
export const LEVEL_LABELS: Record<GoalLevel, { label: string; timeframe: string }> = {
  vision: { label: '长期愿景', timeframe: '3-5年' },
  milestone: { label: '里程碑', timeframe: '1-3年' },
  phase: { label: '阶段目标', timeframe: '月/季度' },
};

// 生命之花维度
export { DIMENSION_COLORS, DIMENSION_LABELS } from '../life-tree/types';






