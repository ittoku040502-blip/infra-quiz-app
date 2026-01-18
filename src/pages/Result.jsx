import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveResult } from '../utils/storage';

// SVG Progress Ring Component
const ProgressRing = ({ progress, size = 200, strokeWidth = 12 }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    return () => clearTimeout(timer);
  }, [progress]);

  const getColor = () => {
    if (progress >= 80) return { start: '#10b981', end: '#06b6d4' };
    if (progress >= 60) return { start: '#f59e0b', end: '#f97316' };
    return { start: '#ef4444', end: '#f97316' };
  };

  const colors = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    </div>
  );
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers = [], totalQuestions = 0, difficulty = 'basic' } = location.state || {};
  const [showContent, setShowContent] = useState(false);

  const { correctCount, rate, categoryResults } = useMemo(() => {
    if (!answers || answers.length === 0) return { correctCount: 0, rate: 0, categoryResults: {} };
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const rate = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const categoryResults = answers.reduce((acc, answer) => {
      const category = answer.question.category;
      if (!acc[category]) {
        acc[category] = { correct: 0, total: 0 };
      }
      acc[category].total++;
      if (answer.isCorrect) acc[category].correct++;
      return acc;
    }, {});

    return { correctCount, rate, categoryResults };
  }, [answers, totalQuestions]);

  useEffect(() => {
    if (answers.length > 0) {
      saveResult({
        correct: correctCount,
        total: totalQuestions,
        rate,
        difficulty,
        categoryResults
      });
    }
    setTimeout(() => setShowContent(true), 100);
  }, [answers.length, correctCount, totalQuestions, rate, difficulty, categoryResults]);

  const getMessage = (r) => {
    if (r >= 90) return { text: '素晴らしい!', sub: '完璧な理解度です', icon: '🎉', gradient: 'from-emerald-400 to-cyan-500' };
    if (r >= 80) return { text: 'お見事!', sub: '合格ラインに到達しました', icon: '🌟', gradient: 'from-blue-400 to-indigo-500' };
    if (r >= 60) return { text: 'あと一歩!', sub: '復習で知識を定着させましょう', icon: '💪', gradient: 'from-amber-400 to-orange-500' };
    return { text: '要復習', sub: '基本をしっかり確認しましょう', icon: '📚', gradient: 'from-red-400 to-pink-500' };
  };

  const getOptions = (q) => q.choices || q.options || [];
  const getCorrectAnswer = (q) => q.correctAnswer ?? q.answer;

  const message = getMessage(rate);

  const difficultyInfo = {
    basic: { text: '基礎', icon: '🌱', gradient: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50' },
    intermediate: { text: '中級', icon: '🚀', gradient: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50' },
    advanced: { text: '上級', icon: '⚡', gradient: 'from-purple-400 to-pink-500', bg: 'bg-purple-50' },
  };

  if (answers.length === 0) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center px-4">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl animate-fade-in-up">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-500 text-lg mb-6">結果データが見つかりません</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const wrongAnswers = answers.filter((a) => !a.isCorrect);

  return (
    <div className="min-h-screen mesh-gradient">
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 transition-all duration-300 flex items-center justify-center shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-slate-800">学習結果</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-8">
        {/* スコアカード */}
        <div className={`relative overflow-hidden bg-white rounded-3xl shadow-xl mb-6 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* 背景デコレーション */}
          <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-br ${message.gradient} opacity-10`}></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative p-8 text-center">
            {/* 結果メッセージ */}
            <div className={`text-6xl mb-4 animate-bounce-in`}>{message.icon}</div>
            <h2 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${message.gradient} bg-clip-text text-transparent`}>
              {message.text}
            </h2>
            <p className="text-slate-500 text-sm mb-8">{message.sub}</p>

            {/* 円形プログレス */}
            <div className="relative inline-flex items-center justify-center mb-8">
              <ProgressRing progress={rate} size={180} strokeWidth={14} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm text-slate-400 mb-1">正答率</span>
                <span className={`text-5xl font-bold bg-gradient-to-r ${message.gradient} bg-clip-text text-transparent animate-count-up`}>
                  {rate}
                </span>
                <span className="text-2xl font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* 正解数 */}
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-800">
                  {correctCount}
                  <span className="text-xl text-slate-400">/{totalQuestions}</span>
                </div>
                <div className="text-sm text-slate-500">正解数</div>
              </div>
            </div>

            {/* 難易度バッジ */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${difficultyInfo[difficulty]?.bg} text-slate-700 text-sm font-medium`}>
                {difficultyInfo[difficulty]?.icon} {difficultyInfo[difficulty]?.text}レベル
              </span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className={`space-y-3 mb-6 transition-all duration-500 delay-200 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => navigate('/quiz', { state: { questionCount: totalQuestions, difficulty } })}
            className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              もう一度挑戦
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-4 rounded-2xl font-bold text-lg transition-all duration-300"
          >
            ホームに戻る
          </button>
        </div>

        {/* カテゴリ別結果 */}
        <div className={`bg-white rounded-3xl shadow-lg overflow-hidden mb-6 transition-all duration-500 delay-300 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-lg">📊</span>
              カテゴリ別の結果
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(categoryResults).map(([category, data], index) => {
              const categoryRate = Math.round((data.correct / data.total) * 100);
              const colorClass = categoryRate >= 80 ? 'from-emerald-400 to-teal-500' :
                categoryRate >= 60 ? 'from-amber-400 to-orange-500' : 'from-red-400 to-pink-500';

              return (
                <div key={category} className="animate-fade-in-up" style={{ animationDelay: `${400 + index * 100}ms` }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">{category}</span>
                    <span className={`text-sm font-bold ${
                      categoryRate >= 80 ? 'text-emerald-600' :
                      categoryRate >= 60 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                      {data.correct}/{data.total} ({categoryRate}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
                      style={{ width: `${categoryRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 間違えた問題 */}
        {wrongAnswers.length > 0 && (
          <div className={`bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-500 delay-400 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <span className="text-lg">📝</span>
                間違えた問題
              </h3>
              <span className="text-sm text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full">
                {wrongAnswers.length}問
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {wrongAnswers.map((answer, index) => {
                const options = getOptions(answer.question);
                const correctAnswerIndex = getCorrectAnswer(answer.question);
                return (
                  <div key={index} className="p-4">
                    <p className="text-sm font-medium text-slate-800 mb-4 leading-relaxed">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold mr-2">
                        {index + 1}
                      </span>
                      {answer.question.question}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-orange-500 text-white flex items-center justify-center text-xs">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-sm text-red-700">{options[answer.selected]}</span>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-xs">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-sm text-emerald-700 font-medium">{options[correctAnswerIndex]}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-base">💡</span>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {answer.question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Result;
