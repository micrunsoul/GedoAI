'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Github, Code2, Server, Terminal, Star, GitFork, ExternalLink } from 'lucide-react';

export const OpenSourceSection = () => {
  const { t } = useLanguage();

  const techStack = [
    { name: 'Next.js 16', icon: '⚛️' },
    { name: 'Hono.js', icon: '🔥' },
    { name: 'PostgreSQL', icon: '🐘' },
    { name: 'pgvector', icon: '🔮' },
    { name: 'Ollama', icon: '🦙' },
    { name: 'MCP', icon: '🔌' },
  ];

  return (
    <section id="opensource" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-slate-950/50" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6">
            <Code2 size={16} />
            <span>{t.opensource?.badge || '开源免费'}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t.opensource?.title || '完全开源，自由部署'}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t.opensource?.desc || 'GEDO.AI 采用 MIT 协议开源，你可以免费下载、自行部署，完全掌控自己的数据和隐私。'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: GitHub Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <a 
              href="https://github.com/micrunsoul/GedoAI/"
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                
                <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 group-hover:border-green-500/50 transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                        <Github className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                          micrunsoul/GedoAI
                        </h3>
                        <p className="text-slate-400 text-sm">MIT License</p>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-green-400 transition-colors" />
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 mb-6">
                    {t.opensource?.repoDesc || 'GEDO.AI（智动）- 记忆+规划双驱效率助手，从记忆到行动的全链路智能系统'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Star className="w-4 h-4" />
                      <span className="text-sm">{t.opensource?.star || 'Star'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <GitFork className="w-4 h-4" />
                      <span className="text-sm">{t.opensource?.fork || 'Fork'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Code2 className="w-4 h-4" />
                      <span className="text-sm">TypeScript</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all duration-300">
                    <Github className="w-5 h-5" />
                    <span>{t.opensource?.viewCode || '查看源代码'}</span>
                  </div>
                </div>
              </div>
            </a>
          </motion.div>

          {/* Right: Features & Tech Stack */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Self-host Benefits */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                {t.opensource?.benefitsTitle || '自托管优势'}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <Server className="w-6 h-6 text-green-400 mb-2" />
                  <h4 className="font-semibold text-white mb-1">{t.opensource?.benefit1Title || '数据自主'}</h4>
                  <p className="text-slate-400 text-sm">{t.opensource?.benefit1Desc || '所有数据存储在你自己的服务器'}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <Terminal className="w-6 h-6 text-cyan-400 mb-2" />
                  <h4 className="font-semibold text-white mb-1">{t.opensource?.benefit2Title || '完全免费'}</h4>
                  <p className="text-slate-400 text-sm">{t.opensource?.benefit2Desc || 'MIT协议，永久免费使用'}</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                {t.opensource?.techTitle || '技术栈'}
              </h3>
              <div className="flex flex-wrap gap-3">
                {techStack.map((tech, i) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50 hover:border-green-500/30 transition-colors"
                  >
                    <span>{tech.icon}</span>
                    <span className="text-sm text-slate-300">{tech.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
              <p className="text-slate-400 text-sm font-mono mb-2"># {t.opensource?.quickStart || '快速开始'}</p>
              <code className="text-green-400 text-sm font-mono">
                git clone https://github.com/micrunsoul/GedoAI.git
              </code>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

