'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, XCircle, Clock, Smile, Meh, Frown } from 'lucide-react';
import { Task, ReasonCode, REASON_LABELS } from './types';

interface CheckInModalProps {
  task: Task;
  onSubmit: (status: 'completed' | 'not_completed' | 'partial', data?: {
    reasonCode?: ReasonCode;
    reasonNote?: string;
    actualDuration?: number;
    moodRating?: 1 | 2 | 3 | 4 | 5;
  }) => void;
  onClose: () => void;
}

export const CheckInModal = ({ task, onSubmit, onClose }: CheckInModalProps) => {
  const [step, setStep] = useState<'status' | 'reason' | 'feedback'>('status');
  const [status, setStatus] = useState<'completed' | 'not_completed' | 'partial' | null>(null);
  const [reasonCode, setReasonCode] = useState<ReasonCode | null>(null);
  const [reasonNote, setReasonNote] = useState('');
  const [actualDuration, setActualDuration] = useState(task.estimatedDuration || 30);
  const [moodRating, setMoodRating] = useState<1 | 2 | 3 | 4 | 5>(3);

  const handleStatusSelect = (s: 'completed' | 'not_completed' | 'partial') => {
    setStatus(s);
    if (s === 'completed') {
      setStep('feedback');
    } else {
      setStep('reason');
    }
  };

  const handleSubmit = () => {
    if (!status) return;
    
    onSubmit(status, {
      reasonCode: reasonCode || undefined,
      reasonNote: reasonNote || undefined,
      actualDuration,
      moodRating,
    });
  };

  const moodEmojis = [
    { value: 1 as const, icon: Frown, label: '很差', color: '#ef4444' },
    { value: 2 as const, icon: Frown, label: '较差', color: '#f97316' },
    { value: 3 as const, icon: Meh, label: '一般', color: '#eab308' },
    { value: 4 as const, icon: Smile, label: '不错', color: '#84cc16' },
    { value: 5 as const, icon: Smile, label: '很好', color: '#22c55e' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full overflow-hidden"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="font-medium text-white">任务打卡</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* 任务信息 */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/30">
          <h4 className="text-white font-medium">{task.title}</h4>
          {task.estimatedDuration && (
            <p className="text-sm text-slate-400 mt-1">
              预计时长: {task.estimatedDuration} 分钟
            </p>
          )}
        </div>

        <div className="p-6">
          {/* 步骤 1: 选择状态 */}
          {step === 'status' && (
            <div className="space-y-3">
              <p className="text-slate-400 mb-4">这个任务完成得怎么样？</p>
              
              <button
                onClick={() => handleStatusSelect('completed')}
                className="w-full p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 hover:bg-green-500/20 transition-colors"
              >
                <CheckCircle size={24} className="text-green-400" />
                <div className="text-left">
                  <div className="text-white font-medium">完成了</div>
                  <div className="text-sm text-slate-400">任务已全部完成</div>
                </div>
              </button>

              <button
                onClick={() => handleStatusSelect('partial')}
                className="w-full p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3 hover:bg-yellow-500/20 transition-colors"
              >
                <Clock size={24} className="text-yellow-400" />
                <div className="text-left">
                  <div className="text-white font-medium">部分完成</div>
                  <div className="text-sm text-slate-400">完成了一部分</div>
                </div>
              </button>

              <button
                onClick={() => handleStatusSelect('not_completed')}
                className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 hover:bg-red-500/20 transition-colors"
              >
                <XCircle size={24} className="text-red-400" />
                <div className="text-left">
                  <div className="text-white font-medium">没完成</div>
                  <div className="text-sm text-slate-400">今天没能完成</div>
                </div>
              </button>
            </div>
          )}

          {/* 步骤 2: 选择原因 */}
          {step === 'reason' && (
            <div className="space-y-4">
              <p className="text-slate-400">是什么原因呢？</p>
              
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(REASON_LABELS) as [ReasonCode, { label: string; icon: string }][]).map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => setReasonCode(code)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      reasonCode === code
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-lg mr-2">{info.icon}</span>
                    <span className="text-sm text-white">{info.label}</span>
                  </button>
                ))}
              </div>

              {reasonCode === 'other' && (
                <textarea
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  placeholder="具体是什么原因？"
                  className="w-full h-20 bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500"
                />
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setStep('status')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={() => setStep('feedback')}
                  disabled={!reasonCode}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl transition-colors"
                >
                  下一步
                </button>
              </div>
            </div>
          )}

          {/* 步骤 3: 反馈 */}
          {step === 'feedback' && (
            <div className="space-y-6">
              {/* 实际时长 */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">实际花费时间</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={180}
                    step={5}
                    value={actualDuration}
                    onChange={(e) => setActualDuration(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <span className="text-white font-medium w-20 text-right">
                    {actualDuration} 分钟
                  </span>
                </div>
              </div>

              {/* 心情评分 */}
              <div>
                <label className="text-sm text-slate-400 mb-3 block">完成这个任务后的感受</label>
                <div className="flex items-center justify-between">
                  {moodEmojis.map(({ value, icon: Icon, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setMoodRating(value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                        moodRating === value ? 'bg-slate-800' : 'hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon
                        size={28}
                        style={{ color: moodRating === value ? color : '#64748b' }}
                      />
                      <span className={`text-xs ${moodRating === value ? 'text-white' : 'text-slate-500'}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => setStep(status === 'completed' ? 'status' : 'reason')}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium transition-colors"
                >
                  完成打卡
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};






