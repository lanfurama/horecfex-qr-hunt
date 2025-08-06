"use client";
import { db } from "@/lib/firebase-client";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider"; // ✅ dùng auth context

export default function ProfilePage() {
  const { user } = useAuth(); // đã được check login ở layout
  const [player, setPlayer] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return; // layout đã redirect nếu chưa login
    const fetchPlayer = async () => {
      const snap = await get(ref(db, `players/${user.uid}`));
      if (snap.exists()) {
        setPlayer({ uid: user.uid, ...snap.val() });
      }
    };
    fetchPlayer();
  }, [user]);

  const handleLogout = async () => {
    await signOut(user.auth);
    router.push("/client/login");
  };

  if (!player) {
    return (
      <div className="text-center text-black mt-10">
        ⏳ Đang tải thông tin...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Thông tin người chơi */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{player.name}</h1>
            <p className="opacity-90">{player.username}</p>
            <p className="opacity-90">{player.email}</p>
            <p className="opacity-90">{player.phone}</p>
          </div>
          <div className="bg-white/20 p-4 rounded-full">
            <span className="text-3xl">🏆</span>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-lg font-semibold">Điểm hiện tại</p>
          <p className="text-4xl font-bold">{player.points}</p>
        </div>

        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
        >
          Đăng xuất
        </button>
      </div>

      {/* Lịch sử quét QR */}
      <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-black mb-4">📜 Lịch sử quét QR</h2>
        {player.scans ? (
          <div className="divide-y divide-gray-200">
            {Object.entries(player.scans)
              .sort((a, b) => new Date(b[1].time) - new Date(a[1].time))
              .map(([qr, data]) => (
                <div
                  key={qr}
                  className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition"
                >
                  <div>
                    <p className="text-black font-medium">
                      {qr}{" "}
                      <span className="text-indigo-600 font-bold">
                        +{data.points} điểm
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(data.time).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xl">📱</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500">Chưa quét QR nào</p>
        )}
      </div>
    </div>
  );
}
