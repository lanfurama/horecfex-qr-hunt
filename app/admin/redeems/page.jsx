"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, update } from "firebase/database";
import { CheckCircle, XCircle, Clock, Check, X } from "lucide-react";

export default function AdminRedeemsPage() {
  const [redeems, setRedeems] = useState([]);

  useEffect(() => {
    const redeemsRef = ref(db, "redeems");
    const unsub = onValue(redeemsRef, (snap) => {
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
    return () => unsub();
  }, []);

  const updateStatus = async (id, status) => {
    await update(ref(db, `redeems/${id}`), { status });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">📋 Quản lý Redeems</h1>

      {redeems.length > 0 ? (
        <div className="space-y-4">
          {redeems.map((r) => (
            <div
              key={r.id}
              className="bg-white/5 border border-white/20 rounded-lg p-4 flex justify-between items-center backdrop-blur-sm"
            >
              <div>
                <p className="font-bold">{r.rewardName}</p>
                <p className="text-sm text-gray-300">
                  Người chơi:{" "}
                  <span className="text-yellow-300">{r.playerName || "Ẩn danh"}</span>
                </p>
                <p className="text-sm text-gray-300">
                  Mã:{" "}
                  <span className="font-mono text-yellow-300">{r.redeemCode}</span>
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
                <StatusBadge status={r.status} />
              </div>

              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(r.id, "confirmed")}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "rejected")}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">📭 Chưa có yêu cầu đổi quà nào</p>
      )}
    </div>
  );
}
