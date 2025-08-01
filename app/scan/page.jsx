    "use client";
import { useState, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import dynamic from "next/dynamic";

export default function QRScanPage() {
  const [qrCode, setQrCode] = useState("");
  const [message, setMessage] = useState("");
  const [currentPoints, setCurrentPoints] = useState(0);
  const QrReader = dynamic(
    () => import("react-qr-reader").then((mod) => mod.QrReader || mod.default),
    { ssr: false }
  );

  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const snap = await get(ref(db, `players/${user.uid}/points`));
        if (snap.exists()) {
          setCurrentPoints(snap.val());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleScan = async () => {
    if (!qrCode) return;
    const user = auth.currentUser;
    if (!user) {
      setMessage("⚠ Bạn cần đăng nhập để chơi.");
      return;
    }

    try {
      // Lấy thông tin QR từ DB
      const qrSnap = await get(ref(db, `qrcodes/${qrCode}`));
      if (!qrSnap.exists()) {
        setMessage("❌ QR không hợp lệ.");
        return;
      }
      const qrData = qrSnap.val();
      let pointsToAdd = qrData.points || 0;

      // Kiểm tra giờ vàng
      const hourlySnap = await get(ref(db, "hourlyChallenges"));
      if (hourlySnap.exists()) {
        const challenges = hourlySnap.val();
        const now = new Date();
        for (let key in challenges) {
          const challengeTime = new Date(key);
          if (
            now >= challengeTime &&
            now <= new Date(challengeTime.getTime() + 60 * 60 * 1000)
          ) {
            if (challenges[key].challengeType === "double_points") {
              pointsToAdd *= 2;
            }
          }
        }
      }

      // Nếu là special challenge → giả sử người chơi thắng
      if (qrData.type === "special") {
        const win = true; // TODO: Mini game check
        pointsToAdd = win ? pointsToAdd * 2 : pointsToAdd;
      }

      // Cập nhật điểm
      const playerRef = ref(db, `players/${user.uid}`);
      const playerSnap = await get(playerRef);
      const oldPoints = playerSnap.exists() ? playerSnap.val().points || 0 : 0;
      const newPoints = oldPoints + pointsToAdd;

      await update(playerRef, {
        points: newPoints,
        [`scans/${qrCode}`]: {
          type: qrData.type,
          points: pointsToAdd,
          time: new Date().toISOString(),
        },
      });

      // Cập nhật leaderboard
      await update(ref(db, `leaderboard/${user.uid}`), {
        name: playerSnap.val()?.name || "Người chơi",
        points: newPoints,
      });

      setCurrentPoints(newPoints);
      setMessage(`🎉 +${pointsToAdd} điểm!`);
      setQrCode("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Lỗi khi quét QR.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-black text-center mb-4">
          Quét QR - Horecfex 2025
        </h1>
        <p className="text-center text-black/80 mb-6">
          Điểm hiện tại:{" "}
          <span className="font-bold text-black">{currentPoints}</span>
        </p>

        <QrReader
          delay={300}
          onResult={(result, error) => {
            if (!!result) {
              setQrCode(result?.text);
              handleScan(); // Tự gọi scan khi quét được
            }
            if (!!error) {
              // Ignore camera errors
            }
          }}
          style={{ width: "100%" }}
        />

        <button
          onClick={handleScan}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-black font-semibold py-3 rounded-xl shadow-lg transition-all"
        >
          Xác nhận
        </button>

        {message && (
          <p className="mt-4 text-center text-black font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
