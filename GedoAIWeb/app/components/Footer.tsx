'use client';

import { useLanguage } from '../contexts/LanguageContext';
import { Github, Twitter, Mail } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-sm">
            {t.footer.copyright}
          </div>
          
          <div className="flex items-center gap-6">
             <a href="#" className="text-slate-500 hover:text-white transition-colors">
               <Twitter size={20} />
             </a>
             <a href="#" className="text-slate-500 hover:text-white transition-colors">
               <Github size={20} />
             </a>
             <a href="mailto:contact@gedo.ai" className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
               <Mail size={20} />
               <span>{t.footer.contact}</span>
             </a>
          </div>
        </div>
      </div>
    </footer>
  );
};





