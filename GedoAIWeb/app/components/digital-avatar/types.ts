// 数字人/虚拟分身 类型定义

import { LifeWheelDimension, LifeWheelWeights } from '../life-tree/types';

// ============ 数字人状态 ============

export type AvatarMood = 'happy' | 'neutral' | 'thinking' | 'excited' | 'tired' | 'encouraging';
export type AvatarLevel = 1 | 2 | 3 | 4 | 5;

export interface AvatarState {
  // 基础信息
  nickname: string;
  level: AvatarLevel;
  experience: number; // 当前经验值
  experienceToNext: number; // 升级所需经验
  
  // 情绪状态
  mood: AvatarMood;
  energy: number; // 0-100 能量值
  
  // 人生主题
  lifeTheme?: string;
  coreValues?: string[];
  
  // 8维度能力
  lifeWheel: LifeWheelWeights;
  
  // 今日统计
  todayCompleted: number;
  todayTotal: number;
  streakDays: number; // 连续打卡天数
  
  // 成就
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  earnedAt: string;
  category: 'goal' | 'streak' | 'memory' | 'milestone';
}

// ============ 对话消息 ============

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  
  // 功能调用相关
  functionCall?: {
    name: string;
    arguments: Record<string, unknown>;
    result?: unknown;
  };
  
  // 快捷操作
  quickActions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  type: 'memory' | 'goal' | 'checkin' | 'confirm' | 'cancel';
  payload?: Record<string, unknown>;
}

// ============ 对话上下文 ============

export interface ConversationContext {
  // 用户画像
  userProfile: {
    nickname: string;
    lifeTheme?: string;
    coreValues?: string[];
  };
  
  // 最近记忆（用于上下文）
  recentMemories: Array<{
    id: string;
    summary: string;
    createdAt: string;
  }>;
  
  // 当前活跃目标
  activeGoals: Array<{
    id: string;
    title: string;
    progress: number;
    dimension: LifeWheelDimension;
  }>;
  
  // 今日任务
  todayTasks: Array<{
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  }>;
  
  // 8维度状态
  lifeWheel: LifeWheelWeights;
}

// ============ Function Calling ============

export type FunctionName = 
  | 'capture_memory'
  | 'create_goal'
  | 'complete_task'
  | 'skip_task'
  | 'search_memory'
  | 'get_insights';

export interface FunctionDefinition {
  name: FunctionName;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

// ============ 配色 ============

export const MOOD_COLORS: Record<AvatarMood, string> = {
  happy: '#22c55e',      // green
  neutral: '#64748b',    // slate
  thinking: '#3b82f6',   // blue
  excited: '#f59e0b',    // amber
  tired: '#94a3b8',      // slate-400
  encouraging: '#ec4899', // pink
};

export const LEVEL_COLORS: Record<AvatarLevel, { primary: string; glow: string }> = {
  1: { primary: '#64748b', glow: 'rgba(100, 116, 139, 0.3)' },  // 素装
  2: { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.3)' },    // 成长
  3: { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },   // 进阶
  4: { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)' },   // 精英
  5: { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },   // 传奇
};

export const DIMENSION_ICONS: Record<LifeWheelDimension, string> = {
  health: '💪',
  career: '💼',
  family: '👨‍👩‍👧',
  finance: '💰',
  growth: '📚',
  social: '🤝',
  hobby: '🎨',
  self_realization: '⭐',
};


