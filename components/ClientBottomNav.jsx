"use client";
import { Home, Trophy, Gift, QrCode, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ClientBottomNav({ onNavigate }) {
  const pathname = usePathname();
  const isActive = (route) => pathname === route;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t shadow-lg rounded-t-2xl z-50">
      <div className="relative flex justify-between items-center px-6 h-16">
        {/* Cụm trái */}
        <div className="flex gap-8">
          <NavItem
            icon={<Home size={22} />}
            label="Trang chủ"
            active={isActive("/client")}
            href="/client"
            onNavigate={onNavigate}
          />
          <NavItem
            icon={<Trophy size={22} />}
            label="Xếp hạng"
            active={isActive("/client/leaderboard")}
            href="/client/leaderboard"
            onNavigate={onNavigate}
          />
        </div>

        {/* Cụm phải */}
        <div className="flex gap-8">
          <NavItem
            icon={<Gift size={22} />}
            label="Đổi quà"
            active={isActive("/client/rewards")}
            href="/client/rewards"
            onNavigate={onNavigate}
          />
          <NavItem
            icon={<User size={22} />}
            label="Cá nhân"
            active={isActive("/client/profile")}
            href="/client/profile"
            onNavigate={onNavigate}
          />
        </div>

        {/* Scan QR - Nút nổi */}
        <Link
          href="/client/scan"
          onClick={onNavigate}
          className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg ring-4 ring-white hover:scale-105 active:scale-95 transition-all"
        >
          <QrCode className="w-7 h-7" />
        </Link>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active, href, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex flex-col items-center text-xs transition-colors ${
        active
          ? "text-indigo-500 font-semibold"
          : "text-gray-500 hover:text-indigo-400"
      }`}
    >
      <div className="mb-0.5">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
