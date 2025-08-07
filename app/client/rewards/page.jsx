"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase-client";
import {
  ref, push, runTransaction, query,
  orderByChild, equalTo, onValue, get, serverTimestamp
} from "firebase/database";
import { Gift, History, Trophy, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState({});
  const [player, setPlayer] = useState(null);
  const [redeems, setRedeems] = useState([]);
  const [activeTab, setActiveTab] = useState("rewards");
  const [successModal, setSuccessModal] = useState(null);
  const [selectedRedeem, setSelectedRedeem] = useState(null);

  // Lấy thông tin player & rewards
  useEffect(() => {
    if (!user?.uid) return;

    onValue(ref(db, `players/${user.uid}`), snap => {
      if (snap.exists()) setPlayer({ uid: user.uid, ...snap.val() });
    });

    get(ref(db, "rewards")).then(snap => {
      if (snap.exists()) setRewards(snap.val());
    });
  }, [user?.uid]);

  // Lấy lịch sử đổi quà
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(ref(db, "redeems"), orderByChild("uid"), equalTo(user.uid));
    const unsub = onValue(q, snap => {
      const data = [];
      snap.forEach(child => {
        const val = child.val();
        data.push({
          id: child.key,
          ...val,
          createdAt: typeof val.createdAt === "number" ? val.createdAt : 0
        });
      });
      data.sort((a, b) => b.createdAt - a.createdAt);
      setRedeems(data);
    });
    return () => unsub();
  }, [user?.uid]);

  const generateRedeemCode = () =>
    Array.from({ length: 6 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
    ).join("");

  const handleRedeem = useCallback(async (rewardId, reward) => {
    if (!player) return;
    if (!confirm(`Đổi quà "${reward.name}" với ${reward.pointsRequired} điểm?`)) return;

    try {
      const playerRef = ref(db, `players/${player.uid}`);
      const txResult = await runTransaction(playerRef, current => {
        if (!current) return current;
        if (current.points < reward.pointsRequired) return;
        current.points -= reward.pointsRequired;
        return current;
      });

      if (!txResult.committed) {
        alert("❌ Bạn không đủ điểm!");
        return;
      }

      const redeemCode = generateRedeemCode();
      await push(ref(db, "redeems"), {
        uid: player.uid,
        playerName: player.name || "",
        playerUsername: player.username || "",
        rewardId,
        rewardName: reward.name,
        pointsUsed: reward.pointsRequired,
        redeemCode,
        status: "pending",
        createdAt: serverTimestamp()
      });

      setActiveTab("history");
      setSuccessModal({
        rewardName: reward.name,
        redeemCode,
      });
    } catch (error) {
      console.error(error);
      alert("❌ Có lỗi xảy ra khi đổi quà!");
    }
  }, [player]);

  const StatusBadge = ({ status }) => {
    const map = {
      confirmed: { icon: <CheckCircle className="w-4 h-4" />, text: "Đã nhận", color: "text-green-400" },
      rejected: { icon: <XCircle className="w-4 h-4" />, text: "Từ chối", color: "text-red-400" },
      pending: { icon: <Clock className="w-4 h-4" />, text: "Chờ duyệt", color: "text-yellow-400" }
    };
    const s = map[status] || map.pending;
    return <span className={`flex items-center gap-1 text-xs font-semibold ${s.color}`}>{s.icon} {s.text}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-4 pb-20 text-white">
      {/* Modal đổi quà thành công */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <div className="bg-white text-black p-6 rounded-2xl w-full max-w-xs relative">
              <button
                onClick={() => setSuccessModal(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold mb-2">🎁 Đổi quà thành công!</h2>
              <p className="mb-2">
                Bạn đã đổi quà <strong>{successModal.rewardName}</strong>.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                📍 Vui lòng mang máy đến <strong>Techzone</strong> để xác nhận và nhận quà.
              </p>
              <p className="text-sm">Mã nhận quà:</p>
              <p className="font-mono font-bold text-lg text-blue-600">
                {successModal.redeemCode}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Điểm người chơi */}
      {player && (
        <div className="bg-purple-600 rounded-2xl p-3 flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Điểm hiện tại</p>
            <p className="text-4xl font-bold">{player.points}</p>
          </div>
          <Trophy className="w-10 h-10" />
        </div>
      )}

      {/* Tab */}
      <div className="flex mb-4 bg-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setActiveTab("rewards")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold ${activeTab === "rewards" ? "bg-white/20" : "hover:bg-white/5"}`}
        >
          <Gift className="w-5 h-5" /> Quà
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 flex items-center justify-center gap-2 font-semibold ${activeTab === "history" ? "bg-white/20" : "hover:bg-white/5"}`}
        >
          <History className="w-5 h-5" /> Lịch sử
        </button>
      </div>

      {/* Nội dung tab */}
      <AnimatePresence mode="wait">
        {activeTab === "rewards" ? (
          <motion.div key="rewards" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(rewards).map(([id, reward]) => {
              const canRedeem = player && player.points >= reward.pointsRequired;
              return (
                <div key={id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                  <div>
                    <h2 className="font-bold text-lg">{reward.name}</h2>
                    <p className="text-gray-300 text-sm mb-2">{reward.description}</p>
                    <p className="font-semibold text-yellow-300">🎯 {reward.pointsRequired} điểm</p>
                  </div>
                  <button
                    onClick={() => handleRedeem(id, reward)}
                    disabled={!canRedeem}
                    className={`mt-4 py-2 rounded-lg font-medium ${canRedeem ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 cursor-not-allowed"}`}
                  >
                    {canRedeem ? "Đổi quà" : "Không đủ điểm"}
                  </button>
                </div>
              );
            })}
            {!Object.keys(rewards).length && (
              <p className="text-center text-gray-400 col-span-full">📭 Hiện chưa có quà</p>
            )}
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="space-y-3">
            {redeems.length > 0 ? (
              redeems.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    if (r.status === "pending") {
                      setSuccessModal({
                        rewardName: r.rewardName,
                        redeemCode: r.redeemCode
                      });
                    } else {
                      setSelectedRedeem(r);
                    }
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-white/10 transition"
                >
                  <div>
                    <p className="font-bold">{r.rewardName}</p>
                    <p className="text-sm text-gray-300">Mã: <span className="font-mono text-yellow-300">{r.redeemCode}</span></p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            ) : (
              <p className="text-gray-400">📭 Chưa có lịch sử</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
