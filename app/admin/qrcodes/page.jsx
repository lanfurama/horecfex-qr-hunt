"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase-client";
import { ref, onValue, set, remove } from "firebase/database";
import { QrCode, Trash2, Plus } from "lucide-react";
import QRCode from "qrcode.react";
import LoadingSpinner from "@/components/LoadingSpinner";

function generateRandomCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join("");
}

export default function AdminQRCodesPage() {
  const [qrcodes, setQrcodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [newQR, setNewQR] = useState({
    code: generateRandomCode(),
    points: 500,
  });

  const resetForm = useCallback(() => {
    setNewQR({ code: generateRandomCode(), points: 500, type: "normal" });
  }, []);

  const validateQR = useCallback(() => {
    if (!newQR.code) return "Mã QR không hợp lệ!";
    if (newQR.points < 500 || newQR.points > 10000)
      return "Điểm phải từ 500 đến 10000!";
    return null;
  }, [newQR]);

  useEffect(() => {
    const qrcodesRef = ref(db, "qrcodes");
    const unsub = onValue(qrcodesRef, (snap) => {
      setQrcodes(snap.exists() ? snap.val() : {});
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddQR = async () => {
    const error = validateQR();
    if (error) return alert(error);

    try {
      await set(ref(db, `qrcodes/${newQR.code}`), {
        points: parseInt(newQR.points, 10),
        createdAt: new Date().toISOString(),
      });
      resetForm();
    } catch (err) {
      console.error("Lỗi khi thêm QR:", err);
      alert("Không thể thêm QR, vui lòng thử lại!");
    }
  };

  const handleDeleteQR = async (code) => {
    if (!confirm(`Xóa QR "${code}"?`)) return;
    try {
      await remove(ref(db, `qrcodes/${code}`));
    } catch (err) {
      console.error("Lỗi khi xóa QR:", err);
      alert("Không thể xóa QR, vui lòng thử lại!");
    }
  };

  const filteredAndSortedQRCodes = useMemo(() => {
    return Object.entries(qrcodes)
      .filter(([_, data]) => filterType === "all" || data.type === filterType)
      .sort((a, b) => {
        if (sortOrder === "asc") return a[1].points - b[1].points;
        if (sortOrder === "desc") return b[1].points - a[1].points;
        if (sortOrder === "newest")
          return new Date(b[1].createdAt || 0) - new Date(a[1].createdAt || 0);
        return 0;
      });
  }, [qrcodes, filterType, sortOrder]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-3 pb-20">
      <h1 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <QrCode size={20} /> Quản lý QR Codes
      </h1>

      {/* Form thêm QR */}
      <div className="bg-white p-3 rounded-xl shadow-sm mb-5">
        <h2 className="font-medium mb-2 text-sm">Thêm QR mới</h2>
        <input
          value={newQR.code}
          readOnly
          className="w-full mb-2 p-2 border rounded-md bg-gray-100 text-sm"
        />
        <input
          type="number"
          min={500}
          max={10000}
          value={newQR.points}
          onChange={(e) => setNewQR({ ...newQR, points: e.target.value })}
          className="w-full mb-2 p-2 border rounded-md text-sm"
          placeholder="Điểm (500 - 10000)"
        />
        <button
          onClick={handleAddQR}
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
        >
          <Plus size={16} /> Thêm QR
        </button>
      </div>

      {/* Bộ lọc + Sắp xếp */}
      <div className="flex gap-2 mb-4">
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded-md flex-1 text-sm"
        >
          <option value="newest">Mới nhất</option>
          <option value="desc">Điểm giảm dần</option>
          <option value="asc">Điểm tăng dần</option>
        </select>
      </div>

      {/* Danh sách QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredAndSortedQRCodes.map(([code, data]) => (
          <QRCard
            key={code}
            code={code}
            data={data}
            onDelete={() => handleDeleteQR(code)}
          />
        ))}
        {filteredAndSortedQRCodes.length === 0 && (
          <p className="p-4 text-gray-500 text-sm">
            Không có QR code nào phù hợp
          </p>
        )}
      </div>
    </div>
  );
}

function QRCard({ code, data, onDelete }) {
  const scanUrl = useMemo(
    () =>
      typeof window !== "undefined"
        ? `${window.location.origin}/client/scan/${code}`
        : "",
    [code]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex flex-col items-center text-center border border-gray-100">
      <QRCode value={scanUrl} size={120} className="mb-2" />
      <h3 className="font-medium text-sm text-gray-900 break-all">{code}</h3>
      <p className="text-xs text-gray-600 mb-1">
        <span className="font-semibold text-blue-600">{data.points}</span> điểm
      </p>
      <p className="text-[10px] text-gray-400 break-all bg-gray-50 p-1 rounded-md w-full mb-2">
        {scanUrl}
      </p>
      <button
        onClick={onDelete}
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition"
      >
        <Trash2 size={14} /> Xóa
      </button>
    </div>
  );
}
