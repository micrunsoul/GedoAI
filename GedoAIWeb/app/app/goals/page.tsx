'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { GoalWizard, GoalList, Goal } from '@/app/components/planner';
import { useAuth } from '@/app/contexts/AuthContext';

export default function GoalsPage() {
  const { api } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  // 加载目标列表
  const loadGoals = useCallback(async () => {
    try {
      const result = await api.listGoals();
      const formattedGoals: Goal[] = (result.items || []).map((item: Record<string, unknown>) => ({
        id: item.id as string,
        title: (item.title as string) || '',
        description: item.description as string | undefined,
        level: 'phase' as Goal['level'],
        lifeWheelDimension: (item.life_wheel_dimension as Goal['lifeWheelDimension']) || 'growth',
        status: (item.status as Goal['status']) || 'draft',
        progress: (item.progress as number) || 0,
        startDate: item.start_date as string | undefined,
        endDate: item.end_date as string | undefined,
        createdAt: (item.created_at as string) || new Date().toISOString(),
        updatedAt: (item.updated_at as string) || new Date().toISOString(),
      }));
      setGoals(formattedGoals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = async (goalData: Partial<Goal>, tasks: Array<{ title: string; scheduledDate?: string }>) => {
    try {
      // 先创建目标
      await api.createGoal({
        title: goalData.title || '新目标',
        description: goalData.description,
        life_wheel_dimension: goalData.lifeWheelDimension,
      });

      // 如果有任务，通过 generatePlan 创建
      if (tasks.length > 0) {
        await api.generatePlan(goalData.title || '新目标', {
          tasks: tasks.map(t => t.title),
        });
      }

      // 重新加载目标列表
      await loadGoals();
      setShowWizard(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  };

  const handleStatusChange = async (id: string, status: Goal['status']) => {
    try {
      await api.updateGoalStatus(id, status);
      // 乐观更新
      setGoals(goals.map(g => 
        g.id === id 
          ? { ...g, status, progress: status === 'completed' ? 100 : g.progress, updatedAt: new Date().toISOString() }
          : g
      ));
    } catch (error) {
      console.error('Failed to update goal status:', error);
      // 回滚：重新加载
      await loadGoals();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">目标管理</h1>
            <p className="text-slate-400">
              设定目标，AI 帮你拆解成可执行的计划
            </p>
          </div>
          
          {!showWizard && (
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors"
            >
              <Plus size={20} />
              <span>新建目标</span>
            </button>
          )}
        </div>

        {/* 目标创建向导 */}
        <AnimatePresence>
          {showWizard && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-white">创建新目标</h2>
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <GoalWizard
                onComplete={handleCreateGoal}
                onCancel={() => setShowWizard(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">
              {goals.filter(g => g.status === 'active').length}
            </div>
            <div className="text-sm text-slate-400">进行中</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {goals.filter(g => g.status === 'completed').length}
            </div>
            <div className="text-sm text-slate-400">已完成</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {goals.filter(g => g.status === 'draft').length}
            </div>
            <div className="text-sm text-slate-400">草稿</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(goals.filter(g => g.status === 'active').reduce((sum, g) => sum + g.progress, 0) / Math.max(goals.filter(g => g.status === 'active').length, 1))}%
            </div>
            <div className="text-sm text-slate-400">平均进度</div>
          </div>
        </div>

        {/* 目标列表 */}
        <GoalList
          goals={goals}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
