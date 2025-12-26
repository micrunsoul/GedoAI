'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface Content {
  nav: {
    product: string;
    features: string;
    concept: string;
    waitlist: string;
  };
  hero: {
    slogan: string;
    subSlogan: string;
    description: string;
    cta: string;
    placeholder: string;
    join: string;
    joined: string;
  };
  concept: {
    title: string;
    subtitle: string;
    description: string;
    flow: {
      memory: string;
      planning: string;
      action: string;
      feedback: string;
    };
  };
  features: {
    memory: {
      title: string;
      subtitle: string;
      desc: string;
      points: string[];
    };
    planning: {
      title: string;
      subtitle: string;
      desc: string;
      points: string[];
    };
  };
  footer: {
    copyright: string;
    contact: string;
  };
}

const content: Record<Language, Content> = {
  zh: {
    nav: {
      product: '智动 GEDO',
      features: '核心功能',
      concept: '产品理念',
      waitlist: '加入候补',
    },
    hero: {
      slogan: 'GEDO智动，智绘蓝图，动达目标',
      subSlogan: '记忆+规划 双驱效率助手',
      description: '泛化情景驱动型组织 (Generalized Episodic-Driven Organization)。将零散记忆转化为行动指南，为您打造个人专属的长期记忆与智能规划系统。',
      cta: '立即预约内测',
      placeholder: '请输入您的邮箱地址',
      join: '加入',
      joined: '已加入候补名单！',
    },
    concept: {
      title: '从记忆到行动的闭环',
      subtitle: '解决“目标模糊、记忆零散、执行低效”三大痛点',
      description: '以“个人长期记忆系统”为基础，“AI智能规划引擎”为核心，整合全链路效率工具。',
      flow: {
        memory: '记忆沉淀',
        planning: '目标拆解',
        action: '行动落地',
        feedback: '进度反馈',
      },
    },
    features: {
      memory: {
        title: '个人长期记忆中心',
        subtitle: '智忆库',
        desc: '让“零散记忆”转化为“规划依据”，避免重复决策。',
        points: [
          '智能记忆捕捉：主动记录文本/语音/图片，自动抓取关键节点。',
          '场景化唤醒：制定目标时自动关联相关经验与能力。',
          '记忆标签体系：自动生成自我认知、成长历程等标签。',
        ],
      },
      planning: {
        title: 'AI智能规划引擎',
        subtitle: '智引',
        desc: '将“模糊需求”转化为“可执行方案”，结合记忆实现个性化。',
        points: [
          '多维目标拆解：基于SMART原则，自动生成长短期计划。',
          '动态调整机制：进度滞后时自动分析原因并调整方案。',
          '生命之花模型：平衡健康、事业、家庭等8大维度。',
        ],
      },
    },
    footer: {
      copyright: '© 2025 GEDO.AI. 保留所有权利。',
      contact: '联系我们',
    },
  },
  en: {
    nav: {
      product: 'GEDO.AI',
      features: 'Features',
      concept: 'Concept',
      waitlist: 'Join Waitlist',
    },
    hero: {
      slogan: 'GEDO.AI: Blueprint Future, Drive Goals',
      subSlogan: 'Memory + Planning: The Dual-Drive Efficiency Assistant',
      description: 'Generalized Episodic-Driven Organization. Transforming scattered memories into actionable guides, building your personal long-term memory and intelligent planning system.',
      cta: 'Join the Beta Waitlist',
      placeholder: 'Enter your email',
      join: 'Join',
      joined: 'Joined!',
    },
    concept: {
      title: 'The Loop from Memory to Action',
      subtitle: 'Solving ambiguous goals, scattered memories, and inefficient execution.',
      description: 'Based on a "Personal Long-term Memory System" and powered by an "AI Intelligent Planning Engine".',
      flow: {
        memory: 'Memory',
        planning: 'Planning',
        action: 'Action',
        feedback: 'Feedback',
      },
    },
    features: {
      memory: {
        title: 'Long-term Memory Center',
        subtitle: 'Memory Vault',
        desc: 'Turning scattered memories into planning foundations to avoid repetitive decision-making.',
        points: [
          'Smart Capture: Text, voice, image input with auto-extraction of key events.',
          'Contextual Recall: Auto-associates relevant experiences when setting goals.',
          'Tag System: Auto-generates tags for self-awareness and growth.',
        ],
      },
      planning: {
        title: 'AI Planning Engine',
        subtitle: 'Guide Engine',
        desc: 'Converting vague needs into executable plans, personalized by your memory.',
        points: [
          'Multi-dim Breakdown: Auto-generates plans based on SMART principles.',
          'Dynamic Adjustment: Analyzes delays and adjusts schedules automatically.',
          'Life Balance: Balances 8 dimensions including health, career, and family.',
        ],
      },
    },
    footer: {
      copyright: '© 2025 GEDO.AI. All rights reserved.',
      contact: 'Contact Us',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Content;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('zh');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: content[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};





