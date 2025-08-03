"use client";
import { usePathname } from "next/navigation";
import { Home, QrCode, Users, Gift, Ticket } from "lucide-react";

export default function AdminBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", icon: <Home size={22} />, label: "Dashboard" },
    { href: "/admin/qrcodes", icon: <QrCode size={22} />, label: "QR Codes" },
    { href: "/admin/users", icon: <Users size={22} />, label: "Người chơi" },
    { href: "/admin/gifts", icon: <Gift size={22} />, label: "Quà" },
    { href: "/admin/redeems", icon: <Ticket size={22} />, label: "Redeems" }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t shadow-lg rounded-t-2xl z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive}
            />
          );
        })}
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
