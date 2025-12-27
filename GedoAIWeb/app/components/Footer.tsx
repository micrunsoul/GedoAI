'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-black border-t border-slate-900 py-12">
      <div className="container mx-auto px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          {/* Logo & Slogan */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform rotate-3">
                <span className="text-white font-mono text-lg">G</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                GEDO.AI
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              智绘蓝图，动达目标
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <a 
              href="#concept" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              产品理念
            </a>
            <a 
              href="#features" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              核心功能
            </a>
            <a 
              href="#avatar" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              智伴
            </a>
            <a 
              href="#opensource" 
              className="text-slate-400 hover:text-white transition-colors"
            >
              开源
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/micrunsoul/GedoAI/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-full text-sm border border-slate-800 hover:border-slate-700"
            >
              <Github size={18} />
              <span>{t.footer.github}</span>
            </a>
            <a 
              href="https://twitter.com/gedoai" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-900 rounded-full"
            >
              <Twitter size={20} />
            </a>
            <a 
              href="mailto:contact@gedo.ai" 
              className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-900 rounded-full"
            >
              <Mail size={20} />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-900 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-500 text-sm">
              {t.footer.copyright}
            </div>
            
            <div className="flex items-center gap-1 text-slate-500 text-sm">
              <span>Made with</span>
              <Heart size={14} className="text-red-500 fill-red-500" />
              <span>by micrunsoul</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
