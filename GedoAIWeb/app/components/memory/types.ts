// 智忆库数据类型

export type MemoryType = 'important_info' | 'personal_trait' | 'key_event' | 'date_reminder';
export type MemorySource = 'text' | 'voice' | 'image' | 'passive_event';
export type SystemTag = 'self_awareness' | 'growth_journey' | 'goal_related' | 'relationship';

export interface Memory {
  id: string;
  type: MemoryType;
  contentRaw: string;
  contentStruct?: {
    people?: string[];
    dates?: string[];
    skills?: string[];
    emotions?: string[];
    conclusions?: string[];
  };
  source: MemorySource;
  attachmentUrl?: string;
  systemTags: SystemTag[];
  userTags: string[];
  confidence: number;
  impactScore: number;
  usageCount: number;
  confirmed: boolean;
  reminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryInput {
  type: MemoryType;
  contentRaw: string;
  source: MemorySource;
  attachmentUrl?: string;
  userTags?: string[];
  reminderDate?: string;
}

// 类型标签
export const TYPE_LABELS: Record<MemoryType, { label: string; icon: string; color: string }> = {
  important_info: { label: '重要信息', icon: '📋', color: '#3b82f6' },
  personal_trait: { label: '个人特质', icon: '🧠', color: '#8b5cf6' },
  key_event: { label: '关键事件', icon: '⭐', color: '#f59e0b' },
  date_reminder: { label: '日期提醒', icon: '📅', color: '#10b981' },
};

// 系统标签
export const SYSTEM_TAG_LABELS: Record<SystemTag, { label: string; color: string }> = {
  self_awareness: { label: '自我认知', color: '#06b6d4' },
  growth_journey: { label: '成长历程', color: '#10b981' },
  goal_related: { label: '目标关联', color: '#8b5cf6' },
  relationship: { label: '人际管理', color: '#ec4899' },
};






