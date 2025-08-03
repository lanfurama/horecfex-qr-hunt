"use client";

import "./globals.css";
import ConditionalBottomNav from "@/components/ConditionalBottomNav";
import { auth, db } from "@/lib/firebase-client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/client/login") {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      const goLogin = () => router.replace("/client/login");

      try {
        if (!user) return goLogin();

        const snap = await get(ref(db, `players/${user.uid}`));
        if (!snap.exists()) {
          await signOut(auth);
          return goLogin();
        }

        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        goLogin();
      }
    });

    return unsub;
  }, [pathname, router]);

  return (
        <div className="max-w-sm mx-auto bg-white h-screen flex flex-col">
          {/* Nội dung */}
          <div className="flex-1 overflow-y-auto pb-20">
            {loading ? (
              <LoadingSpinner />
            ) : (
              children
            )}
          </div>

          {/* Nav luôn render */}
          <ConditionalBottomNav />
        </div>
  );
}
