"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useSearchParams, useRouter } from "next/navigation";

// Map lỗi Firebase sang tiếng Việt
const firebaseErrorMap = {
  "auth/user-not-found": "❌ Tài khoản không tồn tại.",
  "auth/wrong-password": "❌ Sai mật khẩu. Vui lòng thử lại.",
  "auth/invalid-email": "❌ Email không hợp lệ.",
  "auth/too-many-requests":
    "⚠ Tài khoản tạm khóa do đăng nhập sai quá nhiều lần. Thử lại sau.",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const redirectParam = searchParams.get("redirect") || "/client/profile";

  const getErrorMessage = (err) =>
    firebaseErrorMap[err.code] ||
    `❌ ${err.message || "Đăng nhập thất bại."}`;

  const handleLogin = async () => {
    if (loading) return; // Chặn double click

    if (!input.trim() || !password.trim()) {
      setMessage({ text: "⚠ Vui lòng nhập đầy đủ thông tin.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      let emailToLogin = input.trim();

      // Nếu không phải email → tìm email qua username hoặc phone
      if (!input.includes("@")) {
        const isPhone = /^[0-9]+$/.test(input);
        let uid = null;

        if (isPhone) {
          // Tìm qua phone trước
          const phoneSnap = await get(ref(db, `phones/${input}`));
          if (phoneSnap.exists()) uid = phoneSnap.val();
        } else {
          // Tìm qua username
          const usernameSnap = await get(ref(db, `usernames/${input}`));
          if (usernameSnap.exists()) uid = usernameSnap.val();
        }

        if (uid) {
          const emailSnap = await get(ref(db, `players/${uid}/email`));
          if (emailSnap.exists()) emailToLogin = emailSnap.val();
        }
      }

      // Đăng nhập Firebase Auth
      await signInWithEmailAndPassword(auth, emailToLogin, password);

      setMessage({ text: "✅ Đăng nhập thành công!", type: "success" });
      setTimeout(() => router.push(redirectParam), 300);
    } catch (err) {
      setMessage({ text: getErrorMessage(err), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none transition text-gray-800";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Đăng nhập QR Hunt
        </h1>

        {/* Email / Username / Phone */}
        <input
          placeholder="Email / Username / Số điện thoại"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          className={`${inputClass} mb-3 disabled:bg-gray-100`}
        />

        {/* Password */}
        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} pr-12 disabled:bg-gray-100`}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {/* Register button */}
        <button
          onClick={() =>
            router.push(`/client/register?redirect=${encodeURIComponent(redirectParam)}`)
          }
          disabled={loading}
          className="mt-3 w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-colors disabled:bg-gray-400"
        >
          📝 Đăng ký tài khoản mới
        </button>

        {/* Error / success message */}
        {message.text && (
          <p
            className={`mt-4 text-center font-medium ${
              message.type === "error" ? "text-red-500" : "text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
