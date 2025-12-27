'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

// 应用内导航项
const navItems = [
  { href: '/app/avatar', label: '智伴', icon: '🤖' },
  { href: '/app/memory', label: '智忆', icon: '🧠' },
  { href: '/app/goals', label: '智引', icon: '🎯' },
  { href: '/app/today', label: '今日', icon: '✅' },
  { href: '/app/insights', label: '洞察', icon: '📊' },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();

  // 路由守卫：未登录跳转到登录页
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">正在加载...</p>
        </div>
      </div>
    );
  }

  // 未认证时显示空白（等待重定向）
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/app/avatar" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22c0-8-8-10-8-16a8 8 0 1 1 16 0c0 6-8 8-8 16z" />
              </svg>
            </div>
            <span className="font-bold text-white hidden sm:block">GEDO.AI</span>
          </Link>

          {/* 主导航 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors flex items-center gap-2"
              >
                <span>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* 用户菜单 */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}


