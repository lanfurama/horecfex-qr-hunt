import { db } from "@/lib/firebase";
import {
  ref,
  get,
  update,
  runTransaction,
  serverTimestamp,
} from "firebase/database";
import { NextResponse } from "next/server";

// Chuyển key thành an toàn cho Firebase
function safeKey(str) {
  return str.replace(/[.#$/[\]]/g, "_");
}

// Lấy code sạch từ URL hoặc chuỗi raw
function extractCode(input) {
  try {
    const urlObj = new URL(input);
    return urlObj.searchParams.get("code") || input.split("/").pop();
  } catch {
    return input;
  }
}

export async function POST(req) {
  try {
    const { code, uid } = await req.json();

    if (!code || !uid) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu" },
        { status: 400 }
      );
    }

    const scannedCode = safeKey(extractCode(code));
    const playerRef = ref(db, `players/${uid}`);
    const scanRef = ref(db, `players/${uid}/scans/${scannedCode}`);

    let alreadyScanned = false;

    // ⚠ Transaction để kiểm tra và khóa mã quét một lần duy nhất
    await runTransaction(scanRef, (currentData) => {
      if (currentData !== null) {
        alreadyScanned = true;
        return; // Hủy transaction
      }
      return {
        type: "pending",
        time: serverTimestamp(),
      };
    });

    if (alreadyScanned) {
      return NextResponse.json(
        {
          success: false,
          error: "⚠ Bạn đã quét mã này rồi.",
          alreadyScanned: true,
        },
        { status: 200 }
      );
    }

    console.log(`📡 API Scan: code=${scannedCode}, uid=${uid}`);

    // Lấy dữ liệu người chơi
    const playerSnap = await get(playerRef);
    const oldPoints = playerSnap.exists() ? playerSnap.val().points || 0 : 0;

    // Lấy thông tin mã QR
    const qrRef = ref(db, `qrcodes/${scannedCode}`);
    const qrSnap = await get(qrRef);
    if (!qrSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "QR không hợp lệ" },
        { status: 400 }
      );
    }
    const qrData = qrSnap.val();
    let finalPoints = qrData.points || 0;

    // Bonus giờ vàng (nếu có)
    const hourlySnap = await get(ref(db, "hourlyChallenges"));
      if (hourlySnap.exists()) {
        const challenges = hourlySnap.val();
        const now = new Date();

        for (let key in challenges) {
          const challengeTime = new Date(key);
          const diffSec = (now - challengeTime) / 1000;

          // Chỉ áp dụng nếu trong vòng 5 phút sau thời điểm challenge
          if (diffSec >= 0 && diffSec <= 300) {
            if (challenges[key].type === "double_points") {
              finalPoints *= 2;
            }
          }
        }
      }

    const newPoints = oldPoints + finalPoints;

    // Cập nhật điểm và thông tin quét cho người chơi
    await update(playerRef, {
      points: newPoints,
      [`scans/${scannedCode}`]: {
        type: qrData.type,
        points: finalPoints,
        time: serverTimestamp(),
      },
    });

    // Cập nhật bảng xếp hạng
    await update(ref(db, `leaderboard/${uid}`), {
      name: playerSnap.val()?.name || "Người chơi",
      points: newPoints,
    });

    console.log(`✅ Cộng điểm thành công cho ${uid}: +${finalPoints}`);

    return NextResponse.json({
      success: true,
      pointsAdded: finalPoints,
      totalPoints: newPoints,
    });
  } catch (error) {
    console.error("❌ API Scan Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi server" },
      { status: 500 }
    );
  }
}
