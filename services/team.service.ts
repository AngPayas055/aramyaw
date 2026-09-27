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

export interface AdminTeam extends Team {
  coach: {
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
  };
  assistantCoach?: string;
  notes?: string;
  manager: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
  };
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

export interface AdminTeam extends Team {
  coach: {
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
  };
  assistantCoach?: string;
  notes?: string;
  manager: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
  };
}

export async function getSeasonTeams(
  seasonId: string,
  token: string,
): Promise<{ teams: AdminTeam[] }> {
  const response = await fetch(
    apiUrl(`/api/seasons/${encodeURIComponent(seasonId)}/teams`),
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load team registrations.");
  }

  return data;
}

export async function reviewTeam(
  seasonId: string,
  teamId: string,
  payload: {
    status: "approved" | "rejected";
    rejectionReason?: string;
  },
  token: string,
): Promise<{ message: string; team: AdminTeam }> {
  const response = await fetch(
    apiUrl(
      `/api/seasons/${encodeURIComponent(seasonId)}/teams/${encodeURIComponent(teamId)}/review`,
    ),
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to review team registration.");
  }

  return data;
}