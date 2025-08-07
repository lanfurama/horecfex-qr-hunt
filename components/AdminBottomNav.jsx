"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, QrCode, Users, Gift, Ticket } from "lucide-react";

export default function AdminBottomNav({ onNavigate }) {
  const pathname = usePathname();
  const isActive = (route) => pathname.startsWith(route);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 shadow-lg rounded-t-2xl z-50">
      <div className="relative flex justify-between items-center px-6 h-16">
        {/* Cụm trái */}
        <div className="flex gap-8">
          <NavItem
            icon={<Home size={22} />}
            label="Dashboard"
            active={isActive("/admin")}
            href="/admin"
            onNavigate={onNavigate}
          />
          <NavItem
            icon={<QrCode size={22} />}
            label="QR Codes"
            active={isActive("/admin/qrcodes")}
            href="/admin/qrcodes"
            onNavigate={onNavigate}
          />
        </div>

        {/* Cụm phải */}
        <div className="flex gap-8">
          <NavItem
            icon={<Users size={22} />}
            label="Người chơi"
            active={isActive("/admin/users")}
            href="/admin/users"
            onNavigate={onNavigate}
          />
          <NavItem
            icon={<Gift size={22} />}
            label="Quà"
            active={isActive("/admin/gifts")}
            href="/admin/gifts"
            onNavigate={onNavigate}
          />
        </div>

        {/* Nút Redeems - Nút nổi */}
        <Link
          href="/admin/redeems"
          onClick={onNavigate}
          className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg ring-4 ring-white hover:scale-110 active:scale-95 transition-all"
        >
          <Ticket className="w-7 h-7" />
        </Link>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active, href, onNavigate }) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        if (!active) {
          onNavigate?.();
        } else {
          e.preventDefault();
        }
      }}
      className={`flex flex-col items-center text-xs font-medium transition-all ${
        active
          ? "text-blue-600"
          : "text-gray-500 hover:text-blue-500"
      }`}
    >
      <div
        className={`mb-0.5 flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
          active ? "bg-blue-100" : "bg-transparent hover:bg-gray-100"
        }`}
      >
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
}
