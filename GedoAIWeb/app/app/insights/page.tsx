'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Target,
  Brain,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { DIMENSION_LABELS, DIMENSION_COLORS, LifeWheelDimension } from '@/app/components/life-tree';

// Mock 统计数据
const mockStats = {
  weeklyCompletion: [
    { day: '周一', completed: 5, total: 6 },
    { day: '周二', completed: 4, total: 5 },
    { day: '周三', completed: 6, total: 6 },
    { day: '周四', completed: 3, total: 5 },
    { day: '周五', completed: 4, total: 6 },
    { day: '周六', completed: 2, total: 3 },
    { day: '周日', completed: 1, total: 2 },
  ],
  dimensionProgress: [
    { dimension: 'career' as LifeWheelDimension, progress: 65, change: 12 },
    { dimension: 'health' as LifeWheelDimension, progress: 70, change: 5 },
    { dimension: 'growth' as LifeWheelDimension, progress: 55, change: -3 },
    { dimension: 'family' as LifeWheelDimension, progress: 40, change: 8 },
  ],
  topSkills: [
    { name: 'PPT制作', usageCount: 8 },
    { name: '需求分析', usageCount: 5 },
    { name: '沟通协调', usageCount: 4 },
  ],
  recentReflections: [
    {
      id: 'r1',
      type: 'weekly',
      title: '本周复盘',
      content: '本周完成了产品方法论课程的学习，在需求评审中应用了新学的技能。健身计划执行良好，但阅读时间有所减少。',
      createdAt: '2025-12-21',
      insights: ['坚持早起习惯', '需要平衡学习和阅读时间'],
    },
    {
      id: 'r2',
      type: 'goal_complete',
      title: '《思考快与慢》读完',
      content: '完成了这本书的阅读，对系统1和系统2思维有了更深的理解。',
      createdAt: '2025-12-15',
      insights: ['应用到日常决策中', '写一篇读书笔记'],
    },
  ],
};

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const totalCompleted = mockStats.weeklyCompletion.reduce((sum, d) => sum + d.completed, 0);
  const totalTasks = mockStats.weeklyCompletion.reduce((sum, d) => sum + d.total, 0);
  const completionRate = Math.round((totalCompleted / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">洞察与复盘</h1>
            <p className="text-slate-400">
              回顾你的成长轨迹，发现改进机会
            </p>
          </div>
          
          {/* 时间范围切换 */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              本月
            </button>
          </div>
        </div>

        {/* 概览卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <CheckCircle size={16} />
              完成任务
            </div>
            <div className="text-2xl font-bold text-white">{totalCompleted}</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <TrendingUp size={16} />
              完成率
            </div>
            <div className="text-2xl font-bold text-green-400">{completionRate}%</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Target size={16} />
              活跃目标
            </div>
            <div className="text-2xl font-bold text-blue-400">4</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Brain size={16} />
              新增记忆
            </div>
            <div className="text-2xl font-bold text-purple-400">12</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 每日完成情况 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              每日完成情况
            </h3>
            <div className="flex items-end justify-between h-40 gap-2">
              {mockStats.weeklyCompletion.map((day) => {
                const height = day.total > 0 ? (day.completed / day.total) * 100 : 0;
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-slate-700 rounded-t-sm relative" style={{ height: '120px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-sm"
                      />
                    </div>
                    <span className="text-xs text-slate-500">{day.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 维度进展 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Target size={20} />
              维度进展
            </h3>
            <div className="space-y-4">
              {mockStats.dimensionProgress.map(({ dimension, progress, change }) => (
                <div key={dimension}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">
                      {DIMENSION_LABELS[dimension]}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{progress}%</span>
                      <span className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {change >= 0 ? '+' : ''}{change}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: DIMENSION_COLORS[dimension] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI 洞察 */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 text-blue-400 mb-4">
            <Sparkles size={20} />
            <h3 className="font-medium">AI 洞察</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-blue-400">1</span>
              </div>
              <p className="text-slate-300">
                你的<span className="text-blue-400">早晨时段</span>任务完成率最高（92%），建议将重要任务安排在这个时间。
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-blue-400">2</span>
              </div>
              <p className="text-slate-300">
                "<span className="text-blue-400">时间不够</span>"是你最常见的未完成原因，建议尝试任务拆分或预留更多缓冲时间。
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-blue-400">3</span>
              </div>
              <p className="text-slate-300">
                <span className="text-blue-400">成长维度</span>进度有所下滑，本周阅读时间减少了 40%，建议重新平衡时间分配。
              </p>
            </div>
          </div>
        </div>

        {/* 复盘记录 */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-medium text-white flex items-center gap-2">
              <Calendar size={18} />
              复盘记录
            </h3>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
              写复盘
            </button>
          </div>
          
          <div className="divide-y divide-slate-800">
            {mockStats.recentReflections.map((reflection) => (
              <div key={reflection.id} className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        reflection.type === 'weekly'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {reflection.type === 'weekly' ? '周复盘' : '目标达成'}
                      </span>
                      <span className="text-sm text-slate-500">{reflection.createdAt}</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">{reflection.title}</h4>
                    <p className="text-sm text-slate-400 line-clamp-2">{reflection.content}</p>
                    
                    {/* 洞察标签 */}
                    {reflection.insights.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Sparkles size={12} className="text-amber-400" />
                        {reflection.insights.map((insight, i) => (
                          <span key={i} className="text-xs text-amber-400/80">
                            {insight}
                            {i < reflection.insights.length - 1 && ' · '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={18} className="text-slate-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 高频技能 */}
        <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Brain size={20} />
            高频使用技能
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            {mockStats.topSkills.map((skill) => (
              <div
                key={skill.name}
                className="px-4 py-2 bg-slate-800 rounded-lg flex items-center gap-2"
              >
                <span className="text-white">{skill.name}</span>
                <span className="text-xs text-slate-500">×{skill.usageCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
