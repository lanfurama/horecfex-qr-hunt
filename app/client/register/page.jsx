"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      // Check username
      const usernameSnap = await get(ref(db, `usernames/${form.username}`));
      if (usernameSnap.exists()) {
        setMessage("❌ Username đã tồn tại");
        return;
      }
      // Check phone
      const phoneSnap = await get(ref(db, `phones/${form.phone}`));
      if (phoneSnap.exists()) {
        setMessage("❌ Số điện thoại đã tồn tại");
        return;
      }

      // Create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const uid = userCred.user.uid;

      // Save player
      await set(ref(db, `players/${uid}`), {
        name: form.name,
        username: form.username,
        email: form.email,
        phone: form.phone,
        points: 0,
        collectedCards: {},
        scans: {},
      });
      // Save mappings
      await set(ref(db, `usernames/${form.username}`), uid);
      await set(ref(db, `phones/${form.phone}`), uid);

      setMessage("✅ Đăng ký thành công! Hãy đăng nhập.");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <h1 className="text-3xl font-bold text-center mb-6">Đăng ký QR Hunt</h1>
        {["name", "username", "email", "phone", "password"].map((field) => (
          <input
            key={field}
            type={field === "password" ? "password" : "text"}
            placeholder={
              field === "name"
                ? "Họ và tên"
                : field === "username"
                ? "Tên đăng nhập"
                : field === "email"
                ? "Email"
                : field === "phone"
                ? "Số điện thoại"
                : "Mật khẩu"
            }
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            className="w-full mb-3 p-3 rounded-xl border border-white/30 bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
          />
        ))}
        <button
          onClick={handleRegister}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-500 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-600 transition-all"
        >
          Đăng ký
        </button>
        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}
