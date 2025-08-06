"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-client";
import { ref, get } from "firebase/database";
import { useAuth } from "@/context/AuthProvider"; // ✅ dùng auth context

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // layout đã redirect nếu chưa login

    const fetchLeaderboard = async () => {
      const snap = await get(ref(db, "players"));
      if (snap.exists()) {
        const data = Object.entries(snap.val())
          .map(([uid, p]) => ({
            uid,
            name: p.name || "Người chơi",
            points: p.points || 0,
          }))
          .sort((a, b) => b.points - a.points);
        setPlayers(data);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-300 bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        ⏳ Đang tải bảng xếp hạng...
      </div>
    );
  }

  if (!players.length) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-300 bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        📭 Chưa có người chơi nào
      </div>
    );
  }

  const medalIcons = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 max-w-sm mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">🏆 Bảng xếp hạng</h2>

      <ul className="space-y-3">
        {players.map((player, idx) => {
          const isYou = player.uid === user?.uid;
          const isTop3 = idx < 3;

          return (
            <li
              key={player.uid}
              className={`flex justify-between items-center p-3 rounded-lg border ${
                isYou ? "border-yellow-400" : "border-white/20"
              } ${isTop3 ? "bg-white/5" : "bg-white/0"} backdrop-blur-sm`}
            >
              <span className="font-medium flex items-center gap-2">
                {isTop3 && <span>{medalIcons[idx]}</span>}
                {idx + 1}. {player.name} {isYou && "(Bạn)"}
              </span>
              <span className="font-bold text-yellow-300">
                {player.points} điểm
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
