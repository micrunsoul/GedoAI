'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Settings, RefreshCw, User, TreeDeciduous } from 'lucide-react';
import { 
  DigitalAvatar, 
  ChatInterface, 
  AvatarState, 
  ChatMessage, 
  QuickAction,
  AvatarMood,
} from '@/app/components/digital-avatar';
import { LifeTreeView, LifeTreeData, SkillNode, GoalFlower, TaskLeaf } from '@/app/components/life-tree';
import { useAuth } from '@/app/contexts/AuthContext';

type ViewMode = 'avatar' | 'tree';

export default function AvatarPage() {
  const { api } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarState>(getInitialAvatarState());
  const [treeData, setTreeData] = useState<LifeTreeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('avatar');

  // 初始化欢迎消息
  useEffect(() => {
    const welcomeMessage = generateWelcomeMessage(avatarState);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  // 加载用户数据
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // 加载今日任务
      const todayData = await api.getTodayTasks?.() || { tasks: [] };
      const tasks = todayData.tasks || [];
      const completed = tasks.filter((t: { status: string }) => t.status === 'done').length;
      
      // 加载目标
      const goalsData = await api.listGoals?.() || { items: [] };
      const goals = goalsData.items || [];
      
      // 更新头像状态
      setAvatarState(prev => ({
        ...prev,
        todayCompleted: completed,
        todayTotal: tasks.length,
        mood: getMoodFromProgress(completed, tasks.length),
      }));

      // 加载生命之树数据
      await loadTreeData();
    } catch (error) {
      console.error('Failed to load user data:', error);
      // 使用演示数据
      setTreeData(getDemoTreeData());
    }
  };

  // 加载生命之树数据
  const loadTreeData = async () => {
    try {
      const snapshot = await api.treeSnapshot();
      
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
        lifeWheel: avatarState.lifeWheel,
      };
      
      setTreeData(formattedData);
    } catch (error) {
      console.error('Failed to load tree data:', error);
      setTreeData(getDemoTreeData());
    }
  };

  // 映射状态
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

  // 发送消息
  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await api.chat?.({
        message: content,
        context: {
          todayCompleted: avatarState.todayCompleted,
          todayTotal: avatarState.todayTotal,
          streakDays: avatarState.streakDays,
        }
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response?.reply || generateLocalResponse(content, avatarState),
        timestamp: new Date().toISOString(),
        quickActions: response?.quickActions,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response?.mood) {
        setAvatarState(prev => ({ ...prev, mood: response.mood }));
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateLocalResponse(content, avatarState),
        timestamp: new Date().toISOString(),
        quickActions: detectQuickActions(content),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [api, avatarState]);

  // 处理快捷操作
  const handleQuickAction = useCallback(async (action: QuickAction) => {
    switch (action.type) {
      case 'memory':
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '想记录什么呢？可以是今天的经历、学到的东西、或者重要的想法 📝',
          timestamp: new Date().toISOString(),
        }]);
        break;
      case 'goal':
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '想设定一个新目标？告诉我你想达成什么，我来帮你拆解成可执行的计划 🎯',
          timestamp: new Date().toISOString(),
        }]);
        break;
      case 'checkin':
        const tasks = await api.getTodayTasks?.() || { tasks: [] };
        const pendingTasks = (tasks.tasks || [])
          .filter((t: { status: string }) => t.status === 'pending' || t.status === 'in_progress');
        
        if (pendingTasks.length > 0) {
          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: `你今天还有 ${pendingTasks.length} 个任务待完成：\n${pendingTasks.map((t: { title: string }) => `• ${t.title}`).join('\n')}\n\n完成了哪个？告诉我任务名称即可打卡 ✅`,
            timestamp: new Date().toISOString(),
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: '太棒了！今天的任务都完成了 🎉 要设定明天的计划吗？',
            timestamp: new Date().toISOString(),
          }]);
        }
        break;
      case 'confirm':
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `📊 最近一周的洞察：\n\n• 任务完成率：${Math.round(avatarState.todayCompleted / Math.max(avatarState.todayTotal, 1) * 100)}%\n• 连续打卡：${avatarState.streakDays} 天\n• 能量状态：${avatarState.energy}%\n\n继续保持！有什么想调整的吗？`,
          timestamp: new Date().toISOString(),
        }]);
        break;
    }
  }, [api, avatarState]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* 顶部操作栏 */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <motion.h1 
            className="text-xl font-bold text-white flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-2xl">🤖</span>
            智伴
          </motion.h1>
          <div className="flex items-center gap-2">
            <button
              onClick={loadUserData}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="刷新数据"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link
              href="/app/settings"
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {/* 左侧：视图区域（数字人/生命之树切换） */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* 视图切换标签 */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setViewMode('avatar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'avatar'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <User className="w-4 h-4" />
                数字人
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  viewMode === 'tree'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <TreeDeciduous className="w-4 h-4" />
                生命之树
              </button>
            </div>

            {/* 视图内容 */}
            <div className="flex-1 relative overflow-hidden rounded-2xl border border-slate-800/50">
              <AnimatePresence mode="wait">
                {viewMode === 'avatar' ? (
                  <motion.div
                    key="avatar"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center h-full py-6"
                  >
                    <DigitalAvatar
                      state={avatarState}
                      size="lg"
                      showDimensions={true}
                      showAchievements={true}
                      isAnimated={true}
                    />
                    
                    {/* 快捷信息卡片 */}
                    <motion.div
                      className="mt-4 grid grid-cols-3 gap-3 w-full max-w-sm px-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Link
                        href="/app/memory"
                        className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-center transition-colors group"
                      >
                        <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🧠</span>
                        <span className="text-xs text-slate-400">智忆</span>
                      </Link>
                      <Link
                        href="/app/goals"
                        className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-center transition-colors group"
                      >
                        <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🎯</span>
                        <span className="text-xs text-slate-400">智引</span>
                      </Link>
                      <Link
                        href="/app/today"
                        className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-center transition-colors group"
                      >
                        <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">✅</span>
                        <span className="text-xs text-slate-400">今日</span>
                      </Link>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="tree"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                    style={{ minHeight: '500px' }}
                  >
                    {treeData ? (
                      <LifeTreeView
                        data={treeData}
                        onTaskClick={(task) => {
                          setMessages(prev => [...prev, {
                            id: `system-${Date.now()}`,
                            role: 'assistant',
                            content: `📋 任务「${task.title}」\n状态：${task.status === 'completed' ? '已完成 ✅' : task.status === 'in_progress' ? '进行中...' : '待开始'}\n\n要打卡这个任务吗？`,
                            timestamp: new Date().toISOString(),
                            quickActions: task.status !== 'completed' ? [
                              { id: 'complete', label: '完成打卡', type: 'confirm' },
                              { id: 'skip', label: '跳过', type: 'cancel' },
                            ] : undefined,
                          }]);
                        }}
                        onGoalClick={(goal) => {
                          setMessages(prev => [...prev, {
                            id: `system-${Date.now()}`,
                            role: 'assistant',
                            content: `🎯 目标「${goal.title}」\n进度：${goal.progress}%\n状态：${goal.status === 'completed' ? '已完成 🎉' : goal.status === 'active' ? '进行中' : '暂停'}\n\n${goal.status === 'active' ? '继续加油！有什么需要调整的吗？' : ''}`,
                            timestamp: new Date().toISOString(),
                          }]);
                        }}
                        onSkillClick={(skill) => {
                          setMessages(prev => [...prev, {
                            id: `system-${Date.now()}`,
                            role: 'assistant',
                            content: `💪 能力「${skill.name}」\n置信度：${Math.round(skill.proficiencyLevel * 100)}%\n智忆证据：${skill.evidenceCount} 条\n\n这个能力可以关联到你的目标，让规划更精准。`,
                            timestamp: new Date().toISOString(),
                          }]);
                        }}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-slate-400">
                          <div className="text-4xl mb-4">🌱</div>
                          <p>正在加载生命之树...</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* 右侧：对话区域 */}
          <motion.div
            className="flex flex-col"
            style={{ minHeight: '500px', maxHeight: 'calc(100vh - 140px)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onQuickAction={handleQuickAction}
              isLoading={isLoading}
              placeholder="和智伴聊聊..."
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// 获取初始头像状态
function getInitialAvatarState(): AvatarState {
  return {
    nickname: '智伴',
    level: 2,
    experience: 350,
    experienceToNext: 500,
    mood: 'happy',
    energy: 75,
    lifeTheme: '持续成长，创造价值',
    coreValues: ['自律', '学习', '创造'],
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
    todayCompleted: 2,
    todayTotal: 5,
    streakDays: 7,
    achievements: [
      { id: '1', title: '初次相遇', icon: '🌟', earnedAt: new Date().toISOString(), category: 'milestone' },
      { id: '2', title: '连续7天', icon: '🔥', earnedAt: new Date().toISOString(), category: 'streak' },
      { id: '3', title: '完成首个目标', icon: '🏆', earnedAt: new Date().toISOString(), category: 'goal' },
    ],
  };
}

// 演示树数据
function getDemoTreeData(): LifeTreeData {
  return {
    lifeTheme: {
      id: 'theme-1',
      title: '持续成长，创造价值',
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

// 根据进度生成情绪
function getMoodFromProgress(completed: number, total: number): AvatarMood {
  if (total === 0) return 'neutral';
  const ratio = completed / total;
  if (ratio >= 1) return 'excited';
  if (ratio >= 0.6) return 'happy';
  if (ratio >= 0.3) return 'encouraging';
  return 'neutral';
}

// 生成欢迎消息
function generateWelcomeMessage(state: AvatarState): string {
  const hour = new Date().getHours();
  let greeting = '嗨';
  
  if (hour < 6) greeting = '夜深了';
  else if (hour < 12) greeting = '早上好';
  else if (hour < 14) greeting = '中午好';
  else if (hour < 18) greeting = '下午好';
  else greeting = '晚上好';

  const progress = state.todayTotal > 0 
    ? `今天完成了 ${state.todayCompleted}/${state.todayTotal} 个任务`
    : '今天还没有安排任务';

  const streak = state.streakDays > 0 
    ? `，已经连续打卡 ${state.streakDays} 天了 🔥`
    : '';

  return `${greeting}！我是智伴，你的 AI 成长伙伴 ✨\n\n${progress}${streak}\n\n有什么我能帮你的吗？你可以：\n• 记录想法和经历\n• 设定新目标\n• 打卡今日任务\n• 查看成长洞察\n\n💡 点击左侧「生命之树」可以查看你的能力全景`;
}

// 本地响应生成
function generateLocalResponse(content: string, state: AvatarState): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('记住') || lowerContent.includes('记录') || lowerContent.includes('学会') || lowerContent.includes('学到')) {
    return `好的，我帮你记下了 📝\n\n「${content}」\n\n要给它打个标签吗？比如：工作经验、生活感悟、学习笔记...`;
  }
  
  if (lowerContent.includes('目标') || lowerContent.includes('计划') || lowerContent.includes('想要') || lowerContent.includes('打算')) {
    return `听起来是个不错的想法！🎯\n\n让我帮你把它变成可执行的计划：\n1. 首先，这个目标的截止时间是？\n2. 你觉得最大的挑战是什么？\n3. 第一步可以做什么？`;
  }
  
  if (lowerContent.includes('完成') || lowerContent.includes('做完') || lowerContent.includes('搞定')) {
    return `太棒了！✅ 又完成一项任务！\n\n今日进度：${state.todayCompleted + 1}/${state.todayTotal}\n\n感觉怎么样？[精力充沛] [一般] [有点累]`;
  }
  
  if (lowerContent.includes('累') || lowerContent.includes('烦') || lowerContent.includes('压力')) {
    return `我理解你的感受 💙\n\n有时候放慢脚步也是一种进步。要不要：\n• 看看今天的任务，调整一下优先级？\n• 先做一件简单的事，找回节奏？\n• 或者就聊聊，我在这里陪你`;
  }
  
  if (lowerContent.includes('你好') || lowerContent.includes('嗨') || lowerContent.includes('hi')) {
    return `嗨！很高兴见到你 😊\n\n今天想做点什么？我可以帮你记录想法、规划目标、或者只是聊聊天~`;
  }

  if (lowerContent.includes('生命之树') || lowerContent.includes('树') || lowerContent.includes('能力')) {
    return `点击左侧的「生命之树」标签，可以看到你的：\n\n🌳 树干 = 人生主题\n🌿 根系 = 能力（由智忆证据支撑）\n🍃 枝叶 = 今日行动\n🌸 花果 = 目标\n\n点击树上的节点，我会告诉你更多信息~`;
  }
  
  return `收到！${content.length > 20 ? '这是个有意思的话题' : ''}~\n\n我可以帮你把这个想法记录下来，或者继续聊聊。你觉得呢？`;
}

// 检测快捷操作
function detectQuickActions(content: string): QuickAction[] | undefined {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('记住') || lowerContent.includes('记录')) {
    return [
      { id: 'save', label: '保存到智忆', type: 'confirm' },
      { id: 'skip', label: '暂不保存', type: 'cancel' },
    ];
  }
  
  if (lowerContent.includes('目标') || lowerContent.includes('计划')) {
    return [
      { id: 'create', label: '创建目标', type: 'confirm' },
      { id: 'later', label: '稍后再说', type: 'cancel' },
    ];
  }
  
  return undefined;
}
