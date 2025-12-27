import Link from 'next/link';

export default function AppHome() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">GEDO.AI 应用</h1>
        <p className="text-slate-400 mt-3 max-w-2xl">
          这是产品区入口（/app）。智伴是你的 AI 成长伙伴，通过对话完成记忆记录、目标规划、行动打卡。
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/app/avatar"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl font-semibold transition-all text-center shadow-lg shadow-emerald-900/30"
          >
            🤖 进入智伴
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: '智伴', desc: 'AI 成长伙伴（含数字人 + 生命之树双视图）', href: '/app/avatar', icon: '🤖' },
            { title: '智忆', desc: '记录经历与想法，沉淀为能力证据', href: '/app/memory', icon: '🧠' },
            { title: '智引', desc: '目标规划与 SMART 拆解，能力差距分析', href: '/app/goals', icon: '🎯' },
            { title: '今日', desc: '行动清单与打卡反馈，动态调整建议', href: '/app/today', icon: '✅' },
            { title: '复盘洞察', desc: '成长分析与能力进化', href: '/app/insights', icon: '📊' },
          ].map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="border border-slate-800 bg-slate-950/40 hover:bg-slate-950/70 rounded-2xl p-5 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">{c.icon}</span>
                <span className="text-lg font-semibold text-white">{c.title}</span>
              </div>
              <div className="text-slate-400 text-sm mt-1">{c.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}








