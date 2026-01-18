// ローカルストレージを使った学習履歴の保存
// Firebase設定後はFirestoreに移行可能

const STORAGE_KEY = 'network_quiz_history';

// 履歴を取得
export const getHistory = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// 結果を保存
export const saveResult = (result) => {
  const history = getHistory();
  const newResult = {
    id: Date.now(),
    date: new Date().toISOString(),
    ...result
  };
  history.push(newResult);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newResult;
};

// カテゴリ別の正答率を計算
export const getCategoryStats = () => {
  const history = getHistory();
  const stats = {};

  history.forEach(result => {
    if (result.categoryResults) {
      Object.entries(result.categoryResults).forEach(([category, data]) => {
        if (!stats[category]) {
          stats[category] = { correct: 0, total: 0 };
        }
        stats[category].correct += data.correct;
        stats[category].total += data.total;
      });
    }
  });

  return Object.entries(stats).map(([category, data]) => ({
    category,
    correct: data.correct,
    total: data.total,
    rate: Math.round((data.correct / data.total) * 100)
  }));
};

// 直近の学習履歴を取得
export const getRecentHistory = (limit = 10) => {
  const history = getHistory();
  return history.slice(-limit).reverse();
};

// 全履歴をクリア
export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
