"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get, set, remove } from "firebase/database";
import { Gift, Plus, Trash2 } from "lucide-react";

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState({});
  const [loading, setLoading] = useState(true);
  const [newReward, setNewReward] = useState({
    name: "",
    pointsRequired: "",
    description: ""
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    const snap = await get(ref(db, "rewards"));
    if (snap.exists()) {
      setRewards(snap.val());
    } else {
      setRewards({});
    }
    setLoading(false);
  };

  const handleAddReward = async () => {
    if (!newReward.name || !newReward.pointsRequired || !newReward.description) {
      return alert("Nhập đầy đủ thông tin quà!");
    }
    const id = `reward_${Date.now()}`;
    await set(ref(db, `rewards/${id}`), {
      name: newReward.name,
      pointsRequired: parseInt(newReward.pointsRequired),
      description: newReward.description
    });
    setNewReward({ name: "", pointsRequired: "", description: "" });
    fetchRewards();
  };

  const handleDeleteReward = async (id) => {
    if (!confirm(`Xóa quà "${rewards[id].name}"?`)) return;
    await remove(ref(db, `rewards/${id}`));
    fetchRewards();
  };

  if (loading) return <div className="p-4 text-black">Đang tải...</div>;

  // Sắp xếp theo điểm tăng dần
  const sortedRewards = Object.entries(rewards).sort(
    (a, b) => a[1].pointsRequired - b[1].pointsRequired
  );

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
        <Gift size={22} /> Quản lý quà tặng
      </h1>

      {/* Form thêm quà */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2">Thêm quà mới</h2>
        <input
          placeholder="Tên quà"
          value={newReward.name}
          onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          placeholder="Điểm yêu cầu"
          type="number"
          value={newReward.pointsRequired}
          onChange={(e) =>
            setNewReward({ ...newReward, pointsRequired: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          placeholder="Mô tả"
          value={newReward.description}
          onChange={(e) =>
            setNewReward({ ...newReward, description: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <button
          onClick={handleAddReward}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center gap-1"
        >
          <Plus size={18} /> Thêm quà
        </button>
      </div>

      {/* Danh sách quà */}
      <div className="bg-white rounded-xl shadow divide-y">
        {sortedRewards.map(([id, reward]) => (
          <div
            key={id}
            className="p-4 flex justify-between items-center flex-wrap"
          >
            <div className="flex-1 min-w-[200px]">
              <p className="font-semibold">{reward.name}</p>
              <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                {reward.pointsRequired} điểm
              </span>
              <p className="mt-2 text-xs text-gray-500">{reward.description}</p>
            </div>
            <button
              onClick={() => handleDeleteReward(id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {sortedRewards.length === 0 && (
          <p className="p-4 text-gray-500">Chưa có quà nào</p>
        )}
      </div>
    </div>
  );
}
