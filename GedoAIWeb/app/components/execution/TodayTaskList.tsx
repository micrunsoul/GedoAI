'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Target,
  ChevronRight,
  Play,
  Zap,
  MoreVertical,
  Calendar,
  SkipForward,
} from 'lucide-react';
import { Task, ENERGY_LABELS, PRIORITY_LABELS } from './types';
import { CheckInModal } from './CheckInModal';

interface TodayTaskListProps {
  tasks: Task[];
  onCheckIn: (taskId: string, status: 'completed' | 'not_completed' | 'partial', data?: {
    reasonCode?: string;
    reasonNote?: string;
    actualDuration?: number;
    moodRating?: number;
  }) => void;
  onStartTask?: (taskId: string) => void;
  onPostpone?: (taskId: string) => void;
}

export const TodayTaskList = ({ tasks, onCheckIn, onStartTask, onPostpone }: TodayTaskListProps) => {
  const [checkInTask, setCheckInTask] = useState<Task | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 按状态分组
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const skippedTasks = tasks.filter(t => t.status === 'skipped' || t.status === 'postponed');

  const handleQuickComplete = (task: Task) => {
    onCheckIn(task.id, 'completed', { actualDuration: task.estimatedDuration });
  };

  const renderTask = (task: Task) => {
    const isCompleted = task.status === 'completed';
    const isInProgress = task.status === 'in_progress';
    const isSkipped = task.status === 'skipped' || task.status === 'postponed';
    const energyInfo = ENERGY_LABELS[task.energyLevel];
    
    return (
      <motion.div
        key={task.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-slate-900/50 border rounded-xl overflow-hidden ${
          isCompleted 
            ? 'border-green-500/30' 
            : isSkipped 
            ? 'border-slate-700 opacity-60' 
            : 'border-slate-800'
        }`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* 状态图标/按钮 */}
            <button
              onClick={() => isCompleted ? null : setCheckInTask(task)}
              disabled={isCompleted || isSkipped}
              className={`mt-0.5 transition-colors ${
                isCompleted 
                  ? 'text-green-400 cursor-default' 
                  : isSkipped
                  ? 'text-slate-600 cursor-default'
                  : 'text-slate-400 hover:text-green-400'
              }`}
            >
              {isCompleted ? <CheckCircle size={22} /> : <Circle size={22} />}
            </button>

            {/* 任务内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${
                  isCompleted 
                    ? 'text-slate-400 line-through' 
                    : isSkipped
                    ? 'text-slate-500'
                    : 'text-white'
                }`}>
                  {task.title}
                </h4>
                {isInProgress && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    进行中
                  </span>
                )}
              </div>

              {/* 标签行 */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {task.goalTitle && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Target size={12} />
                    {task.goalTitle}
                  </span>
                )}
                {task.estimatedDuration && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={12} />
                    {task.estimatedDuration}分钟
                  </span>
                )}
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                  style={{ 
                    backgroundColor: energyInfo.color + '20',
                    color: energyInfo.color,
                  }}
                >
                  <Zap size={10} />
                  {energyInfo.label}
                </span>
                {task.priority >= 4 && (
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            {!isCompleted && !isSkipped && (
              <div className="flex items-center gap-1">
                {!isInProgress && (
                  <button
                    onClick={() => onStartTask?.(task.id)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="开始任务"
                  >
                    <Play size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleQuickComplete(task)}
                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="快速完成"
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  onClick={() => onPostpone?.(task.id)}
                  className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="顺延到明天"
                >
                  <SkipForward size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 待完成任务 */}
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Circle size={14} />
            待完成 ({pendingTasks.length})
          </h3>
          <div className="space-y-2">
            {pendingTasks.map(renderTask)}
          </div>
        </div>
      )}

      {/* 已完成任务 */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-400/70 mb-3 flex items-center gap-2">
            <CheckCircle size={14} />
            已完成 ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map(renderTask)}
          </div>
        </div>
      )}

      {/* 已跳过/顺延 */}
      {skippedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
            <SkipForward size={14} />
            已跳过/顺延 ({skippedTasks.length})
          </h3>
          <div className="space-y-2">
            {skippedTasks.map(renderTask)}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-500">今天没有任务</p>
          <p className="text-sm text-slate-600 mt-1">去目标页面创建新任务吧</p>
        </div>
      )}

      {/* 打卡弹窗 */}
      <AnimatePresence>
        {checkInTask && (
          <CheckInModal
            task={checkInTask}
            onSubmit={(status, data) => {
              onCheckIn(checkInTask.id, status, data);
              setCheckInTask(null);
            }}
            onClose={() => setCheckInTask(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};






