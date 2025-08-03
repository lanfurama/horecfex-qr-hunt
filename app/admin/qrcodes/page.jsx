"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get, set, remove } from "firebase/database";
import { QrCode, Trash2, Plus } from "lucide-react";
import QRCode from "qrcode.react";
import LoadingSpinner from "@/components/LoadingSpinner";

function generateRandomCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export default function AdminQRCodesPage() {
  const [qrcodes, setQrcodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc, newest

  const [newQR, setNewQR] = useState({
    code: generateRandomCode(),
    points: 10,
    type: "normal",
  });

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    const snap = await get(ref(db, "qrcodes"));
    if (snap.exists()) {
      setQrcodes(snap.val());
    } else {
      setQrcodes({});
    }
    setLoading(false);
  };

  const handleAddQR = async () => {
    if (!newQR.code) return alert("Mã QR không hợp lệ!");
    if (newQR.points < 5 || newQR.points > 50) {
      return alert("Điểm phải từ 5 đến 50!");
    }

    await set(ref(db, `qrcodes/${newQR.code}`), {
      points: parseInt(newQR.points) || 0,
      type: newQR.type,
      createdAt: new Date().toISOString(),
    });

    setNewQR({
      code: generateRandomCode(),
      points: 10,
      type: "normal",
    });

    fetchQRCodes();
  };

  const handleDeleteQR = async (code) => {
    if (!confirm(`Xóa QR "${code}"?`)) return;
    await remove(ref(db, `qrcodes/${code}`));
    fetchQRCodes();
  };

  const filteredAndSortedQRCodes = Object.entries(qrcodes)
    .filter(([_, data]) => filterType === "all" || data.type === filterType)
    .sort((a, b) => {
      if (sortOrder === "asc") return a[1].points - b[1].points;
      if (sortOrder === "desc") return b[1].points - a[1].points;
      if (sortOrder === "newest")
        return new Date(b[1].createdAt || 0) - new Date(a[1].createdAt || 0);
      return 0;
    });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-3 pb-20">
      <h1 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
        <QrCode size={22} /> Quản lý QR Codes
      </h1>

      {/* Form thêm QR */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2">Thêm QR mới</h2>
        <input
          placeholder="Mã QR"
          value={newQR.code}
          readOnly
          className="w-full mb-2 p-2 border rounded bg-gray-100"
        />
        <input
          placeholder="Điểm (5 - 50)"
          type="number"
          min={5}
          max={50}
          value={newQR.points}
          onChange={(e) => setNewQR({ ...newQR, points: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <select
          value={newQR.type}
          onChange={(e) => setNewQR({ ...newQR, type: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        >
          <option value="normal">Normal</option>
          <option value="special">Special</option>
        </select>
        <button
          onClick={handleAddQR}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          <Plus size={18} className="inline mr-1" /> Thêm QR
        </button>
      </div>

      {/* Bộ lọc + Sắp xếp */}
      <div className="flex gap-2 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded flex-1"
        >
          <option value="all">Tất cả loại</option>
          <option value="normal">Normal</option>
          <option value="special">Special</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded flex-1"
        >
          <option value="newest">Mới nhất</option>
          <option value="desc">Điểm giảm dần</option>
          <option value="asc">Điểm tăng dần</option>
        </select>
      </div>

      {/* Danh sách QR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSortedQRCodes.map(([code, data]) => {
          const scanUrl = `${window.location.origin}/api/qrcode/scan/${code}`;

          const labelStyle =
            data.type === "special"
              ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
              : "bg-blue-100 text-blue-800 border border-blue-300";

          const labelText = data.type === "special" ? "Special" : "Normal";

          return (
            <div
              key={code}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center border border-gray-100"
            >
              {/* QR code */}
              <QRCode value={scanUrl} size={140} className="mb-3" />

              {/* Label loại */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${labelStyle}`}
              >
                {labelText}
              </span>

              {/* Thông tin */}
              <h3 className="font-bold text-lg text-black">{code}</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold text-blue-600">
                  {data.points}
                </span>{" "}
                điểm
              </p>

              {/* Link */}
              <p className="text-xs text-gray-400 break-all bg-gray-50 p-2 rounded w-full mb-3">
                {scanUrl}
              </p>

              {/* Nút xóa */}
              <button
                onClick={() => handleDeleteQR(code)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 font-medium transition"
              >
                <Trash2 size={16} /> Xóa
              </button>
            </div>
          );
        })}

        {filteredAndSortedQRCodes.length === 0 && (
          <p className="p-4 text-gray-500">Không có QR code nào phù hợp</p>
        )}
      </div>
    </div>
  );
}
