"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import FindTeamPanel from "./FindTeamPanel";
import PlayerProfileForm from "./PlayerProfileForm";
import PlayerTeamsPanel from "./PlayerTeamsPanel";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("auth-change", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("auth-change", onChange);
  };
}

function getToken() {
  return localStorage.getItem("token");
}

function getAccess() {
  const token = getToken();
  const storedUser = localStorage.getItem("user");

  if (!token || !storedUser) return "guest";

  try {
    const role = JSON.parse(storedUser)?.role;

    if (role === "player") return "player";
    if (role === "admin") return "admin";
    if (role === "user") return "manager";
  } catch {
    return "guest";
  }

  return "guest";
}

export default function PlayerDashboardPage() {
  const router = useRouter();
  const access = useSyncExternalStore(subscribe, getAccess, () => null);
  const token = useSyncExternalStore(subscribe, getToken, () => null);

  useEffect(() => {
    if (access === "guest") router.replace("/signin");
    if (access === "admin") router.replace("/admin");
    if (access === "manager") router.replace("/manager");
  }, [access, router]);

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    router.replace("/signin");
  }

  if (access !== "player" || !token) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Player dashboard</h1>
        <Button onClick={handleSignOut}>Sign out</Button>
      </div>
      <PlayerProfileForm key={`profile-${token}`} token={token} />
      <PlayerTeamsPanel key={`player-teams-${token}`} token={token} />
    </main>
  );
}