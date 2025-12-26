'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  ChevronRight, 
  MoreVertical,
  Play,
  Pause,
  Check,
  Trash2,
  Edit2,
  ListTodo,
} from 'lucide-react';
import { Goal, LEVEL_LABELS, DIMENSION_LABELS, DIMENSION_COLORS } from './types';

interface GoalListProps {
  goals: Goal[];
  onGoalClick?: (goal: Goal) => void;
  onStatusChange?: (id: string, status: Goal['status']) => void;
  onDelete?: (id: string) => void;
}

export const GoalList = ({ goals, onGoalClick, onStatusChange, onDelete }: GoalListProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const getStatusLabel = (status: Goal['status']) => {
    const labels = {
      draft: { text: '草稿', color: 'bg-slate-500/20 text-slate-400' },
      active: { text: '进行中', color: 'bg-blue-500/20 text-blue-400' },
      paused: { text: '已暂停', color: 'bg-yellow-500/20 text-yellow-400' },
      completed: { text: '已完成', color: 'bg-green-500/20 text-green-400' },
      cancelled: { text: '已取消', color: 'bg-red-500/20 text-red-400' },
    };
    return labels[status];
  };

  // 按维度分组
  const groupedGoals = goals.reduce((acc, goal) => {
    const dim = goal.lifeWheelDimension;
    if (!acc[dim]) acc[dim] = [];
    acc[dim].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedGoals).map(([dimension, dimensionGoals]) => (
        <div key={dimension}>
          {/* 维度标题 */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: DIMENSION_COLORS[dimension as keyof typeof DIMENSION_COLORS] }}
            />
            <h3 className="text-sm font-medium text-slate-400">
              {DIMENSION_LABELS[dimension as keyof typeof DIMENSION_LABELS]}
            </h3>
            <span className="text-xs text-slate-500">({dimensionGoals.length})</span>
          </div>

          {/* 目标卡片列表 */}
          <div className="space-y-3">
            {dimensionGoals.map((goal) => {
              const statusInfo = getStatusLabel(goal.status);
              
              return (
                <motion.div
                  key={goal.id}
                  layout
                  className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
                >
                  {/* 卡片主体 */}
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                    onClick={() => {
                      setExpandedId(expandedId === goal.id ? null : goal.id);
                      onGoalClick?.(goal);
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* 进度环 */}
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="#334155"
                            strokeWidth="4"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke={DIMENSION_COLORS[goal.lifeWheelDimension]}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${(goal.progress / 100) * 126} 126`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">{goal.progress}%</span>
                        </div>
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium truncate">{goal.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>{LEVEL_LABELS[goal.level].label}</span>
                          {goal.endDate && (
                            <span>截止: {goal.endDate}</span>
                          )}
                        </div>
                      </div>

                      {/* 操作菜单 */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(menuOpenId === goal.id ? null : goal.id);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {menuOpenId === goal.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg overflow-hidden z-10 min-w-[140px]"
                            >
                              {goal.status === 'active' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange?.(goal.id, 'paused');
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full px-4 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-700 text-sm"
                                >
                                  <Pause size={14} />
                                  暂停
                                </button>
                              )}
                              {(goal.status === 'draft' || goal.status === 'paused') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange?.(goal.id, 'active');
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full px-4 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-700 text-sm"
                                >
                                  <Play size={14} />
                                  开始
                                </button>
                              )}
                              {goal.status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange?.(goal.id, 'completed');
                                    setMenuOpenId(null);
                                  }}
                                  className="w-full px-4 py-2 flex items-center gap-2 text-green-400 hover:bg-slate-700 text-sm"
                                >
                                  <Check size={14} />
                                  标记完成
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: 查看任务
                                  setMenuOpenId(null);
                                }}
                                className="w-full px-4 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-700 text-sm"
                              >
                                <ListTodo size={14} />
                                查看任务
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete?.(goal.id);
                                  setMenuOpenId(null);
                                }}
                                className="w-full px-4 py-2 flex items-center gap-2 text-red-400 hover:bg-slate-700 text-sm"
                              >
                                <Trash2 size={14} />
                                删除
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <ChevronRight
                        size={18}
                        className={`text-slate-400 transition-transform ${
                          expandedId === goal.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* 展开详情 */}
                  <AnimatePresence>
                    {expandedId === goal.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-slate-800">
                          <div className="pt-4 space-y-3">
                            {goal.description && (
                              <p className="text-sm text-slate-300">{goal.description}</p>
                            )}
                            
                            {/* SMART 信息 */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {goal.specific && (
                                <div>
                                  <span className="text-slate-500">具体目标：</span>
                                  <span className="text-slate-300 ml-1">{goal.specific}</span>
                                </div>
                              )}
                              {goal.measurable && (
                                <div>
                                  <span className="text-slate-500">衡量标准：</span>
                                  <span className="text-slate-300 ml-1">{goal.measurable}</span>
                                </div>
                              )}
                            </div>

                            {/* 时间信息 */}
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              {goal.startDate && <span>开始: {goal.startDate}</span>}
                              {goal.endDate && <span>截止: {goal.endDate}</span>}
                              <span>创建于: {new Date(goal.createdAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500">还没有目标，点击上方按钮创建一个吧！</p>
        </div>
      )}
    </div>
  );
};






