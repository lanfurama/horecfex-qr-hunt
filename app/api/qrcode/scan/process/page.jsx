"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function ProcessScanPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState({
    loading: true,
    type: "info", // info, success, error, warning
    message: "Đang xử lý điểm..."
  });

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      setStatus({
        loading: false,
        type: "error",
        message: "Không tìm thấy mã QR."
      });
      return;
    }

    const processScan = async () => {
      const user = auth.currentUser;
      if (!user) {
        setStatus({
          loading: false,
          type: "warning",
          message: "Bạn cần đăng nhập để quét mã này."
        });
        router.replace(`/client/login?redirect=/client/scan/${code}`);
        return;
      }

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
            message: `+${data.pointsAdded} điểm! 🎉`
          });
        } else if (data.alreadyScanned) {
          setStatus({
            loading: false,
            type: "warning",
            message: "Bạn đã quét mã này rồi."
          });
        } else {
          setStatus({
            loading: false,
            type: "error",
            message: data.error || "Lỗi khi quét QR."
          });
        }
      } catch (err) {
        setStatus({
          loading: false,
          type: "error",
          message: "Lỗi kết nối server."
        });
      }
    };

    processScan();
  }, [params, router]);

  const iconMap = {
    success: <CheckCircle2 className="text-green-400 w-20 h-20 mb-4" />,
    error: <XCircle className="text-red-400 w-20 h-20 mb-4" />,
    warning: <AlertTriangle className="text-yellow-400 w-20 h-20 mb-4" />,
    info: <Loader2 className="text-blue-400 w-16 h-16 mb-4 animate-spin" />,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 via-purple-900 to-black px-6 text-white">
      <div className="max-w-xs w-full flex flex-col items-center text-center">
        
        {iconMap[status.type]}
        <p className="text-xl font-bold mb-2">{status.message}</p>

        {status.type === "success" && (
          <p className="text-sm text-green-300">Điểm của bạn đã được cộng!</p>
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
