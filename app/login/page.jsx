"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

export default function LoginPage() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      let emailToLogin = input;

      // Username
      const usernameSnap = await get(ref(db, `usernames/${input}`));
      if (usernameSnap.exists()) {
        const uid = usernameSnap.val();
        const emailSnap = await get(ref(db, `players/${uid}/email`));
        if (emailSnap.exists()) emailToLogin = emailSnap.val();
      }
      // Phone
      const phoneSnap = await get(ref(db, `phones/${input}`));
      if (phoneSnap.exists()) {
        const uid = phoneSnap.val();
        const emailSnap = await get(ref(db, `players/${uid}/email`));
        if (emailSnap.exists()) emailToLogin = emailSnap.val();
      }

      await signInWithEmailAndPassword(auth, emailToLogin, password);
      setMessage("✅ Đăng nhập thành công!");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-center mb-6">Đăng nhập QR Hunt</h1>
        <input
            placeholder="Email / Username / Số điện thoại"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full mb-3 p-3 rounded-xl border border-gray-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400 p-3 outline-none transition"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 rounded-xl border border-gray-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400 p-3 outline-none transition"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-500 py-3 rounded-xl font-semibold text-white hover:from-blue-700 hover:to-purple-600 transition-all"
          >
            Đăng nhập
          </button>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
