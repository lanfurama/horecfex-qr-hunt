import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
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

    // Chuẩn hóa key quét
    const scannedCode = safeKey(extractCode(code));

    const playerRef = ref(db, `players/${uid}`);
    const playerSnap = await get(playerRef);

    // Kiểm tra đã quét chưa
    const scanRef = ref(db, `players/${uid}/scans/${scannedCode}`);
    const scanSnap = await get(scanRef);
    if (scanSnap.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "⚠ Bạn đã quét mã này rồi.",
          alreadyScanned: true
        },
        { status: 200 }
      );
    }

    console.log(`📡 API Scan: code=${scannedCode}, uid=${uid}`);

    // Lấy dữ liệu QR
    const qrRef = ref(db, `qrcodes/${scannedCode}`);
    const qrSnap = await get(qrRef);
    if (!qrSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "QR không hợp lệ" },
        { status: 400 }
      );
    }
    const qrData = qrSnap.val();

    // Tính điểm cơ bản
    let finalPoints = qrData.points || 0;

    // Bonus giờ vàng
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
            finalPoints *= 2;
          }
        }
      }
    }

    // Nếu là special → x2 tiếp
    if (qrData.type === "special") {
      finalPoints *= 2;
    }

    // Cập nhật điểm cho user
    const oldPoints = playerSnap.exists() ? playerSnap.val().points || 0 : 0;
    const newPoints = oldPoints + finalPoints;

    await update(playerRef, {
      points: newPoints,
      [`scans/${scannedCode}`]: {
        type: qrData.type,
        points: finalPoints,
        time: new Date().toISOString(),
      },
    });

    // Cập nhật leaderboard
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
