"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase-client"; // ✅ Dùng bản client
import { ref, get } from "firebase/database";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    top5Users: [],
    scanHistory: [],
  });
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const playersSnap = await get(ref(db, "players"));
    if (!playersSnap.exists()) return;

    const players = playersSnap.val();
    let totalScans = 0;
    let scanHistory = [];

    Object.entries(players).forEach(([uid, player]) => {
      if (player.scans) {
        Object.entries(player.scans).forEach(([code, data]) => {
          totalScans++;
          scanHistory.push({
            name: player.name,
            code,
            points: data.points,
            time: data.time,
          });
        });
      }
    });

    // Top 5 người chơi theo điểm
    const sortedPlayers = Object.values(players)
      .map((p) => ({ name: p.name, points: p.points || 0 }))
      .sort((a, b) => b.points - a.points);

    // Nhật ký mới nhất
    scanHistory.sort((a, b) => new Date(b.time) - new Date(a.time));

    setStats({
      totalUsers: Object.keys(players).length,
      totalScans,
      top5Users: sortedPlayers.slice(0, 5),
      scanHistory: scanHistory.slice(0, 5),
    });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen p-4 bg-gray-50 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">👋 Xin chào Admin</h1>
        <button
          onClick={handleSignOut}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard
          label="Người chơi"
          value={stats.totalUsers}
          color="bg-blue-100 text-blue-800"
        />
        <StatCard
          label="QR đã quét"
          value={stats.totalScans}
          color="bg-green-100 text-green-800"
        />
      </div>

      {/* Top 5 người chơi */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-bold mb-3">🏆 Top 5 người chơi</h2>
        {stats.top5Users.length > 0 ? (
          stats.top5Users.map((u, i) => (
            <p key={i} className="py-1 border-b last:border-b-0 text-sm">
              {i + 1}. <span className="font-semibold">{u.name}</span> - {u.points} điểm
            </p>
          ))
        ) : (
          <p className="text-gray-500">Chưa có dữ liệu</p>
        )}
      </div>

      {/* Nhật ký gần nhất */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-bold mb-3">🕒 Nhật ký gần nhất</h2>
        {stats.scanHistory.length > 0 ? (
          stats.scanHistory.map((log, i) => (
            <div key={i} className="py-2 border-b last:border-b-0 text-sm">
              <span className="font-semibold">{log.name}</span> quét <b>{log.code}</b> (
              {log.points} điểm)
              <br />
              <span className="text-gray-500 text-xs">
                {new Date(log.time).toLocaleString("vi-VN")}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có dữ liệu</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`p-4 rounded-xl ${color}`}>
      <p className="text-sm opacity-80">{label}</p>
      <p className="text-lg font-bold break-words">{value}</p>
    </div>
  );
}
