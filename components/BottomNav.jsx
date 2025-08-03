"use client";
import { Home, Trophy, Gift, QrCode, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route) => pathname === route;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t shadow-lg rounded-t-2xl z-50">
      <div className="flex justify-around items-center relative h-16">
        {/* Home */}
        <NavItem
          icon={<Home size={22} />}
          label="Trang chủ"
          active={isActive("/client")}
          href="/client"
        />

        {/* Leaderboard */}
        <NavItem
          icon={<Trophy size={22} />}
          label="Xếp hạng"
          active={isActive("/client/leaderboard")}
          href="/client/leaderboard"
        />

        {/* Scan QR (nổi bật ở giữa) */}
        <a
          href="/client/scan"
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-full shadow-lg hover:scale-105 transition-all border-4 border-white"
        >
          <QrCode className="text-white w-6 h-6" />
        </a>

        {/* Rewards */}
        <NavItem
          icon={<Gift size={22} />}
          label="Đổi quà"
          active={isActive("/client/rewards")}
          href="/client/rewards"
        />

        {/* Profile */}
        <NavItem
          icon={<User size={22} />}
          label="Cá nhân"
          active={isActive("/client/profile")}
          href="/client/profile"
        />
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active, href }) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center text-xs transition-colors ${
        active
          ? "text-indigo-500 font-semibold"
          : "text-gray-500 hover:text-indigo-400"
      }`}
    >
      <div className="mb-0.5">{icon}</div>
      <span>{label}</span>
    </a>
  );
}
