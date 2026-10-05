"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const publicPaths = ["/login", "/register", "/forgot-password", "/terms", "/privacy", "/"];
    // Allow home page and scholarship detail pages (/scholarships/123)
    // But protect the main scholarship list (/scholarships) and others
    const isDetailPath = pathname.startsWith("/scholarships/") && pathname !== "/scholarships";
    const isPublicPath = publicPaths.includes(pathname) || isDetailPath;

    if (!loading) {
      if (!user) {
        if (!isPublicPath) {
          router.push("/login");
        }
      } else {
        if (pathname === "/login" || pathname === "/register") {
          router.push("/");
        }
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const publicPaths = ["/login", "/register", "/forgot-password", "/terms", "/privacy", "/"];
  const isDetailPath = pathname.startsWith("/scholarships/") && pathname !== "/scholarships";
  const isPublicPath = publicPaths.includes(pathname) || isDetailPath;

  if (!user && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
