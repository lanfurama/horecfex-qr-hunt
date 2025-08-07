"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-client";
import { ref, get, child, onValue, off } from "firebase/database";
import { useAuth } from "@/context/AuthProvider";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const leaderboardRef = ref(db, "leaderboard");

    const handleSnapshot = async (leaderboardSnap) => {
      if (!leaderboardSnap.exists()) {
        setPlayers([]);
        setLoading(false);
        return;
      }

      const leaderboardData = leaderboardSnap.val();
      const dbRef = ref(db);

      const mergedData = await Promise.all(
        Object.entries(leaderboardData).map(async ([uid, lb]) => {
          const playerSnap = await get(child(dbRef, `players/${uid}`));
          const playerData = playerSnap.exists() ? playerSnap.val() : {};

          return {
            uid,
            name: lb.name || playerData.name || "Người chơi",
            points: lb.points || 0,
            email: playerData.email || "Không có email",
            phone: playerData.phone || "Không có SĐT",
          };
        })
      );

      mergedData.sort((a, b) => b.points - a.points);
      setPlayers(mergedData);
      setLoading(false);
    };

    // Lắng nghe realtime
    onValue(leaderboardRef, handleSnapshot);

    // Clear listener khi component unmount
    return () => {
      off(leaderboardRef, "value", handleSnapshot);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-300 bg-gradient-to-br from-blue-950 via-purple-950 to-black">
        ⏳ Đang tải bảng xếp hạng...
      </div>
    );
  }

  if (!players.length) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-300 bg-gradient-to-br from-blue-950 via-purple-950 to-black">
        📭 Chưa có người chơi nào
      </div>
    );
  }

  const medalIcons = ["🥇", "🥈", "🥉"];
  const topColors = [
    "bg-yellow-400/20 border-yellow-400/50",
    "bg-gray-300/20 border-gray-300/50",
    "bg-orange-400/20 border-orange-400/50",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-purple-950 to-black p-5 max-w-md mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">🏆 Bảng xếp hạng</h2>

      <ul className="space-y-3">
        {players.map((player, idx) => {
          const isYou = player.uid === user?.uid;
          const isTop3 = idx < 3;

          return (
            <li
              key={player.uid}
              className={`p-3 rounded-xl backdrop-blur-sm transition ${
                isYou ? "border-yellow-400 shadow-lg" : "border-white/10"
              } ${isTop3 ? topColors[idx] : "bg-white/5"}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-semibold">
                  {isTop3 && <span className="text-lg">{medalIcons[idx]}</span>}
                  <span>
                    {idx + 1}. {player.name}{" "}
                    {isYou && <span className="text-yellow-300">(Bạn)</span>}
                  </span>
                </div>
                <span className="font-bold text-yellow-300">
                  {player.points} điểm
                </span>
              </div>

              <div className="mt-2 text-sm text-gray-300 space-y-0.5">
                <p>📧 {player.email}</p>
                <p>📱 {player.phone}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
