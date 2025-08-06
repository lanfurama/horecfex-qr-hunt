"use client";
import Link from "next/link";
import Image from "next/image";
import { QrCode, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="flex flex-col items-center text-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white px-4 py-10">
      {/* Logo */}
      <Image
        src="https://horecfex.com/wp-content/uploads/2025/06/Horecfex-logo-02-w.svg"
        alt="Horecfex Logo"
        width={180}
        height={180}
        className="mb-6 drop-shadow-lg animate-fadeIn"
      />

      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold drop-shadow-lg">
        🎯 QR Hunt - Horecfex 2025
      </h1>
      <p className="mt-3 max-w-lg text-gray-200 text-sm">
        Săn QR tại các gian hàng trong sự kiện Horecfex 2025, tích điểm, tham gia thử thách và nhận quà hấp dẫn.
      </p>

      {/* CTA */}
      <div className="mt-6">
        {loading ? (
          <div className="text-gray-400">Đang tải...</div>
        ) : user ? (
          <Link
            href="/client/scan"
            className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold shadow-lg transition-all text-lg"
          >
            <QrCode className="w-6 h-6" />
            Bắt đầu chơi
          </Link>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/client/login"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold shadow-lg transition-all"
            >
              <LogIn className="w-5 h-5" />
              Đăng nhập
            </Link>
            <Link
              href="/client/register"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm"
            >
              <UserPlus className="w-5 h-5" />
              Đăng ký
            </Link>
          </div>
        )}
      </div>

      {/* Cách chơi */}
      <div className="mt-7 w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg text-left">
        <h2 className="text-2xl font-bold mb-5 text-center">📜 Cách chơi</h2>
        <div className="space-y-4">
          {[
            ["🏟", "Đi dạo quanh sự kiện Horecfex 2025."],
            ["📷", "Quét QR tại các gian hàng để nhận điểm."],
            ["⏰", "Tham gia thử thách theo giờ để kiếm nhiều điểm hơn."],
            ["🎁", "Tích điểm và đổi các phần quà thú vị tại khu vực Tech Zone."],
          ].map(([icon, text], idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="text-2xl">{icon}</span>
              <p className="text-gray-200">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
