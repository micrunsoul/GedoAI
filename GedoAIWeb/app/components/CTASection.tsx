'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Smartphone, Globe, ArrowRight, Sparkles, Clock, Gift, Apple, Check } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export const CTASection = () => {
  const { t } = useLanguage();
  const [iosEmail, setIosEmail] = useState('');
  const [iosSubmitted, setIosSubmitted] = useState(false);

  const handleIosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (iosEmail) {
      setIosSubmitted(true);
      // In a real app, this would send to an API
      console.log('iOS waitlist:', iosEmail);
    }
  };

  return (
    <section id="cta" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-6">
            <Gift size={16} />
            <span>{t.cta?.badge || '限时免费体验'}</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {t.cta?.title || '立即开始你的智能成长之旅'}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t.cta?.desc || '选择适合你的方式，开始使用 GEDO.AI'}
          </p>
        </motion.div>

        {/* Two Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Online Web App */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            
            <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-700 h-full flex flex-col">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <Globe className="w-8 h-8 text-white" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs mb-4 w-fit">
                <Sparkles size={12} />
                <span>{t.cta?.webBadge || '即刻可用'}</span>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {t.cta?.webTitle || '在线版 Web 应用'}
              </h3>
              <p className="text-slate-400 mb-6 flex-grow">
                {t.cta?.webDesc || '无需下载，打开浏览器即可使用。支持 PC 和移动端，数据云端同步，随时随地管理你的目标和记忆。'}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {(t.cta?.webFeatures || [
                  '跨平台同步',
                  '无需安装',
                  '实时更新'
                ]).map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-blue-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href="/app"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 group/btn"
              >
                <span>{t.cta?.webButton || '立即体验'}</span>
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: iOS App */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            
            <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-700 h-full flex flex-col">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                <Apple className="w-8 h-8 text-white" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs mb-4 w-fit">
                <Clock size={12} />
                <span>{t.cta?.iosBadge || '限时免费内测'}</span>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {t.cta?.iosTitle || 'iOS 原生应用'}
              </h3>
              <p className="text-slate-400 mb-6 flex-grow">
                {t.cta?.iosDesc || '专为 iPhone 和 iPad 优化的原生体验。即将上线 App Store，现在预约即可获得限时免费内测资格。'}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {(t.cta?.iosFeatures || [
                  '原生流畅体验',
                  '离线可用',
                  '系统级集成'
                ]).map((feature: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-orange-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Email Form */}
              {!iosSubmitted ? (
                <form onSubmit={handleIosSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder={t.cta?.iosPlaceholder || '输入邮箱预约内测资格'}
                    value={iosEmail}
                    onChange={(e) => setIosEmail(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>{t.cta?.iosButton || '预约 iOS 内测'}</span>
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-4 rounded-xl font-medium text-center"
                >
                  <Check className="w-6 h-6 mx-auto mb-2" />
                  <p>{t.cta?.iosSuccess || '预约成功！我们会在内测开放时第一时间通知你'}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-500 mt-12 text-sm"
        >
          {t.cta?.note || '💡 内测期间完全免费，正式版将保留免费基础功能'}
        </motion.p>
      </div>
    </section>
  );
};

