"use client";
import Link from "next/link";
import Image from "next/image";
import { QrCode } from "lucide-react";
import { useAuth } from "@/context/AuthProvider"; // ✅ Dùng AuthProvider

export default function HomePage() {
  const { user, loading } = useAuth(); // ✅ Lấy user và trạng thái loading

  return (
    <div className="flex flex-col items-center text-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white px-4 py-10">
      {/* Logo */}
      <Image
        src="https://horecfex.com/wp-content/uploads/2025/06/Horecfex-logo-02-w.svg"
        alt="Horecfex Logo"
        width={300}
        height={300}
        className="mb-6 drop-shadow-lg"
      />

      {/* Tiêu đề */}
      <h1 className="text-3xl font-bold drop-shadow-lg">
        🎯 QR Hunt - Horecfex 2025
      </h1>
      <p className="mt-4 max-w text-gray-200">
        Tham gia trò chơi săn QR tại sự kiện Horecfex 2025! Quét mã QR ở các gian hàng,
        tích điểm, tham gia thử thách giờ vàng và nhận những phần quà hấp dẫn.
      </p>

      {/* Nút hành động */}
      <div className="flex flex-wrap gap-4 mt-5 justify-center">
        {loading ? (
          <div className="text-gray-400">Đang tải...</div>
        ) : user ? (
          <Link
            href="/client/scan"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold shadow-lg transition-all"
          >
            <QrCode className="w-5 h-5" />
            Bắt đầu chơi
          </Link>
        ) : (
          <>
            <Link
              href="/client/login"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold shadow-lg transition-all"
            >
              🔑 Đăng nhập để chơi
            </Link>
            <Link
              href="/client/register"
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm"
            >
              ✍️ Đăng ký
            </Link>
          </>
        )}
      </div>

      {/* Cách chơi */}
      <div className="mt-7 max-w-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg text-left">
        <h2 className="text-2xl font-bold mb-4">Cách chơi</h2>
        <ol className="list-none space-y-3">
          <li className="flex items-start gap-2"><span>🏟</span> Đi dạo quanh sự kiện Horecfex 2025.</li>
          <li className="flex items-start gap-2"><span>📷</span> Quét QR tại các gian hàng để nhận điểm.</li>
          <li className="flex items-start gap-2"><span>🎯</span> QR đặc biệt có mini challenge, thắng sẽ được x2 điểm.</li>
          <li className="flex items-start gap-2"><span>🃏</span> Thu thập đủ thẻ sưu tập để nhận bonus points.</li>
          <li className="flex items-start gap-2"><span>⏰</span> Tham gia thử thách theo giờ để kiếm nhiều điểm hơn.</li>
          <li className="flex items-start gap-2"><span>🎁</span> Đổi điểm lấy quà tại khu vực Tech Zone.</li>
        </ol>
      </div>
    </div>
  );
}
