"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-client";
import { ref, onValue, push, remove } from "firebase/database";

export default function HourlyChallengesAdmin() {
  const [challenges, setChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState({
    type: "",
    description: "",
    time: "",
  });

  useEffect(() => {
    const challengesRef = ref(db, "hourlyChallenges");
    const unsubscribe = onValue(challengesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setChallenges(loaded);
      } else {
        setChallenges([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const addChallenge = async () => {
    if (!newChallenge.type || !newChallenge.description || !newChallenge.time) return;
    await push(ref(db, "hourlyChallenges"), newChallenge);
    setNewChallenge({ type: "", description: "", time: "" });
  };

  const deleteChallenge = async (id) => {
    await remove(ref(db, `hourlyChallenges/${id}`));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🎯 Admin - Hourly Challenges</h1>

      <div className="mb-6 space-y-3 bg-white/10 p-4 rounded-xl">
        <h2 className="text-xl font-semibold">➕ Thêm thử thách</h2>
        <input
          type="text"
          placeholder="Loại (type)"
          value={newChallenge.type}
          onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
        />
        <input
          type="text"
          placeholder="Mô tả (description)"
          value={newChallenge.description}
          onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
        />
        <input
          type="time"
          value={newChallenge.time}
          onChange={(e) => setNewChallenge({ ...newChallenge, time: e.target.value })}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
        />
        <button
          onClick={addChallenge}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
        >
          ✅ Thêm mới
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">📋 Danh sách thử thách</h2>
      <ul className="space-y-3">
        {challenges.map((item) => (
          <li
            key={item.id}
            className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-start"
          >
            <div>
              <p className="font-bold">⏰ {item.time}</p>
              <p className="text-sm text-yellow-300">Loại: {item.type}</p>
              <p className="text-sm">{item.description}</p>
            </div>
            <button
              onClick={() => deleteChallenge(item.id)}
              className="text-red-400 hover:text-red-600 font-bold text-lg"
              title="Xóa"
            >
              ❌
            </button>
          </li>
        ))}
        {!challenges.length && (
          <li className="text-gray-400 text-center italic">Không có thử thách nào</li>
        )}
      </ul>
    </div>
  );
}
