'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Bot, MessageCircle, Lightbulb, Heart, CheckCircle2 } from 'lucide-react';

export const DigitalAvatarSection = () => {
  const { t } = useLanguage();

  return (
    <section id="avatar" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Avatar Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative w-full max-w-md mx-auto">
              {/* Glowing Ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full blur-2xl opacity-20 animate-pulse" />
              
              {/* Avatar Container */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
                {/* Avatar Head */}
                <div className="flex justify-center mb-6">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(34, 211, 238, 0.3)',
                        '0 0 40px rgba(34, 211, 238, 0.5)',
                        '0 0 20px rgba(34, 211, 238, 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center"
                  >
                    <Bot className="w-16 h-16 text-white" />
                  </motion.div>
                </div>

                {/* Chat Bubbles */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="bg-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300">
                      {t.avatar?.greeting || '你好！我是你的智伴，随时准备帮助你规划人生目标。'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-3 justify-end"
                  >
                    <div className="bg-cyan-500/20 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-cyan-100">
                      {t.avatar?.userMessage || '帮我制定一个健康计划吧'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="bg-slate-700/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs">{t.avatar?.analyzing || '正在分析你的记忆...'}</span>
                      </div>
                      {t.avatar?.response || '根据你之前的记录，我发现你喜欢晨跑但最近中断了。让我们从每周3次开始...'}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col"
          >
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20">
              <Bot className="w-8 h-8 text-cyan-400" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-2">
              {t.avatar?.title || '你的专属智伴'}
            </h3>
            <p className="text-cyan-400 font-mono mb-6 text-sm uppercase tracking-widest">
              {t.avatar?.subtitle || 'Digital Avatar'}
            </p>
            
            <p className="text-slate-400 mb-8 text-lg leading-relaxed">
              {t.avatar?.desc || '智伴是你的数字分身，它了解你的过去、理解你的现在、助力你的未来。基于你的记忆和目标，提供个性化的智能陪伴与建议。'}
            </p>

            <ul className="space-y-4">
              {(t.avatar?.points || [
                '深度记忆：基于你的智忆库，真正了解你的经历、能力和偏好',
                '智能对话：自然语言交互，像朋友一样理解你的需求',
                '主动关怀：在关键时刻主动提醒、鼓励和建议',
                '持续成长：随着你的记忆积累，智伴越来越懂你'
              ]).map((point: string, i: number) => (
                <motion.li 
                  key={i} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CheckCircle2 className="w-6 h-6 text-cyan-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{point}</span>
                </motion.li>
              ))}
            </ul>

            {/* Feature Icons */}
            <div className="flex gap-6 mt-8 pt-8 border-t border-slate-800">
              <div className="flex items-center gap-2 text-slate-400">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">{t.avatar?.feature1 || '自然对话'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">{t.avatar?.feature2 || '智能建议'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="text-sm">{t.avatar?.feature3 || '情感陪伴'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

