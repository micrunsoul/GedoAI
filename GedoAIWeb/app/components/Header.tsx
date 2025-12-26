'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Languages, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const pathname = usePathname();
  const isApp = pathname?.startsWith('/app');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const navLinks = isApp
    ? [
        { name: '生命之树', href: '/app/tree' },
        { name: '智忆库', href: '/app/memory' },
        { name: '目标', href: '/app/goals' },
        { name: '今日', href: '/app/today' },
      ]
    : [
        { name: t.nav.concept, href: '#concept' },
        { name: t.nav.features, href: '#features' },
      ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800 py-4' : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform rotate-3">
            <span className="text-white font-mono text-lg">G</span>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            GEDO.AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={toggleLanguage}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
          >
            <Languages size={16} />
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          {isApp ? (
            <Link
              href="/"
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all"
            >
              返回官网
            </Link>
          ) : (
            <Link
              href="/app"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            >
              进入应用
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden absolute top-full left-0 right-0 bg-slate-950 border-b border-slate-800 p-6 flex flex-col gap-4 shadow-2xl"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white text-lg font-medium"
            >
              {link.name}
            </Link>
          ))}
          <button
            onClick={() => {
              toggleLanguage();
              setMobileMenuOpen(false);
            }}
            className="text-slate-300 hover:text-white flex items-center gap-2 text-lg font-medium"
          >
            <Languages size={20} />
            {language === 'zh' ? 'Switch to English' : '切换至中文'}
          </button>
          {isApp ? (
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-slate-800 text-white text-center py-3 rounded-lg font-semibold"
            >
              返回官网
            </Link>
          ) : (
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-blue-600 text-white text-center py-3 rounded-lg font-semibold"
            >
              进入应用
            </Link>
          )}
        </motion.div>
      )}
    </header>
  );
};

