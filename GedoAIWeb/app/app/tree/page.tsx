'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LifeTreeView, LifeTreeData, SkillNode, GoalFlower, TaskLeaf, LifeTheme } from '@/app/components/life-tree';
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
        lifeTheme: snapshot.lifeTheme ? {
          id: snapshot.lifeTheme.id as string,
          title: snapshot.lifeTheme.title as string,
          description: snapshot.lifeTheme.description as string,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
        } : undefined,
        skills: (snapshot.skills || []).map((s: Record<string, unknown>) => ({
          id: s.id as string,
          name: (s.label as string) || (s.name as string) || '技能',
          category: 'growth_journey' as SkillNode['category'],
          proficiencyLevel: (s.proficiency as number) || 0.5,
          evidenceCount: (s.evidence_count as number) || 3,
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
      // 使用演示数据作为回退
      setTreeData(getDemoData());
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-stone-950">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-emerald-400/50"
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-2xl">🌳</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm">正在加载你的生命之树...</p>
        </motion.div>
      </div>
    );
  }

  const hasData = treeData && (treeData.skills.length > 0 || treeData.goals.length > 0 || treeData.todayTasks.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-stone-950">
      {/* 页面头部 */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <span className="text-3xl">🌳</span>
            我的生命之树
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            树干是人生主题 · 根系是能力（由智忆证据支撑）· 枝叶是今日行动 · 花果是目标
          </p>
        </motion.div>
      </div>

      {/* 生命之树视图 */}
      <motion.div 
        className="px-4"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {hasData ? (
          <div 
            className="mx-auto max-w-6xl rounded-2xl border border-slate-800/50 overflow-hidden shadow-2xl shadow-black/20"
            style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}
          >
            <LifeTreeView
              data={treeData}
              onTaskClick={(task) => console.log('Task clicked:', task)}
              onGoalClick={(goal) => console.log('Goal clicked:', goal)}
              onSkillClick={(skill) => console.log('Skill clicked:', skill)}
            />
          </div>
        ) : (
          <div 
            className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 backdrop-blur-sm p-12 text-center"
            style={{ minHeight: '50vh' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-7xl mb-6">🌱</div>
              <h3 className="text-2xl font-semibold text-white mb-3">你的生命之树正在萌芽</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                用<span className="text-emerald-400 font-medium">智忆</span>记录经历沉淀能力、
                用<span className="text-blue-400 font-medium">智引</span>设定目标规划行动，
                让你的能力根系茁壮成长
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  href="/app/memory"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full font-medium transition-all shadow-lg shadow-emerald-900/30 hover:shadow-emerald-800/40"
                >
                  📝 添加智忆
                </Link>
                <Link
                  href="/app/goals"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-medium transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40"
                >
                  🎯 设定目标
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* 快捷操作 */}
      <motion.div 
        className="container mx-auto px-4 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {[
            { href: '/app/memory', icon: '🧠', label: '智忆', desc: '记录经历', color: 'from-emerald-600/20 to-teal-600/20 border-emerald-700/30 hover:border-emerald-600/50' },
            { href: '/app/goals', icon: '🎯', label: '智引', desc: '规划目标', color: 'from-blue-600/20 to-indigo-600/20 border-blue-700/30 hover:border-blue-600/50' },
            { href: '/app/today', icon: '✅', label: '今日行动', desc: '执行打卡', color: 'from-lime-600/20 to-green-600/20 border-lime-700/30 hover:border-lime-600/50' },
            { href: '/app/insights', icon: '📊', label: '复盘洞察', desc: '能力成长', color: 'from-amber-600/20 to-orange-600/20 border-amber-700/30 hover:border-amber-600/50' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`p-4 rounded-xl border bg-gradient-to-br ${item.color} transition-all hover:scale-[1.02] group`}
            >
              <div className="text-center">
                <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-white font-medium text-sm block">{item.label}</span>
                <span className="text-slate-500 text-xs">{item.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// 演示数据（用于展示效果）
function getDemoData(): LifeTreeData {
  return {
    lifeTheme: {
      id: 'theme-1',
      title: '成为持续创造价值的人',
      description: '以健康为基础，通过持续学习和创作，实现个人成长与社会贡献',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    skills: [
      { id: 's1', name: '写作表达', category: 'growth_journey', proficiencyLevel: 0.75, evidenceCount: 12 },
      { id: 's2', name: '编程开发', category: 'goal_related', proficiencyLevel: 0.85, evidenceCount: 28 },
      { id: 's3', name: '产品思维', category: 'goal_related', proficiencyLevel: 0.6, evidenceCount: 8 },
      { id: 's4', name: '情绪管理', category: 'self_awareness', proficiencyLevel: 0.55, evidenceCount: 5 },
      { id: 's5', name: '团队协作', category: 'relationship', proficiencyLevel: 0.7, evidenceCount: 15 },
    ],
    goals: [
      { id: 'g1', title: '完成个人作品集', status: 'active', progress: 45, lifeWheelDimension: 'career', tasks: [] },
      { id: 'g2', title: '每周运动3次', status: 'active', progress: 70, lifeWheelDimension: 'health', tasks: [] },
      { id: 'g3', title: '读完10本书', status: 'completed', progress: 100, lifeWheelDimension: 'growth', tasks: [] },
      { id: 'g4', title: '学习AI产品设计', status: 'active', progress: 30, lifeWheelDimension: 'growth', tasks: [] },
    ],
    todayTasks: [
      { id: 't1', title: '完成项目文档', status: 'completed', scheduledDate: new Date().toISOString(), energyLevel: 'high' },
      { id: 't2', title: '晨跑30分钟', status: 'completed', scheduledDate: new Date().toISOString(), energyLevel: 'medium' },
      { id: 't3', title: '阅读1小时', status: 'in_progress', scheduledDate: new Date().toISOString(), energyLevel: 'low' },
      { id: 't4', title: '复盘本周工作', status: 'pending', scheduledDate: new Date().toISOString(), energyLevel: 'medium' },
      { id: 't5', title: '整理学习笔记', status: 'pending', scheduledDate: new Date().toISOString(), energyLevel: 'low' },
    ],
    lifeWheel: {
      health: 7,
      career: 6,
      family: 8,
      finance: 5,
      growth: 8,
      social: 6,
      hobby: 7,
      self_realization: 5,
    },
  };
}
