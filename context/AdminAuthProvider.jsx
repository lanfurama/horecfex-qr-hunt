"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase-client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useRouter, usePathname } from "next/navigation";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ["/admin/login"];

    // Nếu là trang public thì bỏ qua check
    if (publicPaths.includes(pathname)) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Kiểm tra quyền admin
      const snap = await get(ref(db, `admins/${currentUser.uid}`));
      if (!snap.exists()) {
        await signOut(auth);
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return unsub;
  }, [pathname, router]);

  return (
    <AdminAuthContext.Provider value={{ user, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
