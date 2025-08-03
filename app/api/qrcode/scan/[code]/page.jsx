"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function ScanCodePage() {
  const { code } = useParams();
  const router = useRouter();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace(`/client/login?redirect=/client/scan/${code}`);
      } else {
        router.replace(`/api/qrcode/scan/process?code=${code}`);
      }
    });

    return () => unsub();
  }, [code, router]);

  return <p className="text-center mt-20">🔍 Đang kiểm tra đăng nhập...</p>;
}
