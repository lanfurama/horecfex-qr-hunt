"use client";
import { useState, useRef, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { db, auth } from "@/lib/firebase";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function QRScanPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPoints, setCurrentPoints] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const lastScanRef = useRef("");

  // Lấy điểm hiện tại của user
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

  // Xử lý quét QR
  const handleScan = async (qrCodeUrl) => {
    alert(`Mã QR quét được: ${qrCodeUrl}`);
    // if (processing) return;
    // setProcessing(true);
    // setError("");
    // setMessage("");

    // const user = auth.currentUser;
    // if (!user) {
    //   setError("⚠ Bạn cần đăng nhập để chơi.");
    //   setScanning(false);
    //   setProcessing(false);
    //   return;
    // }

    // try {
    //   console.log("📡 Gọi API scan...");
    //   const res = await fetch("/api/qrcode/scan", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ code, uid: user.uid }),
    //   });

    //   const data = await res.json();
    //   console.log("📦 API Response:", data);

    //   if (!res.ok || !data.success) {
    //     setError(data.error || "❌ Lỗi khi quét QR.");
    //     setScanning(false);
    //     return;
    //   }

    //   setCurrentPoints(data.totalPoints);
    //   setMessage(`🎉 +${data.pointsAdded} điểm!`);
    //   setScanning(false);
    // } catch (err) {
    //   console.error(err);
    //   setError("❌ Lỗi kết nối API.");
    //   setScanning(false);
    // } finally {
    //   setProcessing(false);
    // }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white">
      {/* Điểm hiện tại */}
      <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-purple-500/50 mb-6">
        Điểm hiện tại: <span className="font-bold">{currentPoints}</span>
      </div>

      {/* Khung quét */}
      {scanning ? (
        <div className="relative w-full max-w-md rounded-2xl overflow-hidden border-4 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.8)]">
          <Scanner
            constraints={{ facingMode: "environment" }}
            onScan={(detectedCodes) => {
              const result = detectedCodes[0]?.rawValue;
              if (result) handleScan(result.trim());
            }}
            onError={(err) => {
              console.error("Scanner error:", err);
              setError(`❌ Lỗi camera: ${err?.message || err}`);
              setScanning(false);
            }}
            scanDelay={500}
            allowMultiple={false}
            styles={{ container: { width: "100%" } }}
          />
        </div>
      ) : (
        <div className="text-center my-6">
          {message && <p className="text-green-400 font-bold text-lg">{message}</p>}
          {error && <p className="text-red-400 font-bold text-lg">{error}</p>}
          <button
            onClick={() => {
              setScanning(true);
              setError("");
              setMessage("");
              lastScanRef.current = "";
            }}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full"
          >
            🔄 Quét lại
          </button>
        </div>
      )}
    </div>
  );
}
