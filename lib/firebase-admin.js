import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// ✅ Lấy config từ .env (bắt buộc NEXT_PUBLIC_ để client đọc được)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  databaseURL: "https://qr-hunt-784a1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Đảm bảo không khởi tạo lại
const adminApp =
  getApps().find((app) => app.name === "adminApp") ||
  initializeApp(firebaseConfig, "adminApp");

export const auth = getAuth(adminApp);
export const db = getDatabase(adminApp);
