"use client";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex justify-between items-center px-4 py-2">
        <Link href="/" className="text-xl font-bold text-white">
          Horecfex 2025
        </Link>
        <div className="flex gap-4 items-center">
          <Link href="/scan" className="text-white hover:underline">Quét QR</Link>
          <Link href="/leaderboard" className="text-white hover:underline">BXH</Link>
          <Link href="/rewards" className="text-white hover:underline">Đổi quà</Link>
          {user ? (
            <>
              <Link href="/profile" className="text-white hover:underline">Hồ sơ</Link>
              <button onClick={handleLogout} className="text-red-300 hover:underline">
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white hover:underline">Đăng nhập</Link>
              <Link href="/register" className="text-white hover:underline">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
