import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { code, uid } = await req.json();

    if (!code || !uid) {
      return Response.json({ success: false, error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const scanRef = ref(db, `players/${uid}/scans/${code}`);
    const scanSnap = await get(scanRef);

    if (scanSnap.exists()) {
      return Response.json({
        success: false,
        error: "⚠ Bạn đã quét mã này rồi.",
        alreadyScanned: true
      }, { status: 200 });
    }

    console.log(`📡 API Scan: code=${code}, uid=${uid}`);

    // Lấy dữ liệu QR
    const qrRef = ref(db, `qrcodes/${code}`);
    const qrSnap = await get(qrRef);
    if (!qrSnap.exists()) {
      return Response.json({ success: false, error: "QR không hợp lệ" }, { status: 400 });
    }

    const qrData = qrSnap.val();
    let pointsToAdd = qrData.points || 0;
    
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
            pointsToAdd *= 2;
          }
        }
      }
    }

    // Nếu là special
    if (qrData.type === "special") {
      pointsToAdd *= 2;
    }

    // Cập nhật điểm cho user
    const playerRef = ref(db, `players/${uid}`);
    const playerSnap = await get(playerRef);
    const oldPoints = playerSnap.exists() ? playerSnap.val().points || 0 : 0;
    const newPoints = oldPoints + pointsToAdd;

    await update(playerRef, {
      points: newPoints,
      [`scans/${code}`]: {
        type: qrData.type,
        points: pointsToAdd,
        time: new Date().toISOString(),
      },
    });

    // Cập nhật leaderboard
    await update(ref(db, `leaderboard/${uid}`), {
      name: playerSnap.val()?.name || "Người chơi",
      points: newPoints,
    });

    console.log(`✅ Cộng điểm thành công cho ${uid}: +${pointsToAdd}`);

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
      totalPoints: newPoints,
    });
  } catch (error) {
    console.error("❌ API Scan Error:", err);
    return Response.json({ success: false, error: "Lỗi server" }, { status: 500 });
  }
}
