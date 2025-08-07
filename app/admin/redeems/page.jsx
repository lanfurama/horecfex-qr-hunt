"use client";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase-client";
import { ref, onValue, update } from "firebase/database";
import { CheckCircle, XCircle, Clock, Check, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

function StatusBadge({ status }) {
  const baseClass = "flex items-center gap-1 font-semibold text-sm";
  if (status === "confirmed")
    return (
      <span className={`${baseClass} text-green-600`}>
        <CheckCircle className="w-4 h-4" /> Đã xác nhận
      </span>
    );
  if (status === "rejected")
    return (
      <span className={`${baseClass} text-red-600`}>
        <XCircle className="w-4 h-4" /> Từ chối
      </span>
    );
  return (
    <span className={`${baseClass} text-yellow-600`}>
      <Clock className="w-4 h-4" /> Chờ duyệt
    </span>
  );
}

export default function AdminRedeemsPage() {
  const [redeems, setRedeems] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateStatus = useCallback(async (id, status) => {
    await update(ref(db, `redeems/${id}`), { status });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-black mb-6">📋 Quản lý Redeems</h1>

      {redeems.length > 0 ? (
        <div className="space-y-4">
          {redeems.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm"
            >
              {/* Thông tin redeem */}
              <div>
                <p className="font-bold text-gray-900">{r.rewardName}</p>
                <p className="text-sm text-gray-600">
                  Người chơi:{" "}
                  <span className="text-indigo-600 font-medium">
                    {r.playerName || "Ẩn danh"}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Mã:{" "}
                  <span className="font-mono text-indigo-600">
                    {r.redeemCode}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  {new Date(r.createdAt).toLocaleString("vi-VN")}
                </p>
                <StatusBadge status={r.status} />
              </div>

              {/* Nút duyệt / từ chối */}
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(r.id, "confirmed")}
                    className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-700"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, "rejected")}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">📭 Chưa có yêu cầu đổi quà nào</p>
      )}
    </div>
  );
}
