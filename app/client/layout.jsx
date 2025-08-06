"use client";

import ClientBottomNav from "@/components/ClientBottomNav";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function LayoutContent({ children }) {
  const { loading: authLoading } = useAuth();
  const [routeLoading, setRouteLoading] = useState(false);
  const pathname = usePathname();

  // Bật route loading khi pathname đổi
  useEffect(() => {
    setRouteLoading(true);

    // Khi component mới render xong, route loading sẽ tự tắt
    // Bởi vì useEffect chạy sau khi UI update
    setRouteLoading(false);
  }, [pathname]);

  const showSpinner = authLoading || routeLoading;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      {/* Nội dung */}
      {!showSpinner && children}

      {/* Spinner overlay */}
      {showSpinner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          {/* Logo */}
          <img
            src="/logo-event.svg"
            alt="Loading..."
            className="w-48 h-48 drop-shadow-lg animate-pulse"
          />

          {/* Spinner */}
          <div className="mt-6 w-16 h-16 border-[6px] border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Bottom Navigation */}
      <ClientBottomNav onNavigate={() => setRouteLoading(true)} />
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
