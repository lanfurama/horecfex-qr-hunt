"use client";
import { useState, useRef, useCallback } from "react";
import { db } from "@/lib/firebase";
import { ref as dbRef, get } from "firebase/database";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function QRScanPage() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [status, setStatus] = useState({ loading: false, type: "info", message: "" });
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const lastScanRef = useRef("");
  const router = useRouter();

  // Lấy điểm khi vào trang
  useState(() => {
    if (!user) return;
    get(dbRef(db, `players/${user.uid}/points`)).then((snap) => {
      if (snap.exists()) setPoints(snap.val());
    });
  }, [user]);

  const extractCode = (input) => {
    try {
      const urlObj = new URL(input);
      return urlObj.searchParams.get("code") || input;
    } catch {
      return input;
    }
  };

  const handleScan = useCallback(
    async (qrCodeUrl) => {
      if (processing) return;
      setProcessing(true);

      const scannedCode = extractCode(qrCodeUrl).trim();
      if (!scannedCode || lastScanRef.current === scannedCode) {
        setProcessing(false);
        return;
      }
      lastScanRef.current = scannedCode;

      setStatus({ loading: true, type: "info", message: "Đang xử lý điểm..." });
      setScanning(false);

      try {
        const res = await fetch("/api/qrcode/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: scannedCode, uid: user.uid }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setPoints(data.totalPoints);
          setStatus({ loading: false, type: "success", message: `+${data.pointsAdded} điểm! 🎉` });
        } else if (data.alreadyScanned) {
          setStatus({ loading: false, type: "warning", message: "Bạn đã quét mã này rồi." });
        } else {
          setStatus({ loading: false, type: "error", message: data.error || "Lỗi khi quét QR." });
        }
      } catch {
        setStatus({ loading: false, type: "error", message: "❌ Lỗi kết nối API." });
      } finally {
        setProcessing(false);
      }
    },
    [processing, user]
  );

  const iconMap = {
    success: <CheckCircle2 className="text-green-400 w-16 h-16 mb-4" />,
    error: <XCircle className="text-red-400 w-16 h-16 mb-4" />,
    warning: <AlertTriangle className="text-yellow-400 w-16 h-16 mb-4" />,
    info: <Loader2 className="text-blue-400 w-14 h-14 mb-4 animate-spin" />,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-black text-white">
      <div className="px-4 py-2 bg-white/10 rounded-full">
        Điểm: <b>{points}</b>
      </div>

      {scanning ? (
        <div className="w-full max-w-sm border-4 border-purple-500 rounded-xl overflow-hidden">
          <Scanner
            constraints={{ facingMode: "environment" }}
            onScan={(codes) => {
              const code = codes[0]?.rawValue;
              if (code) handleScan(code);
            }}
            onError={(e) => {
              setStatus({ loading: false, type: "error", message: `❌ Lỗi camera: ${e?.message || e}` });
              setScanning(false);
            }}
            scanDelay={500}
          />
        </div>
      ) : (
        <div className="text-center flex flex-col items-center">
          {iconMap[status.type]}
          <p className="font-bold">{status.message}</p>
          {!status.loading && (
            <button
              onClick={() => {
                setScanning(true);
                setStatus({ loading: false, type: "info", message: "" });
                lastScanRef.current = "";
              }}
              className="mt-3 px-4 py-2 bg-purple-600 rounded-full hover:bg-purple-700"
            >
              🔄 Quét lại
            </button>
          )}
        </div>
      )}
    </div>
  );
}
