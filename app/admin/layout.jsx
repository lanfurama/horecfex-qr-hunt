"use client";
import { auth, db } from "@/lib/firebase-client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminBottomNav from "@/components/AdminBottomNav";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        router.replace("/admin/login");
        return;
      }

      try {
        const snap = await get(ref(db, `admins/${user.uid}`));
        if (!snap.exists()) {
          await signOut(auth);
          setLoading(false);
          router.replace("/admin/login");
          return;
        }

        setLoading(false); // ✅ admin hợp lệ
      } catch (error) {
        console.error("Lỗi kiểm tra quyền admin:", error);
        setLoading(false);
        router.replace("/admin/login");
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) return <LoadingSpinner />;

  return (
  <div className="h-screen flex flex-col bg-gray-50">
    <div className="flex-1 overflow-y-auto pb-20">
      {children}
    </div>
    <AdminBottomNav />
  </div>
);
}
