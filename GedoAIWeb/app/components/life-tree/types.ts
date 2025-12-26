// 生命之树数据类型定义

export interface SkillNode {
  id: string;
  name: string;
  category: 'self_awareness' | 'growth_journey' | 'goal_related' | 'relationship';
  proficiencyLevel: number; // 0-1
  evidenceCount: number;
}

export interface MemoryEvidence {
  id: string;
  type: 'important_info' | 'personal_trait' | 'key_event' | 'date_reminder';
  contentRaw: string;
  createdAt: string;
}

export interface TaskLeaf {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  scheduledDate: string;
  energyLevel: 'low' | 'medium' | 'high';
}

export interface GoalFlower {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  progress: number; // 0-100
  lifeWheelDimension: LifeWheelDimension;
  tasks: TaskLeaf[];
}

export type LifeWheelDimension = 
  | 'health' 
  | 'career' 
  | 'family' 
  | 'finance' 
  | 'growth' 
  | 'social' 
  | 'hobby' 
  | 'self_realization';

export interface LifeWheelWeights {
  health: number;
  career: number;
  family: number;
  finance: number;
  growth: number;
  social: number;
  hobby: number;
  self_realization: number;
}

export interface LifeTreeData {
  skills: SkillNode[];
  goals: GoalFlower[];
  todayTasks: TaskLeaf[];
  lifeWheel: LifeWheelWeights;
}

// 生命之花维度配色
export const DIMENSION_COLORS: Record<LifeWheelDimension, string> = {
  health: '#10b981',      // emerald
  career: '#3b82f6',      // blue
  family: '#f59e0b',      // amber
  finance: '#8b5cf6',     // violet
  growth: '#06b6d4',      // cyan
  social: '#ec4899',      // pink
  hobby: '#f97316',       // orange
  self_realization: '#6366f1', // indigo
};

// 技能分类配色
export const CATEGORY_COLORS: Record<SkillNode['category'], string> = {
  self_awareness: '#06b6d4',   // cyan
  growth_journey: '#10b981',   // emerald
  goal_related: '#8b5cf6',     // violet
  relationship: '#ec4899',     // pink
};

// 中文标签
export const DIMENSION_LABELS: Record<LifeWheelDimension, string> = {
  health: '健康',
  career: '事业',
  family: '家庭',
  finance: '财务',
  growth: '成长',
  social: '社交',
  hobby: '兴趣',
  self_realization: '自我实现',
};

export const CATEGORY_LABELS: Record<SkillNode['category'], string> = {
  self_awareness: '自我认知',
  growth_journey: '成长历程',
  goal_related: '目标关联',
  relationship: '人际管理',
};






