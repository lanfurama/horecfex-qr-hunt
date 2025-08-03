"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [qrcodes, setQrcodes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("admin/login"); // 🔒 Chưa đăng nhập → login
        return;
      }

      const adminSnap = await get(ref(db, `admins/${user.uid}`));
      if (!adminSnap.exists()) {
        router.push("/"); // ❌ Không phải admin → về trang chủ
        return;
      }

      setIsAdmin(true);
      await loadData();
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    const usersSnap = await get(ref(db, "players"));
    const prizesSnap = await get(ref(db, "prizes"));
    const qrcodesSnap = await get(ref(db, "qrcodes"));

    setUsers(usersSnap.exists() ? Object.entries(usersSnap.val()) : []);
    setPrizes(prizesSnap.exists() ? Object.entries(prizesSnap.val()) : []);
    setQrcodes(qrcodesSnap.exists() ? Object.entries(qrcodesSnap.val()) : []);
  };

  if (loading) return <div className="p-8">Đang kiểm tra quyền truy cập...</div>;

  if (!isAdmin) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🎯 Admin Dashboard</h1>

      {/* Người chơi */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">👥 Người chơi</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Điểm</th>
              <th className="p-2 border">Quà</th>
            </tr>
          </thead>
          <tbody>
            {users.map(([uid, data]) => (
              <tr key={uid} className="bg-white hover:bg-gray-50">
                <td className="p-2 border">{data.name || "N/A"}</td>
                <td className="p-2 border">{data.points || 0}</td>
                <td className="p-2 border">
                  {data.prizes ? Object.keys(data.prizes).length : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Quà */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">🎁 Quà</h2>
        <ul>
          {prizes.map(([id, prize]) => (
            <li key={id} className="p-3 bg-white rounded shadow mb-2">
              <b>{prize.name}</b> - SL: {prize.quantity}
            </li>
          ))}
        </ul>
      </section>

      {/* QR Codes */}
      <section>
        <h2 className="text-2xl font-bold mb-4">📱 QR Codes</h2>
        <ul>
          {qrcodes.map(([id, qr]) => (
            <li key={id} className="p-3 bg-white rounded shadow mb-2">
              {id} - {qr.type}{" "}
              {qr.type === "gift"
                ? `(Gift: ${qr.giftId})`
                : `(+${qr.points} điểm)`}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
