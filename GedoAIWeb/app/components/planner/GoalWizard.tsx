'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  Calendar,
  Loader2,
  Check,
  Lightbulb,
  Brain,
} from 'lucide-react';
import { 
  Goal, 
  ClarifyQuestion, 
  ClarifySession,
  LEVEL_LABELS,
  DIMENSION_LABELS,
  DIMENSION_COLORS,
} from './types';
import { LifeWheelDimension } from '../life-tree/types';

interface GoalWizardProps {
  onComplete: (goal: Partial<Goal>, tasks: Array<{ title: string; scheduledDate?: string }>) => void;
  onCancel: () => void;
  relatedMemories?: Array<{ id: string; content: string; relevance: string }>;
}

// 模拟 AI 生成的澄清问题
const generateClarifyQuestions = (prompt: string): ClarifyQuestion[] => {
  const questions: ClarifyQuestion[] = [
    {
      id: 'dimension',
      question: '这个目标属于人生的哪个维度？',
      options: Object.entries(DIMENSION_LABELS).map(([id, label]) => ({ id, label })),
      type: 'select',
      field: 'lifeWheelDimension',
    },
    {
      id: 'timeframe',
      question: '你希望在什么时间范围内实现这个目标？',
      options: [
        { id: '1month', label: '1个月内' },
        { id: '3months', label: '3个月内' },
        { id: '6months', label: '半年内' },
        { id: '1year', label: '1年内' },
        { id: '3years', label: '3年内' },
      ],
      type: 'select',
      field: 'timeframe',
    },
    {
      id: 'measurable',
      question: '如何衡量这个目标是否达成？请描述具体的指标或标准。',
      type: 'text',
      field: 'measurable',
    },
    {
      id: 'constraints',
      question: '每天/每周你能投入多少时间来实现这个目标？',
      options: [
        { id: '30min', label: '每天30分钟' },
        { id: '1hour', label: '每天1小时' },
        { id: '2hours', label: '每天2小时' },
        { id: '3hours', label: '每天3小时以上' },
        { id: 'weekend', label: '主要在周末' },
      ],
      type: 'select',
      field: 'timeInvestment',
    },
  ];

  // 根据提示词动态调整问题
  if (prompt.includes('涨薪') || prompt.includes('升职') || prompt.includes('工作')) {
    questions.splice(2, 0, {
      id: 'current_status',
      question: '目前你的职位和薪资情况是怎样的？',
      type: 'text',
      field: 'currentStatus',
    });
  }

  if (prompt.includes('考试') || prompt.includes('证书') || prompt.includes('学习')) {
    questions.splice(2, 0, {
      id: 'background',
      question: '你目前的相关基础如何？',
      options: [
        { id: 'none', label: '零基础' },
        { id: 'basic', label: '有一些了解' },
        { id: 'intermediate', label: '有一定基础' },
        { id: 'advanced', label: '基础较好' },
      ],
      type: 'select',
      field: 'background',
    });
  }

  return questions;
};

export const GoalWizard = ({ onComplete, onCancel, relatedMemories = [] }: GoalWizardProps) => {
  const [step, setStep] = useState<'input' | 'clarify' | 'review' | 'tasks'>('input');
  const [goalPrompt, setGoalPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [session, setSession] = useState<ClarifySession | null>(null);
  const [generatedGoal, setGeneratedGoal] = useState<Partial<Goal> | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<Array<{ title: string; scheduledDate?: string }>>([]);
  const [balanceWarning, setBalanceWarning] = useState<string | null>(null);

  const handleStartClarify = async () => {
    if (!goalPrompt.trim()) return;
    
    setIsAnalyzing(true);
    
    // 模拟 AI 分析
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const questions = generateClarifyQuestions(goalPrompt);
    setSession({
      goalPrompt,
      questions,
      answers: {},
      currentStep: 0,
      relatedMemories: relatedMemories.length > 0 ? relatedMemories : [
        { id: 'm1', content: '你曾在2024年5月记录"参与过3次产品需求评审"', relevance: '可作为转型优势' },
      ],
    });
    
    setIsAnalyzing(false);
    setStep('clarify');
  };

  const handleAnswer = (questionId: string, value: string | string[]) => {
    if (!session) return;
    
    setSession({
      ...session,
      answers: { ...session.answers, [questionId]: value },
    });
  };

  const handleNextQuestion = () => {
    if (!session) return;
    
    if (session.currentStep < session.questions.length - 1) {
      setSession({ ...session, currentStep: session.currentStep + 1 });
    } else {
      // 生成目标和任务
      generateGoalAndTasks();
    }
  };

  const handlePrevQuestion = () => {
    if (!session) return;
    
    if (session.currentStep > 0) {
      setSession({ ...session, currentStep: session.currentStep - 1 });
    } else {
      setStep('input');
    }
  };

  const generateGoalAndTasks = async () => {
    if (!session) return;
    
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const dimension = (session.answers.dimension as string) || 'growth';
    
    // 生成目标
    const goal: Partial<Goal> = {
      title: goalPrompt,
      description: `基于你的输入"${goalPrompt}"生成的目标`,
      lifeWheelDimension: dimension as LifeWheelDimension,
      level: 'phase',
      status: 'draft',
      progress: 0,
      specific: goalPrompt,
      measurable: session.answers.measurable as string || '按时完成所有子任务',
      achievable: '基于你的时间投入和现有基础，此目标可实现',
      relevant: `与你的${DIMENSION_LABELS[dimension as LifeWheelDimension]}发展相关`,
      timeBound: session.answers.timeframe as string || '3months',
    };
    
    // 生成任务列表
    const tasks = [
      { title: '制定详细学习/执行计划', scheduledDate: getTodayDate() },
      { title: '收集必要的资源和材料', scheduledDate: getTodayDate(1) },
      { title: '完成第一阶段任务', scheduledDate: getTodayDate(7) },
      { title: '中期检查与调整', scheduledDate: getTodayDate(14) },
      { title: '完成第二阶段任务', scheduledDate: getTodayDate(21) },
      { title: '最终复盘与总结', scheduledDate: getTodayDate(30) },
    ];
    
    setGeneratedGoal(goal);
    setGeneratedTasks(tasks);
    
    // 检查生命之花平衡
    if (dimension === 'career') {
      setBalanceWarning('检测到你近期目标主要集中在"事业"维度，建议同步关注"健康"或"家庭"维度的平衡。');
    }
    
    setIsAnalyzing(false);
    setStep('review');
  };

  const handleComplete = () => {
    if (generatedGoal && generatedTasks.length > 0) {
      onComplete(generatedGoal, generatedTasks);
    }
  };

  const currentQuestion = session?.questions[session.currentStep];
  const currentAnswer = currentQuestion ? session?.answers[currentQuestion.id] : undefined;

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
      {/* 进度指示 */}
      <div className="flex items-center gap-2 p-4 border-b border-slate-800">
        {['input', 'clarify', 'review'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s
                  ? 'bg-blue-600 text-white'
                  : ['input', 'clarify', 'review'].indexOf(step) > i
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {['input', 'clarify', 'review'].indexOf(step) > i ? <Check size={16} /> : i + 1}
            </div>
            {i < 2 && <div className="w-12 h-0.5 bg-slate-700 mx-2" />}
          </div>
        ))}
      </div>

      {/* 步骤 1: 输入目标 */}
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">描述你的目标</h3>
                <p className="text-sm text-slate-400">用自然语言告诉我你想实现什么</p>
              </div>
            </div>

            <textarea
              value={goalPrompt}
              onChange={(e) => setGoalPrompt(e.target.value)}
              placeholder="例如：我想半年内月薪涨30%、今年要通过CPA两门考试、每周健身3次..."
              className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500"
            />

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleStartClarify}
                disabled={!goalPrompt.trim() || isAnalyzing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors"
              >
                {isAnalyzing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Sparkles size={18} />
                )}
                <span>AI 分析</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* 步骤 2: 澄清问题 */}
        {step === 'clarify' && session && currentQuestion && (
          <motion.div
            key="clarify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6"
          >
            {/* 相关记忆提示 */}
            {session.currentStep === 0 && session.relatedMemories && session.relatedMemories.length > 0 && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                  <Lightbulb size={16} />
                  <span>相关记忆提示</span>
                </div>
                {session.relatedMemories.map(m => (
                  <div key={m.id} className="text-sm text-slate-300">
                    {m.content}
                    <span className="text-amber-400 ml-2">— {m.relevance}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 问题 */}
            <div className="mb-6">
              <div className="text-sm text-slate-400 mb-2">
                问题 {session.currentStep + 1} / {session.questions.length}
              </div>
              <h3 className="text-xl font-medium text-white">{currentQuestion.question}</h3>
            </div>

            {/* 答案输入 */}
            {currentQuestion.type === 'text' && (
              <textarea
                value={(currentAnswer as string) || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="请输入..."
                className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500"
              />
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(currentQuestion.id, opt.id)}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      currentAnswer === opt.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {currentQuestion.field === 'lifeWheelDimension' && (
                      <div
                        className="w-3 h-3 rounded-full mb-2"
                        style={{ backgroundColor: DIMENSION_COLORS[opt.id as LifeWheelDimension] }}
                      />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {/* 导航按钮 */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevQuestion}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
                <span>上一步</span>
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={!currentAnswer}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-full font-medium transition-colors"
              >
                {isAnalyzing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : session.currentStep === session.questions.length - 1 ? (
                  <>
                    <span>生成计划</span>
                    <Sparkles size={18} />
                  </>
                ) : (
                  <>
                    <span>下一步</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* 步骤 3: 审核确认 */}
        {step === 'review' && generatedGoal && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6"
          >
            {/* 生命之花平衡提示 */}
            {balanceWarning && (
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
                  <Brain size={16} />
                  <span>生命之花平衡建议</span>
                </div>
                <p className="text-sm text-slate-300">{balanceWarning}</p>
              </div>
            )}

            {/* 目标卡片 */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: DIMENSION_COLORS[generatedGoal.lifeWheelDimension!] + '20' 
                  }}
                >
                  <Target 
                    size={24} 
                    style={{ color: DIMENSION_COLORS[generatedGoal.lifeWheelDimension!] }} 
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{generatedGoal.title}</h3>
                  <span
                    className="text-sm px-2 py-0.5 rounded"
                    style={{ 
                      backgroundColor: DIMENSION_COLORS[generatedGoal.lifeWheelDimension!] + '20',
                      color: DIMENSION_COLORS[generatedGoal.lifeWheelDimension!],
                    }}
                  >
                    {DIMENSION_LABELS[generatedGoal.lifeWheelDimension!]}
                  </span>
                </div>
              </div>

              {/* SMART 分析 */}
              <div className="mt-6 space-y-3">
                <div className="text-sm">
                  <span className="text-slate-400">具体(S)：</span>
                  <span className="text-white ml-2">{generatedGoal.specific}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">可衡量(M)：</span>
                  <span className="text-white ml-2">{generatedGoal.measurable}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">可实现(A)：</span>
                  <span className="text-white ml-2">{generatedGoal.achievable}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">相关性(R)：</span>
                  <span className="text-white ml-2">{generatedGoal.relevant}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">时限(T)：</span>
                  <span className="text-white ml-2">{generatedGoal.timeBound}</span>
                </div>
              </div>
            </div>

            {/* 生成的任务列表 */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-slate-400 mb-3">
                <Calendar size={14} className="inline mr-1" />
                建议的行动计划
              </h4>
              <div className="space-y-2">
                {generatedTasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                      {i + 1}
                    </div>
                    <span className="text-white flex-1">{task.title}</span>
                    {task.scheduledDate && (
                      <span className="text-sm text-slate-500">{task.scheduledDate}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('clarify')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
                <span>返回修改</span>
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full font-medium transition-colors"
              >
                <Check size={18} />
                <span>确认创建</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 辅助函数
function getTodayDate(daysOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}






