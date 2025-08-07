"use client";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/lib/firebase-client";
import { ref as dbRef, get } from "firebase/database";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useToast } from "@/context/ToastProvider";
import { useRouter } from "next/navigation";

export default function QRScanPage() {
  const { user } = useAuth();
  const { triggerToast } = useToast();
  const router = useRouter();

  const [points, setPoints] = useState(0);
  const [status, setStatus] = useState({ type: "", message: "" });

  const scannerRef = useRef(null);
  const scannerStartedRef = useRef(false);
  const recentScansRef = useRef(new Set());

  // Lấy điểm khi user đăng nhập (TC01)
  useEffect(() => {
    if (!user) return;
    get(dbRef(db, `players/${user.uid}/points`)).then((snap) => {
      if (snap.exists()) setPoints(snap.val());
    });
  }, [user]);

  const handleScanSuccess = async (decodedText) => {
    // TC08: Chặn spam quét
    if (!decodedText || recentScansRef.current.has(decodedText)) return;

    recentScansRef.current.add(decodedText);
    setTimeout(() => recentScansRef.current.delete(decodedText), 5000);

    setStatus({ type: "info", message: "Đang xử lý mã QR..." });

    try {
      const res = await fetch("/api/qrcode/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: decodedText, uid: user.uid }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // TC01: Cộng điểm nếu thành công
        setPoints(data.totalPoints);
        setStatus({ type: "success", message: `+${data.pointsAdded} điểm 🎉` });
        triggerToast(`+${data.pointsAdded} điểm 🎉`, "success");
      } else if (data.alreadyScanned) {
        // TC02, TC06, TC07: Đã quét rồi
        setStatus({ type: "warning", message: "Bạn đã quét mã này rồi." });
        triggerToast("⚠️ Bạn đã quét mã này rồi.", "warning");
      } else {
        // TC03: Mã không hợp lệ
        setStatus({ type: "error", message: data.error || "QR không hợp lệ." });
        triggerToast(data.error || "❌ QR không hợp lệ.", "error");
      }
    } catch {
      // Không có internet
      setStatus({ type: "error", message: "Không có kết nối internet." });
      triggerToast("❌ Không có kết nối internet.", "error");
    }
  };

  useEffect(() => {
    if (!user || scannerStartedRef.current) return;
    scannerStartedRef.current = true;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    // TC05: Xử lý lỗi quét không rõ mã
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 4.3 },
        handleScanSuccess,
        (errMessage) => {
          if (
            errMessage?.includes("decode") ||
            errMessage?.includes("NotFoundException")
          ) {
            setStatus({
              type: "error",
              message: "Không nhận diện được mã QR. Hãy thử lại.",
            });
          }
        }
      )
      .catch((err) => {
        console.error("Lỗi khi start scanner", err);
        setStatus({
          type: "error",
          message:
            "Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.",
        });
      });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [user]);

  const iconMap = {
    success: <CheckCircle2 className="text-green-400 w-6 h-6" />,
    error: <XCircle className="text-red-400 w-6 h-6" />,
    warning: <AlertTriangle className="text-yellow-400 w-6 h-6" />,
    info: <Loader2 className="text-blue-400 w-6 h-6 animate-spin" />,
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 pt-4">
      {/* Điểm số */}
      <div className="mb-4 px-4 py-2 bg-purple-700 rounded-xl text-white font-bold text-xl shadow-md">
        🎯 Điểm của bạn: <span className="text-yellow-300">{points}</span>
      </div>

      {/* Camera quét */}
      <div
        id="qr-reader"
        className="rounded-2xl overflow-hidden border-4 border-purple-500 shadow-xl"
        style={{ width: "300px", height: "400px" }}
      ></div>

      {/* Thông báo trạng thái */}
      {status.message && (
        <div className="mt-5 flex items-center gap-2 text-sm font-medium bg-white text-black px-4 py-2 rounded-md shadow">
          {iconMap[status.type]} <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
