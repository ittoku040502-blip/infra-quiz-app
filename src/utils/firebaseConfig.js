import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Firebaseコンソールから取得した設定値に置き換えてください
// https://console.firebase.google.com/ でプロジェクトを作成後、
// プロジェクト設定 > マイアプリ > ウェブアプリ追加 で取得できます
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firestore（データベース）
export const db = getFirestore(app);

// Authentication（認証）
export const auth = getAuth(app);

export default app;
