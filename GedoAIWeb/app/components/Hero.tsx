'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export const Hero = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setJoined(true);
      // In a real app, this would send to an API
      console.log('Joined waitlist:', email);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-900/20 rounded-full blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      <div className="container mx-auto px-6 z-10 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8">
            <Sparkles size={14} />
            <span>{t.hero.subSlogan}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <span className="block text-white text-glow">{t.hero.slogan.split('，')[0]}</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-white">
               {t.hero.slogan.split('，').slice(1).join('，') || t.hero.slogan.split(':').slice(1).join(' ')}
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.hero.description}
          </p>

          {/* Waitlist Form */}
          <div id="waitlist" className="max-w-md mx-auto">
            {!joined ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder={t.hero.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-slate-900/50 border border-slate-700 rounded-full px-6 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 group"
                >
                  {t.hero.join}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-full font-medium"
              >
                {t.hero.joined}
              </motion.div>
            )}
            <p className="text-slate-500 text-sm mt-4">
              {t.hero.cta}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};





