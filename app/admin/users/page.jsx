"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snap = await get(ref(db, "players"));
    if (snap.exists()) {
      const data = snap.val();
      const list = Object.entries(data).map(([uid, info]) => ({
        uid,
        ...info,
        scansCount: info.scans ? Object.keys(info.scans).length : 0,
      }));
      list.sort((a, b) => (b.points || 0) - (a.points || 0)).reverse();
      setUsers(list);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold text-black mb-4">👥 Quản lý Người chơi</h1>

      {/* Ô tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm kiếm theo tên hoặc email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border rounded-lg mb-4"
      />

      {/* Danh sách dạng card mobile-first */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((u) => (
          <div
            key={u.uid}
            className="bg-white rounded-xl shadow p-4 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-lg">{u.name || "Chưa đặt tên"}</h2>
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                {u.points || 0} điểm
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{u.email}</p>
            <p className="text-gray-600 text-sm mb-3">
              Đã quét:{" "}
              <span className="font-medium">{u.scansCount} QR</span>
            </p>
            <button
              onClick={() => setSelectedUser(u)}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              📜 Xem lịch sử quét
            </button>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <p className="text-gray-500">Không tìm thấy người chơi</p>
        )}
      </div>

      {/* Modal lịch sử */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              📜 Lịch sử - {selectedUser.name}
            </h2>
            {selectedUser.scans ? (
              <ul className="space-y-2">
                {Object.entries(selectedUser.scans)
                  .sort((a, b) => new Date(b[1].time) - new Date(a[1].time))
                  .map(([qr, data]) => (
                    <li
                      key={qr}
                      className="p-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm"
                    >
                      <div>
                        <p className="font-medium">{qr}</p>
                        <p className="text-gray-500">
                          {new Date(data.time).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-blue-600 font-semibold">
                        +{data.points}đ
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-gray-500">Chưa quét QR nào</p>
            )}
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 w-full bg-gray-200 p-2 rounded-lg hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
