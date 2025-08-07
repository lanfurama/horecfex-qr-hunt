"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase-client";
import { ref, get, onValue, push, remove,set } from "firebase/database";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthProvider";

export default function AdminPage() {
  const { user } = useAdminAuth();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState({ type: "", description: "", time: "" });
  const [editId, setEditId] = useState(null); // đúng

  // useEffect(() => {
  //   fetchStats();
  //   listenChallenges();
  // }, []);

  useEffect(() => {
  const unsubscribeStats = listenStatsRealtime();
  const unsubscribeChallenges = listenChallenges();

  return () => {
    unsubscribeStats();
    unsubscribeChallenges();
  };
}, []);

const listenStatsRealtime = () => {
  const playersRef = ref(db, "players");
  const unsubscribe = onValue(playersRef, (snapshot) => {
    if (!snapshot.exists()) {
      setStats(null);
      return;
    }

    const players = snapshot.val();
    let totalScans = 0;
    let scanHistory = [];

    for (const [uid, player] of Object.entries(players)) {
      if (player.scans) {
        for (const [code, data] of Object.entries(player.scans)) {
          totalScans++;
          scanHistory.push({
            name: player.name,
            code,
            points: data.points,
            time: data.time,
          });
        }
      }
    }

    const sortedPlayers = Object.values(players)
      .map((p) => ({
        name: p.name,
        email: p.email || "—",
        phone: p.phone || "—",
        points: p.points || 0,
      }))
      .sort((a, b) => b.points - a.points);

    scanHistory.sort((a, b) => new Date(b.time) - new Date(a.time));

    setStats({
      totalUsers: Object.keys(players).length,
      totalScans,
      top5Users: sortedPlayers.slice(0, 5),
      scanHistory: scanHistory.slice(0, 5),
    });
  });

  return () => unsubscribe();
};

  const listenChallenges = () => {
    const challengesRef = ref(db, "hourlyChallenges");
    const unsubscribe = onValue(challengesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setChallenges(loaded);
      } else {
        setChallenges([]);
      }
    });
    return () => unsubscribe();
  };

  const addChallenge = async () => {
  const { type, description, time } = newChallenge;
  if (!type || !description || !time) return;

  const challengeData = { type, description };

  if (editId) {
    if (time !== editId) {
      await remove(ref(db, `hourlyChallenges/${editId}`));
      await set(ref(db, `hourlyChallenges/${time}`), challengeData);
    } else {
      // Nếu không đổi time thì chỉ update data
      await set(ref(db, `hourlyChallenges/${editId}`), challengeData);
    }
    setEditId(null);
  } else {
    // Thêm mới
    await push(ref(db, "hourlyChallenges"), challengeData);
  }

  setNewChallenge({ type: "", description: "", time: "" });
};

  const startEditing = (item) => {
    setNewChallenge({
      type: item.type || item.challengeType || "",
      description: item.description || "",
      time: item.id || "",
    });
    setEditId(item.id);
  };


  const deleteChallenge = async (id) => {
    await remove(ref(db, `hourlyChallenges/${id}`));
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/admin/login");
  };

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 bg-gray-50 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-bold">👋 Xin chào {user?.email || "Admin"}</h1>
        <button
          onClick={handleSignOut}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Đăng xuất
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <StatCard label="Người chơi" value={stats.totalUsers} color="bg-blue-100 text-blue-800" />
        <StatCard label="QR đã quét" value={stats.totalScans} color="bg-green-100 text-green-800" />
      </div>

      {/* Top 5 Users */}
      <div className="bg-white p-2 rounded-xl shadow mb-4">
        <h2 className="font-bold mb-4">🏆 Top 5 người chơi</h2>
        {stats.top5Users.length > 0 ? (
          <div className="space-y-3">
            {stats.top5Users.map((u, i) => {
              const rankColors = [
                "bg-gradient-to-r from-yellow-200 to-yellow-100 border-yellow-400",
                "bg-gradient-to-r from-gray-200 to-gray-100 border-gray-400",
                "bg-gradient-to-r from-orange-200 to-orange-100 border-orange-400",
                "bg-gray-50 border-gray-200",
                "bg-gray-50 border-gray-200",
              ];
              const medal = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-xl border shadow-sm ${rankColors[i]}`}
                >
                  <div className="text-2xl">{medal[i]}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-gray-600">{u.email}</p>
                    <p className="text-xs text-gray-600">{u.phone}</p>
                  </div>
                  <div className="font-bold text-blue-700">{u.points} đ</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">Chưa có dữ liệu</p>
        )}
      </div>

      {/* Recent Scans */}
      <div className="bg-white p-3 rounded-xl shadow mb-3">
        <h2 className="font-bold mb-3">🕒 Nhật ký gần nhất</h2>
        {stats.scanHistory.length > 0 ? (
          stats.scanHistory.map((log, i) => (
            <div key={i} className="py-2 border-b last:border-b-0 text-sm">
              <span className="font-semibold">{log.name}</span> quét <b>{log.code}</b> ({log.points} điểm)
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

      {/* Hourly Challenges Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4">🎯 Quản lý khung giờ vàng</h2>

        {/* Add Challenge */}
        <div className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="Loại (type)"
            value={newChallenge.type}
            onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value })}
            className="w-full p-2 rounded border border-gray-300"
          />
          <input
            type="text"
            placeholder="Mô tả (description)"
            value={newChallenge.description}
            onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
            className="w-full p-2 rounded border border-gray-300"
          />
          <input
            type="datetime-local"
            value={newChallenge.time || ""}
            onChange={(e) =>
              setNewChallenge({ ...newChallenge, time: e.target.value })
            }
            className="w-full p-2 rounded border border-gray-300"
          />

          {editId ? (
            <button
              onClick={addChallenge}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              ✅ Cập nhật
            </button>
          ) : (
            <button
              onClick={addChallenge}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              ➕ Thêm thử thách
            </button>
          )}
        </div>

        {/* List Challenges */}
        <ul className="space-y-3">
          {challenges.map((item) => (
            <li
              key={item.id}
              className="p-3 rounded border flex justify-between items-start bg-blue-50"
            >
              <div>
               <p className="font-bold">
                  ⏰ {new Date(item.id).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-blue-700">Loại: {item.challengeType}</p>
                <p className="text-sm">{item.description}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => startEditing(item)}
                  className="text-yellow-600 hover:text-yellow-800 text-sm"
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => deleteChallenge(item.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ❌ Xóa
                </button>
              </div>
            </li>
          ))}
          {!challenges.length && (
            <li className="text-gray-500 text-center italic">Không có thử thách nào</li>
          )}
        </ul>
      </div>
    </div>
  );
}
function StatCard({ label, value, color }) {
  return (
    <div className={`p-2 rounded-xl text-center ${color}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

