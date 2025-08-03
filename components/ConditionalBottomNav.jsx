"use client";
import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import AdminBottomNav from "@/components/AdminBottomNav";

export default function ConditionalBottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return null; // Không hiện nav khi đang ở trang login admin
    return <AdminBottomNav />;
  }

  // Nav của user
  if (pathname.startsWith("/login")) return null; // Không hiện khi ở trang login user
  return <BottomNav />;
}
