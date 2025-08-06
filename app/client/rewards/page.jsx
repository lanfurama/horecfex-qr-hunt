"use client";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase-client";
import {
  ref,
  push,
  runTransaction,
  query,
  orderByChild,
  equalTo,
  onValue,
} from "firebase/database";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthProvider"; // ✅ Dùng AuthProvider

export default function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState({});
  const [player, setPlayer] = useState(null);
  const [redeems, setRedeems] = useState([]);

  // 🔹 Lắng nghe realtime
  useEffect(() => {
    if (!user) return;

    const unsubPlayer = onValue(ref(db, `players/${user.uid}`), (snap) => {
      if (snap.exists()) {
        setPlayer({ uid: user.uid, ...snap.val() });
      }
    });

    const unsubRewards = onValue(ref(db, "rewards"), (snap) => {
      setRewards(snap.exists() ? snap.val() : {});
    });

    const unsubRedeems = onValue(
      query(ref(db, "redeems"), orderByChild("uid"), equalTo(user.uid)),
      (snap) => {
        if (snap.exists()) {
          const data = [];
          snap.forEach((child) => data.push({ id: child.key, ...child.val() }));
          setRedeems(data.sort((a, b) => b.createdAt - a.createdAt));
        } else {
          setRedeems([]);
        }
      }
    );

    return () => {
      unsubPlayer();
      unsubRewards();
      unsubRedeems();
    };
  }, [user]);

  const generateRedeemCode = () =>
    Array.from({ length: 6 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
        Math.floor(Math.random() * 36)
      )
    ).join("");

  const handleRedeem = useCallback(async (rewardId, reward) => {
    if (!player) return;

    if (!confirm(`Đổi quà "${reward.name}" với ${reward.pointsRequired} điểm?`))
      return;

    try {
      const playerRef = ref(db, `players/${player.uid}`);
      const txResult = await runTransaction(playerRef, (current) => {
        if (!current) return current;
        if (current.points < reward.pointsRequired) return; // Không đủ điểm
        current.points -= reward.pointsRequired;
        return current;
      });

      if (!txResult.committed) {
        alert("❌ Bạn không đủ điểm để đổi quà này!");
        return;
      }

      const redeemCode = generateRedeemCode();
      await push(ref(db, "redeems"), {
        uid: player.uid,
        playerName: player.name || "",
        rewardId,
        rewardName: reward.name,
        pointsUsed: reward.pointsRequired,
        redeemCode,
        status: "pending",
        createdAt: Date.now(),
      });

      alert(`🎉 Đổi quà thành công!\nMã đổi quà: ${redeemCode}`);
    } catch (error) {
      console.error("Lỗi đổi quà:", error);
      alert("❌ Có lỗi xảy ra khi đổi quà!");
    }
  }, [player]);

  const StatusBadge = ({ status }) => {
    const map = {
      confirmed: { icon: <CheckCircle className="w-5 h-5" />, text: "Đã xác nhận", color: "text-green-400" },
      rejected: { icon: <XCircle className="w-5 h-5" />, text: "Từ chối", color: "text-red-400" },
      pending: { icon: <Clock className="w-5 h-5" />, text: "Chờ duyệt", color: "text-yellow-400" },
    };
    const s = map[status] || map.pending;
    return <span className={`flex items-center gap-1 font-semibold ${s.color}`}>{s.icon} {s.text}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 pb-20 text-white">
      {player && (
        <div className="bg-white/10 border border-white/20 p-4 rounded-xl text-center mb-6">
          <p className="text-gray-200">Điểm hiện tại</p>
          <p className="text-4xl font-bold text-yellow-300">{player.points}</p>
          <p className="text-sm text-gray-400 mt-1">{player.name}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-3">📜 Quà đã đổi</h2>
      {redeems.length > 0 ? (
        <div className="space-y-3 mb-8">
          {redeems.map((r) => (
            <div key={r.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{r.rewardName}</p>
                  <p className="text-sm text-gray-300">
                    Mã: <span className="font-mono text-yellow-300">{r.redeemCode}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 mb-8">📭 Chưa có</p>
      )}

      <h2 className="text-xl font-semibold mb-3">🎯 Quà có thể đổi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(rewards).map(([id, reward]) => {
          const canRedeem = player && player.points >= reward.pointsRequired;
          return (
            <div key={id} className="bg-white/5 border border-white/20 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-lg mb-1">{reward.name}</h2>
                <p className="text-gray-300 text-sm mb-2">{reward.description}</p>
                <p className="font-semibold text-yellow-300">
                  🎯 {reward.pointsRequired} điểm
                </p>
              </div>
              <button
                onClick={() => handleRedeem(id, reward)}
                disabled={!canRedeem}
                className={`mt-4 py-2 rounded-lg font-medium transition ${
                  canRedeem
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
              >
                {canRedeem ? "Đổi quà" : "Không đủ điểm"}
              </button>
            </div>
          );
        })}
        {!Object.keys(rewards).length && (
          <p className="text-center text-gray-400 col-span-full">
            📭 Hiện chưa có quà nào
          </p>
        )}
      </div>
    </div>
  );
}
