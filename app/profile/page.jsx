"use client";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login"); // Chuyển sang trang đăng nhập
        return;
      }

      const snap = await get(ref(db, `players/${user.uid}`));
      if (snap.exists()) {
        setPlayer(snap.val());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="text-center text-black mt-10">Đang tải...</div>;
  }

  if (!player) {
    return <div className="text-center text-black mt-10">Không tìm thấy thông tin người chơi</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">{player.name}</h1>
        <p className="text-gray-700">Username: {player.username}</p>
        <p className="text-gray-700">Email: {player.email}</p>
        <p className="text-gray-700">SĐT: {player.phone}</p>
        <p className="text-black font-semibold mt-2">Điểm: {player.points}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-black mb-4">Lịch sử quét QR</h2>
        {player.scans ? (
          Object.entries(player.scans)
            .sort((a, b) => new Date(b[1].time) - new Date(a[1].time))
            .map(([qr, data]) => (
              <div key={qr} className="border-b border-gray-200 py-2 text-black">
                <p>{qr} - {data.points} điểm</p>
                <p className="text-sm text-gray-500">{new Date(data.time).toLocaleString()}</p>
              </div>
            ))
        ) : (
          <p className="text-gray-500">Chưa quét QR nào</p>
        )}
      </div>
    </div>
  );
}
