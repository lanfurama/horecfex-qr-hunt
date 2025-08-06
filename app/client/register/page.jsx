"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Map lỗi Firebase sang tiếng Việt
const firebaseErrorMap = {
  "auth/email-already-in-use": "Email đã tồn tại",
  "auth/invalid-email": "Email không hợp lệ",
  "auth/weak-password": "Mật khẩu quá yếu (ít nhất 6 ký tự)",
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/client/profile";

  // Validate form client-side trước khi gọi API
  const validateForm = () => {
    if (!form.name || !form.username || !form.email || !form.phone || !form.password) {
      return "Vui lòng nhập đầy đủ thông tin";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Email không hợp lệ";
    }
    if (!/^(0|\+84)\d{9,10}$/.test(form.phone)) {
      return "Số điện thoại không hợp lệ";
    }
    if (form.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự";
    }
    return "";
  };

  const handleRegister = async () => {
    if (loading) return; // chống double click

    const errorMsg = validateForm();
    if (errorMsg) {
      setMessage({ text: errorMsg, type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Kiểm tra username & phone song song
      const [usernameSnap, phoneSnap] = await Promise.all([
        get(ref(db, `usernames/${form.username}`)),
        get(ref(db, `phones/${form.phone}`))
      ]);

      if (usernameSnap.exists()) {
        setLoading(false);
        setMessage({ text: "❌ Username đã tồn tại", type: "error" });
        return;
      }
      if (phoneSnap.exists()) {
        setLoading(false);
        setMessage({ text: "❌ Số điện thoại đã tồn tại", type: "error" });
        return;
      }

      // Tạo user Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCred.user.uid;

      // Lưu dữ liệu vào DB song song
      await Promise.all([
        set(ref(db, `players/${uid}`), {
          name: form.name,
          username: form.username,
          email: form.email,
          phone: form.phone,
          points: 0,
          collectedCards: {},
          scans: {},
        }),
        set(ref(db, `usernames/${form.username}`), uid),
        set(ref(db, `phones/${form.phone}`), uid),
      ]);

      setMessage({ text: "✅ Đăng ký thành công!", type: "success" });

      // Chuyển hướng sau khi đăng ký
      setTimeout(() => {
        router.push(redirectParam);
      }, 300);

    } catch (err) {
      setMessage({
        text: "❌ " + (firebaseErrorMap[err.code] || "Lỗi không xác định"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field, placeholder, type = "text") => (
    <input
      key={field}
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
      className="w-full mb-3 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none transition text-gray-800 placeholder-gray-400 bg-white"
    />
  );

  const inputs = [
    { field: "name", placeholder: "Họ và tên" },
    { field: "username", placeholder: "Tên đăng nhập" },
    { field: "email", placeholder: "Email", type: "email" },
    { field: "phone", placeholder: "Số điện thoại", type: "tel" },
    { field: "password", placeholder: "Mật khẩu", type: "password" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Đăng ký QR Hunt
        </h1>

        {inputs.map(({ field, placeholder, type }) =>
          renderInput(field, placeholder, type)
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading && <Loader2 className="animate-spin" size={20} />}
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>

        <button
          onClick={() =>
            router.push(`/client/login?redirect=${encodeURIComponent(redirectParam)}`)
          }
          className="mt-3 w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white transition-colors"
        >
          🔑 Đã có tài khoản? Đăng nhập
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
