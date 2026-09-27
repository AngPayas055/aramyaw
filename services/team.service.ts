import { apiUrl } from "./api";

export interface Team {
  _id: string;
  name: string;
  barangay: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  season: string | { _id: string; name: string; status: string };
  division: string | { _id: string; name: string };
  createdAt: string;
}

export interface CreateTeamPayload {
  divisionId: string;
  teamName: string;
  barangay: string;
  coachFirstName: string;
  coachLastName: string;
  coachEmail: string;
  coachContactNumber: string;
  assistantCoach?: string;
  notes?: string;
  acceptedTerms: boolean;
}

export async function createTeam(
  seasonId: string,
  payload: CreateTeamPayload,
  token: string,
): Promise<{ message: string; team: Team }> {
  const response = await fetch(
    apiUrl(`/api/seasons/${encodeURIComponent(seasonId)}/teams`),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit team registration.");
  }

  return data;
}

export async function getMyTeams(
  seasonId: string,
  token: string,
): Promise<{ teams: Team[] }> {
  const response = await fetch(
    apiUrl(`/api/seasons/${encodeURIComponent(seasonId)}/teams/mine`),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load your teams.");
  }

  return data;
}