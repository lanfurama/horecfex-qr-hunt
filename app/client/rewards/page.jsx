"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
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

export default function RewardsPage() {
  const [rewards, setRewards] = useState({});
  const [player, setPlayer] = useState(null);
  const [redeems, setRedeems] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 🔹 Lắng nghe realtime thông tin người chơi
    const playerRef = ref(db, `players/${user.uid}`);
    const unsubPlayer = onValue(playerRef, (snap) => {
      if (snap.exists()) {
        setPlayer({ uid: user.uid, ...snap.val() });
      }
    });

    // 🔹 Lắng nghe realtime danh sách quà
    const rewardsRef = ref(db, "rewards");
    const unsubRewards = onValue(rewardsRef, (snap) => {
      if (snap.exists()) {
        setRewards(snap.val());
      } else {
        setRewards({});
      }
    });

    // 🔹 Lắng nghe realtime quà đã đổi của người chơi
    const redeemsRef = query(
      ref(db, "redeems"),
      orderByChild("uid"),
      equalTo(user.uid)
    );
    const unsubRedeems = onValue(redeemsRef, (snap) => {
      if (snap.exists()) {
        const data = [];
        snap.forEach((child) => {
          data.push({ id: child.key, ...child.val() });
        });
        data.sort((a, b) => b.createdAt - a.createdAt);
        setRedeems(data);
      } else {
        setRedeems([]);
      }
    });

    return () => {
      unsubPlayer();
      unsubRewards();
      unsubRedeems();
    };
  }, []);

  const generateRedeemCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  const handleRedeem = async (rewardId, reward) => {
    if (!player) return;
    if (!confirm(`Đổi quà "${reward.name}" với ${reward.pointsRequired} điểm?`))
      return;

    const playerRef = ref(db, `players/${player.uid}`);

    try {
      // Transaction: trừ điểm nếu đủ
      const txResult = await runTransaction(playerRef, (currentData) => {
        if (!currentData) return currentData;

        if (currentData.points < reward.pointsRequired) {
          // Không đủ điểm -> hủy transaction
          return;
        }

        // Trừ điểm
        currentData.points -= reward.pointsRequired;
        return currentData;
      });

      // Nếu transaction không commit -> báo lỗi
      if (!txResult.committed) {
        alert("❌ Bạn không đủ điểm để đổi quà này!");
        return;
      }

      // Tạo mã đổi quà
      const redeemCode = generateRedeemCode();

      // Ghi vào bảng redeem
      await push(ref(db, "redeems"), {
        uid: player.uid,
        playerName: player.name || "",
        playerUsername: player.username || "",
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
  };

  const StatusBadge = ({ status }) => {
    if (status === "confirmed")
      return (
        <span className="flex items-center gap-1 text-green-400 font-semibold">
          <CheckCircle className="w-5 h-5" /> Đã xác nhận
        </span>
      );
    if (status === "rejected")
      return (
        <span className="flex items-center gap-1 text-red-400 font-semibold">
          <XCircle className="w-5 h-5" /> Từ chối
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-yellow-400 font-semibold">
        <Clock className="w-5 h-5" /> Chờ duyệt
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 pb-20 text-white">
      {/* Thông tin người chơi */}
      {player && (
        <div className="bg-white/10 border border-white/20 p-4 rounded-xl shadow mb-6 text-center backdrop-blur-sm">
          <p className="text-gray-200">Điểm hiện tại</p>
          <p className="text-4xl font-bold text-yellow-300">{player.points}</p>
          <p className="text-sm text-gray-400 mt-1">{player.name}</p>
        </div>
      )}

      {/* Quà đã đổi */}
      <h2 className="text-xl font-semibold mb-3">📜 Quà đã đổi</h2>
      {redeems.length > 0 ? (
        <div className="space-y-3 mb-8">
          {redeems.map((r) => (
            <div
              key={r.id}
              className="bg-white/5 border border-white/20 rounded-lg p-4 backdrop-blur-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{r.rewardName}</p>
                  <p className="text-sm text-gray-300">
                    Mã:{" "}
                    <span className="font-mono text-yellow-300">
                      {r.redeemCode}
                    </span>
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

      {/* Quà có thể đổi */}
      <h2 className="text-xl font-semibold mb-3">🎯 Quà có thể đổi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(rewards).map(([id, reward]) => {
          const canRedeem = player && player.points >= reward.pointsRequired;
          return (
            <div
              key={id}
              className="bg-white/5 border border-white/20 rounded-xl p-4 shadow-sm backdrop-blur-sm flex flex-col justify-between"
            >
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
