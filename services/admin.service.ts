import { apiUrl } from "./api";
import type { AdminTeam } from "./team.service";
import type { Season } from "@/types/season";

export interface AdminDashboardData {
  stats: {
    activeSeasons: number;
    registeredTeams: number;
    players: number;
    pendingRegistrations: number;
  };
  recentTeams: AdminTeam[];
  activeSeasons: Season[];
}

export async function getAdminDashboard(
  token: string,
  signal?: AbortSignal,
): Promise<AdminDashboardData> {
  const response = await fetch(apiUrl("/api/admin/dashboard"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    throw new Error(
      data?.message || "Failed to load the admin dashboard.",
    );
  }

  return response.json();
}