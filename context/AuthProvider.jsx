"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase-client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, get } from "firebase/database";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ["/client/login", "/client/register"];
    if (publicPaths.includes(pathname)) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.replace(`/client/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      const snap = await get(ref(db, `players/${currentUser.uid}`));
      if (!snap.exists()) {
        await signOut(auth);
        router.replace(`/client/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      setUser(currentUser);
      setLoading(false);
    });

    return unsub;
  }, [pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
