"use client";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
  if (!input.trim() || !password.trim()) {
    setMessage({ text: "Vui lòng nhập đầy đủ thông tin", type: "error" });
    return;
  }

  setLoading(true);
  setMessage({ text: "", type: "" });

  try {
    let emailToLogin = input.trim();

    if (!input.includes("@")) {
      // Chạy song song username và phone lookup
      const [usernameSnap, phoneSnap] = await Promise.all([
        get(ref(db, `usernames/${input}`)),
        /^[0-9]+$/.test(input) ? get(ref(db, `phones/${input}`)) : Promise.resolve(null)
      ]);

      if (usernameSnap?.exists()) {
        const uid = usernameSnap.val();
        const emailSnap = await get(ref(db, `players/${uid}/email`));
        if (emailSnap.exists()) emailToLogin = emailSnap.val();
      } else if (phoneSnap?.exists()) {
        const uid = phoneSnap.val();
        const emailSnap = await get(ref(db, `players/${uid}/email`));
        if (emailSnap.exists()) emailToLogin = emailSnap.val();
      }
    }

    await signInWithEmailAndPassword(auth, emailToLogin, password);
    setMessage({ text: "Đăng nhập thành công!", type: "success" });
    setTimeout(() => router.push("/client/profile"), 500);
  } catch (err) {
    let errMsg = "Đăng nhập thất bại. ";
    if (err.code === "auth/user-not-found") errMsg += "Tài khoản không tồn tại.";
    else if (err.code === "auth/wrong-password") errMsg += "Sai mật khẩu.";
    else if (err.code === "auth/invalid-email") errMsg += "Email không hợp lệ.";
    else errMsg += err.message;

    setMessage({ text: errMsg, type: "error" });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Đăng nhập QR Hunt
        </h1>

        <input
          placeholder="Email / Username / Số điện thoại"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full mb-3 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none transition"
        />

        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none transition pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          } py-3 rounded-lg font-semibold text-white transition-all`}
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

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
