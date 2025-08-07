"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
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

  const [editingRewardId, setEditingRewardId] = useState(null);
  const [editingRewardData, setEditingRewardData] = useState({
    name: "",
    pointsRequired: "",
    description: ""
  });

  const fetchRewards = useCallback(async () => {
    const snap = await get(ref(db, "rewards"));
    setRewards(snap.exists() ? snap.val() : {});
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const handleAddReward = async () => {
    if (!newReward.name || !newReward.pointsRequired || !newReward.description) {
      return alert("Vui lòng nhập đầy đủ thông tin quà!");
    }
    const id = `reward_${Date.now()}`;
    await set(ref(db, `rewards/${id}`), {
      name: newReward.name,
      pointsRequired: parseInt(newReward.pointsRequired, 10),
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

  const startEditReward = (id, reward) => {
    setEditingRewardId(id);
    setEditingRewardData({
      name: reward.name,
      pointsRequired: reward.pointsRequired,
      description: reward.description
    });
  };

  const handleSaveEdit = async () => {
    await set(ref(db, `rewards/${editingRewardId}`), {
      name: editingRewardData.name,
      pointsRequired: parseInt(editingRewardData.pointsRequired, 10),
      description: editingRewardData.description
    });
    setEditingRewardId(null);
    setEditingRewardData({ name: "", pointsRequired: "", description: "" });
    fetchRewards();
  };

  const cancelEdit = () => {
    setEditingRewardId(null);
    setEditingRewardData({ name: "", pointsRequired: "", description: "" });
  };

  const sortedRewards = useMemo(
    () =>
      Object.entries(rewards).sort(
        (a, b) => a[1].pointsRequired - b[1].pointsRequired
      ),
    [rewards]
  );

  if (loading) return <div className="p-4 text-sm text-gray-600">Đang tải...</div>;

  return (
    <div className="p-3 pb-20">
      <h1 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Gift size={20} /> Quản lý quà tặng
      </h1>

      {/* Form thêm quà */}
      <div className="bg-white p-3 rounded-xl shadow-sm mb-5">
        <h2 className="font-medium mb-2 text-sm">Thêm quà mới</h2>
        <input
          placeholder="Tên quà"
          value={newReward.name}
          onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
          className="w-full mb-2 p-2 border rounded-md text-sm"
        />
        <input
          placeholder="Điểm yêu cầu"
          type="number"
          value={newReward.pointsRequired}
          onChange={(e) =>
            setNewReward({ ...newReward, pointsRequired: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded-md text-sm"
        />
        <textarea
          placeholder="Mô tả quà"
          value={newReward.description}
          onChange={(e) =>
            setNewReward({ ...newReward, description: e.target.value })
          }
          rows={2}
          className="w-full mb-2 p-2 border rounded-md text-sm"
        />
        <button
          onClick={handleAddReward}
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
        >
          <Plus size={16} /> Thêm quà
        </button>
      </div>

      {/* Danh sách quà */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedRewards.length > 0 ? (
          sortedRewards.map(([id, reward]) => (
            <div
              key={id}
              className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                {editingRewardId === id ? (
                  <div className="space-y-2 w-full">
                    <input
                      value={editingRewardData.name}
                      onChange={(e) =>
                        setEditingRewardData({
                          ...editingRewardData,
                          name: e.target.value
                        })
                      }
                      className="w-full p-1 text-sm border rounded"
                    />
                    <input
                      type="number"
                      value={editingRewardData.pointsRequired}
                      onChange={(e) =>
                        setEditingRewardData({
                          ...editingRewardData,
                          pointsRequired: e.target.value
                        })
                      }
                      className="w-full p-1 text-sm border rounded"
                    />
                    <textarea
                      value={editingRewardData.description}
                      onChange={(e) =>
                        setEditingRewardData({
                          ...editingRewardData,
                          description: e.target.value
                        })
                      }
                      className="w-full p-1 text-sm border rounded"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-300 text-gray-700 px-3 py-1 text-xs rounded hover:bg-gray-400"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{reward.name}</p>
                    <span className="bg-yellow-50 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {reward.pointsRequired} điểm
                    </span>
                    <p className="mt-2 text-xs text-gray-500 leading-snug">
                      {reward.description}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {editingRewardId === id ? null : (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => startEditReward(id, reward)}
                      className="text-blue-500 hover:text-blue-700 p-1 rounded-lg transition text-xs"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteReward(id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-gray-500 text-sm">Chưa có quà nào</p>
        )}
      </div>
    </div>
  );
}
