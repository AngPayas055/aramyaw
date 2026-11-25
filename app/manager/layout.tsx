"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";

type Access = "loading" | "guest" | "manager" | "admin" | "player";

function getSnapshot(): Access {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (!token || !storedUser) return "guest";

  try {
    const role = JSON.parse(storedUser)?.role;
    if (role === "admin") return "admin";
    if (role === "player") return "player";
    return "manager";
  } catch {
    return "guest";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("auth-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("auth-change", onChange);
  };
}

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const access = useSyncExternalStore(subscribe, getSnapshot, () => "loading");

  useEffect(() => {
    if (access === "guest") router.replace("/signin");
    if (access === "admin") router.replace("/admin");
    if (access === "player") router.replace("/player/dashboard");
  }, [access, router]);

  if (access !== "manager") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return children;
}
