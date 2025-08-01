"use client";
import { Home, Trophy, Gift, Camera, User } from "lucide-react";

export default function BottomNav({ active = "home" }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t shadow-lg rounded-t-2xl z-50">
      <div className="flex justify-around items-center relative">
        
        {/* Home */}
        <NavItem icon={<Home />} label="Trang chủ" active={active === "home"} href="/" />
        
        {/* Leaderboard */}
        <NavItem icon={<Trophy />} label="Xếp hạng" active={active === "leaderboard"} href="/leaderboard" />

        {/* Scan QR */}
        <a
          href="/scan"
          className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-full shadow-lg hover:scale-105 transition"
        >
          <Camera className="text-white w-6 h-6" />
        </a>

        {/* Rewards */}
        <NavItem icon={<Gift />} label="Đổi quà" active={active === "rewards"} href="/rewards" />

        {/* Profile */}
        <NavItem icon={<User />} label="Cá nhân" active={active === "profile"} href="/profile" />
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active, href }) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center py-2 text-xs transition ${
        active ? "text-indigo-500" : "text-gray-500 hover:text-indigo-400"
      }`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span>{label}</span>
    </a>
  );
}
