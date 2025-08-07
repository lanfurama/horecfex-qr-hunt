"use client";

import ClientBottomNav from "@/components/ClientBottomNav";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-client";
import { ref, onValue } from "firebase/database";

function LayoutContent({ children }) {
  const { loading: authLoading } = useAuth();
  const [routeLoading, setRouteLoading] = useState(false);
  const pathname = usePathname();

  const [activeChallenge, setActiveChallenge] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Detect route change
  useEffect(() => {
    setRouteLoading(true);
    setRouteLoading(false);
  }, [pathname]);

  const showSpinner = authLoading || routeLoading;

  // Listen to hourlyChallenges
  useEffect(() => {
    const challengeRef = ref(db, "hourlyChallenges");
    const unsubscribe = onValue(challengeRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const now = new Date();
      let found = null;

      Object.entries(data).forEach(([id, value]) => {
        const challengeTime = new Date(id);
        const diffMs = challengeTime.getTime() - now.getTime();
        const diffSec = (Date.now() - new Date(id).getTime()) / 1000;

        if (diffSec >= 0 && diffSec <= 300) {
          found = {
            id,
            ...value,
            remaining: 300 - diffSec, // còn lại bao nhiêu giây
          };
        }
      });

      setActiveChallenge(found);
    });

    return () => unsubscribe();
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!activeChallenge) return;

    setCountdown(activeChallenge.remaining);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setActiveChallenge(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeChallenge]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      {/* Content */}
      {!showSpinner && children}

      {/* Spinner overlay */}
      {showSpinner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          <img
            src="/logo-event.svg"
            alt="Loading..."
            className="w-48 h-48 drop-shadow-lg animate-pulse"
          />
          <div className="mt-6 w-16 h-16 border-[6px] border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* 🟡 Active Challenge Banner */}
      {activeChallenge && (
        <ChallengeBanner activeChallenge={activeChallenge} countdown={countdown} />
      )}

      {/* Bottom Nav */}
      <ClientBottomNav onNavigate={() => setRouteLoading(true)} />
    </div>
  );
}

export function ChallengeBanner({ activeChallenge, countdown }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Khi có challenge mới thì luôn mở lại
  useEffect(() => {
    if (activeChallenge) {
      setIsCollapsed(false);
    }
  }, [activeChallenge]);

  if (!activeChallenge) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4">
      <div className="relative bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-100 text-black shadow-lg border border-yellow-400 px-4 py-3 max-w-sm mx-auto rounded-xl transition-all duration-300">
        
        {/* Nút toggle ẩn/hiện nội dung */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1 right-2 text-yellow-800 hover:text-yellow-900 text-sm font-bold"
        >
          <span className="text-2xl">
            {isCollapsed ? "⬇️" : "⬆️"}
          </span>
        </button>

        {/* Nội dung đầy đủ */}
        {!isCollapsed && (
          <>
            {/* Header */}
            <div className="flex items-center justify-center space-x-2 text-base font-bold text-yellow-900">
              <span className="text-2xl">🎯</span>
              <span>
                Thử thách: <span className="underline">{activeChallenge.type}</span>
              </span>
            </div>

            {/* Mô tả */}
            <div className="text-sm text-center mt-2 text-yellow-900 leading-snug">
              {activeChallenge.description}
            </div>
          </>
        )}

        {/* Đếm ngược luôn hiển thị */}
        <div className={`text-center mt-1 text-base font-semibold text-yellow-950 ${isCollapsed ? "mt-0" : ""}`}>
          ⏳ Còn lại:{" "}
          <b>
            {Number.isFinite(countdown)
              ? `${Math.floor(countdown / 60)}:${String(Math.floor(countdown % 60)).padStart(2, "0")}`
              : "—:—"}
          </b>
        </div>

        {/* Thanh tiến trình */}
        <div className="mt-2 h-1.5 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(countdown / 300) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
