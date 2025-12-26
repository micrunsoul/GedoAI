'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Calendar, Sun, Moon, Zap, CheckCircle, Clock } from 'lucide-react';
import { 
  TodayTaskList, 
  AdjustmentSuggestion,
  generateAdjustmentSuggestion,
  Task, 
  Adjustment,
  ReasonCode,
} from '@/app/components/execution';
import { useAuth } from '@/app/contexts/AuthContext';

export default function TodayPage() {
  const { api } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAdjustment, setPendingAdjustment] = useState<{
    adjustment: Adjustment;
    task: Task;
  } | null>(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  // 加载今日任务
  const loadTasks = useCallback(async () => {
    try {
      const result = await api.todayTasks();
      const formattedTasks: Task[] = (result.items || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        goalId: item.goal_id as string | undefined,
        goalTitle: item.goal_title as string | undefined,
        title: (item.title as string) || '',
        description: item.description as string | undefined,
        estimatedDuration: (item.estimated_duration as number) || 30,
        energyLevel: (item.energy_level as Task['energyLevel']) || 'medium',
        priority: (item.priority as number) || 2,
        status: mapTaskStatus(item.status as string),
        scheduledDate: (item.due_date as string) || new Date().toISOString().split('T')[0],
        completedAt: item.completed_at as string | undefined,
      }));
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // 映射后端状态到前端状态
  const mapTaskStatus = (status: string): Task['status'] => {
    switch (status) {
      case 'done': return 'completed';
      case 'todo': return 'pending';
      case 'skipped': return 'skipped';
      default: return 'pending';
    }
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // 统计数据
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalDuration = tasks.reduce((sum, t) => sum + (t.estimatedDuration || 0), 0);
  const completedDuration = tasks
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.estimatedDuration || 0), 0);

  const handleCheckIn = async (
    taskId: string,
    status: 'completed' | 'not_completed' | 'partial',
    data?: {
      reasonCode?: string;
      reasonNote?: string;
      actualDuration?: number;
      moodRating?: number;
    }
  ) => {
    try {
      if (status === 'completed') {
        await api.checkin(taskId, { status: 'done' });
        setTasks(tasks.map(t => 
          t.id === taskId 
            ? { ...t, status: 'completed', completedAt: new Date().toISOString() }
            : t
        ));
      } else if (status === 'not_completed') {
        await api.checkin(taskId, { 
          status: 'skipped',
          reason_code: data?.reasonCode,
          note: data?.reasonNote,
        });
        
        // 生成调整建议
        const task = tasks.find(t => t.id === taskId);
        if (task && data?.reasonCode) {
          const adjustment = generateAdjustmentSuggestion(
            task,
            data.reasonCode as ReasonCode,
            data.reasonNote
          );
          if (adjustment) {
            setPendingAdjustment({ adjustment, task });
          }
        }
        
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status: 'skipped' } : t
        ));
      } else {
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status: 'in_progress' } : t
        ));
      }
    } catch (error) {
      console.error('Failed to check in:', error);
      // 重新加载任务列表
      await loadTasks();
    }
  };

  const handleStartTask = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: 'in_progress' } : t
    ));
  };

  const handlePostpone = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, status: 'postponed' } : t
    ));
  };

  const handleAcceptAdjustment = (adjustment: Adjustment, option?: string) => {
    console.log('Accepted adjustment:', adjustment.adjustmentType, option);
    // TODO: 执行调整操作，调用后端 API
    setPendingAdjustment(null);
  };

  const handleRejectAdjustment = (adjustment: Adjustment) => {
    console.log('Rejected adjustment:', adjustment.id);
    setPendingAdjustment(null);
  };

  // 获取时段问候语
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 6) return { text: '夜深了', icon: Moon };
    if (hour < 12) return { text: '早上好', icon: Sun };
    if (hour < 18) return { text: '下午好', icon: Sun };
    return { text: '晚上好', icon: Moon };
  };
  const greeting = getGreeting();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 日期和问候 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Calendar size={16} />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-3">
            <greeting.icon size={28} className="text-amber-400" />
            <h1 className="text-3xl font-bold text-white">{greeting.text}</h1>
          </div>
        </div>

        {/* 进度概览 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">今日进度</h2>
            <span className="text-2xl font-bold text-white">
              {completedTasks}/{totalTasks}
            </span>
          </div>
          
          {/* 进度条 */}
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <CheckCircle size={16} />
                <span className="text-lg font-bold">{completedTasks}</span>
              </div>
              <div className="text-xs text-slate-500">已完成</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Zap size={16} />
                <span className="text-lg font-bold">{totalTasks - completedTasks}</span>
              </div>
              <div className="text-xs text-slate-500">待完成</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                <Clock size={16} />
                <span className="text-lg font-bold">{completedDuration}/{totalDuration}</span>
              </div>
              <div className="text-xs text-slate-500">分钟</div>
            </div>
          </div>
        </div>

        {/* 调整建议 */}
        <AnimatePresence>
          {pendingAdjustment && (
            <div className="mb-6">
              <AdjustmentSuggestion
                adjustment={pendingAdjustment.adjustment}
                originalTask={pendingAdjustment.task}
                onAccept={handleAcceptAdjustment}
                onReject={handleRejectAdjustment}
                onDismiss={() => setPendingAdjustment(null)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* 任务列表 */}
        {tasks.length > 0 ? (
          <TodayTaskList
            tasks={tasks}
            onCheckIn={handleCheckIn}
            onStartTask={handleStartTask}
            onPostpone={handlePostpone}
          />
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg mb-2">今天还没有任务</p>
            <p className="text-sm">去目标页面创建目标，自动生成任务</p>
          </div>
        )}

        {/* 完成鼓励 */}
        {completedTasks === totalTasks && totalTasks > 0 && (
          <div className="mt-8 text-center p-6 bg-green-500/10 border border-green-500/30 rounded-2xl">
            <span className="text-4xl mb-3 block">🎉</span>
            <h3 className="text-xl font-bold text-green-400 mb-2">太棒了！</h3>
            <p className="text-slate-400">你完成了今天所有的任务</p>
          </div>
        )}
      </div>
    </div>
  );
}
