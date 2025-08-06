"use client";
import { db } from "@/lib/firebase-client";
import { useEffect, useState } from "react";
import { ref, get, query, orderByChild, equalTo, onValue } from "firebase/database";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [redeems, setRedeems] = useState([]);
  const [activeTab, setActiveTab] = useState("scan");
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Lấy thông tin người chơi
    get(ref(db, `players/${user.uid}`)).then((snap) => {
      if (snap.exists()) {
        setPlayer({ uid: user.uid, ...snap.val() });
      }
    });

    // Lấy lịch sử đổi quà
    const redeemRef = query(ref(db, "redeems"), orderByChild("uid"), equalTo(user.uid));
    onValue(redeemRef, (snap) => {
      if (snap.exists()) {
        const data = [];
        snap.forEach((child) => data.push({ id: child.key, ...child.val() }));
        setRedeems(data.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setRedeems([]);
      }
    });
  }, [user]);

  const handleLogout = async () => {
    await signOut(user.auth);
    router.push("/client/login");
  };

  if (!player) {
    return (
      <div className="text-center text-white mt-10">
        ⏳ Đang tải thông tin...
      </div>
    );
  }

  const StatusBadge = ({ status }) => {
    const map = {
      confirmed: { text: "Đã nhận", color: "text-green-400" },
      pending: { text: "Chờ duyệt", color: "text-yellow-400" },
      rejected: { text: "Từ chối", color: "text-red-400" },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`text-xs font-semibold ${s.color}`}>
        {s.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black p-3 pb-20 text-white">
      {/* Header */}
      <div className="bg-white/5 rounded-2xl p-4 relative">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full"
        >
          <LogOut className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-4">
          {/* Avatar chữ cái đầu */}
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {player.name?.charAt(0) || "?"}
          </div>

          <div>
            <h1 className="text-lg font-semibold">{player.name}</h1>
            <p className="text-sm text-gray-300">{player.email}</p>
            <p className="text-sm text-gray-300">{player.phone}</p>
          </div>
        </div>

        {/* Điểm */}
        <div className="mt-4">
          <span className="px-3 py-1 rounded-lg bg-yellow-400/20 text-yellow-300 font-semibold text-sm">
            Điểm hiện tại: {player.points}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex border-b border-white/10 mb-4">
          {["scan", "redeem"].map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-yellow-300 text-yellow-300"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "scan" ? "Lịch sử quét QR" : "Lịch sử đổi quà"}
            </button>
          ))}
        </div>

        {/* Scan History */}
        {activeTab === "scan" && (
          <div className="space-y-3">
            {player.scans ? (
              Object.entries(player.scans)
                .sort((a, b) => new Date(b[1].time) - new Date(a[1].time))
                .map(([qr, data]) => (
                  <div
                    key={qr}
                    className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {qr}{" "}
                        <span className="text-yellow-300 font-semibold">
                          +{data.points} điểm
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(data.time).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-lg">📱</span>
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-400">📭 Chưa quét QR nào</p>
            )}
          </div>
        )}

        {/* Redeem History */}
        {activeTab === "redeem" && (
          <div className="space-y-3">
            {redeems.length > 0 ? (
              redeems.map((r) => (
                <div
                  key={r.id}
                  className="bg-white/5 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{r.rewardName}</p>
                    <p className="text-sm text-yellow-300">
                      -{r.pointsUsed} điểm
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Mã: <span className="font-mono">{r.redeemCode}</span>
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">📭 Chưa đổi quà nào</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
