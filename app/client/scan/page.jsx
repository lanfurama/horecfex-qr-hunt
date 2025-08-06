"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/firebase-client";
import { ref as dbRef, get } from "firebase/database";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function QRScanPage() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });
  const scannerRef = useRef(null);
  const lastScanRef = useRef("");
  const scannerStartedRef = useRef(false);

  // Lấy điểm hiện tại khi user login
  useEffect(() => {
    if (!user) return;
    get(dbRef(db, `players/${user.uid}/points`)).then((snap) => {
      if (snap.exists()) setPoints(snap.val());
    });
  }, [user]);

  // Hàm xử lý khi scan thành công
  const handleScanSuccess = async (decodedText) => {
    if (lastScanRef.current === decodedText) return;
    lastScanRef.current = decodedText;

    setStatus({ type: "info", message: "⏳ Đang xử lý..." });

    try {
      const res = await fetch("/api/qrcode/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: decodedText, uid: user.uid }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPoints(data.totalPoints);
        setStatus({
          type: "success",
          message: `+${data.pointsAdded} điểm 🎉`,
        });
      } else if (data.alreadyScanned) {
        setStatus({
          type: "warning",
          message: "⚠️ Bạn đã quét mã này rồi.",
        });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Lỗi khi quét QR.",
        });
      }
    } catch {
      setStatus({ type: "error", message: "❌ Lỗi kết nối API." });
    }
  };

  // Khởi tạo scanner chỉ một lần sau khi user đã sẵn sàng
  useEffect(() => {
    if (!user || scannerStartedRef.current) return;
    scannerStartedRef.current = true;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        handleScanSuccess,
        () => {}
      )
      .catch((err) => {
        console.error("Lỗi khi start scanner", err);
        setStatus({
          type: "error",
          message: "Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.",
        });
      });

    return () => {
      // Chỉ stop nếu đang scanning
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [user]);

  const iconMap = {
    success: <CheckCircle2 className="text-green-400 w-14 h-14" />,
    error: <XCircle className="text-red-400 w-14 h-14" />,
    warning: <AlertTriangle className="text-yellow-400 w-14 h-14" />,
    info: <Loader2 className="text-blue-400 w-10 h-10 animate-spin" />,
  };

  // Nếu đang load auth thì hiển thị loading
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Nếu chưa đăng nhập
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Vui lòng đăng nhập để quét QR.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      {/* Khung quét */}
      <div
        id="qr-reader"
        className="w-full max-w-sm rounded-lg overflow-hidden border-3 border-purple-500 shadow-lg"
        style={{ aspectRatio: "4:3" }}
      ></div>

      {/* Trạng thái */}
      {status.message && (
        <div className="mt-4 flex items-center gap-2 text-lg font-medium">
          {iconMap[status.type]} {status.message}
        </div>
      )}
    </div>
  );
}
