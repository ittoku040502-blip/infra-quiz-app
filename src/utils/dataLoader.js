// === データローダー ===
export const dataLoader = {
  /**
   * カテゴリー一覧を取得
   */
  async loadCategories() {
    try {
      // パスから先頭のスラッシュを削除
      const response = await fetch('/data/categories.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error('Failed to load categories:', error);
      return []; // エラー時は空の配列を返す
    }
  },

  /**
   * 特定カテゴリーのメタデータを取得
   */
  async loadCategoryMetadata(categoryId) {
    try {
      // パスから先頭のスラッシュを削除
      const response = await fetch(`/data/${categoryId}/metadata.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to load metadata for ${categoryId}:`, error);
      return null; // エラー時はnullを返す
    }
  },

  /**
   * 問題データを取得
   */
  async loadQuestions(categoryId, difficulty) {
    try {
      // パスから先頭のスラッシュを削除
      const response = await fetch(`/data/${categoryId}/${difficulty}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error(`Failed to load questions for ${categoryId}/${difficulty}:`, error);
      return []; // エラー時は空の配列を返す
    }
  }
};
