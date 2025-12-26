'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Brain, Target, Zap, RefreshCw } from 'lucide-react';

export const Concept = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      title: t.concept.flow.memory,
      color: 'border-purple-500/30 bg-purple-500/10',
    },
    {
      icon: <Target className="w-8 h-8 text-blue-400" />,
      title: t.concept.flow.planning,
      color: 'border-blue-500/30 bg-blue-500/10',
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: t.concept.flow.action,
      color: 'border-yellow-500/30 bg-yellow-500/10',
    },
    {
      icon: <RefreshCw className="w-8 h-8 text-green-400" />,
      title: t.concept.flow.feedback,
      color: 'border-green-500/30 bg-green-500/10',
    },
  ];

  return (
    <section id="concept" className="py-24 bg-slate-950 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            {t.concept.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg"
          >
            {t.concept.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent -translate-y-1/2 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative z-10 flex flex-col items-center justify-center p-8 rounded-2xl border ${step.color} backdrop-blur-sm hover:scale-105 transition-transform duration-300`}
            >
              <div className="mb-4 p-4 rounded-full bg-slate-950 border border-slate-800 shadow-lg">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
            </motion.div>
          ))}
        </div>
        
        <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-slate-500 mt-12 max-w-2xl mx-auto"
        >
            {t.concept.description}
        </motion.p>
      </div>
    </section>
  );
};





