import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { dataLoader } from '../utils/dataLoader';

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Homeから渡されたstateを取得
  const categoryId = location.state?.categoryId || 'network'; // デフォルトはnetwork
  const questionCount = location.state?.questionCount || 10;
  const difficulty = location.state?.difficulty || 'basic';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const loadedQuestions = await dataLoader.loadQuestions(categoryId, difficulty);
      
      if (loadedQuestions) {
        const shuffled = [...loadedQuestions]
          .sort(() => Math.random() - 0.5)
          .slice(0, questionCount);
        setQuestions(shuffled);
      }
    };

    fetchQuestions();
  }, [categoryId, questionCount, difficulty]);

  const currentQuestion = questions[currentIndex];

  const getOptions = (q) => q.choices || q.options || [];
  const getCorrectAnswer = (q) => q.correctAnswer ?? q.answer;

  const handleAnswer = (index) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);

    setAnswers([
      ...answers,
      {
        question: currentQuestion,
        selected: index,
        isCorrect: index === getCorrectAnswer(currentQuestion)
      }
    ]);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      navigate('/result', {
        state: {
          answers,
          totalQuestions: questions.length,
          difficulty
        }
      });
    }
  };

  const handleExit = () => setIsExiting(true);
  const confirmExit = () => navigate('/');
  const cancelExit = () => setIsExiting(false);

  const difficultyInfo = {
    basic: {
      label: '基礎',
      icon: '🌱',
      gradient: 'from-emerald-400 to-teal-500',
      bgLight: 'bg-emerald-50',
      text: 'text-emerald-700'
    },
    intermediate: {
      label: '中級',
      icon: '🚀',
      gradient: 'from-blue-400 to-indigo-500',
      bgLight: 'bg-blue-50',
      text: 'text-blue-700'
    },
    advanced: {
      label: '上級',
      icon: '⚡',
      gradient: 'from-purple-400 to-pink-500',
      bgLight: 'bg-purple-50',
      text: 'text-purple-700'
    },
  };

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen mesh-gradient flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-spin-slow opacity-30"></div>
            <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
            </div>
          </div>
          <p className="text-slate-500 text-lg font-medium">問題を読み込み中...</p>
        </div>
      </div>
    );
  }

  const options = getOptions(currentQuestion);
  const correctAnswer = getCorrectAnswer(currentQuestion);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = selectedAnswer === correctAnswer;
  const currentDiffInfo = difficultyInfo[difficulty];

  return (
    <div className="min-h-screen mesh-gradient flex flex-col">
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={handleExit}
              className="w-10 h-10 rounded-xl bg-white/80 hover:bg-white text-slate-400 hover:text-slate-600 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${currentDiffInfo?.bgLight} ${currentDiffInfo?.text}`}>
              {currentDiffInfo?.icon} {currentDiffInfo?.label}
            </span>
            <div className="text-base font-bold">
              <span className="text-gradient">{currentIndex + 1}</span>
              <span className="text-slate-400"> / {questions.length}</span>
            </div>
          </div>
          {/* プログレスバー */}
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main key={currentQuestion.id} className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* カテゴリタグ */}
        <div className="mb-4 animate-fade-in-down">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 border border-indigo-200/50">
            {currentQuestion.category}
          </span>
        </div>

        {/* 問題カード */}
        <div className="relative bg-white rounded-3xl shadow-xl p-6 mb-6 overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-lg mb-4">
              Q
            </div>
            <h2 className="text-lg font-bold leading-relaxed text-slate-800">
              {currentQuestion.question}
            </h2>
          </div>
        </div>

        {/* 選択肢 */}
        <div className="space-y-3 mb-6">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = index === correctAnswer;
            const optionLabel = ['A', 'B', 'C', 'D'][index];

            let buttonClass = '';
            let labelClass = '';
            let iconContent = null;

            if (showExplanation) {
              if (isCorrectOption) {
                buttonClass = 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-lg shadow-emerald-500/20';
                labelClass = 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white';
                iconContent = (
                  <svg className="w-5 h-5 text-emerald-500 ml-auto animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                );
              } else if (isSelected) {
                buttonClass = 'bg-gradient-to-r from-red-50 to-orange-50 border-red-400 shadow-lg shadow-red-500/20 animate-shake';
                labelClass = 'bg-gradient-to-br from-red-400 to-orange-500 text-white';
                iconContent = (
                  <svg className="w-5 h-5 text-red-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                );
              } else {
                buttonClass = 'bg-slate-50 border-slate-200 opacity-50';
                labelClass = 'bg-slate-300 text-slate-500';
              }
            } else {
              buttonClass = isSelected
                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-400 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md hover:scale-[1.01]';
              labelClass = isSelected
                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                : 'bg-slate-100 text-slate-600';
            }

            return (
              <button
                key={`${currentQuestion.id}-${index}`}
                onClick={() => handleAnswer(index)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4 animate-fade-in-up ${buttonClass}`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${labelClass}`}>
                  {optionLabel}
                </span>
                <span translate="no" className={`flex-1 text-base font-medium ${
                  showExplanation
                    ? isCorrectOption
                      ? 'text-emerald-700'
                      : isSelected
                        ? 'text-red-700'
                        : 'text-slate-400'
                    : isSelected
                      ? 'text-indigo-700'
                      : 'text-slate-700'
                }`}>
                  {option}
                </span>
                {iconContent}
              </button>
            );
          })}
        </div>

        {/* 解説 */}
        {showExplanation && (
          <div className={`relative overflow-hidden rounded-3xl p-5 mb-6 animate-fade-in-up ${
            isCorrect
              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200'
              : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
          }`}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
              style={{ background: isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)' }}
            ></div>
            <div className="relative flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isCorrect
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                  : 'bg-gradient-to-br from-amber-400 to-orange-500'
              }`}>
                {isCorrect ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg mb-2 ${
                  isCorrect ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {isCorrect ? '正解!' : `不正解 - 正解は ${['A', 'B', 'C', 'D'][correctAnswer]}`}
                </h3>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                  isCorrect ? 'text-emerald-600' : 'text-amber-700'
                }`}>
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 次へボタン */}
        {showExplanation && (
          <button
            onClick={nextQuestion}
            className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 group animate-fade-in-up"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {currentIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        )}
      </main>

      {/* 中断確認モーダル */}
      {isExiting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">学習を中断しますか？</h3>
              <p className="text-sm text-slate-500">
                現在の進捗は保存されません
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelExit}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all duration-300"
              >
                続ける
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-red-500/30 transition-all duration-300"
              >
                中断する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
