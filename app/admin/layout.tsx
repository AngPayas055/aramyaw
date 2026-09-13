"use client";

import {
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Spin } from "antd";
import AdminNavbar from "../components/admin/AdminNavbar";

type Access = "loading" | "guest" | "user" | "admin";

function getSnapshot(): Access {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) return "guest";

  try {
    const user = JSON.parse(storedUser);
    return user?.role === "admin" ? "admin" : "user";
  } catch {
    return "guest";
  }
}

function getServerSnapshot(): Access {
  return "loading";
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("auth-change", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("auth-change", onChange);
  };
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const access = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (access === "guest") {
      router.replace("/signin");
    } else if (access === "user") {
      router.replace("/");
    }
  }, [access, router]);

  if (access !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}