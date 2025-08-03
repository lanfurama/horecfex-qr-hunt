"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Đăng nhập Firebase Auth
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // Kiểm tra trong bảng admins
      const snap = await get(ref(db, `admins/${userCred.user.uid}`));
      if (!snap.exists()) {
        setMessage("❌ Bạn không có quyền admin!");
        await auth.signOut();
        return;
      }

      setMessage("✅ Đăng nhập thành công!");
      router.push("/admin/dashboard");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">🔑 Admin Login</h1>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
        />
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-500 py-3 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-purple-600 transition-all"
        >
          Đăng nhập
        </button>
        {message && <p className="mt-4 text-center text-black">{message}</p>}
      </div>
    </div>
  );
}
