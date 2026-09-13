// Copy your existing apiUrl import from auth.service.ts.

import type {
  CreateDivisionPayload,
  DivisionResponse,
  DivisionsResponse,
  UpdateDivisionPayload,
} from "@/types/division";
import { apiUrl } from "./api";

function divisionsPath(seasonId: string) {
  return `/api/seasons/${encodeURIComponent(seasonId)}/divisions`;
}

export async function createDivision(
  seasonId: string,
  payload: CreateDivisionPayload,
  token: string,
): Promise<DivisionResponse> {
  const response = await fetch(apiUrl(divisionsPath(seasonId)), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data: DivisionResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create division.");
  }

  return data;
}

export async function getDivisions(
  seasonId: string,
  token: string,
): Promise<DivisionsResponse> {
  const response = await fetch(apiUrl(divisionsPath(seasonId)), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data: DivisionsResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch divisions.");
  }

  return data;
}

export async function getDivisionById(
  seasonId: string,
  divisionId: string,
  token: string,
): Promise<DivisionResponse> {
  const response = await fetch(
    apiUrl(
      `${divisionsPath(seasonId)}/${encodeURIComponent(divisionId)}`,
    ),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data: DivisionResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch division.");
  }

  return data;
}

export async function updateDivision(
  seasonId: string,
  divisionId: string,
  payload: UpdateDivisionPayload,
  token: string,
): Promise<DivisionResponse> {
  const response = await fetch(
    apiUrl(
      `${divisionsPath(seasonId)}/${encodeURIComponent(divisionId)}`,
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

  const data: DivisionResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update division.");
  }

  return data;
}