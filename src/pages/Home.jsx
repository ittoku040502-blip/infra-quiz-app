import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentHistory } from '../utils/storage';
import { dataLoader } from '../utils/dataLoader';

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('basic');
  const recentHistory = getRecentHistory(3);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const cats = await dataLoader.loadCategories();
      if (cats && cats.length > 0) {
        setCategories(cats);
        const firstEnabledCategory = cats.find(c => c.enabled);
        if (firstEnabledCategory) {
          setSelectedCategory(firstEnabledCategory.id);
        }
      }
      setIsLoading(false);
    };
    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const questionOptions = [5, 10, 15, 20];

  const difficultyOptions = [
    { id: 'intro', label: '超基礎', icon: '🌟' },
    { id: 'basic', label: '基礎', icon: '🌱' },
    { id: 'intermediate', label: '中級', icon: '🚀' },
    { id: 'advanced', label: '上級', icon: '⚡' },
  ];

  const startQuiz = () => {
    navigate('/quiz', { state: { categoryId: selectedCategory, questionCount, difficulty } });
  };

  const currentDifficulty = difficultyOptions.find(d => d.id === difficulty);
  const currentCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen mesh-gradient">
      <header className="glass sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="animate-fade-in-down">
            <h1 className="text-xl font-bold text-gradient">Infra Quiz</h1>
            <p className="text-xs text-slate-500">インフラ学習プラットフォーム</p>
          </div>
          <button
            onClick={() => navigate('/stats')}
            className="flex items-center gap-2 bg-white/80 hover:bg-white text-slate-700 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 animate-fade-in-down"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span className="hidden sm:inline">統計</span>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-8">
        <div className="relative bg-white rounded-3xl shadow-xl mb-6 animate-fade-in-up">
          <div className="relative p-6 space-y-8">
            {/* ジャンル選択 */}
            <div className="animate-fade-in-up delay-100">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                <span className="inline-flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">1</span>
                  学習ジャンルを選択
                </span>
              </label>
              {isLoading ? (
                <div className="text-center p-8 text-slate-500">読み込み中...</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat, index) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      disabled={!cat.enabled}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 card-hover ${
                        selectedCategory === cat.id
                          ? 'border-transparent bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                          : cat.enabled
                            ? 'border-slate-200 bg-white hover:border-slate-300'
                            : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                      }`}
                      style={{ animationDelay: `${100 + index * 50}ms` }}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className={`font-bold text-sm ${selectedCategory === cat.id ? 'text-white' : cat.enabled ? 'text-slate-700' : ''}`}>{cat.name}</div>
                      <div className={`text-[10px] mt-1 ${selectedCategory === cat.id ? 'text-white/80' : 'text-slate-400'}`}>{cat.enabled ? cat.description : '準備中...'}</div>
                      {selectedCategory === cat.id && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                          <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 難易度選択 */}
            <div className="animate-fade-in-up delay-200">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                <span className="inline-flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">2</span>
                  難易度を選択
                </span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {difficultyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDifficulty(opt.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 card-hover ${
                      difficulty === opt.id
                        ? 'border-transparent bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{opt.icon}</div>
                    <div className={`font-bold text-sm ${difficulty === opt.id ? 'text-white' : 'text-slate-700'}`}>{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 問題数選択 */}
            <div className="animate-fade-in-up delay-300">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                <span className="inline-flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">3</span>
                  出題数を選択
                </span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {questionOptions.map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      questionCount === num
                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg scale-105'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-102'
                    }`}
                  >
                    {num}<span className="text-xs font-normal ml-0.5 opacity-70">問</span>
                  </button>
                ))}
              </div>
            </div>

            {/* スタートボタン */}
            <div className="animate-fade-in-up delay-400">
              <button
                onClick={startQuiz}
                disabled={!selectedCategory || isLoading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/40 active:translate-y-0 active:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  学習をはじめる
                </span>
              </button>
            </div>

            {isLoading ? null : (
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500 animate-fade-in delay-500">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600">
                  {currentCategory?.icon} {currentCategory?.name}
                </span>
                <span className="text-slate-300">|</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100">
                  {currentDifficulty?.icon} {currentDifficulty?.label}
                </span>
                <span className="text-slate-300">|</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100">
                  📝 {questionCount}問
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
