"use client";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[80vh] px-4">
      <h1 className="text-4xl md:text-5xl font-bold  drop-shadow-lg">
        🎯 QR Hunt - Horecfex 2025
      </h1>
      <p className="/90 mt-4 max-w-2xl">
        Tham gia trò chơi săn QR tại sự kiện Horecfex 2025! Quét mã QR ở các gian hàng,
        tích điểm, tham gia thử thách giờ vàng và nhận những phần quà hấp dẫn.
      </p>

      <div className="flex flex-wrap gap-4 mt-8 justify-center text-black">
        {user ? (
          <>
            <Link
              href="/scan"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 font-semibold  shadow-lg"
            >
              🚀 Bắt đầu chơi
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 "
            >
              📊 Bảng xếp hạng
            </Link>
            <Link
              href="/rewards"
              className="px-6 py-3 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30 "
            >
              🎁 Đổi quà
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 font-semibold  shadow-lg"
            >
              🔑 Đăng nhập để chơi
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-white/20 border border-white/30 hover:bg-white/30"
            >
              ✍️ Đăng ký
            </Link>
          </>
        )}
      </div>

      <div className="mt-12 max-w-3xl bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold mb-4">📜 Cách chơi</h2>
        <ol className="list-decimal list-inside text-left space-y-2">
          <li>Đi dạo quanh sự kiện Horecfex 2025.</li>
          <li>Quét QR tại các gian hàng để nhận điểm.</li>
          <li>QR đặc biệt có mini challenge, thắng sẽ được x2 điểm.</li>
          <li>Thu thập đủ thẻ sưu tập để nhận bonus points.</li>
          <li>Tham gia thử thách theo giờ để kiếm nhiều điểm hơn.</li>
          <li>Đổi điểm lấy quà tại khu vực Tech Zone.</li>
        </ol>
      </div>
    </div>
  );
}
