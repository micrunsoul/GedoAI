'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Database, Compass, CheckCircle2 } from 'lucide-react';

export const Features = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Feature 1: Memory */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
              <Database className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold mb-2">{t.features.memory.title}</h3>
            <p className="text-purple-400 font-mono mb-6 text-sm uppercase tracking-widest">{t.features.memory.subtitle}</p>
            <p className="text-slate-400 mb-8 text-lg leading-relaxed">
              {t.features.memory.desc}
            </p>
            <ul className="space-y-4">
              {t.features.memory.points.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Visual Representation for Memory (Placeholder for UI) */}
          <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-slate-900 rounded-2xl p-8 border border-slate-800 h-full min-h-[400px] flex flex-col gap-4">
                {/* Mock UI Elements */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-3">
                    <div className="h-12 bg-slate-800/50 rounded-lg w-full animate-pulse" />
                    <div className="h-24 bg-slate-800/30 rounded-lg w-full flex items-center p-4 border-l-4 border-purple-500">
                        <div className="flex-1">
                            <div className="h-4 w-1/3 bg-slate-700 rounded mb-2" />
                            <div className="h-3 w-2/3 bg-slate-700/50 rounded" />
                        </div>
                    </div>
                    <div className="h-24 bg-slate-800/30 rounded-lg w-full flex items-center p-4 border-l-4 border-blue-500 opacity-60">
                         <div className="flex-1">
                            <div className="h-4 w-1/4 bg-slate-700 rounded mb-2" />
                            <div className="h-3 w-1/2 bg-slate-700/50 rounded" />
                        </div>
                    </div>
                </div>
                <div className="mt-auto p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 font-mono">System: Retrieving contextual memory...</p>
                </div>
            </div>
          </motion.div>

          {/* Feature 2: Planning (Reverse Layout on Desktop) */}
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative group lg:order-3"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-slate-900 rounded-2xl p-8 border border-slate-800 h-full min-h-[400px] flex flex-col gap-4">
                 {/* Mock UI Elements */}
                 <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-32 bg-slate-800 rounded" />
                    <div className="h-8 w-8 bg-blue-500/20 rounded-full" />
                </div>
                 <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                         <div className="flex justify-between mb-2">
                             <div className="h-4 w-24 bg-blue-400/40 rounded" />
                             <div className="h-4 w-8 bg-blue-400/20 rounded" />
                         </div>
                         <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full w-3/4 bg-blue-500" />
                         </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 bg-slate-800/30 rounded-lg border border-slate-800" />
                        <div className="h-32 bg-slate-800/30 rounded-lg border border-slate-800" />
                    </div>
                 </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center lg:order-4"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
              <Compass className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold mb-2">{t.features.planning.title}</h3>
            <p className="text-blue-400 font-mono mb-6 text-sm uppercase tracking-widest">{t.features.planning.subtitle}</p>
            <p className="text-slate-400 mb-8 text-lg leading-relaxed">
              {t.features.planning.desc}
            </p>
            <ul className="space-y-4">
              {t.features.planning.points.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300">{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
};





