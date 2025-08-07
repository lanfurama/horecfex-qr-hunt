"use client";

import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuthProvider";
import AdminBottomNav from "@/components/AdminBottomNav";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

function LayoutContent({ children }) {
  const { loading: authLoading } = useAdminAuth();
  const [routeLoading, setRouteLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setRouteLoading(true);
    setRouteLoading(false);
  }, [pathname]);

  const showSpinner = authLoading || routeLoading;

  return (
    <div className="relative min-h-screen bg-gray-50">
      {!showSpinner && children}

      {showSpinner && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <img src="/logo-event.svg" className="w-48 h-48 animate-pulse" />
          <div className="mt-6 w-16 h-16 border-[6px] border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      <AdminBottomNav onNavigate={() => setRouteLoading(true)} />
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AdminAuthProvider>
  );
}
