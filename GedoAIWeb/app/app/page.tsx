import Link from 'next/link';

export default function AppHome() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">GEDO.AI 应用</h1>
        <p className="text-slate-400 mt-3 max-w-2xl">
          这是产品区入口（/app）。你可以从这里进入“生命之树”、智忆库、目标规划与执行打卡。
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/app/tree"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors text-center"
          >
            打开生命之树
          </Link>
          <Link
            href="/app/memory"
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors text-center"
          >
            进入智忆库
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: '生命之树', desc: '以树状隐喻总览：经验/技能/过程/目标', href: '/app/tree' },
            { title: '智忆库', desc: '录入与检索记忆：文本/图片（后续加语音）', href: '/app/memory' },
            { title: '目标', desc: '多轮澄清与 SMART 拆解（智引）', href: '/app/goals' },
            { title: '今日', desc: '行动清单与打卡反馈，触发动态调整', href: '/app/today' },
          ].map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="border border-slate-800 bg-slate-950/40 hover:bg-slate-950/70 rounded-2xl p-5 transition-colors"
            >
              <div className="text-lg font-semibold text-white">{c.title}</div>
              <div className="text-slate-400 text-sm mt-1">{c.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}







