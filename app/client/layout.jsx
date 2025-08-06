"use client";

import ClientBottomNav from "@/components/ClientBottomNav";
import LoadingSpinner from "@/components/LoadingSpinner";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

function LayoutContent({ children }) {
  const { loading: authLoading } = useAuth();
  const [routeLoading, setRouteLoading] = useState(false);
  const pathname = usePathname();

  // Khi pathname thay đổi => tắt spinner sau 300ms
  useEffect(() => {
    if (routeLoading) {
      const timer = setTimeout(() => setRouteLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, routeLoading]);

  const isLoading = authLoading || routeLoading;

  return (
    <div>
      <div>{isLoading ? <LoadingSpinner /> : children}</div>
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
