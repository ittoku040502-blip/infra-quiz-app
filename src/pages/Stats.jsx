import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { getRecentHistory, getCategoryStats, clearHistory } from '../utils/storage';

const Stats = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => getRecentHistory(50));
  const [categoryStats, setCategoryStats] = useState(() => getCategoryStats());
  const [isClearing, setIsClearing] = useState(false);

  const progressData = useMemo(() =>
    history.slice().reverse().map((result, index) => ({
      name: `${index + 1}`,
      rate: result.rate,
      difficulty: result.difficulty
    }))
  , [history]);

  const summaryStats = useMemo(() => ({
    totalRuns: history.length,
    avgRate: history.length > 0 ? Math.round(history.reduce((sum, r) => sum + r.rate, 0) / history.length) : 0,
    totalQuestions: history.reduce((sum, r) => sum + r.total, 0)
  }), [history]);

  const weakestCategories = useMemo(() =>
    categoryStats.filter(c => c.rate < 70).sort((a, b) => a.rate - b.rate)
  , [categoryStats]);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setCategoryStats([]);
    setIsClearing(false);
  };

  const getBarColor = (rate) => {
    if (rate >= 80) return 'url(#gradientGreen)';
    if (rate >= 60) return 'url(#gradientOrange)';
    return 'url(#gradientRed)';
  };

  const getRateColorClass = (rate) => {
    if (rate >= 80) return 'text-emerald-600';
    if (rate >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const difficultyInfo = {
    basic: { text: '基礎', icon: '🌱', gradient: 'from-emerald-400 to-teal-500' },
    intermediate: { text: '中級', icon: '🚀', gradient: 'from-blue-400 to-indigo-500' },
    advanced: { text: '上級', icon: '⚡', gradient: 'from-purple-400 to-pink-500' },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-3 border border-slate-200">
          <p className="font-bold text-slate-700 text-sm">{label}回目</p>
          <p className={`font-bold ${getRateColorClass(payload[0].value)}`}>
            正答率: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-xl p-3 border border-slate-200">
          <p className="font-bold text-slate-700 text-sm">{payload[0].payload.category}</p>
          <p className={`font-bold ${getRateColorClass(payload[0].value)}`}>
            正答率: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen mesh-gradient">
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 transition-all duration-300 flex items-center justify-center shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gradient">学習統計</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-8">
        {history.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              まだ学習履歴がありません
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              クイズに挑戦すると、ここに統計が表示されます
            </p>
            <button
              onClick={() => navigate('/')}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 group"
            >
              <span className="relative z-10">クイズに挑戦する</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 概要カード */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: summaryStats.totalRuns, label: '学習回数', gradient: 'from-indigo-500 to-purple-500', icon: '📚' },
                { value: `${summaryStats.avgRate}%`, label: '平均正答率', gradient: summaryStats.avgRate >= 80 ? 'from-emerald-400 to-teal-500' : summaryStats.avgRate >= 60 ? 'from-amber-400 to-orange-500' : 'from-red-400 to-pink-500', icon: '📊' },
                { value: summaryStats.totalQuestions, label: '総解答数', gradient: 'from-blue-500 to-cyan-500', icon: '✏️' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden bg-white rounded-2xl shadow-lg p-4 text-center animate-fade-in-up card-hover"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 学習推移グラフ */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="text-lg">📈</span>
                <h3 className="font-semibold text-slate-800">学習の推移</h3>
              </div>
              <div className="p-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="#94a3b8"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRate)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* カテゴリ別正答率 */}
            {categoryStats.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <h3 className="font-semibold text-slate-800">カテゴリ別理解度</h3>
                </div>
                <div className="p-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryStats}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="gradientGreen" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                          <linearGradient id="gradientOrange" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                          <linearGradient id="gradientRed" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <YAxis
                          dataKey="category"
                          type="category"
                          width={80}
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<CategoryTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                        <Bar dataKey="rate" radius={[0, 8, 8, 0]} barSize={20}>
                          {categoryStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 苦手カテゴリ */}
                {weakestCategories.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                      <h4 className="font-semibold text-amber-800 text-sm mb-3 flex items-center gap-2">
                        <span className="text-base">⚠️</span>
                        復習が必要なカテゴリ
                      </h4>
                      <div className="space-y-2">
                        {weakestCategories.map(cat => (
                          <div key={cat.category} className="flex justify-between items-center bg-white/80 rounded-xl px-4 py-2.5 shadow-sm">
                            <span className="text-sm font-medium text-slate-700">{cat.category}</span>
                            <span className={`text-sm font-bold ${getRateColorClass(cat.rate)}`}>{cat.rate}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 直近の履歴 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <span className="text-lg">📝</span>
                <h3 className="font-semibold text-slate-800">直近の学習履歴</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {history.slice(0, 10).map((result, index) => (
                  <div
                    key={result.id}
                    className="px-4 py-3 flex justify-between items-center hover:bg-slate-50/50 transition-colors animate-fade-in-up"
                    style={{ animationDelay: `${500 + index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${difficultyInfo[result.difficulty]?.gradient || 'from-slate-400 to-slate-500'} flex items-center justify-center text-lg shadow-md`}>
                        {difficultyInfo[result.difficulty]?.icon || '📄'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          {difficultyInfo[result.difficulty]?.text || '-'} • {result.total}問
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(result.date).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">
                        {result.correct}/{result.total}
                      </span>
                      <span className={`text-xl font-bold ${getRateColorClass(result.rate)}`}>
                        {result.rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 履歴削除ボタン */}
            <div className="text-center pt-4">
              <button
                onClick={() => setIsClearing(true)}
                className="text-sm text-slate-400 hover:text-red-500 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-red-50"
              >
                学習履歴をリセット
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 履歴削除確認モーダル */}
      {isClearing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">履歴をリセットしますか？</h3>
              <p className="text-sm text-slate-500">
                すべての学習記録が削除されます<br />この操作は元に戻せません
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsClearing(false)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all duration-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleClearHistory}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-red-500/30 transition-all duration-300"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;
