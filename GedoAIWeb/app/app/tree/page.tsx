'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LifeTreeView, LifeTreeData, SkillNode, GoalFlower, TaskLeaf } from '@/app/components/life-tree';
import { useAuth } from '@/app/contexts/AuthContext';

export default function TreePage() {
  const { api } = useAuth();
  const [treeData, setTreeData] = useState<LifeTreeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载生命之树快照
  const loadTreeSnapshot = useCallback(async () => {
    try {
      const snapshot = await api.treeSnapshot();
      
      // 转换后端数据格式为前端组件格式
      const formattedData: LifeTreeData = {
        skills: (snapshot.skills || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: (s.label as string) || (s.name as string) || '技能',
          category: 'growth_journey' as SkillNode['category'],
          proficiencyLevel: 0.5,
          evidenceCount: 3,
        })),
        goals: (snapshot.goals || []).map((g: Record<string, unknown>) => ({
          id: g.id as string,
          title: (g.title as string) || '',
          status: mapGoalStatus(g.status as string),
          progress: (g.progress as number) || 0,
          lifeWheelDimension: (g.life_wheel_dimension as GoalFlower['lifeWheelDimension']) || 'growth',
          tasks: [],
        })),
        todayTasks: (snapshot.tasks || []).map((t: Record<string, unknown>) => ({
          id: t.id as string,
          title: (t.title as string) || '',
          status: mapTaskStatus(t.status as string),
          scheduledDate: (t.due_date as string) || new Date().toISOString().split('T')[0],
          energyLevel: 'medium' as TaskLeaf['energyLevel'],
        })),
        lifeWheel: {
          health: 5,
          career: 5,
          family: 5,
          finance: 5,
          growth: 5,
          social: 5,
          hobby: 5,
          self_realization: 5,
        },
      };
      
      setTreeData(formattedData);
    } catch (error) {
      console.error('Failed to load tree snapshot:', error);
      // 使用空数据作为回退
      setTreeData({
        skills: [],
        goals: [],
        todayTasks: [],
        lifeWheel: {
          health: 5,
          career: 5,
          family: 5,
          finance: 5,
          growth: 5,
          social: 5,
          hobby: 5,
          self_realization: 5,
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // 映射后端状态
  const mapGoalStatus = (status: string): GoalFlower['status'] => {
    switch (status) {
      case 'active': return 'active';
      case 'completed': return 'completed';
      case 'paused': return 'paused';
      case 'abandoned': return 'cancelled';
      default: return 'draft';
    }
  };

  const mapTaskStatus = (status: string): TaskLeaf['status'] => {
    switch (status) {
      case 'done': return 'completed';
      case 'skipped': return 'skipped';
      case 'in_progress': return 'in_progress';
      default: return 'pending';
    }
  };

  useEffect(() => {
    loadTreeSnapshot();
  }, [loadTreeSnapshot]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">正在生长你的生命之树...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">我的生命之树</h1>
          <p className="text-slate-400">
            点击树上的节点查看详情 · 根系是你的技能 · 枝叶是今日任务 · 花果是目标
          </p>
        </div>

        {/* 生命之树视图 */}
        {treeData && (treeData.skills.length > 0 || treeData.goals.length > 0 || treeData.todayTasks.length > 0) ? (
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden" style={{ height: '70vh' }}>
            <LifeTreeView
              data={treeData}
              onTaskClick={(task) => console.log('Task clicked:', task)}
              onGoalClick={(goal) => console.log('Goal clicked:', goal)}
              onSkillClick={(skill) => console.log('Skill clicked:', skill)}
            />
          </div>
        ) : (
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-12 text-center" style={{ minHeight: '50vh' }}>
            <div className="text-6xl mb-6">🌱</div>
            <h3 className="text-xl font-medium text-white mb-2">你的生命之树正在萌芽</h3>
            <p className="text-slate-400 mb-6">
              添加记忆、设定目标，让你的树茁壮成长
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/app/memory"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-medium transition-colors"
              >
                添加记忆
              </Link>
              <Link
                href="/app/goals"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition-colors"
              >
                设定目标
              </Link>
            </div>
          </div>
        )}

        {/* 快捷操作 */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/app/memory" className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors text-center">
            <span className="text-2xl mb-2 block">📝</span>
            <span className="text-white font-medium">添加记忆</span>
          </Link>
          <Link href="/app/goals" className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors text-center">
            <span className="text-2xl mb-2 block">🎯</span>
            <span className="text-white font-medium">新建目标</span>
          </Link>
          <Link href="/app/today" className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors text-center">
            <span className="text-2xl mb-2 block">✅</span>
            <span className="text-white font-medium">今日打卡</span>
          </Link>
          <Link href="/app/insights" className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors text-center">
            <span className="text-2xl mb-2 block">📊</span>
            <span className="text-white font-medium">查看洞察</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
