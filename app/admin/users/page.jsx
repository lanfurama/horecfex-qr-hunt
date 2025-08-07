"use client";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase-client";
import { ref, get } from "firebase/database";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, Clock } from "lucide-react";

function UserCard({ user, onViewHistory }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 flex flex-col gap-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-base truncate">
          {user.name || "Chưa đặt tên"}
        </h2>
        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
          {user.points || 0} điểm
        </span>
      </div>

      {/* Email */}
      {user.email && (
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      )}

      {/* Scan count */}
      <p className="text-xs text-gray-600">
        Đã quét:{" "}
        <span className="font-medium">{user.scansCount} QR</span>
      </p>

      {/* Button */}
      <button
        onClick={() => onViewHistory(user)}
        className="self-start flex items-center gap-1 text-xs px-3 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
      >
        <Clock size={14} /> Lịch sử
      </button>
    </div>
  );
}

function ScanHistoryModal({ user, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-base font-semibold mb-3">
          Lịch sử quét - {user.name || "Ẩn danh"}
        </h2>
        {user.scans ? (
          <ul className="space-y-1">
            {Object.entries(user.scans)
              .sort((a, b) => new Date(b[1].time) - new Date(a[1].time))
              .map(([qr, data]) => (
                <li
                  key={qr}
                  className="p-2 bg-gray-50 rounded-md flex justify-between items-center text-xs"
                >
                  <div>
                    <p className="font-medium">{qr}</p>
                    <p className="text-gray-500">
                      {new Date(data.time).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  <span className="text-blue-600 font-semibold">
                    +{data.points}đ
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Chưa quét QR nào</p>
        )}
        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-200 p-1.5 rounded-md hover:bg-gray-300 text-sm"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    const snap = await get(ref(db, "players"));
    if (snap.exists()) {
      const data = snap.val();
      const list = Object.entries(data).map(([uid, info]) => ({
        uid,
        ...info,
        scansCount: info.scans ? Object.keys(info.scans).length : 0,
      }));
      list.sort((a, b) => (b.points || 0) - (a.points || 0));
      setUsers(list);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-3 pb-20">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">
        Quản lý Người chơi
      </h1>

      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 border rounded-md text-sm"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => (
            <UserCard key={u.uid} user={u} onViewHistory={setSelectedUser} />
          ))
        ) : (
          <p className="text-gray-500 text-sm">
            Không tìm thấy người chơi
          </p>
        )}
      </div>

      {/* Modal */}
      {selectedUser && (
        <ScanHistoryModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
