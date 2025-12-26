// 执行与反馈数据类型

export interface Task {
  id: string;
  goalId?: string;
  goalTitle?: string;
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

export interface CheckIn {
  id: string;
  taskId: string;
  status: 'completed' | 'not_completed' | 'partial';
  reasonCode?: ReasonCode;
  reasonNote?: string;
  actualDuration?: number;
  moodRating?: 1 | 2 | 3 | 4 | 5;
  checkedAt: string;
}

export type ReasonCode = 
  | 'time_insufficient' 
  | 'energy_low' 
  | 'priority_changed' 
  | 'external_interrupt' 
  | 'forgot' 
  | 'other';

export interface Adjustment {
  id: string;
  triggerCheckInId?: string;
  adjustmentType: 'reschedule' | 'split' | 'postpone' | 'cancel';
  originalTaskId: string;
  newTaskIds?: string[];
  reason: string;
  aiSuggestion?: {
    message: string;
    options: Array<{ id: string; label: string; action: string }>;
  };
  accepted?: boolean;
  createdAt: string;
}

// 原因代码标签
export const REASON_LABELS: Record<ReasonCode, { label: string; icon: string }> = {
  time_insufficient: { label: '时间不够', icon: '⏰' },
  energy_low: { label: '精力不足', icon: '😴' },
  priority_changed: { label: '优先级变更', icon: '🔄' },
  external_interrupt: { label: '外部打断', icon: '📞' },
  forgot: { label: '忘记了', icon: '🤔' },
  other: { label: '其他原因', icon: '💬' },
};

// 能量等级标签
export const ENERGY_LABELS: Record<Task['energyLevel'], { label: string; color: string }> = {
  low: { label: '低能量', color: '#22c55e' },
  medium: { label: '中等', color: '#f59e0b' },
  high: { label: '高能量', color: '#ef4444' },
};

// 优先级标签
export const PRIORITY_LABELS: Record<Task['priority'], string> = {
  1: '最低',
  2: '较低',
  3: '普通',
  4: '较高',
  5: '最高',
};






