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

  const getErrorMessage = (err) => {
    let code = err.code || "";

    // Nếu không có code nhưng message có chứa auth/xxx → tách ra
    if (!code && err.message) {
      const match = err.message.match(/\(auth\/([^)]+)\)/);
      if (match) code = `auth/${match[1]}`;
    }

    return firebaseErrorMap[code] || "❌ Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
  };

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
  "w-full px-5 py-3 rounded-xl border border-transparent bg-white/90 backdrop-blur-md shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-500 text-gray-800 transition-all";

return (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black px-4">
    <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-full max-w-sm border border-white/20">
      
      {/* Title */}
      <h1 className="text-3xl font-extrabold text-center mb-8 text-white drop-shadow-lg">
        Đăng nhập
      </h1>

      {/* Email / Username / Phone */}
      <input
        placeholder="Email / Username / Số điện thoại"
        value={input}
        disabled={loading}
        onChange={(e) => setInput(e.target.value)}
        className={`${inputClass} mb-4`}
      />

      {/* Password */}
      <div className="relative mb-6">
        <input
          type={showPass ? "text" : "password"}
          placeholder="Mật khẩu"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          disabled={loading}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Login button */}
      <button
        onClick={handleLogin}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white shadow-lg transition-all transform ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-orange-500 hover:scale-[1.02] hover:shadow-pink-500/30"
        }`}
      >
        {loading && <Loader2 className="animate-spin" size={20} />}
        {loading ? "Đang đăng nhập..." : "🚀 Đăng nhập"}
      </button>

      {/* Register button */}
      <button
        onClick={() =>
          router.push(
            `/client/register?redirect=${encodeURIComponent(redirectParam)}`
          )
        }
        disabled={loading}
        className="mt-4 w-full py-3 rounded-xl font-semibold text-white/90 border border-white/40 hover:bg-white/20 transition-all hover:scale-[1.02]"
      >
        📝 Tạo tài khoản mới
      </button>

      {/* Error / success message */}
      {message.text && (
        <p
          className={`mt-4 text-center font-medium ${
            message.type === "error" ? "text-red-300" : "text-green-200"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  </div>
);


}
