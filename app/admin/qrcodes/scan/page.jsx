"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export default function AdminQRScanTestPage() {
  const [result, setResult] = useState("");
  const [qrData, setQrData] = useState(null);
  const searchParams = useSearchParams();
  const presetCode = searchParams.get("code");

  const QrReader = dynamic(
    () => import("react-qr-reader").then((mod) => mod.QrReader || mod.default),
    { ssr: false }
  );

  useEffect(() => {
    if (presetCode) {
      fetchQRInfo(presetCode);
    }
  }, [presetCode]);

  const fetchQRInfo = async (code) => {
    const snap = await get(ref(db, `qrcodes/${code}`));
    if (snap.exists()) {
      setQrData(snap.val());
    } else {
      setQrData(null);
    }
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-4">📷 Quét thử QR</h1>

      <QrReader
        constraints={{ facingMode: "environment" }}
        onResult={(res, err) => {
          if (!!res) {
            setResult(res.text);
            fetchQRInfo(res.text);
          }
        }}
        style={{ width: "100%" }}
      />

      {result && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <p className="font-semibold">Kết quả: {result}</p>
          {qrData ? (
            <p className="text-green-600">
              {qrData.points} điểm • {qrData.type}
            </p>
          ) : (
            <p className="text-red-500">QR này chưa được đăng ký</p>
          )}
        </div>
      )}
    </div>
  );
}
