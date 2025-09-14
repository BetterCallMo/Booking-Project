"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "./auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login"); // إعادة توجيه لو مش مسجّل دخول
    }
  }, [router]);

  if (!isLoggedIn()) return null; // مش هيظهر حاجة لحين التحقق
  return <>{children}</>;
}
