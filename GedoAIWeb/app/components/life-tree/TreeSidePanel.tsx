'use client';

import { motion } from 'framer-motion';
import { X, CheckCircle, Circle, Clock, Target, Sparkles, Brain } from 'lucide-react';
import { 
  SkillNode, 
  GoalFlower, 
  TaskLeaf,
  DIMENSION_COLORS,
  CATEGORY_COLORS,
  DIMENSION_LABELS,
  CATEGORY_LABELS,
} from './types';

interface TreeSidePanelProps {
  type: 'skill' | 'goal' | 'task';
  data: SkillNode | GoalFlower | TaskLeaf;
  onClose: () => void;
}

export const TreeSidePanel = ({ type, data, onClose }: TreeSidePanelProps) => {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="w-80 bg-slate-900/95 backdrop-blur-md border-l border-slate-700 p-6 overflow-y-auto"
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      {type === 'skill' && <SkillPanel skill={data as SkillNode} />}
      {type === 'goal' && <GoalPanel goal={data as GoalFlower} />}
      {type === 'task' && <TaskPanel task={data as TaskLeaf} />}
    </motion.div>
  );
};

// 技能详情面板
const SkillPanel = ({ skill }: { skill: SkillNode }) => {
  const color = CATEGORY_COLORS[skill.category];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color + '30' }}
        >
          <Brain size={24} style={{ color }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
          <span className="text-sm text-slate-400">
            {CATEGORY_LABELS[skill.category]}
          </span>
        </div>
      </div>

      {/* 熟练度进度条 */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">熟练度</span>
          <span className="text-white">{Math.round(skill.proficiencyLevel * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${skill.proficiencyLevel * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 证据数量 */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles size={16} />
          <span>相关记忆证据</span>
        </div>
        <div className="text-2xl font-bold text-white mt-2">
          {skill.evidenceCount} 条
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <button className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          查看相关记忆
        </button>
        <button className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          关联到目标
        </button>
      </div>
    </div>
  );
};

// 目标详情面板
const GoalPanel = ({ goal }: { goal: GoalFlower }) => {
  const color = DIMENSION_COLORS[goal.lifeWheelDimension];
  const isCompleted = goal.status === 'completed';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color + '30' }}
        >
          <Target size={24} style={{ color }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
          <span className="text-sm" style={{ color }}>
            {DIMENSION_LABELS[goal.lifeWheelDimension]}
          </span>
        </div>
      </div>

      {/* 状态标签 */}
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            isCompleted
              ? 'bg-green-500/20 text-green-400'
              : goal.status === 'active'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-slate-500/20 text-slate-400'
          }`}
        >
          {isCompleted ? '已完成' : goal.status === 'active' ? '进行中' : '暂停'}
        </span>
      </div>

      {/* 进度环 */}
      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#334155"
              strokeWidth="8"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 352' }}
              animate={{ strokeDasharray: `${(goal.progress / 100) * 352} 352` }}
              transition={{ duration: 0.8 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-white">{goal.progress}%</span>
            <span className="text-xs text-slate-400">完成进度</span>
          </div>
        </div>
      </div>

      {/* 关联任务 */}
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-3">关联任务</h4>
        <div className="space-y-2">
          {goal.tasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg"
            >
              {task.status === 'completed' ? (
                <CheckCircle size={16} className="text-green-400" />
              ) : (
                <Circle size={16} className="text-slate-500" />
              )}
              <span className={`text-sm ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <button
          className="w-full py-2 px-4 rounded-lg font-medium transition-colors"
          style={{ backgroundColor: color, color: '#fff' }}
        >
          查看详情
        </button>
        <button className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          调整计划
        </button>
      </div>
    </div>
  );
};

// 任务详情面板
const TaskPanel = ({ task }: { task: TaskLeaf }) => {
  const isCompleted = task.status === 'completed';
  
  const energyLabels = {
    low: { text: '低能量', color: '#22c55e' },
    medium: { text: '中等', color: '#f59e0b' },
    high: { text: '高能量', color: '#ef4444' },
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-500/20' : 'bg-slate-700'
          }`}
        >
          {isCompleted ? (
            <CheckCircle size={24} className="text-green-400" />
          ) : (
            <Clock size={24} className="text-slate-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
          <span className="text-sm text-slate-400">
            {new Date(task.scheduledDate).toLocaleDateString('zh-CN')}
          </span>
        </div>
      </div>

      {/* 状态 */}
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-full text-sm ${
            isCompleted
              ? 'bg-green-500/20 text-green-400'
              : task.status === 'in_progress'
              ? 'bg-blue-500/20 text-blue-400'
              : 'bg-slate-500/20 text-slate-400'
          }`}
        >
          {isCompleted ? '已完成' : task.status === 'in_progress' ? '进行中' : '待开始'}
        </span>
        <span
          className="px-3 py-1 rounded-full text-sm"
          style={{
            backgroundColor: energyLabels[task.energyLevel].color + '20',
            color: energyLabels[task.energyLevel].color,
          }}
        >
          {energyLabels[task.energyLevel].text}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2">
        {!isCompleted && (
          <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors">
            完成打卡
          </button>
        )}
        <button className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          {isCompleted ? '查看打卡记录' : '暂时跳过'}
        </button>
        <button className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          调整任务
        </button>
      </div>
    </div>
  );
};






