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
  avatar: {
    title: string;
    subtitle: string;
    desc: string;
    points: string[];
    greeting: string;
    userMessage: string;
    analyzing: string;
    response: string;
    feature1: string;
    feature2: string;
    feature3: string;
  };
  opensource: {
    badge: string;
    title: string;
    desc: string;
    repoDesc: string;
    star: string;
    fork: string;
    viewCode: string;
    benefitsTitle: string;
    benefit1Title: string;
    benefit1Desc: string;
    benefit2Title: string;
    benefit2Desc: string;
    techTitle: string;
    quickStart: string;
  };
  cta: {
    badge: string;
    title: string;
    desc: string;
    webBadge: string;
    webTitle: string;
    webDesc: string;
    webFeatures: string[];
    webButton: string;
    iosBadge: string;
    iosTitle: string;
    iosDesc: string;
    iosFeatures: string[];
    iosPlaceholder: string;
    iosButton: string;
    iosSuccess: string;
    note: string;
  };
  footer: {
    copyright: string;
    contact: string;
    github: string;
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
      subtitle: '解决"目标模糊、记忆零散、执行低效"三大痛点',
      description: '以"个人长期记忆系统"为基础，"AI智能规划引擎"为核心，整合全链路效率工具。',
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
        subtitle: '智忆',
        desc: '让"零散记忆"转化为"规划依据"，避免重复决策。',
        points: [
          '智能记忆捕捉：主动记录文本/语音/图片，自动抓取关键节点。',
          '场景化唤醒：制定目标时自动关联相关经验与能力。',
          '记忆标签体系：自动生成自我认知、成长历程等标签。',
        ],
      },
      planning: {
        title: 'AI智能规划引擎',
        subtitle: '智引',
        desc: '将"模糊需求"转化为"可执行方案"，结合记忆实现个性化。',
        points: [
          '多维目标拆解：基于SMART原则，自动生成长短期计划。',
          '动态调整机制：进度滞后时自动分析原因并调整方案。',
          '生命之花模型：平衡健康、事业、家庭等8大维度。',
        ],
      },
    },
    avatar: {
      title: '你的专属智伴',
      subtitle: 'Digital Avatar',
      desc: '智伴是你的数字分身，它了解你的过去、理解你的现在、助力你的未来。基于你的记忆和目标，提供个性化的智能陪伴与建议。',
      points: [
        '深度记忆：基于你的智忆库，真正了解你的经历、能力和偏好',
        '智能对话：自然语言交互，像朋友一样理解你的需求',
        '主动关怀：在关键时刻主动提醒、鼓励和建议',
        '持续成长：随着你的记忆积累，智伴越来越懂你',
      ],
      greeting: '你好！我是你的智伴，随时准备帮助你规划人生目标。',
      userMessage: '帮我制定一个健康计划吧',
      analyzing: '正在分析你的记忆...',
      response: '根据你之前的记录，我发现你喜欢晨跑但最近中断了。让我们从每周3次开始...',
      feature1: '自然对话',
      feature2: '智能建议',
      feature3: '情感陪伴',
    },
    opensource: {
      badge: '开源免费',
      title: '完全开源，自由部署',
      desc: 'GEDO.AI 采用 MIT 协议开源，你可以免费下载、自行部署，完全掌控自己的数据和隐私。',
      repoDesc: 'GEDO.AI（智动）- 记忆+规划双驱效率助手，从记忆到行动的全链路智能系统',
      star: 'Star',
      fork: 'Fork',
      viewCode: '查看源代码',
      benefitsTitle: '自托管优势',
      benefit1Title: '数据自主',
      benefit1Desc: '所有数据存储在你自己的服务器',
      benefit2Title: '完全免费',
      benefit2Desc: 'MIT协议，永久免费使用',
      techTitle: '技术栈',
      quickStart: '快速开始',
    },
    cta: {
      badge: '限时免费体验',
      title: '立即开始你的智能成长之旅',
      desc: '选择适合你的方式，开始使用 GEDO.AI',
      webBadge: '即刻可用',
      webTitle: '在线版 Web 应用',
      webDesc: '无需下载，打开浏览器即可使用。支持 PC 和移动端，数据云端同步，随时随地管理你的目标和记忆。',
      webFeatures: ['跨平台同步', '无需安装', '实时更新'],
      webButton: '立即体验',
      iosBadge: '限时免费内测',
      iosTitle: 'iOS 原生应用',
      iosDesc: '专为 iPhone 和 iPad 优化的原生体验。即将上线 App Store，现在预约即可获得限时免费内测资格。',
      iosFeatures: ['原生流畅体验', '离线可用', '系统级集成'],
      iosPlaceholder: '输入邮箱预约内测资格',
      iosButton: '预约 iOS 内测',
      iosSuccess: '预约成功！我们会在内测开放时第一时间通知你',
      note: '💡 内测期间完全免费，正式版将保留免费基础功能',
    },
    footer: {
      copyright: '© 2025 GEDO.AI. 保留所有权利。',
      contact: '联系我们',
      github: '开源代码',
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
    avatar: {
      title: 'Your Personal AI Companion',
      subtitle: 'Digital Avatar',
      desc: 'Your Digital Avatar understands your past, present, and helps shape your future. Based on your memories and goals, it provides personalized intelligent companionship and advice.',
      points: [
        'Deep Memory: Truly understands your experiences, abilities, and preferences based on your Memory Vault',
        'Smart Dialogue: Natural language interaction, understanding your needs like a friend',
        'Proactive Care: Actively reminds, encourages, and suggests at key moments',
        'Continuous Growth: The more memories you accumulate, the better it understands you',
      ],
      greeting: "Hello! I'm your AI companion, ready to help you plan your life goals.",
      userMessage: 'Help me create a health plan',
      analyzing: 'Analyzing your memories...',
      response: "Based on your records, I noticed you enjoy morning runs but stopped recently. Let's start with 3 times a week...",
      feature1: 'Natural Chat',
      feature2: 'Smart Advice',
      feature3: 'Emotional Support',
    },
    opensource: {
      badge: 'Open Source & Free',
      title: 'Fully Open Source, Deploy Freely',
      desc: 'GEDO.AI is open-sourced under MIT License. Download freely, self-host, and maintain complete control over your data and privacy.',
      repoDesc: 'GEDO.AI - Memory + Planning dual-drive efficiency assistant, a full-chain intelligent system from memory to action',
      star: 'Star',
      fork: 'Fork',
      viewCode: 'View Source Code',
      benefitsTitle: 'Self-Hosting Benefits',
      benefit1Title: 'Data Sovereignty',
      benefit1Desc: 'All data stored on your own servers',
      benefit2Title: 'Completely Free',
      benefit2Desc: 'MIT License, free forever',
      techTitle: 'Tech Stack',
      quickStart: 'Quick Start',
    },
    cta: {
      badge: 'Limited Free Trial',
      title: 'Start Your Intelligent Growth Journey',
      desc: 'Choose the way that suits you to start using GEDO.AI',
      webBadge: 'Available Now',
      webTitle: 'Online Web Application',
      webDesc: 'No download required, use it directly in your browser. Supports PC and mobile, cloud sync, manage your goals and memories anywhere.',
      webFeatures: ['Cross-platform Sync', 'No Installation', 'Real-time Updates'],
      webButton: 'Try Now',
      iosBadge: 'Limited Free Beta',
      iosTitle: 'iOS Native App',
      iosDesc: 'Native experience optimized for iPhone and iPad. Coming soon to App Store. Reserve now for limited free beta access.',
      iosFeatures: ['Native Experience', 'Offline Available', 'System Integration'],
      iosPlaceholder: 'Enter email to reserve beta access',
      iosButton: 'Reserve iOS Beta',
      iosSuccess: 'Reserved! We will notify you as soon as beta opens',
      note: '💡 Completely free during beta, basic features remain free after launch',
    },
    footer: {
      copyright: '© 2025 GEDO.AI. All rights reserved.',
      contact: 'Contact Us',
      github: 'Source Code',
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
