"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useAuth } from "@/context/AuthProvider";

export default function ScanCodePage() {
  const { code } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const { width, height } = useWindowSize();

  const [showConfetti, setShowConfetti] = useState(false);
  const [displayPoints, setDisplayPoints] = useState(0);
  const [status, setStatus] = useState({
    loading: true,
    type: "info",
    message: "Đang xử lý điểm...",
    pointsAdded: 0
  });

  const animatePoints = (target) => {
    let startTime = performance.now();
    const duration = 800;
    const step = (timestamp) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplayPoints(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!user) return; // Đã check ở layout, nhưng để an toàn

    const fetchPoints = async () => {
      try {
        const res = await fetch("/api/qrcode/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, uid: user.uid }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setStatus({
            loading: false,
            type: "success",
            message: `+${data.pointsAdded} điểm! 🎉`,
            pointsAdded: data.pointsAdded
          });
          setShowConfetti(true);
          animatePoints(data.pointsAdded);
          setTimeout(() => setShowConfetti(false), 3000);
        } else if (data.alreadyScanned) {
          setStatus({
            loading: false,
            type: "warning",
            message: "Bạn đã quét mã này rồi.",
            pointsAdded: 0
          });
        } else {
          setStatus({
            loading: false,
            type: "error",
            message: data.error || "Lỗi khi quét QR.",
            pointsAdded: 0
          });
        }
      } catch {
        setStatus({
          loading: false,
          type: "error",
          message: "Lỗi kết nối server.",
          pointsAdded: 0
        });
      }
    };

    fetchPoints();
  }, [code, user]);

  const iconMap = {
    success: <CheckCircle2 className="text-green-400 w-20 h-20 mb-4" />,
    error: <XCircle className="text-red-400 w-20 h-20 mb-4" />,
    warning: <AlertTriangle className="text-yellow-400 w-20 h-20 mb-4" />,
    info: <Loader2 className="text-blue-400 w-16 h-16 mb-4 animate-spin" />,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-black px-6 text-white relative">
      {showConfetti && <Confetti width={width} height={height} />}

      <div className="max-w-xs w-full flex flex-col items-center text-center">
        {iconMap[status.type]}
        <p className="text-xl font-bold mb-2">{status.message}</p>

        {status.type === "success" && (
          <>
            <p className="text-4xl font-extrabold text-green-300 mb-2 animate-bounce">
              +{displayPoints}
            </p>
            <p className="text-sm text-green-300">Điểm của bạn đã được cộng!</p>
          </>
        )}
        {status.type === "warning" && (
          <p className="text-sm text-yellow-300">Thử quét mã khác để nhận điểm mới.</p>
        )}
        {status.type === "error" && (
          <p className="text-sm text-red-300">Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
        )}

        {!status.loading && (
          <button
            onClick={() => router.push("/client/scan")}
            className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full font-semibold transition-colors"
          >
            🔄 Quét mã khác
          </button>
        )}
      </div>
    </div>
  );
}
